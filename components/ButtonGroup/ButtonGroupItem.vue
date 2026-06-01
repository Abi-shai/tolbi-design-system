<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

interface Props {
  label?: string
  icon?: IconName
  active?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  label: undefined,
  icon: undefined,
  active: false,
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconOnly = computed(() => !!props.icon && !props.label)

function handleClick(event: MouseEvent) {
  if (!props.disabled) emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-pressed="active || undefined"
    :class="[
      'ds-button-group-item',
      iconOnly && 'ds-button-group-item--icon-only',
      icon && label && 'ds-button-group-item--leading-icon',
      active && 'ds-button-group-item--active',
    ]"
    @click="handleClick"
  >
    <Icon
      v-if="icon"
      :name="icon"
      :size="20"
      class="ds-button-group-item__icon"
      aria-hidden="true"
    />
    <span v-if="label" class="ds-button-group-item__label">{{ label }}</span>
  </button>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────── */
.ds-button-group-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-height: 40px;
  padding: 8px 16px;
  border: none;
  border-right: 1px solid var(--ds-semantic-border-primary);
  background-color: var(--ds-semantic-bg-primary);
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  color: var(--ds-semantic-fg-secondary);
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
}

/* Remove right border on last child — container border handles the edge */
.ds-button-group-item:last-child {
  border-right: none;
}

/* ── Icon modes ───────────────────────────────────────────────────── */
.ds-button-group-item--icon-only {
  padding: 8px 12px;
}

.ds-button-group-item--leading-icon {
  gap: 8px;
  padding: 8px 16px 8px 14px;
}

/* ── States ───────────────────────────────────────────────────────── */
.ds-button-group-item:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-primary-hover);
  color: var(--ds-semantic-fg-secondary-hover);
  z-index: 1;
}

.ds-button-group-item:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-gray);
  z-index: 1;
}

.ds-button-group-item--active {
  background-color: var(--ds-semantic-bg-secondary);
  color: var(--ds-semantic-fg-secondary-hover);
}

.ds-button-group-item--active:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-secondary-hover);
}

/* ── Disabled ─────────────────────────────────────────────────────── */
.ds-button-group-item:disabled {
  background-color: var(--ds-semantic-bg-disabled);
  color: var(--ds-semantic-fg-disabled);
  cursor: not-allowed;
}
</style>
