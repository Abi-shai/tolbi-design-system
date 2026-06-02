<script setup lang="ts">
import { computed, useId } from 'vue'
import { Icon } from '../Icon'
import { HelpIcon } from '../HelpIcon'

export type InputFieldSize = 'sm' | 'md'

interface Props {
  modelValue?:   string
  size?:         InputFieldSize
  label?:        string
  placeholder?:  string
  hint?:         string
  helpTooltip?:  string
  type?:         'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  destructive?:  boolean
  disabled?:     boolean
  required?:     boolean
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

const uid      = useId()
const inputId  = computed(() => props.id ?? `input-${uid}`)
const iconSize = computed(() => props.size === 'sm' ? 16 : 20)
</script>

<template>
  <div class="ds-input-field" :class="`ds-input-field--${size}`">

    <!-- Label — texte seul, jamais d'icône ici -->
    <label v-if="label" :for="inputId" class="ds-input-field__label">
      {{ label }}
      <span v-if="required" class="ds-input-field__required" aria-hidden="true">*</span>
    </label>

    <!-- Input wrapper -->
    <div
      class="ds-input-field__wrapper"
      :class="{
        'ds-input-field__wrapper--destructive': destructive,
        'ds-input-field__wrapper--disabled':    disabled,
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
          :disabled="disabled"
          :required="required"
          :aria-invalid="destructive || undefined"
          :aria-describedby="hint ? `${inputId}-hint` : undefined"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Trailing : slot custom > error-icon > help-icon -->
      <span v-if="$slots.trailing" class="ds-input-field__icon" aria-hidden="true">
        <slot name="trailing" />
      </span>
      <Icon
        v-else-if="destructive"
        name="alert-circle"
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

    <!-- Hint / error message -->
    <p
      v-if="hint"
      :id="`${inputId}-hint`"
      class="ds-input-field__hint"
      :class="{ 'ds-input-field__hint--error': destructive }"
    >
      {{ hint }}
    </p>
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

/* ── Label row ────────────────────────────────────────────────────── */
.ds-input-field__label-row {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
}

.ds-input-field__label {
  margin: 0;
  display: block;
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-secondary);
  white-space: nowrap;
}

.ds-input-field__required {
  color: var(--ds-semantic-fg-error-primary);
  margin-left: 2px;
}

/* ── Wrapper (input box) ──────────────────────────────────────────── */
.ds-input-field__wrapper {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);   /* 8px entre content et trailing */
  width: 100%;
  background: var(--ds-semantic-bg-primary);
  border: 1px solid var(--ds-semantic-border-primary);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-xs);
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  padding: 10px 14px; /* md */
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
  border-color: var(--ds-color-brand-300, #589b7a);
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
  outline: none;
}

/* Destructive */
.ds-input-field__wrapper--destructive {
  border-color: var(--ds-color-error-300, #fda29b);
}

.ds-input-field__wrapper--destructive:focus-within {
  border-color: var(--ds-color-error-300, #fda29b);
  box-shadow: var(--ds-focus-ring-error-shadow-xs);
}

/* Disabled */
.ds-input-field__wrapper--disabled {
  background: var(--ds-semantic-bg-primary-alt);
  border-color: var(--ds-semantic-border-primary);
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
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 1rem;      /* 16px — identique en sm et md, seul le padding du wrapper change */
  font-weight: 400;
  line-height: 1.5rem;  /* 24px */
  color: var(--ds-semantic-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-input-field__input::placeholder {
  color: var(--ds-semantic-text-placeholder);
}

.ds-input-field__input:disabled {
  color: var(--ds-semantic-text-placeholder);
  cursor: not-allowed;
}

/* ── Icons ────────────────────────────────────────────────────────── */
.ds-input-field__icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: var(--ds-semantic-text-placeholder);
}

.ds-input-field__error-icon {
  flex-shrink: 0;
  color: var(--ds-semantic-fg-error-primary);
}

/* ── Leading text (ex: "$", "https://") ───────────────────────────── */
.ds-input-field__leading-text {
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5rem;
  color: var(--ds-semantic-text-placeholder);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Hint ─────────────────────────────────────────────────────────── */
.ds-input-field__hint {
  margin: 0;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-tertiary);
}

.ds-input-field__hint--error {
  color: var(--ds-semantic-fg-error-primary);
}
</style>
