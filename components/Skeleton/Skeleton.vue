<script setup lang="ts">
import { computed } from 'vue'

export type SkeletonVariant = 'text' | 'rect' | 'circle'

interface Props {
  variant?: SkeletonVariant
  width?: number | string
  height?: number | string
  /** `text` only — renders several lines, the last one short like real prose. */
  lines?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
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
      :style="n === lines ? { width: '60%' } : style"
    />
  </div>

  <span
    v-else
    class="ds-skeleton"
    :class="`ds-skeleton--${variant}`"
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

.ds-skeleton {
  display: block;
  flex-shrink: 0;
  background: linear-gradient(
    90deg,
    var(--ds-bg-neutral-subtle) 25%,
    var(--ds-bg-hover) 50%,
    var(--ds-bg-neutral-subtle) 75%
  );
  background-size: 400% 100%;
  animation: ds-skeleton-shimmer 1.6s ease-in-out infinite;
}

.ds-skeleton--text {
  height: 14px;
  width: 100%;
  border-radius: var(--ds-radius-inner);
}

.ds-skeleton--rect {
  height: 80px;
  width: 100%;
  border-radius: var(--ds-radius-control);
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
  .ds-skeleton { animation: none !important; background: var(--ds-bg-neutral-subtle); }
}
</style>
