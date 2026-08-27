<script setup lang="ts">
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

interface Props {
  label:      string
  icon?:      IconName
  shortcut?:  string
  disabled?:  boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
})

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    class="ds-dropdown-item"
    :class="{ 'ds-dropdown-item--disabled': disabled }"
    role="menuitem"
    :tabindex="disabled ? -1 : 0"
    @click="!disabled && emit('click')"
    @keydown.enter="!disabled && emit('click')"
    @keydown.space.prevent="!disabled && emit('click')"
  >
    <div class="ds-dropdown-item__content">
      <div class="ds-dropdown-item__icon-text">
        <Icon
          v-if="icon"
          :name="icon"
          :size="16"
          class="ds-dropdown-item__icon"
          aria-hidden="true"
        />
        <span class="ds-dropdown-item__label">{{ label }}</span>
      </div>
      <span v-if="shortcut" class="ds-dropdown-item__shortcut">{{ shortcut }}</span>
    </div>
  </div>
</template>

<style scoped>
.ds-dropdown-item {
  display: flex;
  align-items: center;
  padding: 1px 6px;
  cursor: pointer;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.ds-dropdown-item__content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding: 9px 10px;
  border-radius: var(--ds-radius-sm);
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-dropdown-item:hover:not(.ds-dropdown-item--disabled) .ds-dropdown-item__content {
  background-color: var(--ds-semantic-bg-primary-hover);
}

.ds-dropdown-item:focus-visible {
  outline: none;
}

.ds-dropdown-item:focus-visible .ds-dropdown-item__content {
  background-color: var(--ds-semantic-bg-primary-hover);
}

.ds-dropdown-item--disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.ds-dropdown-item__icon-text {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.ds-dropdown-item__icon {
  flex-shrink: 0;
  color: var(--ds-semantic-fg-secondary);
}

.ds-dropdown-item__label {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.ds-dropdown-item__shortcut {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 400;
  font-size: 0.75rem;
  line-height: 1.125rem;
  color: var(--ds-semantic-text-quarterary);
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
