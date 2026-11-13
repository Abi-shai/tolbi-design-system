<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

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

const props = withDefaults(defineProps<{ position?: MapOverlayPosition }>(), {
  position: 'top-start',
})

/*
  `top` and `bottom` centre in the room the sides leave (ADR-0168). A side
  (`start`, `end`) says how much of the map it takes — from the map's edge to
  its own far edge, the 16px inset counted — on the map's container, and the
  middle places sit between those two marks. They move when a side changes: a
  reading panel folded into its button, a parcel's sheet opened at the end.
  Before, the legend and the timeline stayed centred on the whole map and
  passed under the sheet. Nothing is published while a side holds nothing.
*/
const root = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null
let published: { host: HTMLElement; name: string } | null = null

function publish() {
  const el = root.value
  const host = el?.parentElement
  if (!el || !host) return
  const name = props.position === 'start' ? '--map-overlay-start' : '--map-overlay-end'
  const r = el.getBoundingClientRect()
  const h = host.getBoundingClientRect()
  const rtl = getComputedStyle(host).direction === 'rtl'
  const atStart = props.position === 'start'
  const taken = atStart !== rtl ? r.right - h.left : h.right - r.left
  if (r.width < 1) host.style.removeProperty(name)
  else host.style.setProperty(name, `${Math.round(taken)}px`)
  published = { host, name }
}

onMounted(() => {
  if (props.position !== 'start' && props.position !== 'end') return
  if (typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(publish)
  if (root.value) observer.observe(root.value)
  publish()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  published?.host.style.removeProperty(published.name)
})
</script>

<template>
  <div ref="root" class="ds-map-overlay" :class="`ds-map-overlay--${position}`">
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
  /* A side panel here leaves toward the right edge (MapPanel's travel). */
  --map-panel-side: 1;
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
  /* Between the sides' marks (ADR-0168), not on the whole map: the box spans
     the free room and centres what it holds. It glides there at the sheet's
     own pace when a side changes. */
  inset-inline-start: calc(var(--map-overlay-start, 0px) + var(--ds-spacing-xl));
  inset-inline-end: calc(var(--map-overlay-end, 0px) + var(--ds-spacing-xl));
  max-width: none;
  align-items: center;
  transition:
    inset-inline-start var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    inset-inline-end   var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

@media (prefers-reduced-motion: reduce) {
  .ds-map-overlay--top,
  .ds-map-overlay--bottom {
    transition: none;
  }
}
</style>
