<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { Icon } from '../Icon'
import { InputField, type InputFieldSize } from '../InputField'
import { SurfaceTransition } from '../SurfaceTransition'
import { useFormField } from '../FormField/context'
import { useAnchoredSurface } from '../../composables/useAnchoredSurface'
import DateSegments from './DateSegments.vue'
import DateCalendar from './DateCalendar.vue'
import {
  boundKey,
  dayKey,
  daysIn,
  fromDayKey,
  keyText,
  noParts,
  parseIso,
  placeholdersFor,
  segmentNamesFor,
  segmentOrder,
  segmentSeparator,
  toIso,
  wordsFor,
  type DateGranularity,
  type DateParts,
  type SegmentKind,
} from './dates'

/** A year (`2026`), or a day as an ISO string (`2026-03-12`). */
export type DatePickerValue = number | string
/** A range: its two ends, either of which may be missing. */
export interface DatePickerRange {
  start: DatePickerValue | null
  end: DatePickerValue | null
}
export type DatePickerGranularity = DateGranularity
/** Every value `v-model` can carry: a year, a day, a range, several years. */
export type DatePickerModel = DatePickerValue | DatePickerRange | number[] | null

/**
 * One component, four modes (ADR-0152, the owner's frame `4116:3094`):
 * `granularity` = `day` | `year`, and `range` — « Année de plantation »,
 * « Date de démarrage », « Période d'analyse ».
 *
 * - **The field is typed**, by segments — AAAA; JJ/MM/AAAA in the order the
 *   locale writes it — ↑ ↓ step the segment in focus, ← → move between them.
 *   A range is two values, start → end. The box is `InputField`'s (ADR-0001).
 * - **The calendar opens under it** (a popover, ADR-0078): years on a 4 × 4
 *   grid paged on `min`; or a month, whose title opens the same years and
 *   comes back. A range is two picks in the same grid.
 * - **Out of bounds is refused**: the value is not taken, and `invalid` says
 *   why — « Entre 2011 et 2031 » — for the `FormField` around it to show
 *   (ADR-0008: the message is the field's). `null` once it is right again.
 */
export interface DatePickerProps {
  /** A year (`number`), an ISO day (`string`), a `{ start, end }` range, or null. */
  modelValue?: DatePickerModel
  granularity?: DatePickerGranularity
  range?: boolean
  /**
   * Several years, not contiguous — 2021, 2023, 2026 (ADR-0153). `granularity="year"`
   * only; `v-model` is a `number[]`, sorted. Picked one by one in the grid and
   * confirmed by « Valider »; the field then lists them and is not typed.
   */
  multiple?: boolean
  /** The field's words while nothing is chosen, in `multiple`. */
  multiplePlaceholder?: string
  /** The confirm button's word, in `multiple`. */
  confirmLabel?: string
  /** The first choosable — a year, or an ISO day. */
  min?: DatePickerValue
  /** The last choosable — a year, or an ISO day. */
  max?: DatePickerValue
  /** Writes the segments' order, the month and day names, the messages. */
  locale?: string
  size?: InputFieldSize
  disabled?: boolean
  /** Standalone only — inside a `FormField`, its `error` decides. */
  destructive?: boolean
  /** The calendar button's name and the panel's. */
  calendarLabel?: string
  previousYearsLabel?: string
  nextYearsLabel?: string
  previousMonthLabel?: string
  nextMonthLabel?: string
  chooseYearLabel?: string
  /** A range's two halves, read before their segments. */
  startLabel?: string
  endLabel?: string
}

const props = withDefaults(defineProps<DatePickerProps>(), {
  modelValue: null,
  granularity: 'day',
  range: false,
  multiple: false,
  multiplePlaceholder: 'Choisir des années',
  confirmLabel: 'Valider',
  min: undefined,
  max: undefined,
  locale: 'fr-FR',
  size: 'md',
  disabled: false,
  destructive: false,
  calendarLabel: 'Ouvrir le calendrier',
  previousYearsLabel: 'Années précédentes',
  nextYearsLabel: 'Années suivantes',
  previousMonthLabel: 'Mois précédent',
  nextMonthLabel: 'Mois suivant',
  chooseYearLabel: 'choisir l’année',
  startLabel: 'Début',
  endLabel: 'Fin',
})

