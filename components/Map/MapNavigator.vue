<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { IconButton } from '../IconButton'
import { Tooltip, type TooltipPlacement } from '../Tooltip'
import MapPanel from './MapPanel.vue'

/**
 * Where you are on the map and how to move (ADR-0100, the owner's drawing —
 * track A): the mini-map, and under it − + and « Recentrer », **together**. It
 * folds into a bar of four buttons — the three and the mini-map's own — and
 * the zoom slider is gone (decided 4 Nov.).
 *
 * The three never move: open, the box is the mini-map's width and the row
 * keeps its places; folded, the mini-map's button takes the empty fourth one.
 * So the fold is **one height that travels** (ADR-0025's `0fr → 1fr`, `enter`
 * in and `exit` out, `in-out`), and a pointer pressing − twice finds it where
 * it was. The pressed control is replaced, so the focus goes to the one
 * replacing it (MapPanel's rule).
 *
 * The mini-map is the engine's (`#default`): the system draws its frame, not
 * the map (ADR-0006). The zoom at its limit is `disabled`.
 */
interface Props {
  zoomInLabel?: string
  zoomOutLabel?: string
  recenterLabel?: string
  expandLabel?: string
  collapseLabel?: string
  zoomInDisabled?: boolean
  zoomOutDisabled?: boolean
  /** The tooltips' side: away from the edge the navigator stands on. */
  tooltipPlacement?: TooltipPlacement
}

withDefaults(defineProps<Props>(), {
  zoomInLabel: 'Zoomer',
  zoomOutLabel: 'Dézoomer',
  recenterLabel: 'Recentrer',
  expandLabel: 'Afficher la mini-carte',
  collapseLabel: 'Masquer la mini-carte',
  zoomInDisabled: false,
  zoomOutDisabled: false,
  tooltipPlacement: 'top',
})

const emit = defineEmits<{
  'zoom-in': []
  'zoom-out': []
  recenter: []
}>()

defineSlots<{
  /** The mini-map — the engine's canvas, 4:3. */
  default?: () => unknown
}>()

const collapsed = defineModel<boolean>('collapsed', { default: false })

const root = ref<HTMLElement | null>(null)
async function fold(next: boolean) {
  collapsed.value = next
  await nextTick()
  root.value?.querySelector<HTMLElement>(next ? '[data-map-navigator-open] button' : '[data-map-navigator-fold] button')?.focus()
}
</script>

<template>
  <MapPanel class="ds-map-navigator">
    <div ref="root" class="ds-map-navigator__inner">
      <Transition name="ds-map-navigator-reveal">
        <div v-if="!collapsed" class="ds-map-navigator__reveal">
          <div class="ds-map-navigator__clip">
            <div class="ds-map-navigator__minimap">
              <slot />
              <Tooltip :title="collapseLabel" :placement="tooltipPlacement" class="ds-map-navigator__fold" data-map-navigator-fold>
                <IconButton icon="minimize-2" size="xs" variant="surface" :ariaLabel="collapseLabel" aria-expanded="true" @click="fold(true)" />
              </Tooltip>
            </div>
          </div>
        </div>
      </Transition>
      <div class="ds-map-navigator__row">
        <Tooltip :title="zoomOutLabel" :placement="tooltipPlacement">
          <IconButton icon="minus" size="xs" variant="subtle" :ariaLabel="zoomOutLabel" :disabled="zoomOutDisabled" @click="emit('zoom-out')" />
        </Tooltip>
        <Tooltip :title="zoomInLabel" :placement="tooltipPlacement">
          <IconButton icon="plus" size="xs" variant="subtle" :ariaLabel="zoomInLabel" :disabled="zoomInDisabled" @click="emit('zoom-in')" />
        </Tooltip>
        <Tooltip :title="recenterLabel" :placement="tooltipPlacement">
          <IconButton icon="crosshair" size="xs" variant="subtle" :ariaLabel="recenterLabel" @click="emit('recenter')" />
        </Tooltip>
        <Transition name="ds-map-navigator-fade">
          <Tooltip v-if="collapsed" :title="expandLabel" :placement="tooltipPlacement" data-map-navigator-open>
            <IconButton icon="map" size="xs" variant="subtle" :ariaLabel="expandLabel" aria-expanded="false" @click="fold(false)" />
          </Tooltip>
        </Transition>
      </div>
    </div>
  </MapPanel>
</template>

<style scoped>
/*
  The box is four 32px buttons 4px apart — 140px — and the mini-map is that
  wide, 4:3, so opening it never changes the width.
*/
.ds-map-navigator__inner {
  --map-navigator-width: calc(4 * 32px + 3 * var(--ds-spacing-xs));

  display: flex;
  flex-direction: column;
  width: var(--map-navigator-width);
}

/* ADR-0025: the grid sits on the transitioning element, the gap inside it, so
   nothing snaps when it closes. */
.ds-map-navigator__reveal {
  display: grid;
  grid-template-rows: 1fr;
}

.ds-map-navigator__clip {
  min-height: 0;
  overflow: hidden;
}

.ds-map-navigator__minimap {
  position: relative;
  aspect-ratio: 4 / 3;
  margin-bottom: var(--ds-spacing-md);
  overflow: hidden;
  border-radius: var(--ds-radius-inner);
  background: var(--ds-bg-neutral-subtle);
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-inset);
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

.ds-map-navigator__row {
  display: flex;
  gap: var(--ds-spacing-xs);
}

.ds-map-navigator-reveal-enter-active {
  transition:
    grid-template-rows var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

.ds-map-navigator-reveal-leave-active {
  transition:
    grid-template-rows var(--ds-motion-duration-exit) var(--ds-motion-easing-in-out),
    opacity var(--ds-motion-duration-exit) var(--ds-motion-easing-in-out);
}

.ds-map-navigator-reveal-enter-from,
.ds-map-navigator-reveal-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

/* The fourth place was empty: its button arrives there, nothing travels. */
.ds-map-navigator-fade-enter-active { transition: opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-out); }
.ds-map-navigator-fade-leave-active { transition: opacity var(--ds-motion-duration-exit) var(--ds-motion-easing-in); }
.ds-map-navigator-fade-enter-from,
.ds-map-navigator-fade-leave-to { opacity: 0; }
</style>
