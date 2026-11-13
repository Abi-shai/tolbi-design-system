<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

/* Exported so that a component holding a Scrollbar ref can be declared:
   an unexported props interface cannot be named in its .d.ts. */
export interface ScrollbarProps {
  /** Caps the scroll viewport. Any CSS length. */
  maxHeight?: string
  /** Scroll on the x axis instead of the y axis. Thumb moves to the bottom edge. */
  horizontal?: boolean
  /**
   * Fades the leading and trailing edges while there is more content that way,
   * so a cut-off list reads as scrollable before anyone touches it.
   *
   * This lives here rather than in a separate wrapper because Scrollbar already
   * owns the scroll container and tracks the position — a second component
   * would mean a second scroller nested inside this one.
   */
  shadows?: boolean
  /**
   * The edges fade the **content**, through a mask, instead of painting the
   * ground over it (ADR-0173): on glass there is no ground to paint — the
   * painted fade was an opaque white band over a translucent pane. With
   * `shadows`, the same edges, the same 24px, the same rule (only while there
   * is more that way).
   */
  mask?: boolean
  /**
   * The thumb stays shown while there is something to scroll, from the first
   * frame (ADR-0163) — for a short list a person opens to choose from, where
   * « there is more » must be said before anyone scrolls. Off, it shows while
   * scrolling and fades a second after (ADR-0146): in a reading panel the
   * pointer is always there, and a standing bar is noise.
   */
  persistent?: boolean
}

const props = withDefaults(defineProps<ScrollbarProps>(), { horizontal: false, shadows: false, persistent: false, mask: false })

/**
 * The native scrollbar is hidden and replaced by an absolutely positioned thumb.
 *
 * A styled native scrollbar (`::-webkit-scrollbar { width }`) is a *classic*
 * scrollbar: it takes a permanent bite out of the content box and shifts the
 * layout. Styling it at all opts out of the platform's overlay behaviour. So the
 * thumb here is a real element sitting on top of the content, taking no space.
 *
 * Scrolling itself stays native — wheel, trackpad, touch, keyboard and
 * scroll-into-view all behave normally. The thumb only reflects and drags it.
 */
const viewport = ref<HTMLElement | null>(null)
const thumbSize = ref(0)
const thumbOffset = ref(0)
const scrollable = ref(false)
const visible = ref(false)
const dragging = ref(false)
const hovering = ref(false)
const atStart = ref(true)
const atEnd = ref(false)

/** Below this the thumb becomes an untargetable sliver. */
const MIN_THUMB = 24

/**
 * How long the thumb stays after the last movement — macOS's overlay bars
 * (ADR-0146). A delay, so not a token: it is the time something is *left*
 * on screen, not the length of a movement.
 */
const LINGER = 1000

let hideTimer: ReturnType<typeof setTimeout> | undefined
let observer: ResizeObserver | undefined
let dragOrigin = 0
let scrollOrigin = 0

function measure() {
  const el = viewport.value
  if (!el) return

  const [scrollSize, clientSize, scrollPos] = props.horizontal
    ? [el.scrollWidth, el.clientWidth, el.scrollLeft]
    : [el.scrollHeight, el.clientHeight, el.scrollTop]

  // Sub-pixel layout rounding leaves a fractional overflow on content that
  // actually fits; 1px of slack keeps the thumb from flickering into view.
  scrollable.value = scrollSize - clientSize > 1

  // Same 1px slack at both ends, so a fade never lingers on a fully scrolled edge.
  atStart.value = scrollPos <= 1
  atEnd.value = scrollPos >= scrollSize - clientSize - 1

  if (!scrollable.value) return

  const size = Math.max((clientSize / scrollSize) * clientSize, MIN_THUMB)
  const travel = clientSize - size
  const overflow = scrollSize - clientSize

  thumbSize.value = size
  thumbOffset.value = overflow > 0 ? (scrollPos / overflow) * travel : 0
}

/**
 * Show the thumb, then fade it out a second after the last movement — unless
 * it is held or pointed at. **Pointing at the area shows nothing** (ADR-0146):
 * in a panel the pointer is always there, so a thumb tied to the area's
 * `:hover` never left; the edge fades already say there is more.
 */
function reveal() {
  visible.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (!dragging.value && !hovering.value) visible.value = false
  }, LINGER)
}

