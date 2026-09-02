<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /**
   * Any CSS length. Pass `1em` to track the surrounding font size, which is how
   * Button sizes its own spinner across all five button sizes.
   */
  size?: number | string
  /** Ring thickness in px. */
  thickness?: number
  /**
   * Accessible name. Omit for a spinner sitting next to text that already says
   * the thing is loading — it is then hidden from assistive tech.
   */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  thickness: 2,
})

const style = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  borderWidth: `${props.thickness}px`,
}))
</script>

<template>
  <span
    class="ds-spinner"
    :style="style"
    :role="label ? 'status' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : true"
  />
</template>

<style scoped>
/*
 * Colour comes from `currentColor`, so a spinner always matches the text it
 * sits with and needs no tone prop.
 */
.ds-spinner {
  display: inline-block;
  flex-shrink: 0;
  box-sizing: border-box;
  border-style: solid;
  border-color: currentColor;
  border-top-color: transparent;
  border-radius: var(--ds-radius-pill);
  animation: ds-spinner-rotate 0.6s linear infinite;
}

@keyframes ds-spinner-rotate {
  to { transform: rotate(360deg); }
}

/*
 * A spinner is the one place a stopped animation is worse than a moving one —
 * it would read as frozen. Slow it right down instead of stopping it.
 *
 * Both properties have to be re-declared. The global reduced-motion override in
 * motion.css sets `animation-iteration-count: 1 !important` on `*`, which beats
 * the non-important `infinite` in the shorthand above — so overriding only the
 * duration bought a spinner that turns once over 2.4s and then freezes, which
 * is precisely the outcome the paragraph above says this rule exists to avoid.
 */
@media (prefers-reduced-motion: reduce) {
  .ds-spinner {
    animation-duration: 2.4s !important;
    animation-iteration-count: infinite !important;
  }
}
</style>
