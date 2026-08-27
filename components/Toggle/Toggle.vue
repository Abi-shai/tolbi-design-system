<script setup lang="ts">
import { useId } from 'vue'

export type ToggleSize = 'sm' | 'md'

interface Props {
  size?: ToggleSize
  modelValue?: boolean
  disabled?: boolean
  label?: string
  supportingText?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
  modelValue: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const labelId = useId()

function toggle() {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<template>
  <div
    class="ds-toggle-wrapper"
    :class="[`ds-toggle-wrapper--${size}`, { 'ds-toggle-wrapper--has-text': label }]"
  >
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :aria-labelledby="label ? labelId : undefined"
      :disabled="disabled"
      class="ds-toggle"
      :class="[`ds-toggle--${size}`, { 'ds-toggle--on': modelValue, 'ds-toggle--disabled': disabled }]"
      @click="toggle"
    >
      <span class="ds-toggle__thumb" />
    </button>

    <div v-if="label" :id="labelId" class="ds-toggle__text" :class="`ds-toggle__text--${size}`">
      <span class="ds-toggle__label">{{ label }}</span>
      <span v-if="supportingText" class="ds-toggle__supporting">{{ supportingText }}</span>
    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper ───────────────────────────────────────────────────────── */
.ds-toggle-wrapper {
  display: inline-flex;
  align-items: flex-start;
}

.ds-toggle-wrapper--has-text.ds-toggle-wrapper--sm {
  gap: 8px;
}

.ds-toggle-wrapper--has-text.ds-toggle-wrapper--md {
  gap: 12px;
}

/* ── Track (button) ────────────────────────────────────────────────── */
.ds-toggle {
  display: flex;
  align-items: center;
  padding: 2px;
  border: none;
  border-radius: var(--ds-radius-full);
  background-color: var(--ds-semantic-bg-tertiary);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default), box-shadow var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-toggle--sm {
  width: 36px;
  height: 20px;
}

.ds-toggle--md {
  width: 44px;
  height: 24px;
}

/* ── On state ──────────────────────────────────────────────────────── */
.ds-toggle--on {
  background-color: var(--ds-semantic-bg-brand-solid);
}

.ds-toggle--on:hover:not(:disabled):not(.ds-toggle--disabled) {
  background-color: var(--ds-semantic-bg-brand-solid-hover);
}

/* ── Focus states ──────────────────────────────────────────────────── */
.ds-toggle:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-gray-secondary);
}

.ds-toggle--on:focus-visible {
  box-shadow: var(--ds-focus-ring-brand);
}

/* ── Disabled ──────────────────────────────────────────────────────── */
.ds-toggle--disabled,
.ds-toggle:disabled {
  background-color: var(--ds-semantic-bg-disabled);
  cursor: not-allowed;
}

/* ── Thumb ─────────────────────────────────────────────────────────── */
.ds-toggle__thumb {
  display: block;
  border-radius: var(--ds-radius-full);
  background-color: var(--ds-color-base-white);
  box-shadow: var(--ds-shadow-sm);
  flex-shrink: 0;
  transition: transform var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-toggle--sm .ds-toggle__thumb {
  width: 16px;
  height: 16px;
}

.ds-toggle--md .ds-toggle__thumb {
  width: 20px;
  height: 20px;
}

/* Thumb slides to the right when on */
.ds-toggle--sm.ds-toggle--on .ds-toggle__thumb {
  transform: translateX(16px);
}

.ds-toggle--md.ds-toggle--on .ds-toggle__thumb {
  transform: translateX(20px);
}

/* Disabled thumb tint */
.ds-toggle--disabled .ds-toggle__thumb,
.ds-toggle:disabled .ds-toggle__thumb {
  background-color: var(--ds-color-gray-light-50);
}

/* ── Text content ──────────────────────────────────────────────────── */
.ds-toggle__text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.ds-toggle__text--sm {
  gap: 0;
}

.ds-toggle__text--md {
  gap: 2px;
}

/* ── Label ─────────────────────────────────────────────────────────── */
.ds-toggle__label {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 500;
  color: var(--ds-semantic-text-secondary);
}

.ds-toggle__text--sm .ds-toggle__label {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.ds-toggle__text--md .ds-toggle__label {
  font-size: 1rem;
  line-height: 1.5rem;
}

/* ── Supporting text ───────────────────────────────────────────────── */
.ds-toggle__supporting {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 400;
  color: var(--ds-semantic-text-tertiary);
}

.ds-toggle__text--sm .ds-toggle__supporting {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.ds-toggle__text--md .ds-toggle__supporting {
  font-size: 1rem;
  line-height: 1.5rem;
}
</style>
