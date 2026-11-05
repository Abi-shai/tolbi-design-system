<script setup lang="ts">
import type { InputDropdownSize } from './InputDropdown.vue'
import { Avatar } from '../Avatar'
import { Checkbox } from '../Checkbox'
import { Flag } from '../Flag'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

export type DropdownSelectItemType = 'default' | 'icon' | 'avatar' | 'dot' | 'flag'

interface Props {
  label: string
  supportingText?: string
  type?: DropdownSelectItemType
  icon?: IconName
  avatarSrc?: string
  /** Shown when there is no `avatarSrc` — the same fallback `Avatar` gives. */
  avatarInitials?: string
  avatarAlt?: string
  dotColor?: string
  /** `type="flag"`: the country's ISO code (ADR-0085). */
  flag?: string
  selected?: boolean
  /**
   * The list's size, which is its field's (ADR-0101): `md` 46px in `label-xl`,
   * `sm` 38px in `label-lg` — a row is the height of the field that opened it.
   */
  size?: InputDropdownSize
  disabled?: boolean
  /**
   * One choice among several (ADR-0085): a box leads the row and carries the
   * choice — the row keeps its ground, as `DropdownItem checked` does.
   */
  checkbox?: boolean
  /**
   * The option the keyboard points at, in a list whose focus stays on its
   * field (`aria-activedescendant`, ADR-0095): drawn as hovered.
   */
  active?: boolean
  /**
   * A tab stop of its own. Off in a field's list — the field keeps the focus
   * and the arrows move `active`; one tab stop per option made a 195-country
   * list 195 presses of Tab long.
   */
  focusable?: boolean
}

