<script setup lang="ts">
import { SwapTransition } from '../SwapTransition'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'
import { Checkbox } from '../Checkbox'
import { Scrollbar } from '../Scrollbar'
import { Skeleton } from '../Skeleton'
import { Pagination } from '../Pagination'
import TableHeaderRow from './TableHeaderRow.vue'
import type { TableHeaderCellSpec } from './TableHeaderRow.vue'

export interface TableColumn {
  key: string
  label?: string
  width?: string | number
  minWidth?: string | number
  help?: string
  align?: 'left' | 'center' | 'right'
  /** The header sorts the list: a button, `aria-sort`, the arrow on the sorted column only. */
  sortable?: boolean
  /** Stays in place while the other columns scroll under it. */
  fixed?: 'start' | 'end'
  /** `false`: always shown, and not offered by `TableColumnMenu`. */
  hideable?: boolean
  /** The cell that carries the row's link. Without one, the first column shown. */
  primary?: boolean
}

export type TableRow = { id: string | number } & Record<string, unknown>

export type TableSortDirection = 'ascending' | 'descending'

export interface TableSort {
  key: string
  direction: TableSortDirection
}

/**
 * ADR-0080 — the table of the product's lists, from the board validated on
 * 27 Oct.:
 *
 * - **Sorting** shows on the sorted column only; another sortable header shows
 *   the arrow of the sort a click would apply, on hover and focus, in a place
 *   kept for it so the label never moves. Ascending, then descending, in turn.
 *   The table sorts nothing itself: it reports `update:sort`, and the product,
 *   which pages on its server, sorts.
 * - **A row opens through its name.** With `rowLink` the primary cell holds a
 *   real link, with `@row-click` a real button — so the keyboard and Cmd+click
 *   work — and a click anywhere else on the row is handed to it. A click on
 *   another control in the row stays that control's.
 * - **Fixed columns** (`fixed: 'start' | 'end'`) stay while the rest scrolls,
 *   and a rule marks their edge only while something passes under it.
 * - **`visibleColumns`** hides the others — `TableColumnMenu` edits it.
 * - The foot is `Pagination`: the range, lines per page, the pages.
 *
 * ADR-0090 adds `stickyHeader`: the table keeps the height of its content and
 * scrolls with the page, while the column header stays at the top of the
 * screen.
 */
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
  /** The sorted column and its direction (`v-model:sort`). */
  sort?: TableSort | null
  /** The keys shown, in no particular order; absent, every column. */
  visibleColumns?: string[]
  /**
   * The column header stays at the top of the screen while the page scrolls
   * (ADR-0090). Set `--ds-table-sticky-top` on the table, or above it, to the
   * height of whatever the product keeps at the top of the screen.
   */
  stickyHeader?: boolean
  /** Where a row leads. Given, the row opens as a link. */
  rowLink?: (row: TableRow) => string | undefined
  /** Declared as a prop so the table knows a row can be opened (`@row-click`). */
  onRowClick?: (row: TableRow) => void
  /** How many rows in all — the foot writes the range and counts the pages. */
  total?: number
  /**
   * Rows per page. It writes the range — « 1–25 sur 42 » — on its own; the
   * selector is `pageSizes`' doing, and the two are separate (ADR-0090).
   */
  pageSize?: number
  /** The sizes offered. **Empty, no selector** — the range stays. */
  pageSizes?: number[]
  /** What the rows are, after the range: « projets ». */
  itemLabel?: string
  /**
   * The foot's words and numbers, handed to `Pagination` as they are — absent,
   * its French defaults (ADR-0077, item 26).
   */
  locale?: string
  prevLabel?: string
  nextLabel?: string
  pageSizeLabel?: string
  ofLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  selectable: false,
  loading: false,
  loadingRows: 5,
  emptyText: 'Aucune donnée',
  currentPage: 1,
  totalPages: undefined,
  sort: null,
  visibleColumns: undefined,
  stickyHeader: false,
  rowLink: undefined,
  onRowClick: undefined,
  total: undefined,
  pageSize: undefined,
  pageSizes: () => [10, 20, 50, 100],
  itemLabel: '',
  locale: undefined,
  prevLabel: undefined,
  nextLabel: undefined,
  pageSizeLabel: undefined,
  ofLabel: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: (string | number)[]]
  'update:sort': [value: TableSort]
  'update:pageSize': [size: number]
  'page-change': [page: number]
}>()

/* ── Columns ───────────────────────────────────────────────────────── */
const shown = computed(() =>
  props.columns.filter(c => !props.visibleColumns || c.hideable === false || props.visibleColumns.includes(c.key)),
)