const emit = defineEmits<{
  'update:modelValue': [value: DatePickerModel]
  /** Why what is typed was refused — « Entre 2011 et 2031 » — or null once it is accepted. */
  invalid: [message: string | null]
}>()

const field = useFormField()
const uid = useId()
const groupId = computed(() => field?.id.value ?? `ds-date-picker-${uid}`)
const isDisabled = computed(() => (field?.disabled.value ?? false) || props.disabled)

/* ── Values ⇄ keys ──────────────────────────────────────────────────── */
const kinds = computed<SegmentKind[]>(() => (props.granularity === 'year' ? ['year'] : segmentOrder(props.locale)))
const separator = computed(() => segmentSeparator(props.locale))
const placeholders = computed(() => placeholdersFor(props.locale))
const names = computed(() => segmentNamesFor(props.locale))

const minKey = computed(() => boundKey(props.min, props.granularity, 'start'))
const maxKey = computed(() => boundKey(props.max, props.granularity, 'end'))

function partsOf(v: DatePickerValue | null | undefined): DateParts {
  if (v === null || v === undefined || v === '') return noParts()
  if (props.granularity === 'year') {
    const y = typeof v === 'number' ? v : parseIso(v)?.y ?? Number(v)
    return Number.isFinite(y) ? { y, m: null, d: null } : noParts()
  }
  const p = typeof v === 'string' ? parseIso(v) : null
  return p ? { y: p.y, m: p.m, d: p.d } : noParts()
}

function keyOf(p: DateParts): number | null {
  if (p.y === null || p.y < 1000) return null
  if (props.granularity === 'year') return p.y
  if (p.m === null || p.d === null || p.d > daysIn(p.y, p.m)) return null
  return dayKey(p.y, p.m, p.d)
}

function valueOf(k: number): DatePickerValue {
  if (props.granularity === 'year') return k
  const p = fromDayKey(k)
  return toIso(p.y, p.m, p.d)
}

const isEmpty = (p: DateParts) => p.y === null && p.m === null && p.d === null

/* ── Drafts: what the segments hold ─────────────────────────────────── */
const draftStart = ref<DateParts>(noParts())
const draftEnd = ref<DateParts>(noParts())

watch(
  () => [props.modelValue, props.granularity, props.range],
  () => {
    const v = props.modelValue
    if (Array.isArray(v)) return
    if (props.range) {
      const r = (v && typeof v === 'object' ? v : { start: null, end: null }) as DatePickerRange
      draftStart.value = partsOf(r.start)
      draftEnd.value = partsOf(r.end)
    } else {
      draftStart.value = partsOf(v as DatePickerValue | null)
    }
  },
  { immediate: true, deep: true },
)

const startKey = computed(() => keyOf(draftStart.value))
const endKey = computed(() => keyOf(draftEnd.value))

/* ── Validity ───────────────────────────────────────────────────────── */
const message = ref<string | null>(null)

function boundsMessage(): string {
  const w = wordsFor(props.locale)
  const a = minKey.value === undefined ? undefined : keyText(props.locale, minKey.value, props.granularity)
  const b = maxKey.value === undefined ? undefined : keyText(props.locale, maxKey.value, props.granularity)
  if (a && b) return w.between(a, b)
  return a ? w.from(a) : w.upTo(b!)
}

const outside = (k: number) => (minKey.value !== undefined && k < minKey.value) || (maxKey.value !== undefined && k > maxKey.value)

function say(m: string | null) {
  if (m === message.value) return
  message.value = m
  emit('invalid', m)
}

function same(a: unknown, b: unknown) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
}

/* Several years: `multiple` takes only years (ADR-0153). */
const many = computed(() => props.multiple && props.granularity === 'year')
const manyValue = computed<number[]>(() => (Array.isArray(props.modelValue) ? [...props.modelValue].sort((a, b) => a - b) : []))
const manyText = computed(() => manyValue.value.join(', '))

function onPickMany(years: number[]) {
  commit([...years].sort((a, b) => a - b))
  close()
}

