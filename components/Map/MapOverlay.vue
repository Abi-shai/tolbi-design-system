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
  `top` and `bottom` stay centred on the **whole map** (ADR-0168, amended): a
  legend that slid each time the reading panel folded was a movement nobody
  asked for, and at 1 440px it never met the sheet. What the sides publish —
  how much of the map each takes, from the map's edge to its own far edge — only
  **caps** the middle's width, symmetrically, so its centre never moves: short of
  room, the legend narrows (its ramp is the elastic part) and the timeline
  scrolls, neither passes under a panel. Nothing is published while a side holds
  nothing.
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

/*
  The end side with a tools column (ADR-0171). Three things share it and none
  moves when another comes or goes: the column against the edge, under the
  top; a sheet (`MapPanel lg`) to its left, full height; Tolbi xAI's launcher
  at the column's foot, on its axis. The sheet's track is **always there**,
  25rem — `MapPanel lg`'s declared width — so the side's published width is
  the same, sheet open or not, and the legend and the timeline keep one size
  (ADR-0168's cap): 26.5rem at 1 440px, finishing before the sheet.
*/
.ds-map-overlay--end:has(> .ds-map-navigator--column) {
  display: grid;
  grid-template-columns: 25rem 44px;
  grid-template-rows: minmax(0, 1fr);
  column-gap: var(--ds-spacing-md);
  align-items: start;
}

/* `MapPanel` keeps hold of its forms in a box of no box: its panel is the item. */
.ds-map-overlay--end:has(> .ds-map-navigator--column) > :deep(*),
.ds-map-overlay--end:has(> .ds-map-navigator--column) > :deep(.ds-map-panel-host > *) {
  grid-area: 1 / 1;
  align-self: start;
  justify-self: end;
  min-height: 0;
}

/* A reading sheet takes the side's whole height. */
.ds-map-overlay--end:has(> .ds-map-navigator--column) > :deep(.ds-map-panel--lg),
.ds-map-overlay--end:has(> .ds-map-navigator--column) > :deep(.ds-map-panel-host > .ds-map-panel--lg) {
  align-self: stretch;
}

.ds-map-overlay--end:has(> .ds-map-navigator--column) > :deep(.ds-map-navigator--column) {
  grid-area: 1 / 2;
  align-self: start;
}

.ds-map-overlay--end:has(> .ds-map-navigator--column) > :deep(.ds-tolbi-ai-launcher) {
  grid-area: 1 / 2;
  align-self: end;
  justify-self: center;
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
  /* Centred on the whole map, capped by the wider side (ADR-0168, amended):
     the box is inset by the same amount on both sides, so a side that opens or
     folds changes at most how wide the middle may be — never where its centre
     is. No transition: below the cap nothing moves at all. The cap stops at
     20rem — narrower, the timeline's strip has no period left to show and the
     legend's words spill out of its pill, which is worse than reaching a
     panel's edge — and the map's own 16px margin always holds. */
  --map-overlay-side: max(var(--map-overlay-start, 0px), var(--map-overlay-end, 0px));
  inset-inline: max(
    var(--ds-spacing-xl),
    min(calc(var(--map-overlay-side) + var(--ds-spacing-xl)), calc((100% - 20rem) / 2))
  );
  max-width: none;
  align-items: center;
}

.ds-map-overlay--top > :deep(*),
.ds-map-overlay--bottom > :deep(*) {
  /* Narrowed down to what its content still holds, never past it: under
     that, a pill whose words spill out of it is worse than one that reaches
     a panel's edge. Centred either way. */
  max-width: 100%;
}
</style>
