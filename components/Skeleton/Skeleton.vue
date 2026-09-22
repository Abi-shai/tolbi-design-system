<script setup lang="ts">
import { computed } from 'vue'

export type SkeletonVariant = 'text' | 'rect' | 'circle'

/**
 * How heavy the placeholder is. **A skeleton previews the weight of what is
 * coming**, not only its box: a title bar and its caption are not the same
 * grey, or the wait reads as a stack of identical slabs and tells you nothing
 * about the shape of the page you are about to get.
 */
export type SkeletonEmphasis = 'default' | 'strong'

interface Props {
  variant?: SkeletonVariant
  emphasis?: SkeletonEmphasis
  width?: number | string
  height?: number | string
  /** `text` only — renders several lines, the last one short like real prose. */
  lines?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  emphasis: 'default',
  lines: 1,
})

const len = (v: number | string | undefined) =>
  v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v

const style = computed(() => ({
  width: len(props.width),
  height: len(props.height),
}))
</script>

<template>
  <!-- aria-hidden throughout: the loading state is announced by the container,
       not by each placeholder. -->
  <div
    v-if="variant === 'text' && lines > 1"
    class="ds-skeleton-group"
    aria-hidden="true"
  >
    <span
      v-for="n in lines"
      :key="n"
      class="ds-skeleton ds-skeleton--text"
      :class="`ds-skeleton--${emphasis}`"
      :style="n === lines ? { width: '60%' } : style"
    />
  </div>

  <span
    v-else
    class="ds-skeleton"
    :class="[`ds-skeleton--${variant}`, `ds-skeleton--${emphasis}`]"
    :style="style"
    aria-hidden="true"
  />
</template>

<style scoped>
.ds-skeleton-group {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
}

/*
  Two values, and they have to be **two**. The sheen used to be `bg-hover` and
  the base `bg-neutral-subtle`, which alias the same primitive (ADR-0033 found
  the same collision on the sidebar's ground): the gradient ran from a colour to
  itself, so the animation was running and nothing moved. A skeleton that does
  not shimmer is a disabled block.

  The sheen is always **one step toward the page** — lighter in light, darker in
  dark, because `bg-default` sits on the far side of `bg-neutral-subtle` in both
  modes. Variant switches, not tokens (ADR-0010): they alias, they own nothing.
*/
.ds-skeleton {
  --skeleton-base:  var(--ds-bg-neutral);
  --skeleton-sheen: var(--ds-bg-neutral-subtle);

  display: block;
  flex-shrink: 0;
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 25%,
    var(--skeleton-sheen) 50%,
    var(--skeleton-base) 75%
  );
  background-size: 400% 100%;
  /*
    A **period, not a duration** — same rule as `Spinner`, and the one ADR-0032
    settled for the marquee: a loop has no start to time, so it takes nothing
    from the duration scale.

    `linear`, for `Spinner`'s reason. This said `ease-in-out` — which was not
    even the token of that name (the CSS keyword is `0.42, 0, 0.58, 1`, the
    token `0.4, 0, 0.2, 1`), so it was a curve nobody chose. But the right fix
    is not the token: an easing has a start and an end to shape, and a sweep
    that never stops has neither. Easing it makes the band hesitate at both
    edges and snap at the wrap.
  */
  --skeleton-period: 1.6s;
  animation: ds-skeleton-shimmer var(--skeleton-period) linear infinite;
}

.ds-skeleton--strong {
  --skeleton-base:  var(--ds-bg-pending);
  --skeleton-sheen: var(--ds-bg-neutral);
}

/* One corner for every bar — `inner-sm` (4px), as drawn. A placeholder is not a
   control and does not borrow a control's radius. */
.ds-skeleton--text {
  height: 14px;
  width: 100%;
  border-radius: var(--ds-radius-inner-sm);
}

.ds-skeleton--rect {
  height: 80px;
  width: 100%;
  border-radius: var(--ds-radius-inner-sm);
}

.ds-skeleton--circle {
  height: 40px;
  width: 40px;
  border-radius: var(--ds-radius-pill);
}

@keyframes ds-skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Here a still placeholder is perfectly legible, so honour the preference. */
@media (prefers-reduced-motion: reduce) {
  .ds-skeleton { animation: none !important; background: var(--skeleton-base); }
}
</style>