function commit(value: DatePickerModel) {
  if (!same(value, props.modelValue)) emit('update:modelValue', value)
}

/* What the segments say decides: all empty is « no value », complete and in
   bounds is the value, complete and out of bounds is refused, half-typed waits. */
function evaluate() {
  if (!props.range) {
    if (isEmpty(draftStart.value)) { say(null); commit(null); return }
    const k = startKey.value
    if (k === null) return
    if (outside(k)) { say(boundsMessage()); return }
    say(null)
    commit(valueOf(k))
    return
  }
  const [a, b] = [startKey.value, endKey.value]
  if (isEmpty(draftStart.value) && isEmpty(draftEnd.value)) { say(null); commit(null); return }
  if ((a !== null && outside(a)) || (b !== null && outside(b))) { say(boundsMessage()); return }
  if (a !== null && b !== null && a > b) { say(wordsFor(props.locale).order); return }
  if (a === null || b === null) return
  say(null)
  commit({ start: valueOf(a), end: valueOf(b) })
}

function onStart(p: DateParts) {
  draftStart.value = p
  evaluate()
}

function onEnd(p: DateParts) {
  draftEnd.value = p
  evaluate()
}

/* ── The calendar ───────────────────────────────────────────────────── */
const open = ref(false)
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)
const startSegments = ref<InstanceType<typeof DateSegments> | null>(null)
const endSegments = ref<InstanceType<typeof DateSegments> | null>(null)

/* Hung from the box, not from the button: the panel starts under the field's edge. */
const anchor = ref<HTMLElement | null>(null)
onMounted(() => { anchor.value = root.value?.querySelector<HTMLElement>('.ds-input-field__wrapper') ?? null })
useAnchoredSurface(anchor, panel, { align: () => 'start' })

function toggle() {
  if (isDisabled.value) return
  open.value = !open.value
}

function close(refocus = true) {
  open.value = false
  if (refocus) nextTick(() => button.value?.focus())
}

function onPick(k: number) {
  draftStart.value = partsOf(valueOf(k))
  say(null)
  commit(valueOf(k))
  close()
}

function onPickRange(a: number, b: number) {
  draftStart.value = partsOf(valueOf(a))
  draftEnd.value = partsOf(valueOf(b))
  say(null)
  commit({ start: valueOf(a), end: valueOf(b) })
  close()
}

/* A press outside the field and the panel closes it, the focus staying where it went. */
function onPointerDown(e: PointerEvent) {
  const t = e.target as Node | null
  if (root.value?.contains(t) || panel.value?.contains(t)) return
  close(false)
}

watch(open, (now) => {
  if (now) document.addEventListener('pointerdown', onPointerDown, true)
  else document.removeEventListener('pointerdown', onPointerDown, true)
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onPointerDown, true))

const calendarLabels = computed(() => ({
  previousYears: props.previousYearsLabel,
  nextYears: props.nextYearsLabel,
  previousMonth: props.previousMonthLabel,
  nextMonth: props.nextMonthLabel,
  chooseYear: props.chooseYearLabel,
}))
</script>

