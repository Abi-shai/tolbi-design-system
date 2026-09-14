<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import { Spinner } from '../Spinner'
import type { IconName } from '../Icon'

export type ButtonVariant =
  | 'primary'
  | 'secondary-gray'
  | 'secondary-color'
  | 'tertiary'
  | 'link'
  | 'danger'
  | 'danger-secondary'
  | 'ghost'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'lg-compact' | 'xl' | '2xl'

interface Props {
  label: string
  variant?: ButtonVariant
  size?: ButtonSize
  iconLeading?: IconName
  iconTrailing?: IconName
  iconOnly?: boolean
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  iconOnly: false,
  disabled: false,
  loading: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const iconSize = computed(() => (props.size === '2xl' ? 24 : 20))

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="['ds-button', `ds-button--${variant}`, `ds-button--${size}`, { 'ds-button--icon-only': iconOnly }]"
    :aria-busy="loading || undefined"
    :aria-label="iconOnly || loading ? label : undefined"
    @click="handleClick"
  >
    <!--
      ADR-0027: the body stays in the layout while loading so the button keeps
      its width — it used to collapse from 233px to 44px, which shoves whatever
      sits beside it. Both children share one grid cell; only their visibility
      changes.

      `visibility: hidden` takes the label out of the accessibility tree along
      with the layout, so `aria-label` carries the name while loading. Without
      it the button announces as "busy" with no name at all.

      size="1em" so the spinner tracks the button's own font size, as the
      hand-rolled version did across all five sizes (ADR-0001).
    -->
    <span class="ds-button__stack">
      <span class="ds-button__body" :class="{ 'ds-button__body--hidden': loading }">
        <Icon v-if="iconLeading" :name="iconLeading" :size="iconSize" class="ds-button__icon" aria-hidden="true" />
        <span v-if="!iconOnly" class="ds-button__label">{{ label }}</span>
        <Icon v-if="iconTrailing && !iconOnly" :name="iconTrailing" :size="iconSize" class="ds-button__icon" aria-hidden="true" />
      </span>
      <Spinner v-if="loading" size="1em" class="ds-button__spinner" />
    </span>
  </button>
</template>

<style scoped>
/* ADR-0027 — the spinner and the body share one grid cell, so the body keeps
   defining the width even while it is invisible. `visibility: hidden` rather
   than `display: none`: it holds the space AND leaves the accessibility tree,
   so the label is not announced under aria-busy. */
.ds-button__stack {
  display: grid;
  place-items: center;
}

.ds-button__stack > * {
  grid-area: 1 / 1;
}

.ds-button__body {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-xs);
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-out);
}

.ds-button__body--hidden {
  opacity: 0;
  visibility: hidden;
}

/* ── Base ─────────────────────────────────────────────────────────── */
.ds-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-control-padding-md);
  border: var(--ds-border-width-default) solid transparent;
  border-radius: var(--ds-radius-control);
  font: var(--ds-font-label-lg-strong);
  white-space: nowrap;
  cursor: pointer;
  box-shadow: var(--ds-elevation-control);
  outline: none;
  transition:
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    color            var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    border-color     var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* ── Sizes ────────────────────────────────────────────────────────── */
.ds-button--sm {
  padding: var(--ds-control-padding-sm);
}

.ds-button--lg {
  gap: var(--ds-spacing-sm);
  padding: var(--ds-control-padding-lg);
  font: var(--ds-font-label-xl-strong);
}

/*
  lg's type and horizontal rhythm at a 36px height. It is not `sm`: sm is also
  36px but carries 14px type, and this one keeps label-xl-strong. Used by the
  navigation bar, where a 44px control does not fit the 64px bar.
*/
.ds-button--lg-compact {
  gap: var(--ds-spacing-sm);
  padding: var(--ds-control-padding-lg-compact);
  font: var(--ds-font-label-xl-strong);
}

.ds-button--xl {
  gap: var(--ds-spacing-sm);
  padding: var(--ds-control-padding-xl);
  font: var(--ds-font-label-xl-strong);
}

.ds-button--2xl {
  gap: 10px;
  padding: var(--ds-control-padding-2xl);
  /* Component token (ADR-0010): 18px/28px is off the type ramp and has exactly
     one consumer. A role would be minted for a single call site. */
  --button-2xl-font: var(--ds-font-weight-label-xl-strong) 1.125rem/1.75rem var(--ds-typography-font-family-poppins);
  font: var(--button-2xl-font);
}

