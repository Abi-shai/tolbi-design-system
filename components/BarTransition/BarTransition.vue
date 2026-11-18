<script setup lang="ts">
import { computed } from 'vue'

/**
 * One bar giving way to another at the top of the page (ADR-0216): entering a
 * GIS project, the app's bar (`HorizontalNavigation`) rises out through the top
 * and the project's (`MapTopBar`) takes its place — and back the other way on
 * leaving. Wrap the bars in it; the product's `v-if` / `v-else` does the rest.
 *
 * The leaver **rises and fades** over `enter`, accelerating (`easing-in`).
 * How the arriver comes is the `variant`, read when it enters:
 *
 * - **`rise`** (default, ADR-0218) — it **comes up 8px** (`spacing-md`) and
 *   fades in over `process`, decelerating (`easing-out`), **one `quick`
 *   later**: the app's bar coming back as the project's leaves. Both move up —
 *   one way, one gesture; 0.167's bar coming *down* while the other rose read
 *   as two movements against each other. `SwapTransition rise`'s mechanism.
 *   (`slide`, its 0.167 name, is read as `rise`.)
 * - **`reveal`** (ADR-0217) — the project's bar on entering a map: the map alone
 *   for **`hold`** (800ms), then the bar **opens its height** from the top edge,
 *   `RevealTransition`'s mechanism (`0fr → 1fr` over `ambient`, `easing-in-out`)
 *   rather than a slide — the glass and its rule grow — and its content arrives
 *   **one `enter` later**, coming up 6px and fading in over `considered`
 *   (`easing-out`). The offset is what draws the eye to the bar. The element
 *   that enters must **wrap** the bar (`<div><MapTopBar/></div>`): it becomes
 *   the one-row grid, the bar its row, the bar's own children the content.
 *   It clips only while it opens, so a menu overflows normally afterwards.
 *
 * Bind the variant to where the user is going — `reveal` into a project,
 * `rise` back out. The two bars are in the
 * document together while one leaves, so the product lays them in one cell.
 *
 * Under reduced motion, nothing travels and nothing waits: `motion.css` cuts the
 * durations, and the delays (the hold included) are cut here.
 *
 * Its `<style>` is unscoped on purpose (ADR-0021): Vue puts the classes on the
 * slotted element, which carries the parent's scope id.
 */
interface Props {
  /**
   * How the arriving bar comes — `rise` 8px into place (ADR-0218), or `reveal`
   * its height after a hold (ADR-0217). `slide` is 0.167's name for `rise`.
   */
  variant?: 'rise' | 'reveal' | 'slide'
  /** `reveal` only: how long the map stays alone before the bar opens, in ms. */
  hold?: number
}

const props = withDefaults(defineProps<Props>(), { variant: 'rise', hold: 800 })

const enter = computed(() => (props.variant === 'reveal' ? 'ds-bar-reveal' : 'ds-bar'))

function beforeEnter(el: Element) {
  if (props.variant === 'reveal') (el as HTMLElement).style.setProperty('--bar-hold', `${props.hold}ms`)
}

function afterEnter(el: Element) {
  (el as HTMLElement).style.removeProperty('--bar-hold')
}
</script>

<template>
  <Transition
    name="ds-bar"
    :enter-from-class="`${enter}-enter-from`"
    :enter-active-class="`${enter}-enter-active`"
    :enter-to-class="`${enter}-enter-to`"
    @before-enter="beforeEnter"
    @after-enter="afterEnter"
    @enter-cancelled="afterEnter"
  >
    <slot />
  </Transition>
</template>

<style>
/* Rise (ADR-0218): up 8px and in, one `quick` after the leaver starts — both
   bars move up, the leaver out through the top, the arriver into its place. */
.ds-bar-enter-active {
  transition:
    transform var(--ds-motion-duration-process) var(--ds-motion-easing-out) var(--ds-motion-duration-quick),
    opacity var(--ds-motion-duration-process) var(--ds-motion-easing-out) var(--ds-motion-duration-quick);
}

.ds-bar-leave-active {
  transition:
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in),
    opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-in);
}

.ds-bar-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

.ds-bar-enter-from {
  transform: translateY(var(--ds-spacing-md));
  opacity: 0;
}

/*
  Reveal (ADR-0217): after the leaver's `enter` and the hold, the row opens over
  `ambient` — the element is the grid, the bar its row, clipped while it grows.
  `min-height: 0` lets the row reach 0: a grid item's automatic minimum is its
  content's height, and the bar's is 56.
*/
.ds-bar-reveal-enter-active {
  display: grid;
  overflow: hidden;
  transition: grid-template-rows var(--ds-motion-duration-ambient) var(--ds-motion-easing-in-out)
    calc(var(--ds-motion-duration-enter) + var(--bar-hold, 0ms));
}

.ds-bar-reveal-enter-active > * {
  min-height: 0;
}

.ds-bar-reveal-enter-from {
  grid-template-rows: 0fr;
}

.ds-bar-reveal-enter-to {
  grid-template-rows: 1fr;
}

/* The content, one `enter` after the opening starts: up 6px (`spacing-sm`) and in. */
.ds-bar-reveal-enter-active > * > * {
  transition:
    opacity var(--ds-motion-duration-considered) var(--ds-motion-easing-out)
      calc(2 * var(--ds-motion-duration-enter) + var(--bar-hold, 0ms)),
    transform var(--ds-motion-duration-considered) var(--ds-motion-easing-out)
      calc(2 * var(--ds-motion-duration-enter) + var(--bar-hold, 0ms));
}

.ds-bar-reveal-enter-from > * > * {
  opacity: 0;
  transform: translateY(var(--ds-spacing-sm));
}

@media (prefers-reduced-motion: reduce) {
  .ds-bar-enter-active,
  .ds-bar-reveal-enter-active,
  .ds-bar-reveal-enter-active > * > * {
    transition-delay: 0s;
  }
}
</style>