/* The thumb itself, pointed at: shown while the pointer is on it, and
   lingering a second after it leaves, as after a scroll. */
function onThumbEnter() {
  hovering.value = true
  visible.value = true
  if (hideTimer) clearTimeout(hideTimer)
}

function onThumbLeave() {
  hovering.value = false
  if (!dragging.value) reveal()
}

function onScroll() {
  measure()
  reveal()
}

function onThumbDown(event: PointerEvent) {
  const el = viewport.value
  if (!el) return

  dragging.value = true
  visible.value = true
  dragOrigin = props.horizontal ? event.clientX : event.clientY
  scrollOrigin = props.horizontal ? el.scrollLeft : el.scrollTop
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  event.preventDefault()
}

function onThumbMove(event: PointerEvent) {
  const el = viewport.value
  if (!dragging.value || !el) return

  const clientSize = props.horizontal ? el.clientWidth : el.clientHeight
  const scrollSize = props.horizontal ? el.scrollWidth : el.scrollHeight
  const travel = clientSize - thumbSize.value
  if (travel <= 0) return

  const moved = (props.horizontal ? event.clientX : event.clientY) - dragOrigin
  const next = scrollOrigin + (moved / travel) * (scrollSize - clientSize)

  if (props.horizontal) el.scrollLeft = next
  else el.scrollTop = next
}

function onThumbUp() {
  dragging.value = false
  reveal()
}

onMounted(() => {
  const el = viewport.value
  if (!el) return

  measure()

  // Watch the viewport and its content: either resizing changes whether we
  // overflow and by how much.
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure)
    observer.observe(el)
    for (const child of Array.from(el.children)) observer.observe(child)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (hideTimer) clearTimeout(hideTimer)
})

/* The element that scrolls, for a parent that has to move it — a thread that
   follows its newest message (`TolbiAiPanel`, ADR-0062). */
defineExpose({ viewport })
</script>

<template>
  <div
    class="ds-scrollbar"
    :class="{
      'ds-scrollbar--horizontal': horizontal,
      'ds-scrollbar--shadows': shadows && scrollable && !mask,
      'ds-scrollbar--mask': shadows && scrollable && mask,
      'ds-scrollbar--at-start': atStart,
      'ds-scrollbar--at-end': atEnd,
    }"
  >
    <div
      ref="viewport"
      class="ds-scrollbar__viewport"
      :style="maxHeight ? { maxHeight } : undefined"
      @scroll="onScroll"
    >
      <slot />
    </div>

    <div
      v-if="scrollable"
      class="ds-scrollbar__thumb"
      :class="{ 'ds-scrollbar__thumb--visible': visible || persistent, 'ds-scrollbar__thumb--held': dragging }"
      :style="
        horizontal
          ? { width: `${thumbSize}px`, transform: `translateX(${thumbOffset}px)` }
          : { height: `${thumbSize}px`, transform: `translateY(${thumbOffset}px)` }
      "
      aria-hidden="true"
      @pointerenter="onThumbEnter"
      @pointerleave="onThumbLeave"
      @pointerdown="onThumbDown"
      @pointermove="onThumbMove"
      @pointerup="onThumbUp"
      @pointercancel="onThumbUp"
    />

    <!-- Purely decorative, and never intercepting a pointer. -->
    <template v-if="shadows && scrollable && !mask">
      <span class="ds-scrollbar__fade ds-scrollbar__fade--start" aria-hidden="true" />
      <span class="ds-scrollbar__fade ds-scrollbar__fade--end" aria-hidden="true" />
    </template>
  </div>
</template>

<style scoped>
/*
 * The root is the height-constrained, NON-scrolling box; the viewport inside it
 * is what scrolls. The thumb has to be absolute against something static —
 * inside the scroller it would scroll along with the content.
 *
 * Hence flex + `min-height: 0` rather than `height: 100%` on the viewport: a
 * percentage cannot resolve against a root whose own height is content-based
 * (capped by a max-height), and the viewport would size to its content and spill
 * out instead of scrolling. Consumers should size <Scrollbar> with height or
 * max-height and leave its `display` alone.
 */
.ds-scrollbar {
  position: relative;
  display: flex;
  min-width: 0;
  min-height: 0;
}

