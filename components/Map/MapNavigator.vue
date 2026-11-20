<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, useSlots, watch } from 'vue'
import type { IconName } from '../Icon'
import { IconButton } from '../IconButton'
import { SurfaceTransition } from '../SurfaceTransition'
import { Tooltip, type TooltipPlacement } from '../Tooltip'
import MapZoomGauge from './MapZoomGauge.vue'
import MapBasemapPicker, { type MapBasemapOption } from './MapBasemapPicker.vue'

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
  /**
   * Said after the name while the tool is off (ADR-0185): « Informations —
   * sélectionnez un élément ». The tooltip still shows on a tool that is off.
   */
  disabledHint?: string
}

interface Props {
  tools?: MapTool[]
  /** The mini-map's tool, when `#default` holds one. */
  minimapLabel?: string
  /** The cross at the mini-map's top-right corner (ADR-0187). */
  minimapCloseLabel?: string
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
  /**
   * « Rechercher » at the column's head, in a group of its own (ADR-0241 — it
   * left `MapTopBar`). With a `#tool-search` slot it opens its card to the
   * column's left, as the tools do; without, it emits `search` and wears
   * `searchOpen`.
   */
  search?: boolean
  searchLabel?: string
  /** The product's search is open — the button wears the open state. */
  searchOpen?: boolean
  /**
   * The basemaps, at the column's foot after « Recentrer » (ADR-0241): the
   * chosen one's picture in a round 36px frame, opening `MapBasemapPicker` to
   * the column's left. Fewer than two: nothing.
   */
  basemaps?: MapBasemapOption[]
  basemapLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  tools: () => [],
  minimapLabel: 'Mini-carte',
  minimapCloseLabel: 'Fermer la mini-carte',
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
  search: false,
  searchLabel: 'Rechercher',
  searchOpen: false,
  basemaps: () => [],
  basemapLabel: 'Fond de carte',
})

const emit = defineEmits<{
  recenter: []
  press: [value: string]
  /**
   * The column took the right (ADR-0186): a tool's card or the mini-map just
   * opened. One thing at a time — a sheet there should close.
   */
  claim: [value: string]
  /** « Rechercher » pressed, when no `#tool-search` card answers it (ADR-0241). */
  search: []
}>()

defineSlots<{
  /** The mini-map — the engine's canvas. Its presence adds the « Mini-carte » tool. */
  default?: () => unknown
} & {
  /** What a tool opens: the slot named after its `value`. */
  [key: `tool-${string}`]: (() => unknown) | undefined
}>()

/** The tool whose card is open, or `null`. The mini-map is not one: see `minimapOpen`. */
const tool = defineModel<string | null>('tool', { default: null })
/**
 * The mini-map is a **toggle** (ADR-0185), open on arrival; no press outside
 * and no Escape close it. **One thing at a time on the right** (ADR-0186): the
 * last action wins and the one before goes out, its button too — a tool's card
 * opening turns the mini-map off, the mini-map opening closes the card, a
 * sheet arriving turns it off. It does not come back by itself; its button
 * reopens it. A model, so the product can keep it for the session.
 */
const minimapOpen = defineModel<boolean>('minimapOpen', { default: true })
/** @deprecated The mini-map is a tool now (ADR-0171): `v-model:minimap-open`. Ignored. */
defineModel<boolean>('collapsed', { default: true })
const zoom = defineModel<number>('zoom', { default: 10 })
/** The chosen basemap — `v-model:basemap` (ADR-0241). */
const basemap = defineModel<string | undefined>('basemap', { default: undefined })

const slots = useSlots() as Record<string, unknown>
const MINIMAP = 'minimap'

/*
  One order in every module (ADR-0185): the package sorts the tools it knows —
  Rechercher, Filtres, Informations — whatever order the product passes them
  in; a missing one leaves no gap. A tool the package does not know comes after
  them, in the product's order, and the mini-map closes the group.
*/
const KNOWN = ['search', 'filters', 'info']
const allTools = computed<MapTool[]>(() => {
  const known = KNOWN.map((v) => props.tools.find((t) => t.value === v)).filter((t): t is MapTool => !!t)
  const other = props.tools.filter((t) => !KNOWN.includes(t.value) && t.value !== MINIMAP)
  /* « Rechercher » given as a prop has its own group at the head (ADR-0241). */
  const list = [...known, ...other].filter((t) => !(props.search && t.value === 'search'))
  if (slots.default) list.push({ value: MINIMAP, icon: 'map', label: props.expandLabel ?? props.minimapLabel })
  return list
})
const opens = (t: MapTool) => t.value !== MINIMAP && !!slots[`tool-${t.value}`]
/* « Rechercher », a group of its own at the column's head (ADR-0241). */
const searchTool = computed<MapTool[]>(() =>
  props.search ? [{ value: 'search', icon: 'search', label: props.searchLabel, pressed: props.searchOpen }] : [],
)
const groups = computed(() => [searchTool.value, allTools.value].filter((g) => g.length))
const current = computed(() => [...searchTool.value, ...allTools.value].find((t) => t.value === tool.value && opens(t)) ?? null)
const tipOf = (t: MapTool) => (t.disabled && t.disabledHint ? `${t.label} — ${t.disabledHint}` : t.label)

