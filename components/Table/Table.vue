<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '../Checkbox'
import { HelpIcon } from '../HelpIcon'
import { Icon } from '../Icon'
import { Scrollbar } from '../Scrollbar'

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

const showPagination = computed(() => (props.totalPages ?? 1) > 1)

const visiblePages = computed((): (number | '...')[] => {
  const total = props.totalPages ?? 1
  const current = props.currentPage ?? 1

  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const near = new Set(
    [1, current - 1, current, current + 1, total].filter(p => p >= 1 && p <= total),
  )
  const sorted = [...near].sort((a, b) => a - b)
  const result: (number | '...')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...')
    result.push(sorted[i])
  }
  return result
})

function goToPage(page: number) {
  if (page === props.currentPage || page < 1 || page > (props.totalPages ?? 1)) return
  emit('page-change', page)
}
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
                <div class="ds-table__skeleton ds-table__skeleton--check" />
              </td>
              <td v-for="col in columns" :key="col.key" class="ds-table__td">
                <div class="ds-table__skeleton" />
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

    <div v-if="showPagination" class="ds-table__pagination">
      <button
        class="ds-table__page-nav"
        :disabled="currentPage <= 1"
        @click="goToPage(currentPage - 1)"
      >
        <Icon name="arrow-left" :size="14" />
        <span>Précédent</span>
      </button>

      <div class="ds-table__page-numbers">
        <button
          v-for="(page, i) in visiblePages"
          :key="i"
          class="ds-table__page-num"
          :class="{
            'ds-table__page-num--active': page === currentPage,
            'ds-table__page-num--ellipsis': page === '...',
          }"
          :disabled="page === '...'"
          @click="typeof page === 'number' && goToPage(page)"
        >
          {{ page }}
        </button>
      </div>

      <button
        class="ds-table__page-nav"
        :disabled="currentPage >= (totalPages ?? 1)"
        @click="goToPage(currentPage + 1)"
      >
        <span>Suivant</span>
        <Icon name="arrow-right" :size="14" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── Container ─────────────────────────────────────────────────────── */
.ds-table-container {
  width: 100%;
  border: 1px solid var(--ds-semantic-border-secondary);
  border-radius: var(--ds-radius-xl);
  box-shadow: var(--ds-shadow-sm);
  background-color: var(--ds-semantic-bg-primary);
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
  background-color: var(--ds-semantic-bg-secondary);
}

/* ── Header cell ───────────────────────────────────────────────────── */
.ds-table__th {
  padding: 12px 24px;
  border-bottom: 1px solid var(--ds-semantic-border-secondary);
  text-align: left;
  white-space: nowrap;
  vertical-align: middle;
  overflow: hidden;
}

.ds-table__th--select {
  width: 44px;
  padding: 12px 12px 12px 24px;
}

.ds-table__th--center { text-align: center; }
.ds-table__th--right  { text-align: right; }

.ds-table__th-content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ds-table__th-label {
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ds-semantic-text-tertiary);
  line-height: 1.125rem;
}

/* ── Data row ──────────────────────────────────────────────────────── */
.ds-table__row {
  border-bottom: 1px solid var(--ds-semantic-border-secondary);
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-table__row:last-child {
  border-bottom: none;
}

.ds-table__row:hover {
  background-color: var(--ds-semantic-bg-primary-hover);
}

.ds-table__row--selected {
  background-color: var(--ds-semantic-bg-brand-primary);
}

.ds-table__row--selected:hover {
  background-color: var(--ds-semantic-bg-brand-secondary);
}

/* ── Data cell ─────────────────────────────────────────────────────── */
.ds-table__td {
  padding: 16px 24px;
  vertical-align: middle;
  overflow: hidden;
}

.ds-table__td--select {
  width: 44px;
  padding: 16px 12px 16px 24px;
}

.ds-table__td--center { text-align: center; }
.ds-table__td--right  { text-align: right; }

.ds-table__td--empty {
  text-align: center;
  padding: 48px 24px;
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.875rem;
  color: var(--ds-semantic-text-tertiary);
}

/* ── Default cell text ─────────────────────────────────────────────── */
.ds-table__cell-text {
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--ds-semantic-text-secondary);
  line-height: 1.25rem;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Pagination ────────────────────────────────────────────────────── */
.ds-table__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px 16px;
  border-top: 1px solid var(--ds-semantic-border-secondary);
  gap: 8px;
}

/* ── Pagination nav buttons (Previous / Next) ──────────────────────── */
.ds-table__page-nav {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--ds-semantic-border-primary);
  border-radius: var(--ds-radius-md);
  background-color: var(--ds-semantic-bg-primary);
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--ds-semantic-text-secondary);
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
  white-space: nowrap;
}

.ds-table__page-nav:hover:not(:disabled) {
  background-color: var(--ds-semantic-bg-primary-hover);
}

.ds-table__page-nav:disabled {
  color: var(--ds-semantic-text-disabled);
  border-color: var(--ds-semantic-border-secondary);
  cursor: not-allowed;
}

/* ── Pagination page numbers ───────────────────────────────────────── */
.ds-table__page-numbers {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ds-table__page-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  padding: 0 4px;
  border: none;
  border-radius: var(--ds-radius-md);
  background-color: transparent;
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ds-semantic-text-secondary);
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-table__page-num:hover:not(:disabled):not(.ds-table__page-num--active) {
  background-color: var(--ds-semantic-bg-primary-hover);
}

.ds-table__page-num--active {
  background-color: var(--ds-semantic-bg-brand-primary);
  color: var(--ds-semantic-fg-brand-primary);
  font-weight: 600;
}

.ds-table__page-num--ellipsis {
  cursor: default;
  color: var(--ds-semantic-text-tertiary);
}

.ds-table__page-num--ellipsis:disabled {
  cursor: default;
}

/* ── Skeleton ──────────────────────────────────────────────────────── */
@keyframes ds-skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.ds-table__skeleton {
  height: 14px;
  width: 60%;
  border-radius: var(--ds-radius-sm);
  background: linear-gradient(
    90deg,
    var(--ds-semantic-bg-secondary) 25%,
    var(--ds-semantic-bg-primary-hover) 50%,
    var(--ds-semantic-bg-secondary) 75%
  );
  background-size: 400% 100%;
  animation: ds-skeleton-shimmer 1.6s ease-in-out infinite;
}

.ds-table__skeleton--check {
  width: 16px;
  height: 16px;
  border-radius: var(--ds-radius-xs);
}

.ds-table__row:nth-child(2n) .ds-table__skeleton { width: 75%; }
.ds-table__row:nth-child(3n) .ds-table__skeleton { width: 45%; }
.ds-table__row:nth-child(4n) .ds-table__skeleton { width: 80%; }
.ds-table__row:nth-child(5n) .ds-table__skeleton { width: 55%; }
</style>
