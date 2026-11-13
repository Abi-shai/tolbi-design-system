<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue'
import type { IconName } from '../Icon'
import { IconButton } from '../IconButton'
import { SurfaceTransition } from '../SurfaceTransition'
import { Tooltip, type TooltipPlacement } from '../Tooltip'
import MapZoomGauge from './MapZoomGauge.vue'

/**
 * The map's tools column (ADR-0171, after ADR-0100 / ADR-0120): one upright
 * strip at the map's end edge, under its top — **nothing is added on a map
 * outside a group of tools**. From the top:
 *
 * - the product's **tools** (`tools`: a glyph, a name, a count, on or off) —
 *   Rechercher, Filtres, Couches — then « Mini-carte » when there is one
 *   (`#default`, the engine's canvas);
 * - a rule, + **the zoom gauge** −, a rule, « Recentrer ».
 *
 * A tool with something to show (a `#tool-<value>` slot, or the mini-map)
 * **opens it in a card to the column's left**, its top on the button's,
 * `spacing-md` away; the button stays on while it is open (`v-model:tool`).
 * Escape, a press outside or the button again close it. **One thing at a time
 * on the right**: a `MapPanel` arriving in the same overlay (a parcel's sheet)
 * closes it, and the mini-map goes back into its button. A tool with nothing
 * to show is a toggle: it emits `press`, and the product says it is on
 * (`pressed`).
 *
 * **A control never moves when a panel appears.** Put the column in
 * `MapOverlay position="end"`: the overlay keeps it against the edge and puts
 * a sheet (`MapPanel lg`) to its left, full height, and a `TolbiAiLauncher
 * placement="map"` at its foot, on its axis — none of them moves when the
 * sheet opens or closes.
 *
 * The zoom is a model (`v-model:zoom`, between `zoomMin` and `zoomMax`): the
 * gauge shows **any** value — the product passes the map's zoom as it moves —
 * and moves it; + and − step it by `zoomStep` and stop at the ends, and the
 * thumb travels with the map (`MapZoomGauge`, ADR-0121). « Recentrer » emits;
 * the engine knows where the centre is.
 */
export interface MapTool {
  value: string
  icon: IconName
  /** Its name: the button's, and its tooltip. */
  label: string
  /** A count on the button — the filters in force. Nothing at 0. */
  badge?: number
  /** A tool with nothing to show is a toggle: the product says it is on. */
  pressed?: boolean
  disabled?: boolean
}

interface Props {
  tools?: MapTool[]
  /** The mini-map's tool, when `#default` holds one. */
  minimapLabel?: string
  /** The column's name, for a reader. */
  label?: string
  zoomMin?: number
  zoomMax?: number
  zoomStep?: number
  zoomLabel?: string
  zoomInLabel?: string
  zoomOutLabel?: string
  recenterLabel?: string
  /** @deprecated The mini-map is a tool now (ADR-0171); use `minimapLabel`. */
  expandLabel?: string
  /** @deprecated The mini-map is a tool now (ADR-0171). Ignored. */
  collapseLabel?: string
  /** The tooltips' side: away from the edge the column stands on. */
  tooltipPlacement?: TooltipPlacement
  /**
   * The map does not exist yet (ADR-0122): every control is there and off, so
   * the column keeps its shape and nothing moves when the map arrives.
   */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tools: () => [],
  minimapLabel: 'Mini-carte',
  label: 'Outils de la carte',
  zoomMin: 0,
  zoomMax: 20,
  zoomStep: 1,
  zoomLabel: 'Niveau de zoom',
  zoomInLabel: 'Zoomer',
  zoomOutLabel: 'Dézoomer',
  recenterLabel: 'Recentrer',
  expandLabel: undefined,
  collapseLabel: undefined,
  tooltipPlacement: 'left',
  disabled: false,
})

const emit = defineEmits<{ recenter: []; press: [value: string] }>()

defineSlots<{
  /** The mini-map — the engine's canvas. Its presence adds the « Mini-carte » tool. */
  default?: () => unknown
} & {
  /** What a tool opens: the slot named after its `value`. */
  [key: `tool-${string}`]: (() => unknown) | undefined
}>()

/** The tool whose card is open, or `null`. */
const tool = defineModel<string | null>('tool', { default: null })
/** @deprecated The mini-map is a tool now (ADR-0171): `v-model:tool`, value `minimap`. Ignored. */
defineModel<boolean>('collapsed', { default: true })
const zoom = defineModel<number>('zoom', { default: 10 })

const slots = useSlots() as Record<string, unknown>
const MINIMAP = 'minimap'