const primaryKey = computed(() => (shown.value.find(c => c.primary) ?? shown.value[0])?.key)

/* ── Selection ─────────────────────────────────────────────────────── */
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
  emit('update:modelValue', checked ? [...sel, id] : sel.filter(v => v !== id))
}

function isSelected(id: string | number) {
  return props.modelValue!.includes(id)
}

/* ── Sorting ───────────────────────────────────────────────────────── */
function sortOf(col: TableColumn): TableSortDirection | null {
  return props.sort?.key === col.key ? props.sort.direction : null
}

function ariaSort(col: TableColumn) {
  if (!col.sortable) return undefined
  return sortOf(col) ?? 'none'
}

function toggleSort(col: TableColumn) {
  const current = sortOf(col)
  emit('update:sort', { key: col.key, direction: current === 'ascending' ? 'descending' : 'ascending' })
}

/* ── The row that opens ────────────────────────────────────────────── */
function linkOf(row: TableRow) {
  return props.rowLink?.(row)
}

function rowOpens(row: TableRow) {
  return !!linkOf(row) || !!props.onRowClick
}

const CONTROLS = 'a, button, input, label, select, textarea, [role="button"], [role="checkbox"], [role="menuitem"]'

/*
  A click on the row is the name's. Not when it lands on another control — an
  action keeps its own click — nor when it ends a text selection.
*/
function handleRowClick(event: MouseEvent, row: TableRow) {
  if (!rowOpens(row)) return
  const target = event.target as Element | null
  const tr = event.currentTarget as HTMLElement
  if (target?.closest(CONTROLS) && tr.contains(target.closest(CONTROLS))) return
  if (window.getSelection()?.toString()) return
  const href = linkOf(row)
  if (href) {
    if (event.metaKey || event.ctrlKey || event.button === 1) window.open(href, '_blank', 'noopener')
    else tr.querySelector<HTMLAnchorElement>('.ds-table__row-link')?.click()
    return
  }
  props.onRowClick?.(row)
}

/* ── Fixed columns ─────────────────────────────────────────────────── */
/*
  A fixed column sits at the sum of the widths before it (after it, for the
  end). Measured, not declared: a width can be a minimum, a percentage, or
  nothing at all.
*/
const tableEl = ref<HTMLTableElement>()
const offsets = ref<Record<string, number>>({})
/* The measured width of each header cell and of the table — what the pinned
   copy is cut to, so its columns land on the real ones to the pixel. */
const widths = ref<Record<string, number>>({})
const tableWidth = ref(0)

const hasFixedStart = computed(() => shown.value.some(c => c.fixed === 'start'))
const lastStart = computed(() => [...shown.value].reverse().find(c => c.fixed === 'start')?.key)
const firstEnd = computed(() => shown.value.find(c => c.fixed === 'end')?.key)

function measure() {
  const head = tableEl.value?.querySelectorAll<HTMLTableCellElement>('thead th')
  if (!head) return
  const cells = [...head]
  const keys = [...(props.selectable ? ['__select'] : []), ...shown.value.map(c => c.key)]
  const next: Record<string, number> = {}
  const sizes: Record<string, number> = {}
  let left = 0
  keys.forEach((key, i) => {
    next[`start:${key}`] = left
    sizes[key] = cells[i]?.offsetWidth ?? 0
    left += sizes[key]
  })
  let right = 0
  for (let i = keys.length - 1; i >= 0; i--) {
    next[`end:${keys[i]}`] = right
    right += cells[i]?.offsetWidth ?? 0
  }
  offsets.value = next
  widths.value = sizes
  tableWidth.value = tableEl.value?.offsetWidth ?? 0
}

/* ── The pinned header ─────────────────────────────────────────────── */
/*
  Measured (ADR-0090): a `position: sticky` header resolves against the nearest
  ancestor **scroll container**, and the horizontal scroller around the table is
  one — so a sticky `<thead>` sticks to a box that never scrolls vertically, and
  stays where it was. `overflow-y: clip` and `overflow-y: visible` do not help:
  beside an `auto`, both compute away. So the pinned header is a second drawing
  of the row, outside that scroller, in the page's own scrollport — and it is
  the same component, never a second markup (ADR-0001).

  It carries the body's horizontal scroll position rather than a transform, so
  a fixed column inside it sticks exactly as the real one does.
*/
const scrollbarRef = ref<InstanceType<typeof Scrollbar> | null>(null)
const stickyEl = ref<HTMLElement>()
const atStart = ref(true)
const atEnd = ref(false)

