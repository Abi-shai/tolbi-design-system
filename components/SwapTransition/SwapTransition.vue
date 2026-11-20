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
 *
 * `rise` (ADR-0216) is for a **view** replacing another, not a state: the map
 * giving way to its analytics, under a bar that does not move. The arriver
 * comes up 8px as it fades in, over `enter` (`easing-out`) — a view arrives,
 * where a skeleton only resolves.
 *
 * **It is the handoff of anything that shows one thing at a time** (ADR-0235):
 * a viewer changing document, a parcel's sheet changing parcel, a window
 * changing tab. A handoff, not a move — the things handed over are not in a
 * sequence, so a sideways slide (« next / previous ») would say what is not
 * true. The leaver only fades, over `exit` on `easing-in` (ADR-0021: the exit
 * is shorter than the entrance); the arriver comes up 8px over `enter` on
 * `easing-out`. No bounce. Key the slotted element by what it shows, so
 * choosing the same thing again replays nothing.
 */
interface Props {
  /** The arriver comes up 8px over `enter` — a view, not a state (ADR-0216). */
  rise?: boolean
}

withDefaults(defineProps<Props>(), { rise: false })
</script>

<template>
  <Transition :name="rise ? 'ds-swap-rise' : 'ds-swap'" mode="out-in">
    <slot />
  </Transition>
</template>

<style>
.ds-swap-rise-leave-active {
  transition: opacity var(--ds-motion-duration-exit) var(--ds-motion-easing-in);
}

.ds-swap-rise-enter-active {
  transition:
    opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
}

.ds-swap-rise-enter-from,
.ds-swap-rise-leave-to {
  opacity: 0;
}

.ds-swap-rise-enter-from {
  transform: translateY(var(--ds-spacing-md));
}

.ds-swap-enter-active,
.ds-swap-leave-active {
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-out);
}

.ds-swap-enter-from,
.ds-swap-leave-to {
  opacity: 0;
}
</style>