const allTools = computed<MapTool[]>(() => {
  const list = [...props.tools]
  if (slots.default) list.push({ value: MINIMAP, icon: 'map', label: props.expandLabel ?? props.minimapLabel })
  return list
})
const opens = (t: MapTool) => t.value === MINIMAP || !!slots[`tool-${t.value}`]
const current = computed(() => allTools.value.find((t) => t.value === tool.value && opens(t)) ?? null)

const id = useId()
const flyoutId = `${id}-flyout`
const column = ref<HTMLElement | null>(null)
const flyout = ref<HTMLElement | null>(null)
const top = ref(0)

function buttonOf(value: string) {
  return column.value?.querySelector<HTMLElement>(`[data-map-tool="${value}"] button`) ?? null
}

/* The card's top on its button's, measured when it opens. */
function place(value: string) {
  const wrap = column.value?.querySelector<HTMLElement>(`[data-map-tool="${value}"]`)
  top.value = wrap ? wrap.offsetTop : 0
}

let pressedHere = false
function onTool(t: MapTool) {
  if (!opens(t)) {
    emit('press', t.value)
    return
  }
  if (tool.value === t.value) {
    tool.value = null
    return
  }
  pressedHere = true
  place(t.value)
  tool.value = t.value
}

/* Opened by a press here, the card takes the focus — the search's field
   first (`[data-autofocus]`, then the first field or control). Opened by the
   product, it does not take the reader's focus (ADR-0062). */
function focusArrived() {
  if (!pressedHere) return
  pressedHere = false
  const card = flyout.value
  card?.querySelector<HTMLElement>('[data-autofocus], input:not([type="hidden"]), textarea, select, button, [tabindex]:not([tabindex="-1"])')?.focus()
}

watch(tool, (now) => {
  if (now) void nextTick(() => place(now))
}, { immediate: true })

function close(handBack: boolean) {
  const was = tool.value
  tool.value = null
  if (handBack && was) void nextTick(() => buttonOf(was)?.focus())
}

/* Escape from the card or its button closes it and hands the focus back. A
   layer of its own inside the card (an open list) takes its Escape first. */
function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !tool.value || e.defaultPrevented) return
  const t = e.target as Element | null
  if (t?.closest('[role="listbox"], [role="menu"], [popover]')) return
  e.preventDefault()
  close(true)
}

/* A press outside closes it — the map, the panel. */
function onOutside(e: PointerEvent) {
  if (!tool.value) return
  const t = e.target as Node | null
  if (t && column.value?.contains(t)) return
  close(false)
}

/* One thing at a time on the right: a sheet arriving beside the column
   closes the card (a ghost leaving is not an arrival). */
let watcher: MutationObserver | null = null
onMounted(() => {
  document.addEventListener('pointerdown', onOutside, true)
  const overlay = column.value?.parentElement
  if (!overlay || typeof MutationObserver === 'undefined') return
  watcher = new MutationObserver((records) => {
    if (!tool.value) return
    for (const r of records) for (const n of r.addedNodes) {
      /* `MapPanel` arrives inside its host, a box of no box. */
      const sheet = '.ds-map-panel:not([aria-hidden])'
      if (n instanceof HTMLElement && (n.matches(sheet) || n.querySelector(sheet))) {
        /* A focus inside the card would fall to the page: it goes back to the tool. */
        close(!!flyout.value?.contains(document.activeElement))
        return
      }
    }
  })
  watcher.observe(overlay, { childList: true })
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onOutside, true)
  watcher?.disconnect()
})

/* ── Zoom ─────────────────────────────────────────────────────────── */
const clamp = (z: number) => Math.min(props.zoomMax, Math.max(props.zoomMin, z))
const atMin = computed(() => zoom.value <= props.zoomMin)
const atMax = computed(() => zoom.value >= props.zoomMax)
const gauge = ref<InstanceType<typeof MapZoomGauge> | null>(null)
/* A step that reaches its end disables its button, and a disabled button drops
   the focus to the page (ADR-0059): it goes to the gauge. */
function by(d: number) {
  if (gauge.value) gauge.value.stepBy(d)
  else zoom.value = clamp(zoom.value + d * props.zoomStep)
  void nextTick(() => {
    const a = document.activeElement as HTMLButtonElement | null
    if (a && a !== document.body && !a.disabled) return
    column.value?.querySelector<HTMLElement>('.ds-map-zoom-gauge__input')?.focus()
  })
}
</script>

