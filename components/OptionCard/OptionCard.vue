<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { Avatar } from '../Avatar'
import { Checkbox } from '../Checkbox'
import { Flag } from '../Flag'
import { Icon, type IconName } from '../Icon'
import { OPTION_LIST_KEY, type OptionValue } from './context'

/**
 * One option, as a card or a row (ADR-0086): a media at the start — an icon on
 * its tile, an avatar, a flag, or the `#media` slot — then the title and its
 * sentence, a meta just before the end, and **the control at the end**, where
 * a chevron can only be: one rule for the three controls.
 *
 * In an `OptionList` it is a choice: a real radio (one choice) or checkbox
 * (several), hidden, the card being its label — so the keyboard is the
 * browser's own: one Tab stop for the radios and the arrows that move *and*
 * choose, one stop per box. Chosen, it says so three ways — the `border-brand`
 * contour at 2px (over 3:1 in both modes, ADR-0044), the `bg-selected` tint
 * (ADR-0050) and the control checked — never the colour alone (ADR-0006).
 * Hover is the contour only: a hover ground would be the icon tile's own
 * primitive, and the tile would disappear (ADR-0033).
 *
 * Alone, with `href` or a click, it is **a row that leads**: the same drawing
 * with a chevron, a link or a button, and no chosen state — no system mixes a
 * chevron with a selection.
 */
interface Props {
  /** The title. */
  label: string
  description?: string
  /** A figure or a word just before the control — « 128 parcelles ». */
  meta?: string
  /** In an `OptionList`, what this option stands for. */
  value?: OptionValue
  icon?: IconName
  avatarSrc?: string
  avatarInitials?: string
  /** An ISO 3166-1 code — the media is the country's flag (ADR-0085). */
  flag?: string
  disabled?: boolean
  /** A row that leads somewhere: a link. Without it and outside a list, a button. */
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  meta: undefined,
  value: undefined,
  icon: undefined,
  avatarSrc: undefined,
  avatarInitials: undefined,
  flag: undefined,
  disabled: false,
  href: undefined,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const list = inject(OPTION_LIST_KEY, null)
const uid = useId()
const titleId = `ds-option-card-title-${uid}`
const descriptionId = `ds-option-card-description-${uid}`

/* A choice inside a list; a row that leads outside one. */
const choosing = computed(() => Boolean(list) && props.value !== undefined)
const checked = computed(() => choosing.value && list!.isChecked(props.value!))
const isDisabled = computed(() => props.disabled || (list?.disabled.value ?? false))
const kind = computed(() => (list?.multiple.value ? 'checkbox' : 'radio'))

const tag = computed(() => (choosing.value ? 'label' : props.href ? 'a' : 'button'))
const rootAttrs = computed(() => {
  if (choosing.value) return {}
  /* Named by its title, described by its sentence — not the whole row read as one name. */
  const named = { 'aria-labelledby': titleId, 'aria-describedby': props.description ? descriptionId : undefined }
  if (props.href) return { ...named, href: isDisabled.value ? undefined : props.href, 'aria-disabled': isDisabled.value || undefined }
  return { ...named, type: 'button', disabled: isDisabled.value }
})

function onChange() {
  if (!isDisabled.value && choosing.value) list!.toggle(props.value!)
}

function onClick(event: MouseEvent) {
  if (!choosing.value && !isDisabled.value) emit('click', event)
}
</script>

<template>
  <component
    :is="tag"
    v-bind="rootAttrs"
    class="ds-option-card"
    :class="{
      'ds-option-card--checked': checked,
      'ds-option-card--disabled': isDisabled,
      'ds-option-card--leads': !choosing,
    }"
    @click="onClick"
  >
    <!-- The real control, hidden: the card is its label, the keyboard the browser's. -->
    <input
      v-if="choosing"
      class="ds-option-card__input"
      :type="kind"
      :name="list!.name"
      :value="String(value)"
      :checked="checked"
      :disabled="isDisabled"
      :aria-labelledby="titleId"
      :aria-describedby="description ? descriptionId : undefined"
      @change="onChange"
    />

    <span v-if="$slots.media || icon || avatarSrc || avatarInitials || flag" class="ds-option-card__media" aria-hidden="true">
      <slot name="media">
        <span v-if="icon" class="ds-option-card__tile"><Icon :name="icon" :size="20" /></span>
        <Avatar v-else-if="avatarSrc || avatarInitials" :src="avatarSrc" :initials="avatarInitials" size="sm" />
        <Flag v-else-if="flag" :code="flag" :size="24" />
      </slot>
    </span>

    <span class="ds-option-card__text">
      <span :id="titleId" class="ds-option-card__title">{{ label }}</span>
      <span v-if="description" :id="descriptionId" class="ds-option-card__description">{{ description }}</span>
    </span>

    <span v-if="meta" class="ds-option-card__meta"><span class="ds-option-card__meta-text">{{ meta }}</span></span>

    <span class="ds-option-card__control" aria-hidden="true">
      <Checkbox v-if="choosing" visual-only size="sm" :type="kind" :model-value="checked" :disabled="isDisabled" />
      <Icon v-else name="chevron-right" :size="20" class="ds-option-card__chevron" />
    </span>
  </component>
