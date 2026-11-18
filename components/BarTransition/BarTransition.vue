<script setup lang="ts">
/**
 * One bar giving way to another at the top of the page (ADR-0216): entering a
 * GIS project, the app's bar (`HorizontalNavigation`) rises out through the top
 * and the project's (`MapTopBar`) comes down into its place — and back the other
 * way on leaving. Wrap each bar in it; the product's `v-if` / `v-else` does the
 * rest.
 *
 * The leaver **rises and fades** over `enter`, accelerating (`easing-in`); the
 * arriver **comes down and fades in** over `process`, decelerating
 * (`easing-out`), **one `enter` later** — an arrival waits for its place to be
 * free (ADR-0049). The owner's drawing said 260 / 320 / 200ms; the scale's
 * nearest steps are 200 / 300 / 200, and the order (the leave shorter than the
 * arrival, ADR-0021) is kept. No bounce.
 *
 * The two are in the document together for one `enter`, so the product lays
 * them in one cell (a grid area or absolute positions) — two bars stacked in the
 * flow would push the page down for the length of the swap.
 *
 * Under reduced motion, nothing travels and nothing waits: `motion.css` cuts the
 * durations, and the delay is cut here, or the new bar would appear 200ms late.
 *
 * Its `<style>` is unscoped on purpose (ADR-0021): Vue puts the classes on the
 * slotted element, which carries the parent's scope id.
 */
</script>

<template>
  <Transition name="ds-bar">
    <slot />
  </Transition>
</template>

<style>
.ds-bar-enter-active {
  transition:
    transform var(--ds-motion-duration-process) var(--ds-motion-easing-out) var(--ds-motion-duration-enter),
    opacity var(--ds-motion-duration-process) var(--ds-motion-easing-out) var(--ds-motion-duration-enter);
}

.ds-bar-leave-active {
  transition:
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in),
    opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-in);
}

.ds-bar-enter-from,
.ds-bar-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ds-bar-enter-active {
    transition-delay: 0s;
  }
}
</style>
