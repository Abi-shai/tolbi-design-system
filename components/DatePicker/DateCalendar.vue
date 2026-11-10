<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { DropdownTrigger } from '../Dropdown'
import {
  YEARS_PER_PAGE,
  dayKey,
  dayLabel,
  daysIn,
  firstDayOfWeek,
  fromDayKey,
  keyText,
  monthTitle,
  pageStartOf,
  shiftKey,
  shiftMonths,
  spanText,
  today,
  wordsFor,
  weekdayNames,
  yearOf,
  type DateGranularity,
} from './dates'

/**
 * The panel of `DatePicker` (ADR-0152) — internal. A year grid of 4 × 4,
 * paged on `min`; or a month, whose title opens the same year grid and comes
 * back. A range is two picks in the same grid, the cells between tinted, the
 * hovered one previewing the end.
 *
 * Keys: a year is itself, a day is `yyyymmdd` — both order like the date.
 */
export interface DateCalendarProps {
  granularity: DateGranularity
  range: boolean
  /** The field's size: `md` reads at `label-lg` on taller cells, `sm` at the floor (ADR-0153, amended). */
  size?: 'sm' | 'md'
  /** Several years, toggled one by one and confirmed (ADR-0153). */
  multiple?: boolean
  /** The years chosen, in `multiple`. */
  many?: number[]
  /** The confirm button's word, and the count's words. */
  confirmLabel?: string
  /** The chosen key, or the range's two (either may be null). */
  start: number | null
  end?: number | null
  min?: number
  max?: number
  locale: string
  labels: {
    previousYears: string
    nextYears: string
    previousMonth: string
    nextMonth: string
    chooseYear: string
  }
}

const props = defineProps<DateCalendarProps>()
const emit = defineEmits<{
  pick: [key: number]
  'pick-range': [start: number, end: number]
  'pick-many': [years: number[]]
  close: []
}>()

const now = today()
const todayKey = props.granularity === 'year' ? now.y : dayKey(now.y, now.m, now.d)

const minYear = computed(() => (props.min === undefined ? undefined : yearOf(props.min, props.granularity)))
const maxYear = computed(() => (props.max === undefined ? undefined : yearOf(props.max, props.granularity)))

function clamp(k: number): number {
  if (props.min !== undefined && k < props.min) return props.min
  if (props.max !== undefined && k > props.max) return props.max
  return k
}

/* Where the panel opens: the value (the first of several), else today, held inside the bounds. */
const initial = clamp(props.start ?? (props.multiple && props.many?.length ? Math.min(...props.many) : todayKey))

/* Several years: a draft, confirmed by « Valider » — closing without it keeps the value (ADR-0153). */
const draft = ref<number[]>([...(props.many ?? [])].sort((a, b) => a - b))
function toggleMany(y: number) {
  draft.value = draft.value.includes(y) ? draft.value.filter((v) => v !== y) : [...draft.value, y].sort((a, b) => a - b)
}
const draftCount = computed(() => wordsFor(props.locale).years(draft.value.length))

/* ── State ──────────────────────────────────────────────────────────── */
const view = ref<'years' | 'days'>(props.granularity === 'year' ? 'years' : 'days')
const active = ref(initial)
/** Years under the grid: the year granularity's own, or the day's year while it is chosen. */
const activeYear = ref(yearOf(initial, props.granularity))
const pageStart = ref(pageStartOf(activeYear.value, minYear.value ?? 0))
const month = ref(props.granularity === 'day' ? { y: fromDayKey(initial).y, m: fromDayKey(initial).m } : { y: now.y, m: now.m })

/* A range in progress: its first pick, and the cell the pointer previews. */
const pending = ref<number | null>(null)
const hover = ref<number | null>(null)

const grid = ref<HTMLElement | null>(null)

/* ── Bounds ─────────────────────────────────────────────────────────── */
const outOfBounds = (k: number) => (props.min !== undefined && k < props.min) || (props.max !== undefined && k > props.max)
const yearOut = (y: number) => (minYear.value !== undefined && y < minYear.value) || (maxYear.value !== undefined && y > maxYear.value)

