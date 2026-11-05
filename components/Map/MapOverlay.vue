<script setup lang="ts">
/**
 * A place on a map (ADR-0087): one of six — the four corners of the owner's
 * drawing, and the middle of the top and the bottom edges (a toolbar centred,
 * as Global Nature Watch and Felt put it). It sits **16px** from the map's
 * edges, the page's rhythm (the benchmark's majority is 10; the owner's frame
 * is 16), and draws nothing itself: it holds `MapPanel`s and `MapControls`,
 * which are the surfaces.
 *
 * What it holds **stacks toward the map's centre**, 8px apart — downward from
 * a top corner, upward from a bottom one (MapLibre: « stacked toward the
 * center of the map »). Only its children take the pointer: between them, the
 * map stays draggable.
 *
 * Two more places hold **a whole side** (ADR-0103): `start` and `end` run from
 * 16px under the top edge to 16px over the bottom one — the column a screen is
 * read from (`MapPanel size="lg"`, which then fills that height and keeps its
 * foot at the bottom). The GIS screen's layout, as the owner's frames place
 * it: the panel on `start`, the legend on `top` and the timeline on `bottom`
 * (one 480px axis, centred on the map), the navigator on `top-end`.
 *
 * The map's container must be positioned (`position: relative`); the overlay
 * is placed in it.
 */
export type MapOverlayPosition =
  | 'top-start' | 'top' | 'top-end'
  | 'bottom-start' | 'bottom' | 'bottom-end'
  | 'start' | 'end'

withDefaults(defineProps<{ position?: MapOverlayPosition }>(), {
  position: 'top-start',
})
</script>

<template>
  <div class="ds-map-overlay" :class="`ds-map-overlay--${position}`">
    <slot />
  </div>
</template>

<style scoped>
.ds-map-overlay {
  position: absolute;
  z-index: var(--ds-z-raised);
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  max-width: calc(100% - 2 * var(--ds-spacing-xl));
  max-height: calc(100% - 2 * var(--ds-spacing-xl));
  pointer-events: none;
}

.ds-map-overlay > :deep(*) {
  pointer-events: auto;
}

/* A whole side: from the top edge to the bottom one, its children stacked
   down from the top, the last one free to take what is left. */
.ds-map-overlay--start,
.ds-map-overlay--end {
  top: var(--ds-spacing-xl);
  bottom: var(--ds-spacing-xl);
}

.ds-map-overlay--start {
  inset-inline-start: var(--ds-spacing-xl);
  align-items: flex-start;
}

.ds-map-overlay--end {
  inset-inline-end: var(--ds-spacing-xl);
  align-items: flex-end;
}

/* Top: the first child against the edge, the next under it. */
.ds-map-overlay--top-start,
.ds-map-overlay--top,
.ds-map-overlay--top-end {
  top: var(--ds-spacing-xl);
}

/* Bottom: the first child against the edge, the next above it. */
.ds-map-overlay--bottom-start,
.ds-map-overlay--bottom,
.ds-map-overlay--bottom-end {
  bottom: var(--ds-spacing-xl);
  flex-direction: column-reverse;
}

.ds-map-overlay--top-start,
.ds-map-overlay--bottom-start {
  inset-inline-start: var(--ds-spacing-xl);
  align-items: flex-start;
}

.ds-map-overlay--top-end,
.ds-map-overlay--bottom-end {
  inset-inline-end: var(--ds-spacing-xl);
  align-items: flex-end;
}

.ds-map-overlay--top,
.ds-map-overlay--bottom {
  left: 50%;
  translate: -50% 0;
  align-items: center;
}
</style>
