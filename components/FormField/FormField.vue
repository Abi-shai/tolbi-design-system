<script setup lang="ts">
import { computed, provide, useId } from 'vue'
import Icon from '../Icon/Icon.vue'
import { FORM_FIELD_KEY } from './context'

interface Props {
  /** Caption above the control. Omit it for a control that carries its own inline label (Checkbox, Toggle). */
  label?:    string
  /** Helper text below the control. Replaced by `error` when there is one. */
  hint?:     string
  /** Error message below the control. Its presence is what makes the field invalid. */
  error?:    string
  required?: boolean
  disabled?: boolean
  /** Id given to the wrapped control. Set it here, never on the control. */
  id?:       string
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
})

const uid       = useId()
const fieldId   = computed(() => props.id ?? `field-${uid}`)
const messageId = computed(() => `${fieldId.value}-message`)

// A field is invalid because it has something to say, not because a flag was set.
// That is what stops `destructive` and its message from drifting apart.
const invalid = computed(() => Boolean(props.error))
const message = computed(() => props.error || props.hint || '')

const describedBy = computed(() => (message.value ? messageId.value : undefined))

provide(FORM_FIELD_KEY, {
  id:       fieldId,
  describedBy,
  invalid,
  required: computed(() => props.required),
  disabled: computed(() => props.disabled),
})
</script>

<template>
  <div class="ds-form-field" :class="{ 'ds-form-field--disabled': disabled }">
    <!-- Label — text only. An icon inside the control's box stays the control's business. -->
    <label v-if="label" :for="fieldId" class="ds-form-field__label">
      {{ label }}
      <!--
        aria-hidden: the asterisk is decoration. The control carries the native
        `required` attribute, which is what assistive tech actually reads.
      -->
      <span v-if="required" class="ds-form-field__required" aria-hidden="true">*</span>
    </label>

    <slot />

    <!--
      One message element, one id. Hint and error share it because a field says
      one thing at a time — and because a stable id keeps aria-describedby valid
      across the switch from hint to error.
    -->
    <p
      v-if="message"
      :id="messageId"
      class="ds-form-field__message"
      :class="{ 'ds-form-field__message--error': invalid }"
    >
      <!-- Tone never carries meaning alone (ADR-0006): an error is also a glyph. -->
      <Icon
        v-if="invalid"
        name="circle-alert"
        :size="16"
        class="ds-form-field__message-icon"
        aria-hidden="true"
      />
      {{ message }}
    </p>
  </div>
</template>

<style scoped>
.ds-form-field {
  /*
    The message glyph is 16px — below the 320px floor of the widths ramp and not
    a spacing step, so there is no honest token for it. Declared once here rather
    than buried in the rule below, and overridable by a caller.
  */
  --ds-form-field-message-icon: 1rem;

  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
  width: 100%;
}

/* ── Label ────────────────────────────────────────────────────────── */
.ds-form-field__label {
  margin: 0;
  display: block;
  font: var(--ds-font-label-lg);
  color: var(--ds-text-default);
}

.ds-form-field__required {
  color: var(--ds-text-error);
  margin-left: var(--ds-spacing-xxs);
}

/* ── Message ──────────────────────────────────────────────────────── */
.ds-form-field__message {
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-xs);
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}

.ds-form-field__message--error {
  color: var(--ds-text-error);
}

/* Optically centred on the first line, so a wrapping message keeps the glyph on top. */
.ds-form-field__message-icon {
  flex: none;
  margin-top: calc((var(--ds-line-height-body-md) - var(--ds-form-field-message-icon)) / 2);
}

/* ── Disabled ─────────────────────────────────────────────────────── */
.ds-form-field--disabled .ds-form-field__label,
.ds-form-field--disabled .ds-form-field__message {
  color: var(--ds-text-disabled);
}
</style>