<template>
  <div ref="column" class="ds-map-navigator ds-map-navigator--column" role="group" :aria-label="label" @keydown="onKey">
    <template v-if="allTools.length">
      <div class="ds-map-navigator__group">
        <span v-for="t in allTools" :key="t.value" class="ds-map-navigator__tool" :data-map-tool="t.value">
          <Tooltip :title="t.label" :placement="tooltipPlacement">
            <IconButton
              :icon="t.icon"
              size="xs"
              variant="subtle"
             
              :ariaLabel="t.badge ? `${t.label} (${t.badge})` : t.label"
              :selected="opens(t) ? tool === t.value : !!t.pressed"
              :aria-expanded="opens(t) ? tool === t.value : undefined"
              :aria-controls="opens(t) && tool === t.value ? flyoutId : undefined"
              :aria-pressed="opens(t) ? undefined : !!t.pressed"
              :disabled="disabled || t.disabled"
              @click="onTool(t)"
            />
          </Tooltip>
          <span v-if="t.badge" class="ds-map-navigator__count" aria-hidden="true">{{ t.badge }}</span>
        </span>
      </div>
      <span class="ds-map-navigator__rule" aria-hidden="true" />
    </template>

    <div class="ds-map-navigator__group">
      <Tooltip :title="zoomInLabel" :placement="tooltipPlacement">
        <IconButton icon="plus" size="xs" variant="subtle" :ariaLabel="zoomInLabel" :disabled="disabled || atMax" @click="by(1)" />
      </Tooltip>
      <MapZoomGauge ref="gauge" v-model="zoom" vertical :min="zoomMin" :max="zoomMax" :step="zoomStep" :label="zoomLabel" :disabled="disabled" />
      <Tooltip :title="zoomOutLabel" :placement="tooltipPlacement">
        <IconButton icon="minus" size="xs" variant="subtle" :ariaLabel="zoomOutLabel" :disabled="disabled || atMin" @click="by(-1)" />
      </Tooltip>
    </div>

    <span class="ds-map-navigator__rule" aria-hidden="true" />

    <Tooltip :title="recenterLabel" :placement="tooltipPlacement">
      <IconButton icon="crosshair" size="xs" variant="subtle" :ariaLabel="recenterLabel" :disabled="disabled" @click="emit('recenter')" />
    </Tooltip>

    <!-- What the open tool shows: a card to the column's left, its top on its button's. -->
    <SurfaceTransition @enter="focusArrived">
      <div
        v-if="current"
        :id="flyoutId"
        :key="current.value"
        ref="flyout"
        class="ds-map-navigator__flyout"
        :class="{ 'ds-map-navigator__flyout--minimap': current.value === MINIMAP }"
        role="dialog"
        :aria-label="current.label"
        :style="{ top: `${top}px` }"
      >
        <div v-if="current.value === MINIMAP" class="ds-map-navigator__minimap"><slot /></div>
        <slot v-else :name="`tool-${current.value}`" />
      </div>
    </SurfaceTransition>
  </div>
</template>

<style scoped>
/*
  The column (ADR-0171): 44 wide — 32px buttons in 6px of margin, under a
  hairline — on the map's floating surface (`bg-default`, `border-subtle`,
  `elevation-raised`, `radius-surface`), its groups ruled off. Its own height
  in any row it lands in (ADR-0170): a stretched column is a hole in the map.
*/
.ds-map-navigator {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-xs);
  box-sizing: border-box;
  width: 44px;
  height: fit-content;
  padding: var(--ds-spacing-xs) 0;
  border-radius: var(--ds-radius-pill);
  /* Pilot glass (ADR-0172): the map shows through as colour. */
  border: var(--ds-border-width-default) solid var(--ds-border-map-edge);
  background: var(--ds-bg-map-control);
  -webkit-backdrop-filter: var(--ds-backdrop-map-control);
  backdrop-filter: var(--ds-backdrop-map-control);
  /* On the darkest imagery behind it, text-subtlest fails (3.0–4.3:1); subtle holds (4.6). */
  /* token-lint-disable-next-line no-shadowing-var — on map glass the role's value changes, not its name (ADR-0172) */
  --ds-text-subtlest: var(--ds-text-subtle);
  --on-glass-control-radius: var(--ds-radius-pill);
  --on-glass-rule: color-mix(in srgb, var(--ds-text-strong) 8%, transparent);
  /* A rim of light on top, a wide soft shadow (ADR-0173). */
  box-shadow: var(--ds-elevation-map-glass);
}

.ds-map-navigator__group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-xxs);
}

.ds-map-navigator__tool {
  position: relative;
  display: inline-flex;
}

