<script setup lang="ts">
import { Avatar } from '../Avatar'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

export type DropdownSelectItemType = 'default' | 'icon' | 'avatar' | 'dot'

interface Props {
  label: string
  supportingText?: string
  type?: DropdownSelectItemType
  icon?: IconName
  avatarSrc?: string
  avatarAlt?: string
  dotColor?: string
  selected?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'default',
  selected: false,
  disabled: false,
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="ds-dropdown-select-item"
    :class="{
      'ds-dropdown-select-item--selected': selected,
      'ds-dropdown-select-item--disabled': disabled,
    }"
    role="option"
    :aria-selected="selected"
    :tabindex="disabled ? -1 : 0"
    @click="!disabled && emit('click')"
    @keydown.enter.prevent="!disabled && emit('click')"
    @keydown.space.prevent="!disabled && emit('click')"
  >
    <div class="ds-dropdown-select-item__content">
      <Icon
        v-if="type === 'icon'"
        :name="icon || 'user'"
        :size="20"
        class="ds-dropdown-select-item__leading-icon"
        aria-hidden="true"
      />
      <Avatar
        v-else-if="type === 'avatar'"
        :src="avatarSrc"
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

      <Icon
        v-if="selected"
        name="check"
        :size="20"
        class="ds-dropdown-select-item__check"
        aria-hidden="true"
      />
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

.ds-dropdown-select-item--selected .ds-dropdown-select-item__content {
  background-color: var(--ds-bg-selected);
}

.ds-dropdown-select-item:hover:not(.ds-dropdown-select-item--disabled) .ds-dropdown-select-item__content,
.ds-dropdown-select-item:focus-visible .ds-dropdown-select-item__content {
  background-color: var(--ds-bg-hover);
}

.ds-dropdown-select-item:focus-visible {
  outline: none;
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

.ds-dropdown-select-item__label {  font: var(--ds-font-label-xl);
  color: var(--ds-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.ds-dropdown-select-item--disabled .ds-dropdown-select-item__label {
  color: var(--ds-text-disabled);
}

.ds-dropdown-select-item__supporting {  font: var(--ds-font-body-lg);
  color: var(--ds-text-subtle);
  white-space: nowrap;
  flex-shrink: 0;
}

.ds-dropdown-select-item--disabled .ds-dropdown-select-item__supporting {
  color: var(--ds-text-disabled);
}

.ds-dropdown-select-item__check {
  flex-shrink: 0;
  color: var(--ds-text-brand);
}

.ds-dropdown-select-item--disabled .ds-dropdown-select-item__check {
  color: var(--ds-text-subtlest);
}
</style>
