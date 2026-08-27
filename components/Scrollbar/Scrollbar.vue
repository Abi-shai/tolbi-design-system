<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Props {
  /** Caps the scroll viewport. Any CSS length. */
  maxHeight?: string
  /** Scroll on the x axis instead of the y axis. Thumb moves to the bottom edge. */
  horizontal?: boolean
}

const props = withDefaults(defineProps<Props>(), { horizontal: false })

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
  <div class="ds-scrollbar" :class="{ 'ds-scrollbar--horizontal': horizontal }">
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
  border-radius: var(--ds-radius-full);
  background-color: var(--ds-semantic-bg-quaternary);
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
  background-color: var(--ds-semantic-fg-senary);
}
</style>