<template>
  <div ref="root" class="ds-date-picker" :class="`ds-date-picker--${size}`">
    <InputField :size="size" :disabled="isDisabled" :destructive="destructive || (!field && !!message)">
      <template #control>
        <div
          :id="groupId"
          class="ds-date-picker__value"
          role="group"
          :aria-labelledby="field?.labelId?.value"
          :aria-describedby="field?.describedBy.value"
          :aria-invalid="field?.invalid.value || (!field && !!message) || undefined"
        >
          <!-- Several years are listed, not typed: the grid is where they are chosen. -->
          <button
            v-if="many"
            type="button"
            class="ds-date-picker__list"
            :class="{ 'ds-date-picker__list--empty': !manyValue.length }"
            :disabled="isDisabled"
            tabindex="-1"
            @click="toggle"
          >{{ manyValue.length ? manyText : multiplePlaceholder }}</button>
          <DateSegments
            v-else
            ref="startSegments"
            :parts="draftStart"
            :kinds="kinds"
            :separator="separator"
            :placeholders="placeholders"
            :names="names"
            :prefix="range ? startLabel : undefined"
            :disabled="isDisabled"
            @update:parts="onStart"
            @leave-end="range ? endSegments?.focus('start') : button?.focus()"
          />
          <template v-if="range && !many">
            <span class="ds-date-picker__arrow" aria-hidden="true">→</span>
            <DateSegments
              ref="endSegments"
              :parts="draftEnd"
              :kinds="kinds"
              :separator="separator"
              :placeholders="placeholders"
              :names="names"
              :prefix="endLabel"
              :disabled="isDisabled"
              @update:parts="onEnd"
              @leave-start="startSegments?.focus('end')"
              @leave-end="button?.focus()"
            />
          </template>
        </div>
      </template>
      <template #trailing>
        <!-- PasswordField's shape (a bare 20px glyph in the box), so the field keeps its height. -->
        <button
          ref="button"
          type="button"
          class="ds-date-picker__toggle"
          :aria-label="calendarLabel"
          aria-haspopup="dialog"
          :aria-expanded="open"
          :disabled="isDisabled"
          @click="toggle"
        >
          <Icon :name="granularity === 'year' ? 'calendar' : 'calendar-days'" :size="20" />
        </button>
      </template>
    </InputField>

    <SurfaceTransition>
      <div
        v-if="open"
        ref="panel"
        popover="manual"
        class="ds-date-picker__panel"
        role="dialog"
        :aria-label="calendarLabel"
      >
        <DateCalendar
          :granularity="granularity"
          :size="size"
          :range="range && !many"
          :multiple="many"
          :many="manyValue"
          :confirm-label="confirmLabel"
          :start="startKey"
          :end="endKey"
          :min="minKey"
          :max="maxKey"
          :locale="locale"
          :labels="calendarLabels"
          @pick="onPick"
          @pick-range="onPickRange"
          @pick-many="onPickMany"
          @close="close()"
        />
      </div>
    </SurfaceTransition>
  </div>
</template>

<style scoped>
.ds-date-picker {
  display: block;
  min-width: 0;
}

.ds-date-picker__value {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

/* sm is the 14/20 type, as InputField's (ADR-0108). */
.ds-date-picker--sm .ds-date-picker__value :deep(.ds-date-segments) {
  font: var(--ds-font-body-md);
  font-variant-numeric: tabular-nums;
}

/* The list of several years: the field's own type, cut at its edge. */
.ds-date-picker__list {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: none;
  font: var(--ds-font-body-lg);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.ds-date-picker__list--empty { color: var(--ds-text-placeholder); }

.ds-date-picker--sm .ds-date-picker__list {
  font: var(--ds-font-body-md);
  font-variant-numeric: tabular-nums;
}

.ds-date-picker__arrow {
  font: var(--ds-font-body-md);
  color: var(--ds-text-placeholder);
}

.ds-date-picker__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ds-text-subtle);
  border-radius: var(--ds-radius-inner-sm);
  cursor: pointer;
  transition:
    color      var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant)  var(--ds-motion-easing-default);
}

.ds-date-picker__toggle:hover:not(:disabled),
.ds-date-picker__toggle[aria-expanded='true'] { color: var(--ds-text-strong); }
.ds-date-picker__toggle:disabled { cursor: not-allowed; color: var(--ds-text-disabled); }
.ds-date-picker__toggle:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

/* In the top layer, under the field (ADR-0078), as `Dropdown`'s panel is. */
.ds-date-picker__panel {
  position: fixed;
  inset: auto;
  margin: var(--ds-spacing-md) 0;
  padding: 0;
  color: inherit;
  z-index: var(--ds-z-popover);
  box-sizing: border-box;
  /* The field's width, as a select's list has (ADR-0153, amended), never under
     the 300 of the owner's frame — the grid's own floor. */
  width: max(300px, var(--anchor-width, 300px));
  max-width: calc(100vw - 2 * var(--ds-spacing-md));
  max-height: var(--anchor-room, none);
  overflow: auto;
  background-color: var(--ds-bg-default);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface-sm);
  box-shadow: var(--ds-elevation-overlay);
}
</style>
