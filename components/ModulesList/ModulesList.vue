<script setup lang="ts">
import { ModuleIcon } from '../ModuleIcon'
import type { ModuleName } from '../ModuleIcon'

export interface ModulesListItem {
  name:      ModuleName
  label?:    string
  active?:   boolean
  disabled?: boolean
}

interface Props {
  modules?: ModulesListItem[]
}

const props = withDefaults(defineProps<Props>(), {
  modules: () => [],
})

const emit = defineEmits<{
  select: [item: ModulesListItem]
}>()

function onSelect(item: ModulesListItem) {
  if (item.disabled) return
  emit('select', item)
}
</script>

<template>
  <div class="ds-modules-list">
    <div class="ds-modules-list__inner">
      <button
        v-for="mod in modules"
        :key="mod.name"
        class="ds-modules-list__item"
        :class="{
          'ds-modules-list__item--active':   mod.active,
          'ds-modules-list__item--disabled': mod.disabled,
        }"
        :disabled="mod.disabled"
        @click="onSelect(mod)"
      >
        <ModuleIcon :module="mod.name" :size="48" />
        <span class="ds-modules-list__label">{{ mod.label ?? mod.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/*
 * Figma node 518:15253
 * Outer  : h-224px fixe, p-sm (6px), overflow-y auto, align-items flex-start
 *          → content area = 224 - 12 = 212px
 * Inner  : w-246px, p-md (8px), flex wrap, gap-xl (16px)
 *          2 rangées = 8+90+16+90+8 = 212px → fit exact, green visible 4 côtés
 *          3 rangées = 318px → scroll, green visible en fin de scroll
 * Item   : w-66px, h-90px, p-md (8px), flex-col, gap-md (8px)
 */

.ds-modules-list {
  height: 224px;
  box-sizing: border-box;
  background: var(--ds-semantic-bg-secondary);
  border-radius: var(--ds-radius-2xl);
  padding: var(--ds-spacing-sm);
  overflow-y: auto;
  overflow-x: hidden;
  display: inline-flex;
  align-items: flex-start;
  flex-shrink: 0;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--ds-semantic-bg-quaternary) transparent;
}

.ds-modules-list::-webkit-scrollbar {
  width: 16px;
}

.ds-modules-list::-webkit-scrollbar-track {
  background: transparent;
}

.ds-modules-list::-webkit-scrollbar-thumb {
  background-color: var(--ds-semantic-bg-quaternary);
  border-radius: var(--ds-radius-full);
  border: 4px solid transparent;
  background-clip: padding-box;
}

.ds-modules-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--ds-semantic-fg-senary);
}

.ds-modules-list__inner {
  width: 246px;
  box-sizing: border-box;
  background: var(--ds-semantic-bg-primary);
  border-radius: var(--ds-radius-xl);
  padding: var(--ds-spacing-md);
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-spacing-xl);
  align-content: flex-start;
}

.ds-modules-list__item {
  width: 66px;
  height: 90px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-md);
  background: transparent;
  border: none;
  border-radius: var(--ds-radius-md);
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  transition: background 0.12s ease;
}

.ds-modules-list__item:hover:not(:disabled) {
  background: var(--ds-semantic-bg-primary-hover);
}

.ds-modules-list__item--active {
  background: var(--ds-semantic-bg-brand-primary);
}

.ds-modules-list__item--disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ds-modules-list__label {
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem;
  text-align: center;
  color: var(--ds-semantic-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
</style>
