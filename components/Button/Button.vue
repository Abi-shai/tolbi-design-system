<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

export type ButtonVariant =
  | 'primary'
  | 'secondary-gray'
  | 'secondary-color'
  | 'tertiary'
  | 'link'
  | 'danger'
  | 'danger-secondary'
  | 'ghost'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface Props {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  iconLeading?: IconName
  iconTrailing?: IconName
  iconOnly?: boolean
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  iconOnly: false,
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconSize = computed(() => (props.size === '2xl' ? 24 : 20))

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['ds-button', `ds-button--${variant}`, `ds-button--${size}`, { 'ds-button--icon-only': iconOnly }]"
    :aria-busy="loading || undefined"
    :aria-label="iconOnly ? label : undefined"
    @click="handleClick"
  >
    <span v-if="loading" class="ds-button__spinner" aria-hidden="true" />
    <template v-else>
      <Icon v-if="iconLeading" :name="iconLeading" :size="iconSize" class="ds-button__icon" aria-hidden="true" />
      <span v-if="!iconOnly" class="ds-button__label">{{ label }}</span>
      <Icon v-if="iconTrailing && !iconOnly" :name="iconTrailing" :size="iconSize" class="ds-button__icon" aria-hidden="true" />
    </template>
  </button>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────── */
.ds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 14px;
  border: 1px solid transparent;
  border-radius: var(--ds-radius-md);
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: var(--ds-shadow-xs);
  outline: none;
  transition:
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    color            var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    border-color     var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

/* ── Sizes ────────────────────────────────────────────────────────── */
.ds-button--sm {
  padding: 8px 12px;
}

.ds-button--lg {
  gap: 6px;
  padding: 10px 16px;
  font-size: 1rem;
  line-height: 1.5rem;
}

.ds-button--xl {
  gap: 6px;
  padding: 12px 18px;
  font-size: 1rem;
  line-height: 1.5rem;
}

.ds-button--2xl {
  gap: 10px;
  padding: 16px 22px;
  font-size: 1.125rem;
  line-height: 1.75rem;
}

/* ── Primary ──────────────────────────────────────────────────────── */
.ds-button--primary {
  background-color: var(--ds-semantic-bg-brand-solid);
  border-color: var(--ds-semantic-border-brand-solid);
  color: var(--ds-semantic-fg-white);
}
.ds-button--primary:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-brand-solid-hover);
  border-color: var(--ds-color-brand-700);
}
.ds-button--primary:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* ── Secondary gray ───────────────────────────────────────────────── */
.ds-button--secondary-gray {
  background-color: var(--ds-semantic-bg-primary);
  border-color: var(--ds-semantic-border-primary);
  color: var(--ds-semantic-fg-secondary);
}
.ds-button--secondary-gray:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-primary-hover);
  color: var(--ds-semantic-fg-secondary-hover);
}
.ds-button--secondary-gray:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-gray-shadow-xs);
}

/* ── Secondary color ──────────────────────────────────────────────── */
.ds-button--secondary-color {
  background-color: var(--ds-semantic-bg-primary);
  border-color: var(--ds-semantic-border-brand);
  color: var(--ds-color-brand-700);
}
.ds-button--secondary-color:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-brand-primary);
  color: var(--ds-color-brand-800);
}
.ds-button--secondary-color:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* ── Tertiary ─────────────────────────────────────────────────────── */
.ds-button--tertiary {
  background-color: transparent;
  border-color: transparent;
  color: var(--ds-color-brand-700);
  box-shadow: none;
}
.ds-button--tertiary:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-brand-primary);
  color: var(--ds-color-brand-800);
}
.ds-button--tertiary:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* ── Link ─────────────────────────────────────────────────────────── */
.ds-button--link {
  gap: 6px;
  padding: 0;
  background-color: transparent;
  border-color: transparent;
  color: var(--ds-color-brand-700);
  box-shadow: none;
}
.ds-button--link:hover:not(:disabled) {
  color: var(--ds-color-brand-800);
  text-decoration: underline;
}
.ds-button--link:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* ── Danger ───────────────────────────────────────────────────────── */
.ds-button--danger {
  background-color: var(--ds-semantic-bg-error-solid);
  border-color: var(--ds-semantic-border-error-solid);
  color: var(--ds-semantic-fg-white);
}
.ds-button--danger:hover:not(:disabled) {
  background-color: var(--ds-color-error-700);
  border-color: var(--ds-color-error-700);
}
.ds-button--danger:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-error-shadow-xs);
}

/* ── Danger secondary ─────────────────────────────────────────────── */
.ds-button--danger-secondary {
  background-color: var(--ds-semantic-bg-primary);
  border-color: var(--ds-semantic-border-error);
  color: var(--ds-color-error-700);
}
.ds-button--danger-secondary:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-error-primary);
  color: var(--ds-color-error-800);
}
.ds-button--danger-secondary:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-error-shadow-xs);
}

/* ── Ghost ────────────────────────────────────────────────────────── */
.ds-button--ghost {
  background-color: transparent;
  border-color: transparent;
  color: var(--ds-semantic-text-tertiary);
  box-shadow: none;
}
.ds-button--ghost:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-primary-hover);
  color: var(--ds-semantic-text-secondary);
}
.ds-button--ghost:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-gray-shadow-xs);
}

/* ── Icon-only ────────────────────────────────────────────────────── */
.ds-button--icon-only {
  padding: 0;
  gap: 0;
}
.ds-button--icon-only.ds-button--sm  { width: 36px; height: 36px; }
.ds-button--icon-only.ds-button--md  { width: 40px; height: 40px; }
.ds-button--icon-only.ds-button--lg  { width: 44px; height: 44px; }
.ds-button--icon-only.ds-button--xl  { width: 48px; height: 48px; }
.ds-button--icon-only.ds-button--2xl { width: 56px; height: 56px; }

/* ── Disabled ─────────────────────────────────────────────────────── */
.ds-button:disabled {
  background-color: var(--ds-semantic-bg-disabled);
  border-color: var(--ds-semantic-border-disabled-subtle);
  color: var(--ds-semantic-fg-disabled);
  box-shadow: none;
  cursor: not-allowed;
}

.ds-button--tertiary:disabled,
.ds-button--link:disabled {
  background-color: transparent;
  border-color: transparent;
}

/* ── Spinner ──────────────────────────────────────────────────────── */
.ds-button__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ds-spin 0.6s linear infinite;
}

@keyframes ds-spin {
  to { transform: rotate(360deg); }
}
</style>
