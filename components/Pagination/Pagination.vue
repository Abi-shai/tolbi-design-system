<script setup lang="ts">
import { computed, useId } from 'vue'
import { Button } from '../Button'
import { InputDropdown } from '../Dropdown'

/**
 * A list's foot: where you are, how much there is, how much at a time, and the
 * way to the other pages (ADR-0080, track A of the table board).
 *
 * The **range on the left** — « 1–10 sur 42 projets », where the eye leaves the
 * last row — when `total` is given. On the right, **lines per page** when
 * `pageSize` is bound, then the numbered pages between two arrows: the pages
 * are what is kept from before, the words « Précédent / Suivant » became the
 * arrows' names. Changing the page size goes back to page 1.
 *
 * It sends nothing and fetches nothing: it emits `page-change` and
 * `update:pageSize`, and shows what it is given.
 */
interface Props {
  currentPage: number
  /** Without `total` and `pageSize`, how many pages there are. */
  totalPages?: number
  /** How many items in all. Given, the range is written and the pages counted. */
  total?: number
  /** Items per page. Bound (`v-model:pageSize`), the size selector shows. */
  pageSize?: number
  pageSizes?: number[]
  /** What the items are, after the range: « projets », « parcelles ». */
  itemLabel?: string
  /** Writes the numbers — `1 250` in `fr-FR`. */
  locale?: string
  prevLabel?: string
  nextLabel?: string
  pageSizeLabel?: string
  /** The word between the range and the total. */
  ofLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  totalPages: undefined,
  total: undefined,
  pageSize: undefined,
  pageSizes: () => [10, 20, 50, 100],
  itemLabel: '',
  locale: 'fr-FR',
  prevLabel: 'Précédent',
  nextLabel: 'Suivant',
  pageSizeLabel: 'Lignes par page',
  ofLabel: 'sur',
})

const emit = defineEmits<{
  'page-change': [page: number]
  'update:pageSize': [size: number]
}>()

const pages = computed(() => {
  if (props.total !== undefined && props.pageSize) return Math.max(1, Math.ceil(props.total / props.pageSize))
  return props.totalPages ?? 1
})

const visiblePages = computed((): (number | '...')[] => {
  const total = pages.value
  const current = props.currentPage

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

const format = (n: number) => new Intl.NumberFormat(props.locale).format(n)

/* The range of the page being shown, against the whole. With no page size,
   there is no range to write — only the total. */
const summary = computed(() => {
  if (props.total === undefined) return null
  const label = props.itemLabel ? ` ${props.itemLabel}` : ''
  if (!props.pageSize || props.total === 0) return `${format(props.total)}${label}`
  const from = (props.currentPage - 1) * props.pageSize + 1
  const to = Math.min(props.currentPage * props.pageSize, props.total)
  return `${format(from)}–${format(to)} ${props.ofLabel} ${format(props.total)}${label}`
})

const sizeOptions = computed(() => props.pageSizes.map(n => ({ value: n, label: format(n) })))

function goToPage(page: number) {
  if (page === props.currentPage || page < 1 || page > pages.value) return
  emit('page-change', page)
}

function setSize(size: string | number | null) {
  if (typeof size !== 'number' || size === props.pageSize) return
  emit('update:pageSize', size)
  if (props.currentPage !== 1) emit('page-change', 1)
}

const sizeLabelId = `ds-pagination-size-${useId()}`
</script>

<template>
  <div class="ds-pagination">
    <p v-if="summary" class="ds-pagination__summary">{{ summary }}</p>

    <div class="ds-pagination__controls">
      <div v-if="pageSize !== undefined" class="ds-pagination__size">
        <span :id="sizeLabelId" class="ds-pagination__size-label" aria-hidden="true">{{ pageSizeLabel }}</span>
        <InputDropdown
          size="sm"
          :options="sizeOptions"
          :model-value="pageSize"
          :aria-label="pageSizeLabel"
          @update:model-value="setSize"
        />
      </div>

      <div class="ds-pagination__pages">
        <Button
          variant="secondary-gray"
          size="sm"
          icon-only
          icon-leading="arrow-left"
          :label="prevLabel"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        />

        <div class="ds-pagination__numbers">
          <button
            v-for="(page, i) in visiblePages"
            :key="i"
            type="button"
            class="ds-pagination__num"
            :class="{
              'ds-pagination__num--active': page === currentPage,
              'ds-pagination__num--ellipsis': page === '...',
            }"
            :disabled="page === '...'"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="typeof page === 'number' && goToPage(page)"
          >
            {{ page }}
          </button>
        </div>

        <Button
          variant="secondary-gray"
          size="sm"
          icon-only
          icon-leading="arrow-right"
          :label="nextLabel"
          :disabled="currentPage >= pages"
          @click="goToPage(currentPage + 1)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Container ─────────────────────────────────────────────────────── */
/* The range left, the controls right; on a narrow foot the controls wrap
   under the range rather than squeeze it. */
.ds-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-lg) var(--ds-spacing-3xl);
  padding: var(--ds-spacing-lg) var(--ds-spacing-3xl) var(--ds-spacing-xl);
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-pagination__summary {
  margin: 0;
  font: var(--ds-font-body-md);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
}

.ds-pagination__controls {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-3xl);
  margin-left: auto;
}

.ds-pagination__size {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
}

.ds-pagination__size-label {
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
  white-space: nowrap;
}

.ds-pagination__pages {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
}

/* ── Page numbers ──────────────────────────────────────────────────── */
.ds-pagination__numbers {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xxs);
  flex-shrink: 0;
}

/* ── Individual page button ────────────────────────────────────────── */
.ds-pagination__num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: var(--ds-radius-pill);
  background-color: transparent;
  font: var(--ds-font-label-lg);
  color: var(--ds-text-subtle);
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
  font-variant-numeric: tabular-nums;
}

.ds-pagination__num:hover:not(:disabled):not(.ds-pagination__num--active) {
  background-color: var(--ds-bg-hover);
}

.ds-pagination__num:focus-visible {
  box-shadow: var(--ds-focus-ring-brand);
}

/* The current page, marked the one way every list marks its current item
   (ADR-0050) — ground, that ground's ink, strong weight. It had the ground and
   the weight already; the ink was `text-strong`, not the ground's partner. */
.ds-pagination__num--active {
  background-color: var(--ds-bg-selected);
  color: var(--ds-text-on-brand-subtle);
  font-weight: var(--ds-font-weight-label-lg-strong);
}

.ds-pagination__num--ellipsis {
  cursor: default;
  color: var(--ds-text-subtle);
}

.ds-pagination__num--ellipsis:disabled {
  cursor: default;
}
</style>
