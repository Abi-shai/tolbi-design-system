<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
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
onBeforeUnmount(() => group?.unregister(key.value))

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
/* A segment on the rail (ADR-0084): no border of its own, no ground — the
   group paints the rail and the pill under it. 32px, so the rail is 42. */
.ds-button-group-item {
  position: relative;
  z-index: var(--ds-z-raised);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-height: 32px;
  padding: var(--ds-spacing-sm) var(--ds-spacing-lg);
  border: none;
  border-radius: var(--ds-radius-inner);
  background-color: transparent;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-subtle);
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    color            var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* ── Icon modes ───────────────────────────────────────────────────── */
.ds-button-group-item--icon-only {
  padding: var(--ds-spacing-sm);
}

.ds-button-group-item--leading-icon {
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-sm) var(--ds-spacing-lg) var(--ds-spacing-sm) var(--ds-spacing-md);
}

/* ── States ───────────────────────────────────────────────────────── */
/* Hover is half a surface and the ink steps forward — Tabs' own, clearly
   lighter than the pill. */
.ds-button-group-item:not(.ds-button-group-item--active):hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--ds-bg-default) 50%, transparent);
  color: var(--ds-text-default);
}

.ds-button-group-item:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-gray);
}

/* The pill is the group's sliding indicator (ADR-0024); the item carries the
   ink — the strong one, so the choice is also said by the text. */
.ds-button-group-item--active {
  color: var(--ds-text-strong);
}

/* ── Disabled ─────────────────────────────────────────────────────── */
.ds-button-group-item:disabled {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}
</style>