function viewportEl(): HTMLElement | null {
  return scrollbarRef.value?.viewport ?? null
}

function syncScroll() {
  const el = viewportEl()
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  atStart.value = el.scrollLeft <= 1
  atEnd.value = el.scrollLeft >= max - 1
  if (stickyEl.value) stickyEl.value.scrollLeft = el.scrollLeft
}

let observer: ResizeObserver | null = null
onMounted(() => {
  measure()
  observer = new ResizeObserver(() => { measure(); syncScroll() })
  if (tableEl.value) observer.observe(tableEl.value)
  viewportEl()?.addEventListener('scroll', syncScroll, { passive: true })
  syncScroll()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  viewportEl()?.removeEventListener('scroll', syncScroll)
})
watch(shown, async () => { await nextTick(); measure(); syncScroll() })

function fixedOf(key: string): 'start' | 'end' | undefined {
  if (key === '__select') return hasFixedStart.value ? 'start' : undefined
  return shown.value.find(c => c.key === key)?.fixed
}

function fixedClass(key: string) {
  const f = fixedOf(key)
  if (!f) return undefined
  return [
    `ds-table__cell--fixed ds-table__cell--fixed-${f}`,
    key === lastStart.value && 'ds-table__cell--edge-start',
    key === firstEnd.value && 'ds-table__cell--edge-end',
  ]
}

function fixedStyle(key: string): Record<string, string> | undefined {
  const f = fixedOf(key)
  if (!f) return undefined
  const v = offsets.value[`${f}:${key}`] ?? 0
  return f === 'start' ? { left: `${v}px` } : { right: `${v}px` }
}

/* ── The header row, resolved once for both drawings ───────────────── */
/* Cast, so the names do not depend on the slots this very template declares —
   the inference walks back into itself and the .d.ts build stops (ADR-0061's
   rule: the build fails on a dropped declaration). */
const slots = useSlots() as Record<string, unknown>
const headerSlotNames = computed<string[]>(() => Object.keys(slots).filter(n => n.startsWith('header-')))

function headerCells(pinned: boolean): TableHeaderCellSpec[] {
  const size = (key: string): Record<string, string> =>
    pinned && widths.value[key] ? { width: `${widths.value[key]}px` } : {}
  const cells: TableHeaderCellSpec[] = []
  if (props.selectable) {
    cells.push({
      key: '__select',
      select: true,
      cellClass: fixedClass('__select'),
      cellStyle: { ...fixedStyle('__select'), ...size('__select') },
    })
  }
  for (const col of shown.value) {
    cells.push({
      key: col.key,
      label: col.label,
      help: col.help,
      align: col.align,
      sortable: col.sortable,
      ariaSort: pinned ? undefined : ariaSort(col),
      sortDirection: sortOf(col),
      cellClass: fixedClass(col.key),
      cellStyle: { ...colStyle(col), ...size(col.key) },
      column: col,
    })
  }
  return cells
}

function sortByKey(key: string) {
  const col = shown.value.find(c => c.key === key)
  if (col) toggleSort(col)
}

