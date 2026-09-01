<script setup lang="ts">
/**
 * The motion for a mark that confirms an action: a checkbox tick, a selected
 * item's check, a completed step. It stamps in from 60% and fades, faster than
 * a surface entrance — a mark *confirms* where a surface *arrives*.
 *
 * ADR-0023. Sibling of `SurfaceTransition`, and the same unscoped-style caveat
 * applies: Vue puts the transition classes on the slotted element, which carries
 * the parent's scope id, so a scoped rule would never match — and would fail
 * silently.
 *
 * `mode="out-in"` because a mark sits in a centred flex box: two children
 * present at once would sit side by side and jump. It costs nothing in the
 * common case (nothing → mark has no outgoing element) and only shows on the
 * rare swap, such as indeterminate → checked.
 */
</script>

<template>
  <Transition name="ds-mark" mode="out-in">
    <slot />
  </Transition>
</template>

<style>
.ds-mark-enter-active {
  transition:
    opacity   var(--ds-motion-duration-quick) var(--ds-motion-easing-out),
    transform var(--ds-motion-duration-quick) var(--ds-motion-easing-out);
}

.ds-mark-leave-active {
  transition:
    opacity   var(--ds-motion-duration-exit) var(--ds-motion-easing-in),
    transform var(--ds-motion-duration-exit) var(--ds-motion-easing-in);
}

.ds-mark-enter-from,
.ds-mark-leave-to {
  opacity: 0;
  transform: scale(var(--ds-motion-scale-mark));
}
</style>
