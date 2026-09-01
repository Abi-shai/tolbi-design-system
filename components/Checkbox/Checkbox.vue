<script setup lang="ts">
import { computed, useId, watch, useTemplateRef } from 'vue'
import { Icon } from '../Icon'
import { useFormField } from '../FormField/context'

export type CheckboxSize = 'sm' | 'md'
export type CheckboxInputType = 'checkbox' | 'radio'

interface Props {
  size?: CheckboxSize
  type?: CheckboxInputType
  modelValue?: boolean
  indeterminate?: boolean
  disabled?: boolean
  label?: string
  supportingText?: string
  name?: string
  value?: string
  /** Renders only the visual control (no native input). For embedding inside other DS components. */
  visualOnly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
  type: 'checkbox',
  modelValue: false,
  indeterminate: false,
  disabled: false,
  visualOnly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const field   = useFormField()
const uid     = useId()
const inputId = uid

const labelId   = `${uid}-label`
const supportId = `${uid}-support`

const isDisabled = computed(() => (field?.disabled.value ?? false) || props.disabled)

/*
  The wrapping <label> would otherwise fold the supporting text into the accessible
  NAME — "Recevoir les alertes Vous serez notifié par SMS" as one string. An explicit
  aria-labelledby overrides that computation, so the name is the label and the
  supporting text becomes a description, which is what it is.
*/
const describedBy = computed(() => {
  const ids = [props.supportingText ? supportId : null, field?.describedBy.value]
  return ids.filter(Boolean).join(' ') || undefined
})
const inputRef = useTemplateRef<HTMLInputElement>('inputEl')

const iconSize = computed(() => props.size === 'md' ? 16 : 12)

watch(
  () => props.indeterminate,
  (val) => {
    if (inputRef.value && props.type === 'checkbox') {
      inputRef.value.indeterminate = val
    }
  },
  { immediate: true, flush: 'post' },
)

function handleChange(event: Event) {
  if (!props.disabled) {
    emit('update:modelValue', (event.target as HTMLInputElement).checked)
  }
}
</script>

<template>
  <!-- Visual-only mode: just the control indicator, no native input or label -->
  <span
    v-if="visualOnly"
    class="ds-checkbox__control"
    :class="[
      `ds-checkbox__control--${type}`,
      `ds-checkbox__control--${size}`,
      modelValue && 'ds-checkbox__control--checked',
      type === 'checkbox' && indeterminate && 'ds-checkbox__control--indeterminate',
      isDisabled && 'ds-checkbox__control--disabled',
    ]"
    aria-hidden="true"
  >
    <Icon
      v-if="type === 'checkbox' && modelValue && !indeterminate"
      name="check"
      :size="iconSize"
      class="ds-checkbox__icon"
    />
    <Icon
      v-else-if="type === 'checkbox' && indeterminate"
      name="minus"
      :size="iconSize"
      class="ds-checkbox__icon"
    />
  </span>

  <!-- Full interactive mode -->
  <label
    v-else
    :for="inputId"
    class="ds-checkbox-wrapper"
    :class="[
      `ds-checkbox-wrapper--${size}`,
      label && 'ds-checkbox-wrapper--has-text',
      isDisabled && 'ds-checkbox-wrapper--disabled',
    ]"
  >
    <span class="ds-checkbox__input-wrap">
      <input
        :id="inputId"
        ref="inputEl"
        class="ds-checkbox__input"
        :type="type"
        :checked="modelValue"
        :disabled="isDisabled"
        :name="name"
        :value="value"
        :aria-labelledby="label ? labelId : undefined"
        :aria-describedby="describedBy"
        :aria-invalid="field?.invalid.value || undefined"
        @change="handleChange"
      />
      <span
        class="ds-checkbox__control"
        :class="[
          `ds-checkbox__control--${type}`,
          `ds-checkbox__control--${size}`,
          modelValue && 'ds-checkbox__control--checked',
          type === 'checkbox' && indeterminate && 'ds-checkbox__control--indeterminate',
          isDisabled && 'ds-checkbox__control--disabled',
        ]"
        aria-hidden="true"
      >
        <Icon
          v-if="type === 'checkbox' && modelValue && !indeterminate"
          name="check"
          :size="iconSize"
          class="ds-checkbox__icon"
        />
        <Icon
          v-else-if="type === 'checkbox' && indeterminate"
          name="minus"
          :size="iconSize"
          class="ds-checkbox__icon"
        />
      </span>
    </span>

    <span v-if="label" class="ds-checkbox__text" :class="`ds-checkbox__text--${size}`">
      <span :id="labelId" class="ds-checkbox__label">{{ label }}</span>
      <span v-if="supportingText" :id="supportId" class="ds-checkbox__supporting">{{ supportingText }}</span>
    </span>
  </label>
</template>

<style scoped>
/* ── Wrapper ───────────────────────────────────────────────────────── */
.ds-checkbox-wrapper {
  display: inline-flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
}

.ds-checkbox-wrapper--has-text.ds-checkbox-wrapper--sm {
  gap: var(--ds-spacing-md);
}

.ds-checkbox-wrapper--has-text.ds-checkbox-wrapper--md {
  gap: var(--ds-spacing-lg);
}

.ds-checkbox-wrapper--disabled {
  cursor: not-allowed;
}

/* ── Input wrap — aligns native input with control ─────────────────── */
.ds-checkbox__input-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding-top: var(--ds-spacing-xxs);
}

