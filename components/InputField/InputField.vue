<script setup lang="ts">
import { computed, useId } from 'vue'
import { Icon } from '../Icon'
import { HelpIcon } from '../HelpIcon'
import { useFormField } from '../FormField/context'

export type InputFieldSize = 'sm' | 'md'

interface Props {
  modelValue?:   string
  size?:         InputFieldSize
  placeholder?:  string
  /** Renders inside the box, so it stays the control's business — not FormField's. */
  helpTooltip?:  string
  type?:         'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  /** Standalone use only. Inside a FormField, the wrapper's `error` decides. */
  destructive?:  boolean
  disabled?:     boolean
  /** Standalone use only. Inside a FormField, the wrapper's `required` decides. */
  required?:     boolean
  /** Standalone use only. Inside a FormField, set the id on the wrapper. */
  id?:           string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue:  '',
  size:        'md',
  type:        'text',
  destructive: false,
  disabled:    false,
  required:    false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uid   = useId()
const field = useFormField()

// The wrapper wins where it has an opinion, so `for` and aria-describedby always
// resolve. Each falls back to the prop when the control is used on its own.
const inputId     = computed(() => field?.id.value ?? props.id ?? `input-${uid}`)
const isInvalid   = computed(() => field?.invalid.value ?? props.destructive)
const isRequired  = computed(() => field?.required.value ?? props.required)
const isDisabled  = computed(() => (field?.disabled.value ?? false) || props.disabled)
const describedBy = computed(() => field?.describedBy.value)

/*
  An error is announced once per field, and the glyph lives on the message — which
  is the only place every control can carry one. So the in-box icon steps aside as
  soon as the wrapper is showing the message, and stays for standalone use, where
  it is the only non-chromatic signal there is.
*/
const wrapperShowsError = computed(() => Boolean(field?.invalid.value && field?.describedBy.value))

const iconSize = computed(() => props.size === 'sm' ? 16 : 20)
</script>

<template>
  <div class="ds-input-field" :class="`ds-input-field--${size}`">

    <!-- Input wrapper. Label and message live on FormField — see ADR-0008. -->
    <div
      class="ds-input-field__wrapper"
      :class="{
        'ds-input-field__wrapper--destructive': isInvalid,
        'ds-input-field__wrapper--disabled':    isDisabled,
      }"
    >
      <!-- Content : leading + input (gap-8px entre eux) -->
      <div class="ds-input-field__content">
        <!-- Leading icon -->
        <span v-if="$slots['icon-leading']" class="ds-input-field__icon" aria-hidden="true">
          <slot name="icon-leading" />
        </span>

        <!-- Leading text (ex: "$", "https://") -->
        <span v-if="$slots['leading-text']" class="ds-input-field__leading-text" aria-hidden="true">
          <slot name="leading-text" />
        </span>

        <!-- Native input -->
        <input
          :id="inputId"
          class="ds-input-field__input"
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="isDisabled"
          :required="isRequired"
          :aria-invalid="isInvalid || undefined"
          :aria-describedby="describedBy"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Trailing : slot custom > error-icon > help-icon -->
      <!--
        NOT aria-hidden: this slot takes arbitrary content, including interactive
        controls such as a password reveal toggle. A caller passing purely
        decorative content sets aria-hidden on it themselves. The error and help
        icons below are separate branches and stay hidden.
      -->
      <span v-if="$slots.trailing" class="ds-input-field__icon">
        <slot name="trailing" />
      </span>
      <Icon
        v-else-if="isInvalid && !wrapperShowsError"
        name="circle-alert"
        :size="iconSize"
        class="ds-input-field__error-icon"
        aria-hidden="true"
      />
      <HelpIcon
        v-else-if="helpTooltip"
        :title="helpTooltip"
        placement="top-arrow"
      />
    </div>
  </div>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────────────── */
.ds-input-field {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
  width: 100%;
}

/* ── Wrapper (input box) ──────────────────────────────────────────── */
.ds-input-field__wrapper {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);   /* 8px entre content et trailing */
  width: 100%;
  background: var(--ds-bg-default);
  border: 1px solid var(--ds-border-default);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-control);
  box-sizing: border-box;
  transition: border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default), box-shadow var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
  padding: var(--ds-control-padding-md); /* md */
}

.ds-input-field--sm .ds-input-field__wrapper {
  padding: var(--ds-spacing-md) var(--ds-spacing-lg); /* 8px 12px */
}

/* ── Content (leading icon + input) ──────────────────────────────── */
.ds-input-field__content {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: var(--ds-spacing-md);   /* 8px entre icon-leading et input */
}

/* Focused — via :focus-within sur le wrapper */
.ds-input-field__wrapper:focus-within {
  border-color: var(--ds-border-brand);
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
  outline: none;
}

/* Destructive */
.ds-input-field__wrapper--destructive {
  border-color: var(--ds-border-error);
}

.ds-input-field__wrapper--destructive:focus-within {
  border-color: var(--ds-border-error);
  box-shadow: var(--ds-focus-ring-error-shadow-xs);
}

/* Disabled */
.ds-input-field__wrapper--disabled {
  background: var(--ds-bg-default);
  border-color: var(--ds-border-default);
  box-shadow: none;
  cursor: not-allowed;
}

/* ── Input native ─────────────────────────────────────────────────── */
.ds-input-field__input {
  flex: 1 0 0;
  min-width: 0;
  padding: 0;           /* reset browser default */
  margin: 0;
  border: none;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  background: transparent;
  font: var(--ds-font-body-lg);
  color: var(--ds-text-strong);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-input-field__input::placeholder {
  color: var(--ds-text-placeholder);
}

.ds-input-field__input:disabled {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}

/* ── Icons ────────────────────────────────────────────────────────── */
.ds-input-field__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--ds-text-placeholder);
}

.ds-input-field__error-icon {
  flex-shrink: 0;
  color: var(--ds-text-error);
}

/* ── Leading text (ex: "$", "https://") ───────────────────────────── */
.ds-input-field__leading-text {  font: var(--ds-font-body-lg);
  color: var(--ds-text-placeholder);
  white-space: nowrap;
  flex-shrink: 0;
}

</style>
