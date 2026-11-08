<script setup lang="ts">
import { computed } from 'vue'
import { Icon, type IconName } from '../Icon'

export type EmptyStateSize = 'sm' | 'md'

interface Props {
  title: string
  /** One sentence on what to do about it. */
  description?: string
  /** `inbox` when a description is given without one. */
  icon?: IconName
  size?: EmptyStateSize
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  description: undefined,
  size: 'md',
})

/*
  With neither a glyph nor a description, the empty state is **a sentence in a
  block that already has its title** (ADR-0134): a panel's sunk card titled
  « Données de terrain » that has nothing yet. Centred and in a strong label it
  read as a second heading under the block's, and the absence outweighed the
  block. So it is running text — `body-md`, `text-subtle`, at the block's start,
  on the block's own margin — and the action, if any, goes under it. The
  centred form, glyph and title, stays for an empty screen, which says more.
*/
const inline = computed(() => !props.icon && !props.description)
</script>

<template>
  <div v-if="inline" class="ds-empty-state ds-empty-state--inline">
    <p class="ds-empty-state__sentence">{{ title }}</p>
    <div v-if="$slots.default" class="ds-empty-state__action">
      <slot />
    </div>
  </div>

  <div v-else class="ds-empty-state" :class="`ds-empty-state--${size}`">
    <span class="ds-empty-state__icon">
      <Icon :name="icon ?? 'inbox'" :size="size === 'sm' ? 20 : 24" />
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
  font: var(--ds-font-heading-sm);
  color: var(--ds-text-strong);
  text-wrap: balance;
}

.ds-empty-state__description {
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}

.ds-empty-state__action { display: flex; gap: var(--ds-spacing-md); }

/* ── Inline: a sentence in a titled block (ADR-0134) ─────────────────── */
.ds-empty-state--inline {
  align-items: flex-start;
  gap: var(--ds-spacing-md);
  padding: 0;
  text-align: start;
}

.ds-empty-state__sentence {
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}
</style>
