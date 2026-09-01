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
  padding: var(--ds-spacing-md) var(--ds-spacing-xl);
  border: none;
  border-right: var(--ds-border-width-default) solid var(--ds-border-default);
  background-color: var(--ds-bg-default);
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-default);
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    color            var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

/* Remove right border on last child — container border handles the edge */
.ds-button-group-item:last-child {
  border-right: none;
}

/* ── Icon modes ───────────────────────────────────────────────────── */
.ds-button-group-item--icon-only {
  padding: var(--ds-spacing-md) var(--ds-spacing-lg);
}

.ds-button-group-item--leading-icon {
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-md) var(--ds-spacing-xl) var(--ds-spacing-md) 14px;
}

/* ── States ───────────────────────────────────────────────────────── */
.ds-button-group-item:hover:not(:disabled) {
  background-color: var(--ds-bg-hover);
  color: var(--ds-text-default-hover);
  z-index: var(--ds-z-raised);
}

.ds-button-group-item:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-gray);
  z-index: var(--ds-z-raised);
}

/* Component token (ADR-0009): segmented selection is a neutral raised
   surface. It must not use bg-selected — that one is brand-tinted, and a
   segmented control is a neutral affordance. */
.ds-button-group-item--active {
  --segment-selected-bg:       var(--ds-bg-neutral-subtle);
  --segment-selected-bg-hover: var(--ds-bg-neutral-subtle-hover);

  background-color: var(--segment-selected-bg);
  color: var(--ds-text-default-hover);
}

.ds-button-group-item--active:hover:not(:disabled) {
  background-color: var(--segment-selected-bg-hover);
}

/* ── Disabled ─────────────────────────────────────────────────────── */
.ds-button-group-item:disabled {
  background-color: var(--ds-bg-disabled);
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}
</style>