/* ── Years ──────────────────────────────────────────────────────────── */
const years = computed(() => Array.from({ length: YEARS_PER_PAGE }, (_, i) => pageStart.value + i))
const yearsTitle = computed(() => `${years.value[0]} – ${years.value[YEARS_PER_PAGE - 1]}`)
const canPrevYears = computed(() => minYear.value === undefined || pageStart.value > minYear.value)
const canNextYears = computed(() => maxYear.value === undefined || pageStart.value + YEARS_PER_PAGE - 1 < maxYear.value)

/* ── Days ───────────────────────────────────────────────────────────── */
const first = firstDayOfWeek(props.locale)
const weekdays = weekdayNames(props.locale, first)
const title = computed(() => monthTitle(props.locale, month.value.y, month.value.m))

/** Six weeks, always — the panel keeps one height whatever the month. */
const days = computed(() => {
  const { y, m } = month.value
  const firstIso = ((new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7) + 1 // 1 = Monday
  const lead = (firstIso - first + 7) % 7
  const start = shiftKey(dayKey(y, m, 1), -lead, 'day')
  return Array.from({ length: 42 }, (_, i) => {
    const k = shiftKey(start, i, 'day')
    const p = fromDayKey(k)
    return { key: k, d: p.d, outside: p.m !== m, label: dayLabel(props.locale, p.y, p.m, p.d) }
  })
})

const monthOut = (y: number, m: number) =>
  (props.min !== undefined && dayKey(y, m, daysIn(y, m)) < props.min) || (props.max !== undefined && dayKey(y, m, 1) > props.max)
const canPrevMonth = computed(() => {
  const p = fromDayKey(shiftMonths(dayKey(month.value.y, month.value.m, 1), -1))
  return !monthOut(p.y, p.m)
})
const canNextMonth = computed(() => {
  const p = fromDayKey(shiftMonths(dayKey(month.value.y, month.value.m, 1), 1))
  return !monthOut(p.y, p.m)
})

/* ── Marks ──────────────────────────────────────────────────────────── */
/** The two ends shown: the range being made (its first pick and the hovered cell), else the value. */
const ends = computed<[number | null, number | null]>(() => {
  if (props.range && pending.value !== null) {
    const other = hover.value ?? pending.value
    return [Math.min(pending.value, other), Math.max(pending.value, other)]
  }
  return [props.start, props.range ? props.end ?? null : props.start]
})

function isChosen(k: number): boolean {
  const [a, b] = ends.value
  return k === a || k === b
}

function isBetween(k: number): boolean {
  const [a, b] = ends.value
  return props.range && a !== null && b !== null && k > a && k < b
}

/* The day picker's year grid marks the month's year as chosen, nothing else. */
function yearChosen(y: number): boolean {
  if (props.multiple) return draft.value.includes(y)
  if (props.granularity === 'day') return y === month.value.y
  return isChosen(y)
}

/* ── Summary of a made range ────────────────────────────────────────── */
const summary = computed(() => {
  if (!props.range || pending.value !== null || props.start === null || props.end == null) return null
  return {
    ends: `${keyText(props.locale, props.start, props.granularity)} → ${keyText(props.locale, props.end, props.granularity)}`,
    span: spanText(props.locale, props.start, props.end, props.granularity),
  }
})

/* ── Picking ────────────────────────────────────────────────────────── */
function pick(k: number) {
  if (outOfBounds(k)) return
  if (!props.range) {
    emit('pick', k)
    return
  }
  if (pending.value === null) {
    pending.value = k
    hover.value = null
    return
  }
  const a = Math.min(pending.value, k)
  const b = Math.max(pending.value, k)
  pending.value = null
  emit('pick-range', a, b)
}

function pickYear(y: number) {
  if (yearOut(y)) return
  if (props.multiple) {
    toggleMany(y)
    return
  }
  if (props.granularity === 'year') {
    pick(y)
    return
  }
  /* A day picker's year: back to the same month in that year. */
  month.value = { y, m: month.value.m }
  const p = fromDayKey(active.value)
  active.value = clamp(dayKey(y, p.m, Math.min(p.d, daysIn(y, p.m))))
  view.value = 'days'
  focusActive()
}

/* ── Paging ─────────────────────────────────────────────────────────── */
function pageYears(dir: 1 | -1) {
  pageStart.value += dir * YEARS_PER_PAGE
  activeYear.value = clampYear(activeYear.value + dir * YEARS_PER_PAGE)
  if (props.granularity === 'year') active.value = activeYear.value
}

function clampYear(y: number) {
  let v = y
  if (minYear.value !== undefined) v = Math.max(v, minYear.value)
  if (maxYear.value !== undefined) v = Math.min(v, maxYear.value)
  return v
}

function pageMonth(dir: 1 | -1) {
  const p = fromDayKey(shiftMonths(dayKey(month.value.y, month.value.m, 1), dir))
  month.value = { y: p.y, m: p.m }
  active.value = clamp(shiftMonths(active.value, dir))
}

function openYears() {
  activeYear.value = month.value.y
  pageStart.value = pageStartOf(activeYear.value, minYear.value ?? 0)
  view.value = 'years'
  focusActive()
}

/* ── Keyboard ───────────────────────────────────────────────────────── */
function moveYear(to: number) {
  const y = clampYear(to)
  activeYear.value = y
  if (props.granularity === 'year') active.value = y
  if (y < pageStart.value || y >= pageStart.value + YEARS_PER_PAGE) pageStart.value = pageStartOf(y, minYear.value ?? 0)
  if (props.range && pending.value !== null) hover.value = y
  focusActive()
}

function moveDay(to: number) {
  const k = clamp(to)
  active.value = k
  const p = fromDayKey(k)
  if (p.y !== month.value.y || p.m !== month.value.m) month.value = { y: p.y, m: p.m }
  if (props.range && pending.value !== null) hover.value = k
  focusActive()
}

function onKeydown(e: KeyboardEvent) {
  const years = view.value === 'years'
  const cur = years ? activeYear.value : active.value
  const go = (n: number) => (years ? moveYear(cur + n) : moveDay(shiftKey(cur, n, 'day')))
  switch (e.key) {
    case 'ArrowLeft': go(-1); break
    case 'ArrowRight': go(1); break
    case 'ArrowUp': go(years ? -4 : -7); break
    case 'ArrowDown': go(years ? 4 : 7); break
    case 'PageUp': years ? moveYear(cur - YEARS_PER_PAGE) : moveDay(shiftMonths(cur, -1)); break
    case 'PageDown': years ? moveYear(cur + YEARS_PER_PAGE) : moveDay(shiftMonths(cur, 1)); break
    case 'Enter':
    case ' ':
      if (years) pickYear(cur)
      else pick(cur)
      break
    default:
      return
  }
  e.preventDefault()
}

/* Escape: a day picker's year grid steps back to its month; otherwise the panel closes. */
function onEscape(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  e.stopPropagation()
  if (view.value === 'years' && props.granularity === 'day') {
    view.value = 'days'
    focusActive()
    return
  }
  emit('close')
}

/* ── Focus ──────────────────────────────────────────────────────────── */
/* After the paint: the panel joins the top layer once it is placed, and a
   focus asked before that lands on nothing. */
function focusActive() {
  nextTick(() => requestAnimationFrame(() => grid.value?.querySelector<HTMLElement>('[tabindex="0"]')?.focus()))
}
onMounted(focusActive)
defineExpose({ focus: focusActive })

const isActiveYear = (y: number) => y === activeYear.value
const isActiveDay = (k: number) => k === active.value
</script>

<template>
  <div class="ds-date-calendar" :class="`ds-date-calendar--${size ?? 'md'}`" @keydown="onEscape">
    <!-- A range made: its ends and its span, over the grid (the owner's « 2016 → 2026 · 11 années »). -->
    <p v-if="summary" class="ds-date-calendar__summary">
      <span class="ds-date-calendar__summary-ends">{{ summary.ends }}</span>
      <span class="ds-date-calendar__summary-span">· {{ summary.span }}</span>
    </p>

    <!-- ── Years ── -->
    <template v-if="view === 'years'">
      <div class="ds-date-calendar__head">
        <IconButton size="xs" variant="subtle" icon="chevron-left" :ariaLabel="labels.previousYears" :disabled="!canPrevYears" @click="pageYears(-1)" />
        <span class="ds-date-calendar__title" aria-live="polite">{{ yearsTitle }}</span>
        <IconButton size="xs" variant="subtle" icon="chevron-right" :ariaLabel="labels.nextYears" :disabled="!canNextYears" @click="pageYears(1)" />
      </div>
      <div ref="grid" class="ds-date-calendar__years" role="grid" :aria-label="yearsTitle" :aria-multiselectable="multiple || undefined" @keydown="onKeydown" @mouseleave="hover = null">
        <div v-for="row in 4" :key="row" class="ds-date-calendar__row" role="row">
          <button
            v-for="y in years.slice((row - 1) * 4, row * 4)"
            :key="y"
            type="button"
            role="gridcell"
            class="ds-date-calendar__cell ds-date-calendar__cell--year"
            :class="{
              'ds-date-calendar__cell--chosen': yearChosen(y),
              'ds-date-calendar__cell--between': granularity === 'year' && isBetween(y),
              'ds-date-calendar__cell--today': y === now.y,
            }"
            :tabindex="isActiveYear(y) ? 0 : -1"
            :aria-selected="yearChosen(y)"
            :aria-current="y === now.y ? 'date' : undefined"
            :aria-disabled="yearOut(y) || undefined"
            @click="pickYear(y)"
            @mouseenter="range && pending !== null && granularity === 'year' && !yearOut(y) ? (hover = y) : undefined"
            @focus="activeYear = y; if (granularity === 'year') active = y"
          >{{ y }}</button>
        </div>
      </div>
    </template>

    <!-- ── Days ── -->
    <template v-else>
      <div class="ds-date-calendar__head">
        <IconButton size="xs" variant="subtle" icon="chevron-left" :ariaLabel="labels.previousMonth" :disabled="!canPrevMonth" @click="pageMonth(-1)" />
        <DropdownTrigger
          chrome="chip"
          chevron
          :popup="false"
          class="ds-date-calendar__month"
          :ariaLabel="`${title}, ${labels.chooseYear}`"
          @click="openYears"
        >{{ title }}</DropdownTrigger>
        <IconButton size="xs" variant="subtle" icon="chevron-right" :ariaLabel="labels.nextMonth" :disabled="!canNextMonth" @click="pageMonth(1)" />
      </div>
      <div ref="grid" class="ds-date-calendar__days" role="grid" :aria-label="title" @keydown="onKeydown" @mouseleave="hover = null">
        <div class="ds-date-calendar__row" role="row">
          <span v-for="w in weekdays" :key="w.long" class="ds-date-calendar__weekday" role="columnheader" :aria-label="w.long">{{ w.narrow }}</span>
        </div>
        <div v-for="row in 6" :key="row" class="ds-date-calendar__row" role="row">
          <button
            v-for="c in days.slice((row - 1) * 7, row * 7)"
            :key="c.key"
            type="button"
            role="gridcell"
            class="ds-date-calendar__cell ds-date-calendar__cell--day"
            :class="{
              'ds-date-calendar__cell--chosen': isChosen(c.key),
              'ds-date-calendar__cell--between': isBetween(c.key),
              'ds-date-calendar__cell--today': c.key === todayKey,
              'ds-date-calendar__cell--outside': c.outside,
            }"
            :tabindex="isActiveDay(c.key) ? 0 : -1"
            :aria-label="c.label"
            :aria-selected="isChosen(c.key)"
            :aria-current="c.key === todayKey ? 'date' : undefined"
            :aria-disabled="outOfBounds(c.key) || undefined"
            @click="pick(c.key)"
            @mouseenter="range && pending !== null && !outOfBounds(c.key) ? (hover = c.key) : undefined"
            @focus="active = c.key"
          >{{ c.d }}</button>
        </div>
      </div>
    </template>

    <!-- Several years: the count, and the choice confirmed — not taken on every press (ADR-0153). -->
    <div v-if="multiple" class="ds-date-calendar__foot">
      <span class="ds-date-calendar__count" role="status">{{ draftCount }}</span>
      <Button variant="primary" size="sm" :label="confirmLabel ?? 'Valider'" @click="emit('pick-many', draft)" />
    </div>
  </div>
