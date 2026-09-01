<script setup lang="ts">
import { computed, inject, onMounted, ref } from 'vue'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import { BUTTON_GROUP_KEY } from './context'

/**
 * ADR-0024: selection comes from the group, not from a prop. `active` is gone —
 * it allowed a segmented control with zero or two selected segments, and it
 * meant nothing knew where the selection sat, so it could only cross-fade.
 *
 * The item still works outside a group (`useSlidingIndicator` is the group's
 * business); it simply never reports as selected.
 */
interface Props {
  /** Identifies this segment to the group's `v-model`. */
  value?: string
  label?: string
  icon?: IconName
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  label: undefined,
  icon: undefined,
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const group = inject(BUTTON_GROUP_KEY, null)
const el = ref<HTMLButtonElement>()
const key = computed(() => props.value ?? props.label ?? '')

onMounted(() => { if (group && el.value) group.register(key.value, el.value) })

const selected = computed(() => group?.isSelected(key.value) ?? false)
const iconOnly = computed(() => !!props.icon && !props.label)

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  group?.select(key.value)
  emit('click', event)
}
</script>

<template>
  <button
    ref="el"
    :type="type"
    :disabled="disabled"
    :aria-pressed="selected || undefined"
    :class="[
      'ds-button-group-item',
      iconOnly && 'ds-button-group-item--icon-only',
      icon && label && 'ds-button-group-item--leading-icon',
      selected && 'ds-button-group-item--active',
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
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
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

/* The selection is painted by the group's sliding indicator (ADR-0024); the
   item only promotes its own text. */
.ds-button-group-item--active {
  color: var(--ds-text-default-hover);
}

/* ── Disabled ─────────────────────────────────────────────────────── */
.ds-button-group-item:disabled {
  background-color: var(--ds-bg-disabled);
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}
</style>