/* ── Visually-hidden native input ──────────────────────────────────── */
.ds-checkbox__input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: inherit;
  z-index: var(--ds-z-raised);
}

/* ── Custom control ────────────────────────────────────────────────── */
.ds-checkbox__control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: var(--ds-border-width-default) solid var(--ds-border-default);
  background-color: var(--ds-bg-default);
  color: var(--ds-text-on-brand-solid);
  overflow: hidden;
  transition:
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    border-color     var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

/* ── Sizes ─────────────────────────────────────────────────────────── */
.ds-checkbox__control--sm {
  width: 16px;
  height: 16px;
}

.ds-checkbox__control--md {
  width: 20px;
  height: 20px;
}

/* ── Shape: checkbox (square) ──────────────────────────────────────── */
.ds-checkbox__control--checkbox.ds-checkbox__control--sm {
  border-radius: var(--ds-radius-inner-sm);
}

.ds-checkbox__control--checkbox.ds-checkbox__control--md {
  border-radius: var(--ds-radius-inner);
}

/* ── Shape: radio (circle) ─────────────────────────────────────────── */
.ds-checkbox__control--radio {
  border-radius: var(--ds-radius-pill);
  position: relative;
}

/* Radio inner dot via ::after */
.ds-checkbox__control--radio::after {
  content: '';
  display: block;
  border-radius: var(--ds-radius-pill);
  background-color: var(--ds-text-on-brand-solid);
  opacity: 0;
  transition: opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-checkbox__control--radio.ds-checkbox__control--sm::after {
  width: 6px;
  height: 6px;
}

.ds-checkbox__control--radio.ds-checkbox__control--md::after {
  width: 8px;
  height: 8px;
}

/* ── Checked state ─────────────────────────────────────────────────── */
.ds-checkbox__control--checked {
  background-color: var(--ds-bg-brand-solid);
  border-color: var(--ds-bg-brand-solid);
}

.ds-checkbox__control--radio.ds-checkbox__control--checked::after {
  opacity: 1;
}

/* Indeterminate state (checkbox only) */
.ds-checkbox__control--indeterminate {
  background-color: var(--ds-bg-brand-solid);
  border-color: var(--ds-bg-brand-solid);
}

/* ── Hover (on the native input triggers the control) ──────────────── */
.ds-checkbox__input:not(:disabled):hover ~ .ds-checkbox__control:not(.ds-checkbox__control--checked):not(.ds-checkbox__control--indeterminate) {
  border-color: var(--ds-border-default);
  background-color: var(--ds-bg-hover);
}

/* ── Focus ─────────────────────────────────────────────────────────── */
.ds-checkbox__input:focus-visible ~ .ds-checkbox__control:not(.ds-checkbox__control--checked):not(.ds-checkbox__control--indeterminate) {
  outline: none;
  box-shadow: var(--ds-focus-ring-gray);
}

.ds-checkbox__input:focus-visible ~ .ds-checkbox__control--checked,
.ds-checkbox__input:focus-visible ~ .ds-checkbox__control--indeterminate {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

/* ── Disabled state ────────────────────────────────────────────────── */
.ds-checkbox__control--disabled {
  background-color: var(--ds-bg-disabled);
  border-color: var(--ds-border-disabled);
}

.ds-checkbox__control--disabled.ds-checkbox__control--checked,
.ds-checkbox__control--disabled.ds-checkbox__control--indeterminate {
  background-color: var(--ds-bg-disabled);
  border-color: var(--ds-border-disabled);
  color: var(--ds-border-disabled);
}

.ds-checkbox__control--radio.ds-checkbox__control--disabled::after {
  background-color: var(--ds-border-disabled);
}

/* ── Icon ──────────────────────────────────────────────────────────── */
.ds-checkbox__icon {
  flex-shrink: 0;
  color: var(--ds-text-on-brand-solid);
}

/* Boost stroke weight to match Figma's bold checkbox indicators.
   SVG presentation attributes (stroke-width="2") are overridden by CSS.
   Icon is sized at 75% of the control, so stroke-width compensates to keep visual weight correct. */
.ds-checkbox__icon :deep(path) {
  stroke-width: 3.5;
}

.ds-checkbox__control--disabled .ds-checkbox__icon {
  color: var(--ds-border-disabled);
}

/* ── Text ──────────────────────────────────────────────────────────── */
.ds-checkbox__text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.ds-checkbox__text--sm {
  gap: 0;
}

.ds-checkbox__text--md {
  gap: var(--ds-spacing-xxs);
}

/* ── Label ─────────────────────────────────────────────────────────── */
.ds-checkbox__label {
  font-family: var(--ds-typography-font-family-poppins);
  color: var(--ds-text-default);
}

.ds-checkbox__text--sm .ds-checkbox__label {
  font: var(--ds-font-label-lg);
}

.ds-checkbox__text--md .ds-checkbox__label {
  font: var(--ds-font-label-xl);
}

/* ── Supporting text ───────────────────────────────────────────────── */
.ds-checkbox__supporting {
  font-family: var(--ds-typography-font-family-poppins);
  color: var(--ds-text-subtle);
}

.ds-checkbox__text--sm .ds-checkbox__supporting {
  font: var(--ds-font-body-md);
}

.ds-checkbox__text--md .ds-checkbox__supporting {
  font: var(--ds-font-body-lg);
}
</style>
