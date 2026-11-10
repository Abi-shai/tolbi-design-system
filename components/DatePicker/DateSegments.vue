<script setup lang="ts">
import { ref } from 'vue'
import { daysIn, today, type DateParts, type SegmentKind } from './dates'

/**
 * One value typed by segments (ADR-0152) — AAAA, or JJ/MM/AAAA in the order
 * the locale writes it. Each segment is a `spinbutton`: digits type into it and
 * move on when it is full, ↑ ↓ step it by one, ← → move between segments,
 * Backspace takes a digit back. Internal: `DatePicker` owns the value.
 */
export interface DateSegmentsProps {
  parts: DateParts
  kinds: SegmentKind[]
  separator: string
  placeholders: Record<SegmentKind, string>
  names: Record<SegmentKind, string>
  /** Read before each segment's name — « Début », « Fin » in a range. */
  prefix?: string
  disabled?: boolean
}

const props = defineProps<DateSegmentsProps>()
const emit = defineEmits<{
  'update:parts': [parts: DateParts]
  /** ← on the first segment, → on the last: the caller moves on. */
  'leave-start': []
  'leave-end': []
}>()

const FIELD = { day: 'd', month: 'm', year: 'y' } as const
const WIDTH: Record<SegmentKind, number> = { day: 2, month: 2, year: 4 }

const els = ref<HTMLElement[]>([])
/* What is being typed into a segment, so « 0 » then « 3 » reads 03 on the way. */
const buffer = ref<Partial<Record<SegmentKind, string>>>({})

function value(k: SegmentKind) {
  return props.parts[FIELD[k]]
}

function text(k: SegmentKind): string {
  const typed = buffer.value[k]
  if (typed) return typed.padStart(WIDTH[k], '0')
  const v = value(k)
  return v == null ? props.placeholders[k] : String(v).padStart(WIDTH[k], '0')
}

function bounds(k: SegmentKind): [number, number] {
  if (k === 'year') return [1, 9999]
  if (k === 'month') return [1, 12]
  return [1, daysIn(props.parts.y ?? 2000, props.parts.m ?? 1)]
}

function set(k: SegmentKind, v: number | null) {
  emit('update:parts', { ...props.parts, [FIELD[k]]: v })
}

function focusAt(i: number) {
  els.value[i]?.focus()
}

/** The first segment, for the caller. */
function focus(at: 'start' | 'end' = 'start') {
  focusAt(at === 'start' ? 0 : props.kinds.length - 1)
}
defineExpose({ focus })

function typeDigit(i: number, k: SegmentKind, digit: string) {
  let s = (buffer.value[k] ?? '') + digit
  if (s.length > WIDTH[k]) s = digit
  buffer.value = { ...buffer.value, [k]: s }
  const n = Number(s)
  const [lo, hi] = bounds(k)
  set(k, n >= lo && n <= hi ? n : k === 'year' ? n || null : null)
  /* Full, or no second digit could follow: on to the next segment. */
  const full = s.length === WIDTH[k] || (k === 'month' && n > 1) || (k === 'day' && n > 3)
  if (full) {
    buffer.value = { ...buffer.value, [k]: undefined }
    if (i < props.kinds.length - 1) focusAt(i + 1)
  }
}

function step(k: SegmentKind, dir: 1 | -1) {
  buffer.value = { ...buffer.value, [k]: undefined }
  const now = today()
  const v = value(k)
  const [lo, hi] = bounds(k)
  if (v == null) {
    set(k, k === 'year' ? now.y : k === 'month' ? now.m : Math.min(now.d, hi))
    return
  }
  let next = v + dir
  if (k !== 'year') next = next > hi ? lo : next < lo ? hi : next
  set(k, Math.min(Math.max(next, lo), hi))
}

function onKeydown(e: KeyboardEvent, i: number, k: SegmentKind) {
  /* Alt+↓ is the field's (it opens the calendar), not a step. */
  if (props.disabled || e.altKey) return
  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault()
    typeDigit(i, k, e.key)
    return
  }
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      step(k, 1)
      break
    case 'ArrowDown':
      e.preventDefault()
      step(k, -1)
      break
    case 'ArrowLeft':
      e.preventDefault()
      if (i > 0) focusAt(i - 1)
      else emit('leave-start')
      break
    case 'ArrowRight':
      e.preventDefault()
      if (i < props.kinds.length - 1) focusAt(i + 1)
      else emit('leave-end')
      break
    case 'Backspace':
    case 'Delete': {
      e.preventDefault()
      const typed = buffer.value[k]
      const s = (typed ?? (value(k) == null ? '' : String(value(k)))).slice(0, -1)
      buffer.value = { ...buffer.value, [k]: s || undefined }
      set(k, s ? Number(s) || null : null)
      if (!s && e.key === 'Backspace' && value(k) == null && i > 0) focusAt(i - 1)
      break
    }
  }
}

function onBlur(k: SegmentKind) {
  buffer.value = { ...buffer.value, [k]: undefined }
}
</script>

<template>
  <span class="ds-date-segments">
    <template v-for="(k, i) in kinds" :key="k">
      <span v-if="i > 0" class="ds-date-segments__separator" aria-hidden="true">{{ separator }}</span>
      <span
        :ref="(el) => { if (el) els[i] = el as HTMLElement }"
        class="ds-date-segments__segment"
        :class="{ 'ds-date-segments__segment--empty': value(k) == null && !buffer[k] }"
        role="spinbutton"
        :tabindex="disabled ? -1 : 0"
        :aria-label="prefix ? `${prefix}, ${names[k]}` : names[k]"
        :aria-valuenow="value(k) ?? undefined"
        :aria-valuemin="bounds(k)[0]"
        :aria-valuemax="bounds(k)[1]"
        :aria-valuetext="value(k) == null ? '' : String(value(k))"
        :aria-disabled="disabled || undefined"
        inputmode="numeric"
        @keydown="onKeydown($event, i, k)"
        @blur="onBlur(k)"
      >{{ text(k) }}</span>
    </template>
  </span>
</template>

<style scoped>
.ds-date-segments {
  display: inline-flex;
  align-items: center;
  font: var(--ds-font-body-lg);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
  white-space: nowrap;
}

.ds-date-segments__separator {
  padding: 0 var(--ds-spacing-xxs);
  color: var(--ds-text-placeholder);
}

/* A segment is a word in the field: a tint where the caret would be, the
   placeholder's ink while it is empty (the owner's « 03 » on its pill). */
.ds-date-segments__segment {
  padding: 0 var(--ds-spacing-xxs);
  border-radius: var(--ds-radius-inner-sm);
  outline: none;
  caret-color: transparent;
  cursor: text;
}

.ds-date-segments__segment--empty {
  color: var(--ds-text-placeholder);
}

.ds-date-segments__segment:focus {
  background-color: var(--ds-bg-selected);
  color: var(--ds-text-on-brand-subtle);
}

.ds-date-segments__segment[aria-disabled='true'] {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}
</style>
