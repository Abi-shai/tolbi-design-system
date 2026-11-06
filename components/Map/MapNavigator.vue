<script setup lang="ts">
import { computed, nextTick, ref, useSlots } from 'vue'
import { IconButton } from '../IconButton'
import { SurfaceTransition } from '../SurfaceTransition'
import { Tooltip, type TooltipPlacement } from '../Tooltip'
import MapZoomGauge from './MapZoomGauge.vue'

/**
 * The map's navigator (ADR-0100, Figma « Carte/Navigateur » `3552:3437`), at
 * the top right of a map, in the owner's drawing — two forms:
 *
 * - **open**: the mini-map (`#default`, the engine's — the system draws its
 *   frame, ADR-0006) with its fold on its corner, and under it − **the zoom
 *   gauge** + and « Recentrer »;
 * - **folded**: a bar — − + « Recentrer », a rule, and the mini-map's button.
 *
 * **The fold and the unfold share a corner** (the owner, 5 Nov.): the
 * mini-map's button closes the bar, at its top right, where the fold sits on
 * the open mini-map — so folding and unfolding again is the same press in the
 * same place, the pointer never moves. The drawing put it first in the bar.
 *
 * **Without a mini-map** (no `#default`, ADR-0120 — the presence decides,
 * ADR-0053) there is nothing to fold: the navigator is the bar alone, − the
 * gauge + « Recentrer », in the folded form's chrome — no rule, no mini-map
 * button, and `v-model:collapsed` is ignored.
 *
 * The zoom is a model (`v-model:zoom`, between `zoomMin` and `zoomMax`):
 * the gauge shows it — **any** value, the product passes the map's zoom as it
 * moves — and moves it; − and + step it by `zoomStep` and stop at the ends, and
 * the thumb travels with the map (`MapZoomGauge`, ADR-0121). « Recentrer » emits; the engine knows where the centre is.
 *
 * The two forms are two surfaces of two shapes, so the fold is a surface
 * leaving and another arriving at the same corner (`SurfaceTransition`, out
 * then in — `MapPanel`'s fold, ADR-0099); the focus goes to the button that
 * replaced the one pressed.
 */
interface Props {
  zoomMin?: number
  zoomMax?: number
  zoomStep?: number
  zoomLabel?: string
  zoomInLabel?: string
  zoomOutLabel?: string
  recenterLabel?: string
  expandLabel?: string
  collapseLabel?: string
  /** The tooltips' side: away from the edge the navigator stands on. */
  tooltipPlacement?: TooltipPlacement
}

const props = withDefaults(defineProps<Props>(), {
  zoomMin: 0,
  zoomMax: 20,
  zoomStep: 1,
  zoomLabel: 'Niveau de zoom',
  zoomInLabel: 'Zoomer',
  zoomOutLabel: 'Dézoomer',
  recenterLabel: 'Recentrer',
  expandLabel: 'Afficher la mini-carte',
  collapseLabel: 'Masquer la mini-carte',
  tooltipPlacement: 'left',
})

const emit = defineEmits<{ recenter: [] }>()

defineSlots<{
  /** The mini-map — the engine's canvas. */
  default?: () => unknown
}>()

const collapsed = defineModel<boolean>('collapsed', { default: false })
/* No mini-map, nothing to fold: the slot's presence decides (ADR-0120). */
const slots = useSlots() as Record<string, unknown>
const hasMinimap = computed<boolean>(() => !!slots.default)
const zoom = defineModel<number>('zoom', { default: 10 })

const clamp = (z: number) => Math.min(props.zoomMax, Math.max(props.zoomMin, z))
const atMin = computed(() => zoom.value <= props.zoomMin)
const atMax = computed(() => zoom.value >= props.zoomMax)
/* − or + that reaches its end disables itself, and a disabled button drops the
   focus to the page (ADR-0059): it goes to the gauge open, to the other step
   folded. */
const gauge = ref<InstanceType<typeof MapZoomGauge> | null>(null)
function by(d: number) {
  /* With a gauge, the step is the gauge's: from where its thumb is going, and
     the thumb travels with the map (ADR-0121). */
  if (gauge.value) gauge.value.stepBy(d)
  else zoom.value = clamp(zoom.value + d * props.zoomStep)
  nextTick(() => {
    const a = document.activeElement as HTMLButtonElement | null
    if (a && a !== document.body && !a.disabled) return
    const to = host.value?.querySelector<HTMLElement>('.ds-map-zoom-gauge__input')
      ?? host.value?.querySelector<HTMLElement>(`[aria-label="${d > 0 ? props.zoomOutLabel : props.zoomInLabel}"]`)
    to?.focus()
  })
}

const host = ref<HTMLElement | null>(null)
/* The focus follows the fold only when the fold was pressed here: a product
   folding it through `v-model:collapsed` does not take the reader's focus
   (ADR-0062 — a focus is not held hostage). */
let pressed = false
function fold(next: boolean) {
  pressed = true
  collapsed.value = next
}
function focusArrived() {
  if (!pressed) return
  pressed = false
  host.value?.querySelector<HTMLElement>(collapsed.value ? '[data-map-navigator-open] button' : '[data-map-navigator-fold] button')?.focus()
}
</script>