/* The count rides the button's corner, on the brand's fill — a count of what
   a control holds (ADR-0149's ground) — clear of the glyph: a `Badge` (20px)
   covered a 16px glyph whole. 16px tall, the type at the reading floor. */
.ds-map-navigator__count {
  position: absolute;
  top: calc(-1 * var(--ds-spacing-xs));
  right: calc(-1 * var(--ds-spacing-xs));
  box-sizing: border-box;
  min-width: 16px;
  height: 16px;
  padding-inline: var(--ds-spacing-xs);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-brand-solid);
  color: var(--ds-text-on-brand-solid);
  font: var(--ds-font-label-md-strong);
  font-variant-numeric: tabular-nums;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 var(--ds-border-width-strong) var(--ds-bg-default);
  pointer-events: none;
}

.ds-map-navigator__rule {
  flex: none;
  width: 20px;
  height: var(--ds-border-width-default);
  /* Translucent ink, not an opaque grey (ADR-0173). */
  background: var(--on-glass-rule, var(--ds-border-subtle));
}

/*
  The card a tool opens: the same floating surface, `spacing-md` to the
  column's left, its top on its button's, growing from the corner nearest the
  button. Its width is its content's — the search and the filters are 20rem.
*/
.ds-map-navigator__flyout {
  position: absolute;
  right: calc(100% + var(--ds-spacing-md));
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: max-content;
  max-width: 24rem;
  max-height: min(36rem, 70vh);
  border-radius: var(--ds-radius-surface-xl);
  /* Reading glass (ADR-0172): almost opaque — the text is long. What it holds
     follows (`--on-glass-*`): blocks at 70 % / 55 %, what is pressed in a pill. */
  border: var(--ds-border-width-default) solid var(--ds-border-map-edge);
  background: var(--ds-bg-map-read);
  -webkit-backdrop-filter: var(--ds-backdrop-map-read);
  backdrop-filter: var(--ds-backdrop-map-read);
  /* token-lint-disable-next-line no-shadowing-var — on map glass the role's value changes, not its name (ADR-0172) */
  --ds-text-subtlest: var(--ds-text-subtle);
  --on-glass-control-radius: var(--ds-radius-pill);
  --on-glass-raised-edge: color-mix(in srgb, var(--ds-text-strong) 6%, transparent);
  --on-glass-raised-shadow: var(--ds-elevation-map-raised);
  --on-glass-sunk-border: transparent;
  --on-glass-sunk-edge: inset 0 0 0 var(--ds-border-width-default) color-mix(in srgb, var(--ds-text-strong) 3%, transparent);
  --on-glass-tile: color-mix(in srgb, var(--ds-text-strong) 5%, transparent);
  --on-glass-selected-shadow: var(--ds-elevation-map-selected);
  --on-glass-rule: color-mix(in srgb, var(--ds-text-strong) 8%, transparent);
  --on-glass-card-radius: var(--ds-radius-surface-lg);
  --on-glass-row-radius: var(--ds-radius-surface);
  --on-glass-raised: var(--ds-bg-map-raised);
  --on-glass-sunk: var(--ds-bg-map-sunk);
  /* A rim of light on top, a wide soft shadow (ADR-0173). */
  box-shadow: var(--ds-elevation-map-glass);
  transform-origin: top right;
}

.ds-map-navigator__flyout--minimap {
  padding: var(--ds-spacing-md);
}

/* 200 × 128: the ring, the points and the view's frame read at a glance. */
.ds-map-navigator__minimap {
  width: 12.5rem;
  height: 8rem;
  overflow: hidden;
  border-radius: var(--ds-radius-inner);
  background: var(--ds-bg-neutral-subtle);
}

.ds-map-navigator__minimap > :deep(*) {
  width: 100%;
  height: 100%;
}

/* Less transparency asked for: the same surface, opaque, nothing blurred (ADR-0172). */
@media (prefers-reduced-transparency: reduce) {
  .ds-map-navigator {
    border-color: var(--ds-border-subtle);
    background: var(--ds-bg-default);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    --on-glass-raised: var(--ds-bg-default);
    --on-glass-sunk: var(--ds-bg-neutral-subtle);
  }
}

/* Less transparency asked for: the same surface, opaque, nothing blurred (ADR-0172). */
@media (prefers-reduced-transparency: reduce) {
  .ds-map-navigator__flyout {
    border-color: var(--ds-border-subtle);
    background: var(--ds-bg-default);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    --on-glass-raised: var(--ds-bg-default);
    --on-glass-sunk: var(--ds-bg-neutral-subtle);
  }
}
</style>
