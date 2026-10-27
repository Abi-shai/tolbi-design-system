<script setup lang="ts">
import { computed, ref } from 'vue'
import { Dropdown, DropdownItem, DropdownTrigger } from '../Dropdown'
import { Icon } from '../Icon'
import type { TableColumn } from './Table.vue'

/**
 * The columns a table shows (ADR-0080, track A): a « Colonnes » button for the
 * right end of the list's toolbar, opening a menu of checkbox rows that stays
 * open while they are ticked — Escape, a click outside or the button close it.
 *
 * It edits a list of keys (`v-model`) that the table reads as
 * `visibleColumns`; the product binds both to one ref, and may keep it per
 * user. A column with `hideable: false` is ticked and cannot be unticked; a
 * column with no label (the actions) is not offered. « Réinitialiser » brings
 * back `defaultValue` and only shows when there is something to bring back.
 */
interface Props {
  columns: TableColumn[]
  /** The keys shown. Absent, every column. */
  modelValue?: string[]
  /** What « Réinitialiser » brings back. Absent, every column. */
  defaultValue?: string[]
  label?: string
  /** The menu's title, and its accessible name. */
  title?: string
  resetLabel?: string
  align?: 'start' | 'end'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  defaultValue: undefined,
  label: 'Colonnes',
  title: 'Colonnes à afficher',
  resetLabel: 'Réinitialiser',
  align: 'end',
})

const emit = defineEmits<{ 'update:modelValue': [keys: string[]] }>()

const open = ref(false)

const offered = computed(() => props.columns.filter(c => c.label))
const all = computed(() => props.columns.map(c => c.key))
const visible = computed(() => props.modelValue ?? all.value)
const defaults = computed(() => props.defaultValue ?? all.value)

const isShown = (c: TableColumn) => c.hideable === false || visible.value.includes(c.key)

/* In the columns' order, whatever order they were ticked in. */
function toggle(c: TableColumn) {
  if (c.hideable === false) return
  const next = isShown(c) ? visible.value.filter(k => k !== c.key) : [...visible.value, c.key]
  emit('update:modelValue', all.value.filter(k => next.includes(k)))
}

const isDefault = computed(() => {
  const a = offered.value.filter(isShown).map(c => c.key)
  const b = offered.value.filter(c => c.hideable === false || defaults.value.includes(c.key)).map(c => c.key)
  return a.length === b.length && a.every(k => b.includes(k))
})

function reset() {
  emit('update:modelValue', [...defaults.value])
}
</script>

<template>
  <Dropdown v-model:open="open" class="ds-table-column-menu" :align="align" :label="title">
    <template #trigger="{ open: isOpen, toggle: toggleMenu }">
      <DropdownTrigger size="sm" chevron :open="isOpen" @click="toggleMenu">
        <Icon name="sliders-vertical" :size="20" aria-hidden="true" />
        {{ label }}
      </DropdownTrigger>
    </template>

    <template #header>
      <span class="ds-table-column-menu__title">{{ title }}</span>
    </template>

    <DropdownItem
      v-for="c in offered"
      :key="c.key"
      :label="c.label!"
      :checked="isShown(c)"
      :disabled="c.hideable === false"
      @click="toggle(c)"
    />

    <template v-if="!isDefault" #footer>
      <DropdownItem icon="undo-2" :label="resetLabel" @click="reset" />
    </template>
  </Dropdown>
</template>

<style scoped>
.ds-table-column-menu__title {
  padding: var(--ds-spacing-xs) var(--ds-spacing-md);
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
}
</style>
