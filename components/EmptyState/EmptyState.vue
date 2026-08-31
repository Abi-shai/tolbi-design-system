<script setup lang="ts">
import { Icon, type IconName } from '../Icon'

export type EmptyStateSize = 'sm' | 'md'

interface Props {
  title: string
  /** One sentence on what to do about it. */
  description?: string
  icon?: IconName
  size?: EmptyStateSize
}

withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  size: 'md',
})
</script>

<template>
  <div class="ds-empty-state" :class="`ds-empty-state--${size}`">
    <span class="ds-empty-state__icon">
      <Icon :name="icon" :size="size === 'sm' ? 20 : 24" />
    </span>

    <div class="ds-empty-state__text">
      <p class="ds-empty-state__title">{{ title }}</p>
      <p v-if="description" class="ds-empty-state__description">{{ description }}</p>
    </div>

    <!-- Pass a Button here. The measure below caps the text, not the action. -->
    <div v-if="$slots.default" class="ds-empty-state__action">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ds-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-xl);
  padding: var(--ds-spacing-6xl) var(--ds-spacing-xl);
  text-align: center;
  font-family: var(--ds-typography-font-family-poppins);
}

.ds-empty-state--sm {
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-4xl) var(--ds-spacing-xl);
}

.ds-empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--ds-radius-pill);
  background-color: var(--ds-bg-neutral-subtle);
  color: var(--ds-text-subtlest);
  flex-shrink: 0;
}

.ds-empty-state--sm .ds-empty-state__icon { width: 40px; height: 40px; }

.ds-empty-state__text {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  /* Measure ceiling: the pattern this replaces capped its text at 352px. */
  max-width: 22rem;
}

.ds-empty-state__title {
  margin: 0;
  font-size: var(--ds-font-size-heading-sm);
  line-height: var(--ds-line-height-heading-sm);
  font-weight: var(--ds-font-weight-heading-sm);
  color: var(--ds-text-strong);
  text-wrap: balance;
}

.ds-empty-state__description {
  margin: 0;
  font-size: var(--ds-font-size-body-md);
  line-height: var(--ds-line-height-body-md);
  color: var(--ds-text-subtle);
}

.ds-empty-state__action { display: flex; gap: var(--ds-spacing-md); }
</style>