</template>

<style scoped>
/*
  The owner's frame `4116:3094`: a 300px panel, a head of chevrons around a
  title, then the grid — years 64 × 36 six apart, days 36 square four apart.
  The text is the floor's 14 (a dense place, ADR-0145).
*/
.ds-date-calendar {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-lg);
  font-family: var(--ds-typography-font-family-poppins);
}

.ds-date-calendar__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  padding-top: var(--ds-spacing-lg);
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-date-calendar__count {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-date-calendar__summary {
  display: flex;
  align-items: baseline;
  gap: var(--ds-spacing-md);
  margin: 0;
}

.ds-date-calendar__summary-ends {
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
}

.ds-date-calendar__summary-span {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-date-calendar__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
}

.ds-date-calendar__title {
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
  font-variant-numeric: tabular-nums;
}

.ds-date-calendar__years,
.ds-date-calendar__days {
  display: flex;
  flex-direction: column;
}

.ds-date-calendar__years { gap: var(--ds-spacing-sm); }
.ds-date-calendar__days { gap: var(--ds-spacing-xs); }

.ds-date-calendar__row {
  display: grid;
}

.ds-date-calendar__years .ds-date-calendar__row {
  grid-template-columns: repeat(4, 1fr);
  gap: var(--ds-spacing-sm);
}

.ds-date-calendar__days .ds-date-calendar__row {
  grid-template-columns: repeat(7, 1fr);
  gap: var(--ds-spacing-xs);
}

.ds-date-calendar__weekday {
  display: grid;
  place-items: center;
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtlest);
}