<template>
  <div ref="host" class="ds-map-navigator-host">
    <!-- ── Without a mini-map: the bar alone ─────────────────────────── -->
    <div v-if="!hasMinimap" class="ds-map-navigator ds-map-navigator--folded">
      <div class="ds-map-navigator__zoom">
        <Tooltip :title="zoomOutLabel" :placement="tooltipPlacement">
          <IconButton icon="minus" size="xs" variant="subtle" :ariaLabel="zoomOutLabel" :disabled="atMin" @click="by(-1)" />
        </Tooltip>
        <MapZoomGauge ref="gauge" v-model="zoom" :min="zoomMin" :max="zoomMax" :step="zoomStep" :label="zoomLabel" />
        <Tooltip :title="zoomInLabel" :placement="tooltipPlacement">
          <IconButton icon="plus" size="xs" variant="subtle" :ariaLabel="zoomInLabel" :disabled="atMax" @click="by(1)" />
        </Tooltip>
        <Tooltip :title="recenterLabel" :placement="tooltipPlacement">
          <IconButton icon="crosshair" size="xs" variant="subtle" :ariaLabel="recenterLabel" @click="emit('recenter')" />
        </Tooltip>
      </div>
    </div>

    <SurfaceTransition v-else mode="out-in" @enter="focusArrived">
      <!-- ── Open ──────────────────────────────────────────────────── -->
      <div v-if="!collapsed" key="open" class="ds-map-navigator">
        <div class="ds-map-navigator__minimap">
          <slot />
          <Tooltip :title="collapseLabel" :placement="tooltipPlacement" class="ds-map-navigator__fold" data-map-navigator-fold>
            <IconButton
              icon="minimize-2"
              size="xs"
              variant="surface"
              :ariaLabel="collapseLabel"
              aria-expanded="true"
              @click="fold(true)"
            />
          </Tooltip>
        </div>
        <div class="ds-map-navigator__zoom">
          <Tooltip :title="zoomOutLabel" :placement="tooltipPlacement">
            <IconButton icon="minus" size="xs" variant="subtle" :ariaLabel="zoomOutLabel" :disabled="atMin" @click="by(-1)" />
          </Tooltip>
          <MapZoomGauge ref="gauge" v-model="zoom" :min="zoomMin" :max="zoomMax" :step="zoomStep" :label="zoomLabel" />
          <Tooltip :title="zoomInLabel" :placement="tooltipPlacement">
            <IconButton icon="plus" size="xs" variant="subtle" :ariaLabel="zoomInLabel" :disabled="atMax" @click="by(1)" />
          </Tooltip>
          <Tooltip :title="recenterLabel" :placement="tooltipPlacement">
            <IconButton icon="crosshair" size="xs" variant="subtle" :ariaLabel="recenterLabel" @click="emit('recenter')" />
          </Tooltip>
        </div>
      </div>

      <!-- ── Folded: a bar ─────────────────────────────────────────── -->
      <div v-else key="folded" class="ds-map-navigator ds-map-navigator--folded">
        <Tooltip :title="zoomOutLabel" :placement="tooltipPlacement">
          <IconButton icon="minus" size="xs" variant="subtle" :ariaLabel="zoomOutLabel" :disabled="atMin" @click="by(-1)" />
        </Tooltip>
        <Tooltip :title="zoomInLabel" :placement="tooltipPlacement">
          <IconButton icon="plus" size="xs" variant="subtle" :ariaLabel="zoomInLabel" :disabled="atMax" @click="by(1)" />
        </Tooltip>
        <Tooltip :title="recenterLabel" :placement="tooltipPlacement">
          <IconButton icon="crosshair" size="xs" variant="subtle" :ariaLabel="recenterLabel" @click="emit('recenter')" />
        </Tooltip>
        <!-- Last, so it lands in the corner the fold leaves: the pointer that
             folded the mini-map is already on the button that opens it. -->
        <span class="ds-map-navigator__rule" aria-hidden="true" />
        <Tooltip :title="expandLabel" :placement="tooltipPlacement" data-map-navigator-open>
          <IconButton icon="map" size="xs" variant="subtle" :ariaLabel="expandLabel" aria-expanded="false" @click="fold(false)" />
        </Tooltip>
      </div>
    </SurfaceTransition>
  </div>
</template>

<style scoped>
.ds-map-navigator-host {
  display: contents;
}

/*
  The drawing: `bg-default`, `border-subtle`, `elevation-raised`, 8 around and
  between. The open form takes `radius-surface` (Figma's 14 is no step; 12 is
  the role of a surface that holds content), the bar `radius-surface-sm` (10,
  exactly as drawn). Both grow from the top right, the corner they stand in.
*/
.ds-map-navigator {
  display: inline-flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  box-sizing: border-box;
  padding: var(--ds-spacing-md);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-raised);
  transform-origin: top right;
  /* Its own height in any row it lands in — a stretched card is a hole in the map. */
  align-self: flex-start;
}

.ds-map-navigator--folded {
  flex-direction: row;
  align-items: center;
  gap: var(--ds-spacing-xxs);
  padding: var(--ds-spacing-xs);
  border-radius: var(--ds-radius-surface-sm);
}

/* 148 × 96, as drawn; the engine's canvas fills it. */
.ds-map-navigator__minimap {
  position: relative;
  width: 9.25rem;
  height: 6rem;
  overflow: hidden;
  border-radius: var(--ds-radius-inner);
  background: var(--ds-bg-neutral-subtle);
}

.ds-map-navigator__minimap > :deep(:not(.ds-map-navigator__fold)) {
  width: 100%;
  height: 100%;
}

.ds-map-navigator__fold {
  position: absolute;
  top: var(--ds-spacing-xs);
  right: var(--ds-spacing-xs);
}

.ds-map-navigator__zoom {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xxs);
  width: 9.25rem;
}

.ds-map-navigator__rule {
  flex: none;
  width: var(--ds-border-width-default);
  height: 20px;
  background: var(--ds-border-subtle);
}
</style>
