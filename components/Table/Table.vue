<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '../Checkbox'
import { HelpIcon } from '../HelpIcon'
import { Scrollbar } from '../Scrollbar'
import { Skeleton } from '../Skeleton'
import { Pagination } from '../Pagination'

export interface TableColumn {
  key: string
  label?: string
  width?: string | number
  minWidth?: string | number
  help?: string
  align?: 'left' | 'center' | 'right'
}

export type TableRow = { id: string | number } & Record<string, unknown>

interface Props {
  columns: TableColumn[]
  rows: TableRow[]
  modelValue?: (string | number)[]
  selectable?: boolean
  loading?: boolean
  loadingRows?: number
  emptyText?: string
  currentPage?: number
  totalPages?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  selectable: false,
  loading: false,
  loadingRows: 5,
  emptyText: 'Aucune donnée',
  currentPage: 1,
  totalPages: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  'page-change': [page: number]
}>()

const allSelected = computed(() =>
  props.rows.length > 0 && props.modelValue!.length === props.rows.length,
)
const someSelected = computed(() =>
  props.modelValue!.length > 0 && props.modelValue!.length < props.rows.length,
)

function toggleAll(checked: boolean) {
  emit('update:modelValue', checked ? props.rows.map(r => r.id) : [])
}

function toggleRow(id: string | number, checked: boolean) {
  const sel = props.modelValue!
  if (checked) {
    emit('update:modelValue', [...sel, id])
  } else {
    emit('update:modelValue', sel.filter(v => v !== id))
  }
}

function isSelected(id: string | number) {
  return props.modelValue!.includes(id)
}

function colStyle(col: TableColumn) {
  const styles: Record<string, string> = {}
  if (col.width) styles.width = typeof col.width === 'number' ? `${col.width}px` : col.width
  if (col.minWidth) styles.minWidth = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth
  return styles
}

/*
 * Reproduces the widths the old nth-child rules produced, including their
 * precedence: later selectors won, so 5n beats 4n beats 3n beats 2n.
 * Varying the width is what stops the skeleton reading as a striped block.
 */
function skeletonWidth(i: number): string {
  if (i % 5 === 0) return '55%'
  if (i % 4 === 0) return '80%'
  if (i % 3 === 0) return '45%'
  if (i % 2 === 0) return '75%'
  return '60%'
}

const showPagination = computed(() => (props.totalPages ?? 1) > 1)
</script>

<template>
  <div class="ds-table-container">
    <Scrollbar :horizontal="true">
      <table class="ds-table">
        <thead>
          <tr class="ds-table__header-row">
            <th v-if="selectable" class="ds-table__th ds-table__th--select">
              <Checkbox
                :model-value="allSelected"
                :indeterminate="someSelected"
                @update:model-value="toggleAll"
              />
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              class="ds-table__th"
              :class="col.align && `ds-table__th--${col.align}`"
              :style="colStyle(col)"
            >
              <slot :name="`header-${col.key}`" :column="col">
                <div class="ds-table__th-content">
                  <span v-if="col.label" class="ds-table__th-label">{{ col.label }}</span>
                  <HelpIcon v-if="col.help" :title="col.help" placement="top" />
                </div>
              </slot>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr v-for="i in loadingRows" :key="`skeleton-${i}`" class="ds-table__row">
              <td v-if="selectable" class="ds-table__td ds-table__td--select">
                <Skeleton variant="rect" width="16px" height="16px" />
              </td>
              <td v-for="col in columns" :key="col.key" class="ds-table__td">
                <Skeleton variant="text" :width="skeletonWidth(i)" height="14px" />
              </td>
            </tr>
          </template>
          <template v-else>
            <tr
              v-for="row in rows"
              :key="row.id"
              class="ds-table__row"
              :class="{ 'ds-table__row--selected': isSelected(row.id) }"
            >
              <td v-if="selectable" class="ds-table__td ds-table__td--select">
                <Checkbox
                  :model-value="isSelected(row.id)"
                  @update:model-value="(v) => toggleRow(row.id, v)"
                />
              </td>
              <td
                v-for="col in columns"
                :key="col.key"
                class="ds-table__td"
                :class="col.align && `ds-table__td--${col.align}`"
              >
                <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  <span class="ds-table__cell-text">{{ row[col.key] }}</span>
                </slot>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td
                class="ds-table__td ds-table__td--empty"
                :colspan="selectable ? columns.length + 1 : columns.length"
              >
                <slot name="empty">{{ emptyText }}</slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </Scrollbar>

    <Pagination
      v-if="showPagination"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="emit('page-change', $event)"
    />
  </div>
</template>

<style scoped>
/* ── Container ─────────────────────────────────────────────────────── */
.ds-table-container {
  width: 100%;
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  box-shadow: var(--ds-elevation-surface);
  background-color: var(--ds-bg-default);
  overflow: hidden;
}

/* ── Table ─────────────────────────────────────────────────────────── */
.ds-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

/* ── Header row ────────────────────────────────────────────────────── */
.ds-table__header-row {
  background-color: var(--ds-bg-neutral-subtle);
}

/* ── Header cell ───────────────────────────────────────────────────── */
.ds-table__th {
  padding: var(--ds-spacing-lg) var(--ds-spacing-3xl);
  border-bottom: var(--ds-border-width-default) solid var(--ds-border-subtle);
  text-align: left;
  white-space: nowrap;
  vertical-align: middle;
  overflow: hidden;
}

.ds-table__th--select {
  width: 44px;
  padding: var(--ds-spacing-lg) var(--ds-spacing-lg) var(--ds-spacing-lg) var(--ds-spacing-3xl);
}

.ds-table__th--center { text-align: center; }
.ds-table__th--right  { text-align: right; }

.ds-table__th-content {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
}

.ds-table__th-label {  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
}

/* ── Data row ──────────────────────────────────────────────────────── */
.ds-table__row {
  border-bottom: var(--ds-border-width-default) solid var(--ds-border-subtle);
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-table__row:last-child {
  border-bottom: none;
}

.ds-table__row:hover {
  background-color: var(--ds-bg-hover);
}

.ds-table__row--selected {
  background-color: var(--ds-bg-selected);
}

.ds-table__row--selected:hover {
  background-color: var(--ds-bg-selected-hover);
}

/* ── Data cell ─────────────────────────────────────────────────────── */
.ds-table__td {
  padding: var(--ds-spacing-xl) var(--ds-spacing-3xl);
  vertical-align: middle;
  overflow: hidden;
}

.ds-table__td--select {
  width: 44px;
  padding: var(--ds-spacing-xl) var(--ds-spacing-lg) var(--ds-spacing-xl) var(--ds-spacing-3xl);
}

.ds-table__td--center { text-align: center; }
.ds-table__td--right  { text-align: right; }

.ds-table__td--empty {
  text-align: center;
  padding: var(--ds-spacing-6xl) var(--ds-spacing-3xl);
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}

/* ── Default cell text ─────────────────────────────────────────────── */
.ds-table__cell-text {  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


/* Skeleton geometry and shimmer now live in the Skeleton component. */
</style>