/* ── Cells ──────────────────────────────────────────────────────────── */
.ds-date-calendar__cell {
  display: grid;
  place-items: center;
  height: var(--date-calendar-cell, 36px);
  padding: 0;
  border: 0;
  background: transparent;
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-default);
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    color            var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-date-calendar__cell--year { border-radius: var(--ds-radius-control); }

/* A day stays round whatever the panel's width: a square, centred in its
   column — and in a 300px panel at md, where seven 40s and their gaps do not
   fit (304 > 276), the square gives to the column rather than spilling. */
.ds-date-calendar__cell--day {
  justify-self: center;
  width: min(var(--date-calendar-cell, 36px), 100%);
  height: auto;
  aspect-ratio: 1;
  border-radius: var(--ds-radius-pill);
}

/*
  md follows its field as `DropdownItem` does (ADR-0153, amended): the field
  writes at `body-lg`, so the grid reads at `label-lg` on cells 40 high — the
  36 of `sm` × the 24 / 20 of the two line boxes, on the 4px grid. sm keeps
  the floor's 14 on 36 (ADR-0145).
*/
.ds-date-calendar--md {
  --date-calendar-cell: 40px;
}

.ds-date-calendar--md .ds-date-calendar__cell {
  font: var(--ds-font-label-lg);
  font-variant-numeric: tabular-nums;
}