.ds-scrollbar__viewport {
  flex: 1 1 auto;
  min-width: 0;
  /* Lets the flex item shrink below its content size so it can scroll. */
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  /* Hide the native bar so it claims no layout space. */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.ds-scrollbar--horizontal .ds-scrollbar__viewport {
  overflow-x: auto;
  overflow-y: hidden;
}

.ds-scrollbar__viewport::-webkit-scrollbar {
  display: none;
}

.ds-scrollbar__thumb {
  position: absolute;
  border-radius: var(--ds-radius-pill);
  /* Its own role (ADR-0147): a bar the product draws owes WCAG 1.4.11's 3:1 —
     `bg-neutral-strong` (1.47:1) is the slider's channel and read as a border. */
  background-color: var(--ds-bg-scrollbar);
  opacity: 0;
  transition:
    opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-out),
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
  /* 8px thumb inset 4px — the weight the styled native bar used to have. */
  width: 8px;
  top: 0;
  right: 4px;
  touch-action: none;
}

.ds-scrollbar--horizontal .ds-scrollbar__thumb {
  width: auto;
  height: 8px;
  top: auto;
  right: auto;
  left: 0;
  bottom: 4px;
}

.ds-scrollbar__thumb--visible {
  opacity: 1;
}

/* Reduced motion: it appears and goes without a fade — and so do the edges. */
@media (prefers-reduced-motion: reduce) {
  .ds-scrollbar__thumb,
  .ds-scrollbar__fade {
    transition: none;
  }
}

/* Pointed at or held — `--held` as well as `:active`, because a captured
   pointer that leaves the thumb mid-drag drops `:hover`. */
.ds-scrollbar__thumb:hover,
.ds-scrollbar__thumb:active,
.ds-scrollbar__thumb--held {
  background-color: var(--ds-bg-scrollbar-hover);
}

/* ── Edge fades ───────────────────────────────────────────────────── */
.ds-scrollbar__fade {
  position: absolute;
  pointer-events: none;
  opacity: 1;
  transition: opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
  /* Fades to the surface behind, which the consumer can override. */
  --fade-color: var(--ds-bg-default);
  --fade-size: 24px;
}

.ds-scrollbar__fade--start { top: 0; left: 0; right: 0; height: var(--fade-size); background: linear-gradient(to bottom, var(--fade-color), transparent); }
.ds-scrollbar__fade--end   { bottom: 0; left: 0; right: 0; height: var(--fade-size); background: linear-gradient(to top, var(--fade-color), transparent); }

.ds-scrollbar--horizontal .ds-scrollbar__fade--start { top: 0; bottom: 0; left: 0; right: auto; height: auto; width: var(--fade-size); background: linear-gradient(to right, var(--fade-color), transparent); }
.ds-scrollbar--horizontal .ds-scrollbar__fade--end   { top: 0; bottom: 0; right: 0; left: auto; height: auto; width: var(--fade-size); background: linear-gradient(to left, var(--fade-color), transparent); }

/* ── Masked edges (ADR-0173): the content fades, nothing is painted ── */
.ds-scrollbar--mask .ds-scrollbar__viewport {
  --mask-start: 24px;
  --mask-end: 24px;
  /* token-lint-disable-next-line no-colour-literal — a mask's alpha, not a colour */
  mask-image: linear-gradient(to bottom, transparent 0, black var(--mask-start), black calc(100% - var(--mask-end)), transparent 100%);
}

.ds-scrollbar--mask.ds-scrollbar--horizontal .ds-scrollbar__viewport {
  /* token-lint-disable-next-line no-colour-literal — a mask's alpha, not a colour */
  mask-image: linear-gradient(to right, transparent 0, black var(--mask-start), black calc(100% - var(--mask-end)), transparent 100%);
}

.ds-scrollbar--mask.ds-scrollbar--at-start .ds-scrollbar__viewport { --mask-start: 0px; }
.ds-scrollbar--mask.ds-scrollbar--at-end .ds-scrollbar__viewport { --mask-end: 0px; }

/* Hide the fade on the edge that has nothing left to reveal. */
.ds-scrollbar--at-start .ds-scrollbar__fade--start,
.ds-scrollbar--at-end   .ds-scrollbar__fade--end { opacity: 0; }
</style>
