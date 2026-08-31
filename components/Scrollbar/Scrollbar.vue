<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Props {
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
}

const props = withDefaults(defineProps<Props>(), { horizontal: false, shadows: false })

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
const atStart = ref(true)
const atEnd = ref(false)

/** Below this the thumb becomes an untargetable sliver. */
const MIN_THUMB = 24

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

/** Show the thumb, then fade it out once scrolling settles. */
function reveal() {
  visible.value = true
  if (hideTimer) clearTimeout(hideTimer)
  hideTimer = setTimeout(() => {
    if (!dragging.value) visible.value = false
  }, 700)
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
</script>

<template>
  <div
    class="ds-scrollbar"
    :class="{
      'ds-scrollbar--horizontal': horizontal,
      'ds-scrollbar--shadows': shadows && scrollable,
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
      :class="{ 'ds-scrollbar__thumb--visible': visible }"
      :style="
        horizontal
          ? { width: `${thumbSize}px`, transform: `translateX(${thumbOffset}px)` }
          : { height: `${thumbSize}px`, transform: `translateY(${thumbOffset}px)` }
      "
      aria-hidden="true"
      @pointerdown="onThumbDown"
      @pointermove="onThumbMove"
      @pointerup="onThumbUp"
      @pointercancel="onThumbUp"
    />

    <!-- Purely decorative, and never intercepting a pointer. -->
    <template v-if="shadows && scrollable">
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
  background-color: var(--ds-bg-neutral-strong);
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

.ds-scrollbar:hover .ds-scrollbar__thumb,
.ds-scrollbar__thumb--visible {
  opacity: 1;
}

.ds-scrollbar__thumb:hover,
.ds-scrollbar__thumb:active {
  background-color: var(--ds-bg-neutral-strong);
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

/* Hide the fade on the edge that has nothing left to reveal. */
.ds-scrollbar--at-start .ds-scrollbar__fade--start,
.ds-scrollbar--at-end   .ds-scrollbar__fade--end { opacity: 0; }
</style>