withDefaults(defineProps<Props>(), {
  size: 'md',
  type: 'default',
  flag: undefined,
  selected: false,
  disabled: false,
  checkbox: false,
  active: false,
  focusable: true,
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="ds-dropdown-select-item"
    :class="{
      'ds-dropdown-select-item--selected': selected && !checkbox,
      'ds-dropdown-select-item--sm': size === 'sm',
      'ds-dropdown-select-item--disabled': disabled,
      'ds-dropdown-select-item--active': active && !disabled,
    }"
    role="option"
    :aria-selected="selected"
    :aria-disabled="disabled || undefined"
    :tabindex="focusable && !disabled ? 0 : -1"
    @click="!disabled && emit('click')"
    @keydown.enter.prevent="focusable && !disabled && emit('click')"
    @keydown.space.prevent="focusable && !disabled && emit('click')"
  >
    <div class="ds-dropdown-select-item__content">
      <Checkbox v-if="checkbox" visual-only size="sm" :model-value="selected" :disabled="disabled" class="ds-dropdown-select-item__check" />
      <Flag v-if="type === 'flag' && flag" :code="flag" :size="size === 'sm' ? 16 : 20" />
      <Icon
        v-else-if="type === 'icon'"
        :name="icon || 'user'"
        :size="size === 'sm' ? 16 : 20"
        class="ds-dropdown-select-item__leading-icon"
        aria-hidden="true"
      />
      <Avatar
        v-else-if="type === 'avatar'"
        :src="avatarSrc"
        :initials="avatarInitials"
        :alt="avatarAlt"
        size="xs"
        class="ds-dropdown-select-item__leading-avatar"
      />
      <span
        v-else-if="type === 'dot'"
        class="ds-dropdown-select-item__leading-dot"
        :style="dotColor ? { backgroundColor: dotColor } : undefined"
        aria-hidden="true"
      />

      <div class="ds-dropdown-select-item__text">
        <span class="ds-dropdown-select-item__label">{{ label }}</span>
        <span v-if="supportingText" class="ds-dropdown-select-item__supporting">{{ supportingText }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ds-dropdown-select-item {
  display: flex;
  align-items: center;
  padding: 1px var(--ds-spacing-sm);
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.ds-dropdown-select-item--disabled {
  cursor: not-allowed;
}

.ds-dropdown-select-item__content {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  flex: 1;
  min-width: 0;
  padding: 10px 10px 10px var(--ds-spacing-md);
  border-radius: var(--ds-radius-inner);
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

/*
  The current item, marked the one way every list in the catalogue marks it
  (ADR-0050): its own ground, that ground's ink, and the role's strong weight.
  No check — the weight is the cue that does not travel by colour, which is
  what the tint alone could not be: in dark it measures 1.145:1 against the
  panel, where hover measures 1.233:1.
*/
.ds-dropdown-select-item--selected .ds-dropdown-select-item__content {
  background-color: var(--ds-bg-selected);
}

.ds-dropdown-select-item:hover:not(.ds-dropdown-select-item--disabled) .ds-dropdown-select-item__content,
.ds-dropdown-select-item:focus-visible .ds-dropdown-select-item__content,
.ds-dropdown-select-item--active .ds-dropdown-select-item__content {
  background-color: var(--ds-bg-hover);
}

/* Hovering the current item keeps its ground's family — `bg-hover` would take
   the tint away and leave the brand ink on grey. */
.ds-dropdown-select-item--selected:hover:not(.ds-dropdown-select-item--disabled) .ds-dropdown-select-item__content,
.ds-dropdown-select-item--selected:focus-visible .ds-dropdown-select-item__content,
.ds-dropdown-select-item--selected.ds-dropdown-select-item--active .ds-dropdown-select-item__content {
  background-color: var(--ds-bg-selected-hover);
}

.ds-dropdown-select-item:focus-visible {
  outline: none;
}

.ds-dropdown-select-item__check {
  flex-shrink: 0;
}

.ds-dropdown-select-item__leading-icon {
  flex-shrink: 0;
  color: var(--ds-text-default);
}

.ds-dropdown-select-item--disabled .ds-dropdown-select-item__leading-icon {
  color: var(--ds-text-subtlest);
}

.ds-dropdown-select-item__leading-avatar {
  flex-shrink: 0;
}

.ds-dropdown-select-item__leading-dot {
  flex-shrink: 0;
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: var(--ds-radius-pill);
  background-color: var(--ds-text-success);
}

.ds-dropdown-select-item--disabled .ds-dropdown-select-item__leading-dot {
  background-color: var(--ds-text-subtlest);
}

.ds-dropdown-select-item__text {
  display: flex;
  align-items: baseline;
  gap: var(--ds-spacing-md);
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

/*
  Both texts may give way, the supporting one a hundred times faster — so it is
  cut first, and the label only once it has nothing left. The label used to be
  `flex-shrink: 0`, which made its own ellipsis unreachable: a long label was
  clipped mid-letter by the text box instead (« Coopérative de Kaolac »).
*/
.ds-dropdown-select-item__label {  font: var(--ds-font-label-xl);
  color: var(--ds-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 1 auto;
  min-width: 0;
}

.ds-dropdown-select-item--selected .ds-dropdown-select-item__label {
  font: var(--ds-font-label-xl-strong);
  color: var(--ds-text-on-brand-subtle);
}

.ds-dropdown-select-item--selected .ds-dropdown-select-item__leading-icon {
  color: var(--ds-text-on-brand-subtle);
}

.ds-dropdown-select-item--disabled .ds-dropdown-select-item__label {
  color: var(--ds-text-disabled);
}

.ds-dropdown-select-item__supporting {  font: var(--ds-font-body-lg);
  color: var(--ds-text-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 100 auto;
  min-width: 0;
}

/* sm (ADR-0101): the row is the `sm` field's height — 38px: `label-lg`'s 20px
   line, 8px above and below, and the row's 1px gap. One step down in type,
   as the field is. */
.ds-dropdown-select-item--sm .ds-dropdown-select-item__content {
  padding: var(--ds-spacing-md) 10px var(--ds-spacing-md) var(--ds-spacing-md);
}

.ds-dropdown-select-item--sm .ds-dropdown-select-item__label {
  font: var(--ds-font-label-lg);
}

.ds-dropdown-select-item--sm.ds-dropdown-select-item--selected .ds-dropdown-select-item__label {
  font: var(--ds-font-label-lg-strong);
}

.ds-dropdown-select-item--sm .ds-dropdown-select-item__supporting {
  font: var(--ds-font-body-md);
}

.ds-dropdown-select-item--disabled .ds-dropdown-select-item__supporting {
  color: var(--ds-text-disabled);
}


</style>