/* ── Cells ─────────────────────────────────────────────────────────── */
function colStyle(col: TableColumn) {
  const styles: Record<string, string> = {}
  if (col.width) styles.width = typeof col.width === 'number' ? `${col.width}px` : col.width
  if (col.minWidth) styles.minWidth = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth
  return { ...styles, ...fixedStyle(col.key) }
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

/* ── The foot ──────────────────────────────────────────────────────── */
const pageCount = computed(() => {
  if (props.total !== undefined && props.pageSize) return Math.ceil(props.total / props.pageSize)
  return props.totalPages ?? 1
})

/* Only what was given, so Pagination's own defaults hold for the rest. */
const footLabels = computed(() => Object.fromEntries(
  (['locale', 'prevLabel', 'nextLabel', 'pageSizeLabel', 'ofLabel'] as const)
    .filter(k => props[k] !== undefined)
    .map(k => [k, props[k]]),
))

/* A size is offered only when there is a list of them to offer (ADR-0090):
   `pageSizes` empty is « no selector », and the range « 1–25 sur 42 » stays. */
const offersSizes = computed(() => props.pageSize !== undefined && props.pageSizes.length > 0)

/* With a size to choose, the foot stays while there is more than the
   smallest page — or a user who picked 50 for 42 rows could not go back.
   With no size to choose, there is nothing to come back to: the foot shows
   only when there is more than one page. */
const showPagination = computed(() =>
  pageCount.value > 1
  || (offersSizes.value && props.total !== undefined && props.total > Math.min(...props.pageSizes)),
)
</script>

<template>
  <div class="ds-table-container">
    <div class="ds-table__frame">
    <Scrollbar ref="scrollbarRef" :horizontal="true">
      <table ref="tableEl" class="ds-table">
        <thead>
          <TableHeaderRow
            :cells="headerCells(false)"
            :all-selected="allSelected"
            :some-selected="someSelected"
            :at-start="atStart"
            :at-end="atEnd"
            @toggle-all="toggleAll"
            @sort="sortByKey"
          >
            <template v-for="name in headerSlotNames" :key="name" #[name]="slotProps">
              <slot :name="name" v-bind="slotProps" />
            </template>
          </TableHeaderRow>
        </thead>
        <SwapTransition>
          <tbody v-if="loading">
            <tr v-for="i in loadingRows" :key="`skeleton-${i}`" class="ds-table__row">
              <td
                v-if="selectable"
                class="ds-table__td ds-table__td--select"
                :class="fixedClass('__select')"
                :style="fixedStyle('__select')"
              >
                <Skeleton variant="rect" width="16px" height="16px" />
              </td>
              <td
                v-for="col in shown"
                :key="col.key"
                class="ds-table__td"
                :class="fixedClass(col.key)"
                :style="fixedStyle(col.key)"
              >
                <Skeleton variant="text" :width="skeletonWidth(i)" height="14px" />
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr
              v-for="row in rows"
              :key="row.id"
              class="ds-table__row"
              :class="{ 'ds-table__row--selected': isSelected(row.id), 'ds-table__row--opens': rowOpens(row) }"
              @click="handleRowClick($event, row)"
              @auxclick="$event.button === 1 && handleRowClick($event, row)"
            >
              <td
                v-if="selectable"
                class="ds-table__td ds-table__td--select"
                :class="fixedClass('__select')"
                :style="fixedStyle('__select')"
              >
                <Checkbox
                  :model-value="isSelected(row.id)"
                  @update:model-value="(v) => toggleRow(row.id, v)"
                />
              </td>
              <td
                v-for="col in shown"
                :key="col.key"
                class="ds-table__td"
                :class="[col.align && `ds-table__td--${col.align}`, fixedClass(col.key)]"
                :style="fixedStyle(col.key)"
              >
                <!-- The name, as the row's own link or button: what a click on the row opens. -->
                <component
                  :is="linkOf(row) ? 'a' : 'button'"
                  v-if="col.key === primaryKey && (linkOf(row) || props.onRowClick)"
                  class="ds-table__row-link"
                  :href="linkOf(row)"
                  :type="linkOf(row) ? undefined : 'button'"
                  @click.stop="!linkOf(row) && props.onRowClick?.(row)"
                >
                  <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                    <span class="ds-table__cell-text">{{ row[col.key] }}</span>
                  </slot>
                </component>
                <slot v-else :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                  <span class="ds-table__cell-text">{{ row[col.key] }}</span>
                </slot>
              </td>
            </tr>
            <tr v-if="rows.length === 0">
              <td
                class="ds-table__td ds-table__td--empty"
                :colspan="selectable ? shown.length + 1 : shown.length"
              >
                <slot name="empty">{{ emptyText }}</slot>
              </td>
            </tr>
          </tbody>
        </SwapTransition>
      </table>
    </Scrollbar>

    <!--
      The pinned copy. It sits in the same grid cell as the scroller, takes the
      top of it, and travels no further than the table's own box — so it leaves
      with the last row instead of floating over what comes after.
    -->
    <div
      v-if="stickyHeader"
      ref="stickyEl"
      class="ds-table__sticky-head"
      aria-hidden="true"
    >
      <table class="ds-table" :style="tableWidth ? { width: `${tableWidth}px` } : undefined">
        <thead>
          <TableHeaderRow
            clone
            :cells="headerCells(true)"
            :all-selected="allSelected"
            :some-selected="someSelected"
            :at-start="atStart"
            :at-end="atEnd"
            @toggle-all="toggleAll"
            @sort="sortByKey"
          >
            <template v-for="name in headerSlotNames" :key="name" #[name]="slotProps">
              <slot :name="name" v-bind="slotProps" />
            </template>
          </TableHeaderRow>
        </thead>
      </table>
    </div>
    </div>

    <Pagination
      v-if="showPagination"
      :current-page="currentPage"
      :total-pages="pageCount"
      :total="total"
      :page-size="pageSize"
      :page-sizes="pageSizes"
      :item-label="itemLabel"
      v-bind="footLabels"
      @page-change="emit('page-change', $event)"
      @update:page-size="emit('update:pageSize', $event)"
    />
  </div>
</template>

<style scoped>
/* ── Container ─────────────────────────────────────────────────────── */
/*
  `clip`, not `hidden`: both cut the frame to its radius, but `hidden` makes a
  scroll container, and a scroll container between the header and the page is
  exactly what stops the header from pinning (ADR-0090). Measured: with
  `hidden` the header travels the full scroll; with `clip` it holds.
*/
.ds-table-container {
  width: 100%;
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  box-shadow: var(--ds-elevation-surface);
  background-color: var(--ds-bg-default);
  overflow: clip;
}

/* The scroller and the pinned copy share one cell, so the copy covers the
   header it repeats instead of taking a second row's worth of height. */
.ds-table__frame {
  display: grid;
}

.ds-table__frame > * {
  grid-area: 1 / 1;
}

.ds-table__sticky-head {
  position: sticky;
  top: var(--ds-table-sticky-top, 0px);
  z-index: var(--ds-z-raised);
  align-self: start;
  /* Not `auto`: nobody scrolls this one by hand — it carries the body's
     position, and a fixed column inside it needs a scrollport to stick to. */
  overflow: hidden;
  scrollbar-width: none;
}

.ds-table__sticky-head::-webkit-scrollbar {
  display: none;
}

/* ── Table ─────────────────────────────────────────────────────────── */
/* `border-collapse: separate` — sticky cells keep their own borders only when
   they are not collapsed into their neighbours'. */
.ds-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

/* ── Data row ──────────────────────────────────────────────────────── */
/* The ground lives on the cells, so a fixed cell carries the row's state. */
.ds-table__row {
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-table__row:hover .ds-table__td {
  background-color: var(--ds-bg-hover);
}

.ds-table__row--selected .ds-table__td {
  background-color: var(--ds-bg-selected);
}

.ds-table__row--selected:hover .ds-table__td {
  background-color: var(--ds-bg-selected-hover);
}

.ds-table__row:not(:last-child) .ds-table__td {
  border-bottom: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

/* A row that opens: the hand, and its name underlined while the pointer is on it. */
.ds-table__row--opens {
  cursor: pointer;
}

.ds-table__row--opens:hover .ds-table__row-link {
  text-decoration: underline;
}

/* ── Data cell ─────────────────────────────────────────────────────── */
/* The cell's type is the body's, so text a slot puts in it reads as the
   default cell does without wrapping it. */
.ds-table__td {
  padding: var(--ds-spacing-xl) var(--ds-spacing-3xl);
  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
  background-color: var(--ds-bg-default);
  vertical-align: middle;
  overflow: hidden;
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
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

/* ── The row's link ────────────────────────────────────────────────── */
.ds-table__row-link {
  display: inline-block;
  max-width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--ds-radius-inner-sm);
  background: none;
  font: inherit;
  color: inherit;
  text-align: inherit;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  outline: none;
  transition: box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-table__row-link:focus-visible {
  box-shadow: var(--ds-focus-ring-brand);
}

/* ── Fixed columns ─────────────────────────────────────────────────── */
/* Above the cells that scroll under them; z-index under 10 is stacking inside
   one component (ADR-0020). */
.ds-table__cell--fixed {
  position: sticky;
  z-index: 1;
}

/*
  The edge: a rule, shown only while something passes under the column — on
  the start side once the table has scrolled, on the end side until it has
  scrolled to the end. A rule and not a shadow: in dark, a shadow separates
  nothing (ADR-0030). `Scrollbar` says where the scroll is.
*/
.ds-table__cell--edge-start::after,
.ds-table__cell--edge-end::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: var(--ds-border-width-default);
  background-color: var(--ds-border-subtle);
  opacity: 0;
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
  pointer-events: none;
}

.ds-table__cell--edge-start::after { right: 0; }
.ds-table__cell--edge-end::after   { left: 0; }

.ds-scrollbar:not(.ds-scrollbar--at-start) .ds-table__cell--edge-start::after,
.ds-scrollbar:not(.ds-scrollbar--at-end) .ds-table__cell--edge-end::after {
  opacity: 1;
}

/* ── Default cell text ─────────────────────────────────────────────── */
.ds-table__cell-text {
  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Skeleton geometry and shimmer now live in the Skeleton component. */
</style>