</template>

<style scoped>
/*
  The contour is a ring inside the border, so going from 1px to 2px moves
  nothing; the focus ring is added to it, not put in its place.
*/
.ds-option-card {
  --option-card-contour: 0 0 transparent;
  --option-card-focus: 0 0 transparent;

  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-lg);
  box-sizing: border-box;
  width: 100%;
  margin: 0;
  padding: var(--ds-spacing-xl);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface-sm);
  background: var(--ds-bg-default);
  box-shadow: var(--option-card-contour), var(--option-card-focus);
  color: inherit;
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition:
    border-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* Hover is the contour alone: a ground would swallow the icon's tile. */
.ds-option-card:hover:not(.ds-option-card--disabled):not(.ds-option-card--checked) {
  border-color: var(--ds-border-default);
}

.ds-option-card--checked {
  --option-card-contour: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-brand);

  border-color: var(--ds-border-brand);
  background: var(--ds-bg-selected);
}

/* The ring is the card's, whichever holds the focus — its input or itself. */
.ds-option-card:has(.ds-option-card__input:focus-visible),
.ds-option-card--leads:focus-visible {
  --option-card-focus: var(--ds-focus-ring-brand);

  outline: none;
}

.ds-option-card--disabled {
  border-color: var(--ds-border-disabled);
  background: var(--ds-bg-disabled);
  cursor: not-allowed;
}

/* Visually hidden, still the control. */
.ds-option-card__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
  opacity: 0;
}

.ds-option-card__media {
  display: inline-flex;
  flex: none;
}

/* The icon on its 40px tile — the recessed ground the hover must not cover. */
.ds-option-card__tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--ds-spacing-5xl);
  height: var(--ds-spacing-5xl);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-neutral-subtle);
  color: var(--ds-text-default);
}

.ds-option-card__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
  min-width: 0;
}

.ds-option-card__title {
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
  overflow-wrap: anywhere;
}

.ds-option-card__description {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
  overflow-wrap: anywhere;
}

/* The meta and the control sit on the title's line: each is a box one title
   line tall (`1lh` in the title's own font), its content centred in it. */
.ds-option-card__meta,
.ds-option-card__control {
  display: inline-flex;
  flex: none;
  align-items: center;
  height: 1lh;
  font: var(--ds-font-label-lg-strong);
}

.ds-option-card__meta-text {
  font: var(--ds-font-body-sm);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
}

.ds-option-card__chevron {
  color: var(--ds-text-subtle);
}

.ds-option-card--disabled .ds-option-card__title,
.ds-option-card--disabled .ds-option-card__description,
.ds-option-card--disabled .ds-option-card__meta-text,
.ds-option-card--disabled .ds-option-card__chevron {
  color: var(--ds-text-disabled);
}
</style>