.ds-date-calendar--md .ds-date-calendar__cell--chosen {
  font: var(--ds-font-label-lg-strong);
  font-variant-numeric: tabular-nums;
}

.ds-date-calendar--md .ds-date-calendar__title,
.ds-date-calendar--md .ds-date-calendar__month,
.ds-date-calendar--md .ds-date-calendar__summary-ends {
  font: var(--ds-font-label-lg-strong);
  font-variant-numeric: tabular-nums;
}

.ds-date-calendar--md .ds-date-calendar__weekday {
  font: var(--ds-font-label-lg);
}

.ds-date-calendar__cell:hover:not([aria-disabled='true']):not(.ds-date-calendar__cell--chosen) {
  background-color: var(--ds-bg-hover);
}

.ds-date-calendar__cell:focus-visible {
  box-shadow: var(--ds-focus-ring-brand);
}

/* Another month's day: there, still choosable, receding. */
.ds-date-calendar__cell--outside { color: var(--ds-text-subtlest); }

/* Today, or this year: a contour in the brand's border (the owner's « filet »). */
.ds-date-calendar__cell--today:not(.ds-date-calendar__cell--chosen) {
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-brand);
}

.ds-date-calendar__cell--today:not(.ds-date-calendar__cell--chosen):focus-visible {
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-brand), var(--ds-focus-ring-brand);
}

/* Inside a range: the brand's tint and its ink. */
.ds-date-calendar__cell--between {
  background-color: var(--ds-bg-brand-subtle);
  color: var(--ds-text-on-brand-subtle);
}

/* Chosen — a value, or a range's end: the brand's fill and its ink. */
.ds-date-calendar__cell--chosen {
  background-color: var(--ds-bg-brand-solid);
  color: var(--ds-text-on-brand-solid);
  font: var(--ds-font-label-md-strong);
  font-variant-numeric: tabular-nums;
}

/* Past min or max: there, greyed, refused. */
.ds-date-calendar__cell[aria-disabled='true'] {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}
</style>
