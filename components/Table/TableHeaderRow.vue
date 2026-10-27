<script setup lang="ts">
import { Checkbox } from '../Checkbox'
import { HelpIcon } from '../HelpIcon'
import { Icon } from '../Icon'

/*
  The header row, written once and rendered twice (ADR-0090): in the table
  itself, and — with `stickyHeader` — in the copy pinned to the page. Two
  drawings of one row is the defect ADR-0001 exists to stop, so the row is a
  component and the copy is the same component with `clone` on.

  Its cells are handed to it already resolved: the parent owns the measuring
  (a fixed column's offset, a cell's width) and this only draws.
*/
export interface TableHeaderCellSpec {
  key: string
  /** The selection column, which carries a checkbox rather than a label. */
  select?: boolean
  label?: string
  help?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  ariaSort?: 'ascending' | 'descending' | 'none'
  /** The direction in force on this column, or `null` when it is not the sorted one. */
  sortDirection?: 'ascending' | 'descending' | null
  cellClass?: unknown
  cellStyle?: Record<string, string>
  /** Handed back to the consumer's `header-<key>` slot. */
  column?: unknown
}

defineProps<{
  cells: TableHeaderCellSpec[]
  allSelected?: boolean
  someSelected?: boolean
  /**
   * Where the horizontal scroll sits. The edge of a fixed column is a rule
   * shown only while something passes under it, and the pinned copy is outside
   * the scroller that used to say so — so both drawings read it from here.
   */
  atStart?: boolean
  atEnd?: boolean
  /**
   * The pinned copy: out of the accessibility tree and out of the tab order,
   * so a reader meets the row once and Tab lands on the real header — which
   * the browser then scrolls back into view.
   */
  clone?: boolean
}>()

const emit = defineEmits<{
  'toggle-all': [boolean]
  sort: [key: string]
}>()
</script>

<template>
  <tr
    class="ds-table__header-row"
    :class="{
      'ds-table__header-row--at-start': atStart,
      'ds-table__header-row--at-end': atEnd,
      'ds-table__header-row--clone': clone,
    }"
  >
    <th
      v-for="cell in cells"
      :key="cell.key"
      class="ds-table__th"
      :class="[
        cell.select && 'ds-table__th--select',
        cell.align && `ds-table__th--${cell.align}`,
        cell.cellClass,
      ]"
      :style="cell.cellStyle"
      :aria-sort="cell.ariaSort"
    >
      <Checkbox
        v-if="cell.select"
        :model-value="allSelected"
        :indeterminate="someSelected"
        :tabindex="clone ? -1 : undefined"
        @update:model-value="emit('toggle-all', $event)"
      />
      <slot v-else :name="`header-${cell.key}`" :column="cell.column">
        <div class="ds-table__th-content">
          <!-- A sortable header is a button; the arrow's place is kept, so nothing moves when it shows. -->
          <button
            v-if="cell.sortable"
            type="button"
            class="ds-table__sort"
            :class="{ 'ds-table__sort--active': cell.sortDirection }"
            :tabindex="clone ? -1 : undefined"
            @click="emit('sort', cell.key)"
          >
            <span class="ds-table__th-label">{{ cell.label }}</span>
            <Icon
              :name="cell.sortDirection === 'descending' ? 'arrow-down' : 'arrow-up'"
              :size="16"
              class="ds-table__sort-icon"
              aria-hidden="true"
            />
          </button>
          <span v-else-if="cell.label" class="ds-table__th-label">{{ cell.label }}</span>
          <HelpIcon v-if="cell.help" :title="cell.help" placement="top" />
        </div>
      </slot>
    </th>
  </tr>
</template>

<style scoped>
/* ── Header row ────────────────────────────────────────────────────── */
.ds-table__header-row {
  background-color: var(--ds-bg-neutral-subtle);
}

/* ── Header cell ───────────────────────────────────────────────────── */
.ds-table__th {
  padding: var(--ds-spacing-lg) var(--ds-spacing-3xl);
  border-bottom: var(--ds-border-width-default) solid var(--ds-border-subtle);
  background-color: var(--ds-bg-neutral-subtle);
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
  max-width: 100%;
}

.ds-table__th-label {
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Sortable header ───────────────────────────────────────────────── */
.ds-table__sort {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  max-width: 100%;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--ds-radius-inner-sm);
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  outline: none;
  transition: box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-table__sort:focus-visible {
  box-shadow: var(--ds-focus-ring-brand);
}

/* The arrow of the sort a click would apply, kept in place and shown only on
   hover and focus — the header says how the list is sorted, nothing else. */
.ds-table__sort-icon {
  flex-shrink: 0;
  color: var(--ds-text-subtlest);
  visibility: hidden;
}

.ds-table__sort:hover .ds-table__sort-icon,
.ds-table__sort:focus-visible .ds-table__sort-icon {
  visibility: visible;
}

.ds-table__sort--active .ds-table__th-label {
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
}

.ds-table__sort--active .ds-table__sort-icon {
  color: var(--ds-text-strong);
  visibility: visible;
}

/*
  The copy is cut to the widths measured on the real row, and a measured width
  is a border-box one — so the cells that repeat it are told to read it that
  way, or each lands its own padding wider (measured: 48px a column, and the
  drift accumulates across the row).
*/
.ds-table__header-row--clone .ds-table__th {
  box-sizing: border-box;
}

/* ── Fixed columns ─────────────────────────────────────────────────── */
/*
  The same rules the body cells carry in `Table.vue`, because a scoped style
  reaches a child component's root and no further. The corner — a fixed column
  under the pinned header — is above both: the pinned copy is a layer of its
  own over the body, and inside it this keeps the column over its neighbours.
*/
.ds-table__cell--fixed {
  position: sticky;
  z-index: 1;
}

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

.ds-table__header-row:not(.ds-table__header-row--at-start) .ds-table__cell--edge-start::after,
.ds-table__header-row:not(.ds-table__header-row--at-end) .ds-table__cell--edge-end::after {
  opacity: 1;
}
</style>