/* A sheet on the right (a `MapPanel` beside the column) hides the mini-map
   while it is there; read off the overlay, as the tool card's closing is. */
const sheetPresent = ref(false)
const minimapShown = computed(() => !!slots.default && minimapOpen.value && !current.value && !sheetPresent.value)
const minimapId = `${useId()}-minimap`
const minimapTop = ref(0)

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
  if (t.value === MINIMAP) {
    minimapOpen.value = !minimapOpen.value
    return
  }
  if (!opens(t)) {
    if (t.value === 'search' && props.search) emit('search')
    else emit('press', t.value)
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

/* One thing at a time on the right (ADR-0186): what opens last wins. */
watch(current, (now) => {
  if (!now) return
  if (minimapOpen.value) minimapOpen.value = false
  emit('claim', now.value)
})
watch(minimapOpen, (open) => {
  if (!open) return
  if (tool.value) tool.value = null
  emit('claim', MINIMAP)
})

/* The cross on the mini-map closes it, as its button does (ADR-0187); the
   focus goes back to that button, the way to open it again. */
function closeMinimap() {
  minimapOpen.value = false
  void nextTick(() => buttonOf(MINIMAP)?.focus())
}

/* At the top, on the first tool's line — not facing its own button (ADR-0186):
   it is a picture of the whole map, read before the tools. */
function placeMinimap() {
  const first = column.value?.querySelector<HTMLElement>('[data-map-tool]')
  minimapTop.value = first ? first.offsetTop : 0
}
watch(minimapShown, (now) => { if (now) placeMinimap() }, { flush: 'post' })
onMounted(placeMinimap)

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
  const sheet = '.ds-map-panel:not([aria-hidden])'
  sheetPresent.value = !!overlay.querySelector(sheet)
  /* A sheet on the right on arrival: it is the one thing there. */
  if (sheetPresent.value) minimapOpen.value = false
  watcher = new MutationObserver((records) => {
    const was = sheetPresent.value
    sheetPresent.value = !!overlay.querySelector(sheet)
    /* A sheet arriving (a point, a polygon selected) turns the mini-map off. */
    if (sheetPresent.value && !was) minimapOpen.value = false
    if (!tool.value) return
    for (const r of records) for (const n of r.addedNodes) {
      /* `MapPanel` arrives inside its host, a box of no box. */
      if (n instanceof HTMLElement && (n.matches(sheet) || n.querySelector(sheet))) {
        /* A focus inside the card would fall to the page: it goes back to the tool. */
        close(!!flyout.value?.contains(document.activeElement))
        return
      }
    }
  })
  watcher.observe(overlay, { childList: true, subtree: true })
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
    <template v-for="group in groups" :key="group[0].value">
      <div class="ds-map-navigator__group">
        <span v-for="t in group" :key="t.value" class="ds-map-navigator__tool" :data-map-tool="t.value">
          <Tooltip :title="tipOf(t)" :placement="tooltipPlacement">
            <IconButton
              :icon="t.icon"
              size="md"
              variant="ghost"
              :ariaLabel="t.badge ? `${t.label} (${t.badge})` : t.label"
              :selected="t.value === MINIMAP ? minimapOpen : opens(t) ? tool === t.value : !!t.pressed"
              :aria-expanded="opens(t) ? tool === t.value : t.value === 'search' && search ? searchOpen : undefined"
              :aria-controls="opens(t) && tool === t.value ? flyoutId : t.value === MINIMAP && minimapShown ? minimapId : undefined"
              :aria-pressed="t.value === MINIMAP ? minimapOpen : opens(t) || (t.value === 'search' && search) ? undefined : !!t.pressed"
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
        <IconButton icon="plus" size="md" variant="ghost" :ariaLabel="zoomInLabel" :disabled="disabled || atMax" @click="by(1)" />
      </Tooltip>
      <MapZoomGauge ref="gauge" v-model="zoom" vertical :min="zoomMin" :max="zoomMax" :step="zoomStep" :label="zoomLabel" :disabled="disabled" />
      <Tooltip :title="zoomOutLabel" :placement="tooltipPlacement">
        <IconButton icon="minus" size="md" variant="ghost" :ariaLabel="zoomOutLabel" :disabled="disabled || atMin" @click="by(-1)" />
      </Tooltip>
    </div>

    <span class="ds-map-navigator__rule" aria-hidden="true" />

    <Tooltip :title="recenterLabel" :placement="tooltipPlacement">
      <IconButton icon="crosshair" size="md" variant="ghost" :ariaLabel="recenterLabel" :disabled="disabled" @click="emit('recenter')" />
    </Tooltip>

    <!-- The basemap at the foot (ADR-0241): the chosen one's picture, round, the tray to the column's left. -->
    <template v-if="basemaps.length > 1">
      <span class="ds-map-navigator__rule" aria-hidden="true" />
      <span class="ds-map-navigator__basemap">
        <MapBasemapPicker
          v-model="basemap"
          :basemaps="basemaps"
          :label="basemapLabel"
          shape="round"
          side="left"
          :tooltip-placement="tooltipPlacement"
        />
      </span>
    </template>

    <!-- What the open tool shows: a card to the column's left, its top on its button's. -->
    <SurfaceTransition @enter="focusArrived">
      <div
        v-if="current"
        :id="flyoutId"
        :key="current.value"
        ref="flyout"
        class="ds-map-navigator__flyout"
        role="dialog"
        :aria-label="current.label"
        :style="{ top: `${top}px` }"
      >
        <slot :name="`tool-${current.value}`" />
      </div>
    </SurfaceTransition>

    <!-- The mini-map: on while its toggle is, out of the way while a card or a sheet is there. -->
    <SurfaceTransition>
      <div
        v-if="minimapShown"
        :id="minimapId"
        class="ds-map-navigator__flyout ds-map-navigator__flyout--minimap"
        role="region"
        :aria-label="expandLabel ?? minimapLabel"
        :style="{ top: `${minimapTop}px` }"
      >
        <div class="ds-map-navigator__minimap"><slot /></div>
        <!-- Where the old fold stood (ADR-0100): the top-right corner, a white
             disc that stands off the drawing. -->
        <Tooltip :title="minimapCloseLabel" :placement="tooltipPlacement" class="ds-map-navigator__close">
          <IconButton icon="x" size="xs" variant="surface" :ariaLabel="minimapCloseLabel" @click="closeMinimap" />
        </Tooltip>
      </div>
    </SurfaceTransition>
  </div>
</template>

<style scoped>
/*
  The column (ADR-0171, ADR-0179): 52 wide — 40px buttons in 6px of margin, under a
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
  width: 52px;
  height: fit-content;
  padding: var(--ds-spacing-sm) 0;
  /* A control on a map is a pill, its buttons round (ADR-0224): 26 at the ends,
     concentric with the 40px buttons 6px in. */
  border-radius: var(--ds-radius-map-control);
  /* Pilot glass (ADR-0172): the map shows through as colour. */
  border: var(--ds-border-width-default) solid var(--ds-border-map-edge);
  background: var(--ds-bg-map-control);
  -webkit-backdrop-filter: var(--ds-backdrop-map-control);
  backdrop-filter: var(--ds-backdrop-map-control);
  /* On the darkest imagery behind it, text-subtlest fails (3.0–4.3:1); subtle holds (4.6). */
  /* token-lint-disable-next-line no-shadowing-var — on map glass the role's value changes, not its name (ADR-0172) */
  --ds-text-subtlest: var(--ds-text-subtle);
  --on-glass-focus: var(--ds-focus-ring-map);
  /* Hover and an open menu on glass (ADR-0216): an ink veil, `bg-hover` being the glass's white. */
  --on-glass-hover: color-mix(in srgb, var(--ds-text-strong) 7%, transparent);
  --on-glass-field-bg: var(--ds-bg-map-raised);
  --on-glass-field-border: color-mix(in srgb, var(--ds-text-strong) 16%, transparent);
  --on-glass-field-shadow: var(--ds-elevation-map-raised);
  --on-glass-disabled: var(--ds-text-disabled);
  /* Brand text at 72 % over near-black imagery: brand-600 measured 4.08:1, brand-700 holds (ADR-0175). */
  --on-glass-brand: var(--ds-text-brand-hover);
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

/* The basemap's round frame, centred on the column's axis (ADR-0241). */
.ds-map-navigator__basemap {
  display: flex;
  justify-content: center;
}

.ds-map-navigator__rule {
  flex: none;
  width: 24px;
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
  /* A surface read on a map (ADR-0224); its blocks take `map-block`. */
  border-radius: var(--ds-radius-map-surface);
  --on-glass-block-radius: var(--ds-radius-map-block);
  /* Reading glass (ADR-0172): almost opaque — the text is long. What it holds
     follows (`--on-glass-*`): the levels by light (ADR-0173). */
  border: var(--ds-border-width-default) solid var(--ds-border-map-edge);
  background: var(--ds-bg-map-read);
  -webkit-backdrop-filter: var(--ds-backdrop-map-read);
  backdrop-filter: var(--ds-backdrop-map-read);
  /* token-lint-disable-next-line no-shadowing-var — on map glass the role's value changes, not its name (ADR-0172) */
  --ds-text-subtlest: var(--ds-text-subtle);
  --on-glass-focus: var(--ds-focus-ring-map);
  /* Hover and an open menu on glass (ADR-0216): an ink veil, `bg-hover` being the glass's white. */
  --on-glass-hover: color-mix(in srgb, var(--ds-text-strong) 7%, transparent);
  --on-glass-field-bg: var(--ds-bg-map-raised);
  --on-glass-field-border: color-mix(in srgb, var(--ds-text-strong) 16%, transparent);
  --on-glass-field-shadow: var(--ds-elevation-map-raised);
  --on-glass-disabled: var(--ds-text-disabled);
  --on-glass-raised-edge: color-mix(in srgb, var(--ds-text-strong) 6%, transparent);
  --on-glass-raised-shadow: var(--ds-elevation-map-raised);
  --on-glass-sunk-border: transparent;
  --on-glass-sunk-edge: inset 0 0 0 var(--ds-border-width-default) color-mix(in srgb, var(--ds-text-strong) 3%, transparent);
  --on-glass-tile: color-mix(in srgb, var(--ds-text-strong) 5%, transparent);
  --on-glass-selected-shadow: var(--ds-elevation-map-selected);
  --on-glass-rule: color-mix(in srgb, var(--ds-text-strong) 8%, transparent);
  --on-glass-raised: var(--ds-bg-map-raised);
  --on-glass-sunk: var(--ds-bg-map-sunk);
  /* A rim of light on top, a wide soft shadow (ADR-0173). */
  box-shadow: var(--ds-elevation-map-glass);
  transform-origin: top right;
  /* What it holds is cut to its curve (ADR-0174): a scroller's square corners
     showed under the rounded foot. */
  overflow: clip;
}

/*
  The mini-map's card is a frame around a picture (ADR-0188), as « Derniers
  projets » (`ProjectList`, ADR-0166): the frame recessed, the picture on white
  — the map itself reads as the content, the card as what holds it. Still glass
  at the reading level's 90 %, tinted to `bg-neutral-subtle`.
*/
.ds-map-navigator__flyout--minimap {
  padding: var(--ds-spacing-md);
  background: color-mix(in srgb, var(--ds-bg-neutral-subtle) 90%, transparent);
}

/* 200 × 128: the ring, the points and the view's frame read at a glance. */
.ds-map-navigator__minimap {
  width: 12.5rem;
  height: 8rem;
  overflow: hidden;
  /* Concentric with the card: 24 less its 8px of padding (ADR-0224). */
  border-radius: var(--ds-radius-map-block);
  background: var(--ds-bg-default);
}

.ds-map-navigator__minimap > :deep(*) {
  width: 100%;
  height: 100%;
}

/* The mini-map's top-right corner, 4px inside it (ADR-0187). */
.ds-map-navigator__close {
  position: absolute;
  top: calc(var(--ds-spacing-md) + var(--ds-spacing-xs));
  right: calc(var(--ds-spacing-md) + var(--ds-spacing-xs));
}

/* Less transparency asked for: the same surface, opaque, nothing blurred (ADR-0172). */
@media (prefers-reduced-transparency: reduce) {
  .ds-map-navigator__flyout.ds-map-navigator__flyout--minimap {
    background: var(--ds-bg-neutral-subtle);
  }

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
