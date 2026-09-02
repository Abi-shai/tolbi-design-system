<script setup lang="ts">
/**
 * One thing replacing another in the same slot: a skeleton becoming content, a
 * spinner becoming a chart. The most-watched transition in a data product,
 * because it happens on every page load.
 *
 * ADR-0026. Third sibling of `SurfaceTransition` and `MarkTransition`, and the
 * same unscoped-style caveat applies — Vue puts the classes on the slotted
 * element, which carries the parent's scope id.
 *
 * `mode="out-in"` is not optional here. The two states rarely have the same
 * height — skeleton rows against real rows, a spinner against a chart — so
 * overlapping them would make the container jump mid-fade. Sequencing costs the
 * two durations back to back, which is why they are `quick`.
 */
</script>

<template>
  <Transition name="ds-swap" mode="out-in">
    <slot />
  </Transition>
</template>

<style>
.ds-swap-enter-active,
.ds-swap-leave-active {
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-out);
}

.ds-swap-enter-from,
.ds-swap-leave-to {
  opacity: 0;
}
</style>
