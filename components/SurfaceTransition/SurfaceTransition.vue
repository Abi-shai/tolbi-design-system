<script setup lang="ts">
/**
 * The house entrance for anything that floats: a dropdown panel, a tooltip, a
 * toast. Scale + fade from the anchor — the surface grows from 96% while
 * fading in, which ties it visually to whatever opened it and moves nothing
 * around it.
 *
 * ADR-0021. `Dropdown` used scale(0.98) with a translate, `HelpIcon` used
 * scale(0.96), and `InputDropdown` had nothing. One decision, one value.
 *
 * The exit is deliberately faster than the entrance: a surface should get out
 * of the way quicker than it arrives.
 *
 * The consuming surface sets its own `transform-origin` — only it knows where
 * its anchor is:
 *
 *     .my-panel { transform-origin: top left; }
 */
</script>

<template>
  <Transition name="ds-surface">
    <slot />
  </Transition>
</template>

<!--
  Deliberately NOT scoped. Vue applies transition classes to the *slotted*
  element, which carries the parent's scope id and not this component's — a
  scoped rule would never match. The `ds-surface-` prefix is the namespace.
-->
<style>
.ds-surface-enter-active {
  transition:
    opacity   var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
}

.ds-surface-leave-active {
  transition:
    opacity   var(--ds-motion-duration-exit) var(--ds-motion-easing-in),
    transform var(--ds-motion-duration-exit) var(--ds-motion-easing-in);
}

.ds-surface-enter-from,
.ds-surface-leave-to {
  opacity: 0;
  transform: scale(var(--ds-motion-scale-enter));
}
</style>
