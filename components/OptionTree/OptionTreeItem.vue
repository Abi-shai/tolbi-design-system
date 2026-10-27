<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { Checkbox } from '../Checkbox'
import { Icon } from '../Icon'
import { Tag } from '../Tag'
import { OPTION_TREE_KEY, type OptionTreeNode } from './context'

/* One row of `OptionTree` and the group under it — internal. */
defineOptions({ name: 'OptionTreeItem' })

const props = defineProps<{
  node: OptionTreeNode
  level: number
}>()

const tree = inject(OPTION_TREE_KEY)!

const id = useId()
const nameId = `ds-option-tree-name-${id}`
const hasChildren = computed(() => Boolean(props.node.children?.length))
const open = computed(() => hasChildren.value && tree.isOpen(props.node))
const selected = computed(() => tree.isSelected(props.node))
</script>

<template>
  <!--
    The treeitem holds its group, so its name has to be said — from content it
    would be every row under it. It is the code and the label, nothing else.
  -->
  <li
    v-if="tree.isVisible(node)"
    :ref="el => tree.register(node, el as HTMLElement | null)"
    role="treeitem"
    class="ds-option-tree__item"
    :class="{ 'ds-option-tree__item--block': level === 1 }"
    :aria-labelledby="nameId"
    :aria-level="level"
    :aria-expanded="hasChildren ? open : undefined"
    :aria-selected="selected"
    :aria-disabled="node.disabled || undefined"
    :tabindex="tree.isTabbable(node) ? 0 : -1"
  >
    <div
      class="ds-option-tree__row"
      :class="{
        'ds-option-tree__row--selected': selected,
        'ds-option-tree__row--disabled': node.disabled,
      }"
      :style="{ '--option-tree-level': level }"
      @click="tree.select(node)"
    >
      <!-- Only the chevron opens: the row chooses (Carbon, Primer, Ant). -->
      <span class="ds-option-tree__toggle" aria-hidden="true" @click.stop="hasChildren && tree.toggle(node)">
        <Icon v-if="hasChildren" :name="open ? 'chevron-down' : 'chevron-right'" :size="16" />
      </span>
      <span :id="nameId" class="ds-option-tree__name">
        <Tag v-if="node.code" size="sm" :label="node.code" class="ds-option-tree__code" />
        <span class="ds-option-tree__label">
          <template v-for="(segment, i) in tree.segments(node.label)" :key="i">
            <mark v-if="segment.hit" class="ds-option-tree__hit">{{ segment.text }}</mark>
            <template v-else>{{ segment.text }}</template>
          </template>
        </span>
      </span>
      <!-- The sign of the choice, not a control: the tree's arrows navigate, a radio group's would choose. -->
      <Checkbox type="radio" visual-only size="sm" :model-value="selected" class="ds-option-tree__mark" />
    </div>

    <ul v-if="open" role="group" class="ds-option-tree__group">
      <OptionTreeItem
        v-for="child in node.children"
        :key="child.value"
        :node="child"
        :level="level + 1"
      />
    </ul>
  </li>
</template>

<style scoped>
.ds-option-tree__item {
  outline: none;
}

/* A chapter is a block on the recessed ground; its rows rise from it. */
.ds-option-tree__item--block {
  display: flex;
  flex-direction: column;
  padding: var(--ds-spacing-md);
  background: var(--ds-bg-neutral-subtle);
  border-radius: var(--ds-radius-surface-sm);
}

.ds-option-tree__group {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
  margin: var(--ds-spacing-xxs) 0 0;
  padding: 0;
  list-style: none;
}

/* 24px a level (Ant), from the chevron's column. */
.ds-option-tree__row {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-sm) var(--ds-spacing-lg) var(--ds-spacing-sm)
    calc(var(--ds-spacing-md) + (var(--option-tree-level) - 1) * var(--ds-spacing-3xl));
  border-radius: var(--ds-radius-inner);
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* On `bg-neutral-subtle`, `bg-hover` is the same primitive (ADR-0036): the
   row rises to the surface instead. */
.ds-option-tree__row:hover {
  background: var(--ds-bg-default);
}

/* The current item's mark (ADR-0050). */
.ds-option-tree__row--selected {
  background: var(--ds-bg-selected);
}

.ds-option-tree__row--selected:hover {
  background: var(--ds-bg-selected-hover);
}

.ds-option-tree__row--disabled {
  cursor: default;
}

.ds-option-tree__row--disabled:hover {
  background: none;
}

/* The ring is the row's: the treeitem holds its whole group. */
.ds-option-tree__item:focus-visible > .ds-option-tree__row {
  box-shadow: var(--ds-focus-ring-brand);
}

.ds-option-tree__toggle {
  display: inline-flex;
  flex: none;
  width: 1rem;
  height: 1rem;
  color: var(--ds-text-subtle);
}

.ds-option-tree__name {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

.ds-option-tree__code {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.ds-option-tree__label {
  min-width: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
  overflow-wrap: anywhere;
}

.ds-option-tree__row--selected .ds-option-tree__label {
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-on-brand-subtle);
}

.ds-option-tree__row--disabled .ds-option-tree__label {
  color: var(--ds-text-disabled);
}

/* What the search found: underlined and in the strong ink, not painted —
   the chosen row's tint must stay the only ground that means something. */
.ds-option-tree__hit {
  background: none;
  color: var(--ds-text-strong);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.ds-option-tree__mark {
  flex: none;
}
</style>
