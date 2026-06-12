<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'

export type CloseButtonSize = 'sm' | 'md' | 'lg'

interface Props {
  size?: CloseButtonSize
  darkBackground?: boolean
  ariaLabel?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
  darkBackground: false,
  ariaLabel: 'Fermer',
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconSize = computed(() => (props.size === 'lg' ? 24 : 20))

function handleClick(event: MouseEvent) {
  if (!props.disabled) emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :class="[
      'ds-close-button',
      `ds-close-button--${size}`,
      darkBackground && 'ds-close-button--dark',
    ]"
    @click="handleClick"
  >
    <Icon
      name="x-close"
      :size="iconSize"
      class="ds-close-button__icon"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────── */
.ds-close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--ds-radius-md);
  background-color: transparent;
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

/* ── Sizes ────────────────────────────────────────────────────────── */
.ds-close-button--sm { width: 36px; height: 36px; }
.ds-close-button--md { width: 40px; height: 40px; }
.ds-close-button--lg { width: 44px; height: 44px; }

/* ── Icon color — light background ───────────────────────────────── */
.ds-close-button__icon {
  color: var(--ds-semantic-fg-quaternary);
  transition: color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default), opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-close-button:hover:not(:disabled) .ds-close-button__icon {
  color: var(--ds-semantic-fg-secondary);
}

.ds-close-button:focus-visible:not(:disabled) {
  background-color: var(--ds-semantic-bg-primary);
  box-shadow: var(--ds-focus-ring-gray);
}

.ds-close-button:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-primary-hover);
}

/* ── Dark background ──────────────────────────────────────────────── */
.ds-close-button--dark .ds-close-button__icon {
  color: white;
  opacity: 0.7;
}

.ds-close-button--dark:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
}

.ds-close-button--dark:hover:not(:disabled) .ds-close-button__icon {
  color: white;
  opacity: 1;
}

.ds-close-button--dark:focus-visible:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: var(--ds-focus-ring-gray);
}

.ds-close-button--dark:focus-visible:not(:disabled) .ds-close-button__icon {
  opacity: 0.7;
}

/* ── Disabled ─────────────────────────────────────────────────────── */
.ds-close-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
</style>
