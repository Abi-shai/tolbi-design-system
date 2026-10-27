<script setup lang="ts">
import { computed, provide, useId, useSlots } from 'vue'
import Icon from '../Icon/Icon.vue'
import { FORM_FIELD_KEY } from './context'

interface Props {
  /** Caption above the control. Omit it for a control that carries its own inline label (Checkbox, Toggle). */
  label?:    string
  /**
   * Helper text below the control. Replaced by `error` when there is one. For
   * more than a string — a link, a word in bold — the `#hint` slot, which the
   * prop falls back to (phrasing content: it is read inside a `<p>`).
   */
  hint?:     string
  /** Error message below the control. Its presence is what makes the field invalid. */
  error?:    string
  required?: boolean
  disabled?: boolean
  /** Id given to the wrapped control. Set it here, never on the control. */
  id?:       string
  /**
   * Several controls under one label — a list of identifiers (ADR-0081). The
   * label names the group (`role="group"`) rather than pointing at a control,
   * and the message describes the group: each control keeps its own id and is
   * named by the product (« Identifiant TVA »).
   */
  group?:    boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  group:    false,
})

const uid       = useId()
const fieldId   = computed(() => props.id ?? `field-${uid}`)
const labelId   = computed(() => `${fieldId.value}-label`)
const messageId = computed(() => `${fieldId.value}-message`)

// A field is invalid because it has something to say, not because a flag was set.
// That is what stops `destructive` and its message from drifting apart.
const invalid = computed(() => Boolean(props.error))
const slots = useSlots()
/* The slot counts as a hint too: the message, and the control's description, follow it. */
const hasMessage = computed(() => invalid.value || Boolean(props.hint) || Boolean(slots.hint))

const describedBy = computed(() => (hasMessage.value ? messageId.value : undefined))

/* In a group, no control takes the field's id or its message: the label and
   the message are the group's, and one id cannot sit on two controls. */
provide(FORM_FIELD_KEY, {
  id:          computed(() => (props.group ? undefined : fieldId.value)),
  describedBy: computed(() => (props.group ? undefined : describedBy.value)),
  labelId:     computed(() => (props.label && !props.group ? labelId.value : undefined)),
  invalid,
  required: computed(() => props.required),
  disabled: computed(() => props.disabled),
})
</script>

<template>
  <div
    class="ds-form-field"
    :class="{ 'ds-form-field--disabled': disabled }"
    :role="group ? 'group' : undefined"
    :aria-labelledby="group && label ? labelId : undefined"
    :aria-describedby="group ? describedBy : undefined"
  >
    <!--
      The label's row. `#label-action` sits at its end — « + Ajouter un
      identifiant » — outside the `<label>`, or a click on the action would be
      the label's too (ADR-0081). Short of room, the action goes under it.
    -->
    <div v-if="label || $slots['label-action']" class="ds-form-field__label-row">
      <!-- Label — text only. An icon inside the control's box stays the control's business. -->
      <component
        :is="group ? 'span' : 'label'"
        v-if="label"
        :id="labelId"
        :for="group ? undefined : fieldId"
        class="ds-form-field__label"
      >
        {{ label }}
        <!--
          aria-hidden: the asterisk is decoration. The control carries the native
          `required` attribute, which is what assistive tech actually reads.
        -->
        <span v-if="required" class="ds-form-field__required" aria-hidden="true">*</span>
      </component>
      <span v-if="$slots['label-action']" class="ds-form-field__label-action">
        <slot name="label-action" />
      </span>
    </div>

    <slot />

    <!--
      One message element, one id. Hint and error share it because a field says
      one thing at a time — and because a stable id keeps aria-describedby valid
      across the switch from hint to error.
    -->
    <Transition name="ds-field-message">
      <div v-if="invalid || hint || $slots.hint" class="ds-form-field__message-wrap">
        <p
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
          <template v-if="invalid">{{ error }}</template>
          <slot v-else name="hint">{{ hint }}</slot>
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/*
  ADR-0025 — the message opens the space it needs instead of shoving the layout.

  `height: auto` is not animatable, so the wrapper is a one-row grid and the row
  goes 0fr → 1fr, which IS. The child needs `overflow: hidden` or it spills out
  of the collapsed row.

  The grid lives on the TRANSITIONING element rather than a static parent: Vue
  puts enter-from / leave-to on the element it mounts, and on leave the content
  has to still be there for the space to have anything to close over. A static
  wrapper with a toggled class collapses instantly, because `v-if` has already
  removed what gave the row its height.

  `quick` (100ms), not `enter`: an error must not be late. The duration is there
  to stop the layout jumping, not to make an entrance.
*/
.ds-form-field__message-wrap {
  display: grid;
  grid-template-rows: 1fr;
}

.ds-field-message-enter-active,
.ds-field-message-leave-active {
  transition:
    grid-template-rows var(--ds-motion-duration-quick) var(--ds-motion-easing-out),
    opacity            var(--ds-motion-duration-quick) var(--ds-motion-easing-out);
}

.ds-field-message-enter-from,
.ds-field-message-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

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
/* The action ends the row; when it no longer fits, it wraps to the start of
   the next line (EUI) rather than squeezing the label. */
.ds-form-field__label-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-xs) var(--ds-spacing-md);
}

.ds-form-field__label-action {
  display: inline-flex;
  flex: none;
}

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
  overflow: hidden;
  /* hint → error is the common case (the stories carry 30 hints to 9 errors):
     same slot, so nothing moves and only the colour turns. The text itself does
     not cross-fade — an error has to be readable the instant it replaces a hint. */
  transition: color var(--ds-motion-duration-quick) var(--ds-motion-easing-out);
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
  overflow: hidden;
  /* hint → error is the common case (the stories carry 30 hints to 9 errors):
     same slot, so nothing moves and only the colour turns. The text itself does
     not cross-fade — an error has to be readable the instant it replaces a hint. */
  transition: color var(--ds-motion-duration-quick) var(--ds-motion-easing-out);
  color: var(--ds-text-disabled);
}
</style>
