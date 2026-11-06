<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { readDuration } from '../../composables/cssTime'

/**
 * `MapNavigator`'s zoom gauge (internal, ADR-0121) — a value that **follows a
 * moving map**. The product passes the map's zoom continuously (13.62 while a
 * wheel turns), so the gauge shows **any** value between `min` and `max`: the
 * native range takes `step="any"`, and `step` only sets what − / + and the
 * keyboard move by.
 *
 * Two ways the thumb moves, and they must not mix:
 *
 * - **following** — the value arrives frame by frame from the map, which *is*
 *   the motion: the thumb sits on it with no transition, or it would trail the
 *   map by a whole duration;
 * - **gliding** — a step (− / +, the arrows, Home / End) is one jump of the
 *   value, which the map then travels over `duration-process`. The thumb
 *   travels with it, on the token's duration and `easing-in-out` (a thing that
 *   travels), **pinned to its target**: the map's own values on the way there
 *   (and the product's echo of the target before them) would otherwise pull it
 *   back and forth. A value outside the trip — the wheel turned the other way —
 *   is a new gesture and the glide yields to it.
 *
 * Dragging never glides: the thumb stays under the finger — pinned to it, so a
 * map that follows the finger a little late cannot pull it back — and stays
 * where it was let go while the map catches up. Under reduced motion nothing
 * glides, and the thumb follows the map.
 *
 * The native thumb cannot be animated, so it is transparent and keeps the
 * pointer, the keyboard and the reader; the drawn one travels the same span.
 */
const props = defineProps<{
  min: number
  max: number
  step: number
  label: string
  disabled?: boolean
}>()

const value = defineModel<number>({ required: true })

const clamp = (z: number) => Math.min(props.max, Math.max(props.min, z))

/* While the thumb is pinned — a glide, a drag, the map catching up after one —
   where it stands, and where the map left from. Only a glide is animated. */
const target = ref<number | null>(null)
const gliding = ref(false)
let from = 0
let timer: ReturnType<typeof setTimeout> | undefined
const dragging = ref(false)

const shown = computed(() => clamp(target.value ?? value.value))
const at = computed(() => (props.max > props.min ? (shown.value - props.min) / (props.max - props.min) : 0))

const root = ref<HTMLElement | null>(null)

function settle() {
  clearTimeout(timer)
  timer = undefined
  target.value = null
  gliding.value = false
}

/* The duration ends a pin, plus a frame or three for the map to land — not
   `transitionend`, which a trip the thumb never makes (two presses
   back to where it stood) and a drag never fire. */
function arm() {
  clearTimeout(timer)
  timer = setTimeout(settle, (root.value ? readDuration(root.value, '--ds-motion-duration-process') : 0) + 50)
}

function go(to: number) {
  const next = clamp(to)
  const base = target.value ?? value.value
  if (next === base) return
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) settle()
  else {
    from = target.value === null ? value.value : shown.value
    target.value = next
    gliding.value = true
    arm()
  }
  value.value = next
}

/** − / + and the arrows: one step from where the thumb is going. */
function stepBy(d: number) {
  go((target.value ?? value.value) + d * props.step)
}

defineExpose({ stepBy })

/* The value left the trip: a new gesture, which the thumb follows. */
watch(value, (v) => {
  if (target.value === null || dragging.value) return
  const lo = Math.min(from, target.value) - 1e-6
  const hi = Math.max(from, target.value) + 1e-6
  if (v < lo || v > hi) settle()
})

function onKey(e: KeyboardEvent) {
  const steps: Record<string, () => void> = {
    ArrowRight: () => stepBy(1),
    ArrowUp: () => stepBy(1),
    ArrowLeft: () => stepBy(-1),
    ArrowDown: () => stepBy(-1),
    PageUp: () => stepBy(1),
    PageDown: () => stepBy(-1),
    Home: () => go(props.min),
    End: () => go(props.max),
  }
  const act = steps[e.key]
  if (!act) return
  e.preventDefault()
  act()
}

