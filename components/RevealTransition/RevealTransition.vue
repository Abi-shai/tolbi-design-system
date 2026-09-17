<script setup lang="ts">
/**
 * A surface that **opens its own height in place** once it has something to
 * show — the fourth member of the transition family, after `SurfaceTransition`
 * (floats), `MarkTransition` (confirms) and `SwapTransition` (hands over).
 *
 * Extracted from the product's dashboard banner. Three things it carries, each
 * of which cost a debugging session there:
 *
 * **It is not a fade.** The height opens; the content arriving is a second,
 * later movement. Fading a full-width band in reads as "it appeared"; opening it
 * reads as "it arrived" — and the difference is entirely in the offset between
 * the two.
 *
 * **`ambient` and `in-out`, not `process` and `default`.** Measured in the
 * product: at 300ms on `easing-default` the band was 44% open in 50ms and 71% in
 * 100ms, then dawdled — `easing-default` is a pronounced ease-out that leaves
 * the line flat out. `easing-in-out` over `ambient` (600ms) reads 2% at 50ms,
 * 24% at 150ms, 78% at 300ms. It settles in rather than springing open.
 *
 * **The two-frame problem is gone by construction.** The product toggled a flag
 * inside `requestAnimationFrame` and the transition never ran: rAF fires at the
 * start of the rendering steps, *before* style recalculation, so the insertion
 * and the class landed in the same frame, the browser never saw the collapsed
 * state, and it painted the final one. It needed a second nested rAF. Vue's
 * `<Transition>` already does exactly that (`nextFrame` in `runtime-dom`), which
 * is the whole reason to reach for this component instead of a hand-rolled flag.
 *
 * The row is a grid going `0fr -> 1fr` (ADR-0025) rather than a measured height:
 * `height: auto` is not animatable, and the grid also collapses the content's
 * own padding and margins for free — the product animated five properties to get
 * there. Unlike `SurfaceTransition` this renders its own element, so the grid
 * cannot end up on the wrong one, and the styles can be scoped.
 */
interface Props {
  /** Open when this turns true. */
  show?: boolean
}

withDefaults(defineProps<Props>(), { show: false })
</script>

<template>
  <Transition name="ds-reveal">
    <div v-if="show" class="ds-reveal">
      <div class="ds-reveal__inner"><slot /></div>
    </div>
  </Transition>
</template>

<style scoped>
.ds-reveal {
  display: grid;
  grid-template-rows: 1fr;
}

/* Without this the content spills out of the collapsed row instead of being
   clipped by it — and the clip is what carries the padding and margins down. */
.ds-reveal__inner {
  overflow: hidden;
  min-height: 0;
}

.ds-reveal-enter-active,
.ds-reveal-leave-active {
  transition: grid-template-rows var(--ds-motion-duration-ambient) var(--ds-motion-easing-in-out);
}

.ds-reveal-enter-from,
.ds-reveal-leave-to {
  grid-template-rows: 0fr;
}

/* The second movement. It starts a step late on purpose — `enter` (200ms) of
   delay — so the content lands as the height is nearly won rather than riding
   down with the edge. That offset is the whole difference between a surface
   that opens and one that merely appears. */
.ds-reveal-enter-active .ds-reveal__inner,
.ds-reveal-leave-active .ds-reveal__inner {
  transition:
    opacity var(--ds-motion-duration-considered) var(--ds-motion-easing-out)
      var(--ds-motion-duration-enter),
    transform var(--ds-motion-duration-considered) var(--ds-motion-easing-out)
      var(--ds-motion-duration-enter);
}

.ds-reveal-enter-from .ds-reveal__inner,
.ds-reveal-leave-to .ds-reveal__inner {
  opacity: 0;
  transform: translateY(6px);
}
</style>
