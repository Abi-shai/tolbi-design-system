<script setup lang="ts">
import { ModuleIcon } from '../ModuleIcon'
import { Scrollbar } from '../Scrollbar'
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
    <Scrollbar class="ds-modules-list__viewport">
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
          <!--
            The primitive, not the logo: the item button already supplies the surface
            (its own radius, hover background, and bg-brand-primary when active), so the
            logo's tile would be a tile inside a tile and would fight the active state.
            aria-label is null because the visible label below already names the module.
          -->
          <ModuleIcon
            :module="mod.name"
            variant="illustration"
            :size="48"
            :aria-label="null"
          />
          <span class="ds-modules-list__label">{{ mod.label ?? mod.name }}</span>
        </button>
      </div>
    </Scrollbar>
  </div>
</template>

<style scoped>
/*
 * Figma node 518:15253
 * Outer  : h-224px fixe, p-sm (6px), scroll délégué à <Scrollbar>, align-items flex-start
 *          → content area = 224 - 12 = 212px
 * Inner  : w-246px, p-md (8px), flex wrap, gap-xl (16px)
 *          2 rangées = 8+90+16+90+8 = 212px → fit exact, green visible 4 côtés
 *          3 rangées = 318px → scroll, green visible en fin de scroll
 * Item   : w-66px, h-90px, p-md (8px), flex-col, gap-md (8px)
 */

/*
 * Scrolling is delegated to <Scrollbar> (ADR-0001), whose thumb is absolutely
 * positioned over the content. Nothing here reserves a gutter: the panel keeps
 * its full 246px and the thumb floats above its right edge.
 */
.ds-modules-list {
  height: 224px;
  box-sizing: border-box;
  background: var(--ds-bg-neutral-subtle);
  border-radius: var(--ds-radius-2xl);
  padding: var(--ds-spacing-sm);
  display: inline-flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.ds-modules-list__viewport {
  max-height: 100%;
}

.ds-modules-list__inner {
  width: 246px;
  box-sizing: border-box;
  background: var(--ds-bg-default);
  border-radius: var(--ds-radius-surface);
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
  border-radius: var(--ds-radius-control);
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  transition: background 0.12s ease;
}

.ds-modules-list__item:hover:not(:disabled) {
  background: var(--ds-bg-hover);
}

.ds-modules-list__item--active {
  background: var(--ds-bg-selected);
}

.ds-modules-list__item--disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ds-modules-list__label {
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.125rem;
  text-align: center;
  color: var(--ds-text-default);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}
</style>