function release() {
  if (!dragging.value) return
  dragging.value = false
  window.removeEventListener('pointerup', release)
  window.removeEventListener('pointercancel', release)
  /* Let go where it stands; the map's values on the way there keep it pinned. */
  if (target.value !== null) {
    from = value.value
    arm()
  }
}

function press() {
  settle()
  dragging.value = true
  window.addEventListener('pointerup', release)
  window.addEventListener('pointercancel', release)
}

function onInput(e: Event) {
  const v = clamp(Number((e.target as HTMLInputElement).value))
  if (dragging.value) target.value = v
  value.value = v
}

onBeforeUnmount(() => {
  clearTimeout(timer)
  release()
})
</script>

<template>
  <span
    ref="root"
    class="ds-map-zoom-gauge"
    :class="{ 'ds-map-zoom-gauge--gliding': gliding, 'ds-map-zoom-gauge--disabled': disabled }"
    :style="{ '--at': at }"
  >
    <input
      class="ds-map-zoom-gauge__input"
      type="range"
      :min="min"
      :max="max"
      step="any"
      :value="shown"
      :aria-label="label"
      :disabled="disabled"
      :aria-valuetext="String(Math.round(shown * 10) / 10)"
      @input="onInput"
      @keydown="onKey"
      @pointerdown="press"
    />
    <span class="ds-map-zoom-gauge__span" aria-hidden="true">
      <span class="ds-map-zoom-gauge__mover">
        <span class="ds-map-zoom-gauge__thumb" />
      </span>
    </span>
  </span>
</template>

<style scoped>
/*
  The gauge, as drawn: a 4px `border-subtle` channel and a 12px thumb — white,
  ringed 2px in the text's ink. The part already travelled is not filled, as
  drawn. The channel is the native track; the thumb is drawn over it.
*/
.ds-map-zoom-gauge {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  height: 32px;
}

.ds-map-zoom-gauge__input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  margin: 0;
  background: transparent;
  cursor: pointer;
  appearance: none;
  outline: none;
}

.ds-map-zoom-gauge__input::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: var(--ds-radius-pill);
  background: var(--ds-border-subtle);
}

.ds-map-zoom-gauge__input::-moz-range-track {
  height: 4px;
  border-radius: var(--ds-radius-pill);
  background: var(--ds-border-subtle);
}

/* The native thumb keeps its size — it is what the pointer grabs — and shows nothing. */
.ds-map-zoom-gauge__input::-webkit-slider-thumb {
  width: 12px;
  height: 12px;
  margin-top: -4px;
  opacity: 0;
  appearance: none;
}

.ds-map-zoom-gauge__input::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border: none;
  opacity: 0;
}

/* The span the thumb's left edge travels: the gauge less one thumb, as the native one does. */
.ds-map-zoom-gauge__span {
  position: absolute;
  inset-block: 0;
  inset-inline: 0 12px;
  pointer-events: none;
}

/* As wide as the span, so a percentage of its own width is a fraction of the trip. */
.ds-map-zoom-gauge__mover {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  transform: translateX(calc(var(--at) * 100%));
}

.ds-map-zoom-gauge--gliding .ds-map-zoom-gauge__mover {
  transition: transform var(--ds-motion-duration-process) var(--ds-motion-easing-in-out);
}

.ds-map-zoom-gauge__thumb {
  flex: none;
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: var(--ds-border-width-strong) solid var(--ds-text-default);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-default);
  transition: box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-map-zoom-gauge--disabled .ds-map-zoom-gauge__input {
  cursor: not-allowed;
}

/* Off, it looks off: the ring takes the disabled buttons' half ink (ADR-0118). */
.ds-map-zoom-gauge--disabled .ds-map-zoom-gauge__thumb {
  border-color: color-mix(in srgb, var(--ds-text-disabled) 50%, transparent);
}

.ds-map-zoom-gauge__input:focus-visible + .ds-map-zoom-gauge__span .ds-map-zoom-gauge__thumb {
  box-shadow: var(--ds-focus-ring-gray);
}
</style>