/* ── Primary ──────────────────────────────────────────────────────── */
.ds-button--primary {
  background-color: var(--ds-bg-brand-solid);
  border-color: var(--ds-border-brand-solid);
  color: var(--ds-text-on-brand-solid);
}
.ds-button--primary:hover:not(:disabled) {
  background-color: var(--ds-bg-brand-solid-hover);
  border-color: var(--ds-border-brand-solid-hover);
}
.ds-button--primary:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* ── Secondary gray ───────────────────────────────────────────────── */
.ds-button--secondary-gray {
  background-color: var(--ds-bg-default);
  border-color: var(--ds-border-default);
  color: var(--ds-text-default);
}
.ds-button--secondary-gray:hover:not(:disabled) {
  background-color: var(--ds-bg-hover);
  color: var(--ds-text-default-hover);
}
.ds-button--secondary-gray:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-gray-shadow-xs);
}

/* ── Secondary color ──────────────────────────────────────────────── */
.ds-button--secondary-color {
  background-color: var(--ds-bg-default);
  border-color: var(--ds-border-brand);
  color: var(--ds-text-brand);
}
.ds-button--secondary-color:hover:not(:disabled) {
  background-color: var(--ds-bg-brand-subtle);
  color: var(--ds-text-brand-hover);
}
.ds-button--secondary-color:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* ── Tertiary ─────────────────────────────────────────────────────── */
.ds-button--tertiary {
  background-color: transparent;
  border-color: transparent;
  color: var(--ds-text-brand);
  box-shadow: none;
}
.ds-button--tertiary:hover:not(:disabled) {
  background-color: var(--ds-bg-brand-subtle);
  color: var(--ds-text-brand-hover);
}
.ds-button--tertiary:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* ── Link ─────────────────────────────────────────────────────────── */
.ds-button--link {
  gap: var(--ds-spacing-sm);
  padding: 0;
  background-color: transparent;
  border-color: transparent;
  color: var(--ds-text-brand);
  box-shadow: none;
}
.ds-button--link:hover:not(:disabled) {
  color: var(--ds-text-brand-hover);
  text-decoration: underline;
}
.ds-button--link:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* ── Danger ───────────────────────────────────────────────────────── */
.ds-button--danger {
  background-color: var(--ds-bg-error-solid);
  border-color: var(--ds-border-error-solid);
  color: var(--ds-text-on-error-solid);
}
.ds-button--danger:hover:not(:disabled) {
  background-color: var(--ds-bg-error-solid-hover);
  border-color: var(--ds-border-error-solid-hover);
}
.ds-button--danger:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-error-shadow-xs);
}

/* ── Danger secondary ─────────────────────────────────────────────── */
.ds-button--danger-secondary {
  background-color: var(--ds-bg-default);
  border-color: var(--ds-border-error);
  color: var(--ds-text-error);
}
.ds-button--danger-secondary:hover:not(:disabled) {
  background-color: var(--ds-bg-error-subtle);
  color: var(--ds-text-on-error-subtle);
}
.ds-button--danger-secondary:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-error-shadow-xs);
}

/* ── Ghost ────────────────────────────────────────────────────────── */
.ds-button--ghost {
  background-color: transparent;
  border-color: transparent;
  color: var(--ds-text-subtle);
  box-shadow: none;
}
.ds-button--ghost:hover:not(:disabled) {
  background-color: var(--ds-bg-hover);
  color: var(--ds-text-default);
}
.ds-button--ghost:focus-visible:not(:disabled) {
  box-shadow: var(--ds-focus-ring-gray-shadow-xs);
}

/* ── Icon-only ────────────────────────────────────────────────────── */
.ds-button--icon-only {
  padding: 0;
  gap: 0;
}
.ds-button--icon-only.ds-button--sm  { width: 36px; height: 36px; }
.ds-button--icon-only.ds-button--md  { width: 40px; height: 40px; }
.ds-button--icon-only.ds-button--lg  { width: 44px; height: 44px; }
.ds-button--icon-only.ds-button--lg-compact { width: 36px; height: 36px; }
.ds-button--icon-only.ds-button--xl  { width: 48px; height: 48px; }
.ds-button--icon-only.ds-button--2xl { width: 56px; height: 56px; }

/* ── Disabled ─────────────────────────────────────────────────────── */
.ds-button:disabled {
  background-color: var(--ds-bg-disabled);
  border-color: var(--ds-border-subtle);
  color: var(--ds-text-disabled);
  box-shadow: none;
  cursor: not-allowed;
}

.ds-button--tertiary:disabled,
.ds-button--link:disabled {
  background-color: transparent;
  border-color: transparent;
}

/* ── Spinner ──────────────────────────────────────────────────────── */
/* Geometry and animation now live in Spinner. */
.ds-button__spinner { flex-shrink: 0; }

</style>
