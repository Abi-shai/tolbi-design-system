<script setup lang="ts">
import { ref, computed, useId } from 'vue'
import { useFormField } from '../FormField/context'

export type OtpSize   = 'sm' | 'md' | 'lg'
export type OtpDigits = 4 | 6

interface Props {
  modelValue?: string
  digits?:     OtpDigits
  size?:       OtpSize
  disabled?:   boolean
  id?:         string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  digits:     4,
  size:       'md',
  disabled:   false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'complete':         [value: string]
}>()

const uid   = useId()
const field = useFormField()

// The first cell is the control the wrapper's `for` points at.
const fieldId     = computed(() => field?.id.value ?? props.id ?? `otp-${uid}`)
const isDisabled  = computed(() => (field?.disabled.value ?? false) || props.disabled)
const describedBy = computed(() => field?.describedBy.value)

// Tableau des refs sur chaque input
const cellRefs = ref<HTMLInputElement[]>([])

// Tableau de valeurs (une par cellule)
const cells = computed(() => {
  const arr = Array(props.digits).fill('')
  for (let i = 0; i < props.modelValue.length && i < props.digits; i++) {
    arr[i] = props.modelValue[i]
  }
  return arr
})

function emitValue(arr: string[]) {
  const val = arr.join('')
  emit('update:modelValue', val)
  if (val.length === props.digits && !arr.includes('')) {
    emit('complete', val)
  }
}

function onInput(e: Event, index: number) {
  const input = e.target as HTMLInputElement
  const char  = input.value.replace(/\D/g, '').slice(-1)
  input.value = char

  const arr = cells.value.slice()
  arr[index] = char
  emitValue(arr)

  if (char && index < props.digits - 1) {
    cellRefs.value[index + 1]?.focus()
  }
}

function onKeydown(e: KeyboardEvent, index: number) {
  if (e.key === 'Backspace') {
    const arr = cells.value.slice()
    if (arr[index]) {
      arr[index] = ''
      emitValue(arr)
    } else if (index > 0) {
      cellRefs.value[index - 1]?.focus()
      const arr2 = cells.value.slice()
      arr2[index - 1] = ''
      emitValue(arr2)
    }
  }
  if (e.key === 'ArrowLeft'  && index > 0)                  cellRefs.value[index - 1]?.focus()
  if (e.key === 'ArrowRight' && index < props.digits - 1)    cellRefs.value[index + 1]?.focus()
}

function onPaste(e: ClipboardEvent, startIndex: number) {
  e.preventDefault()
  const pasted = (e.clipboardData?.getData('text') ?? '').replace(/\D/g, '')
  const arr = cells.value.slice()
  for (let i = 0; i < pasted.length && startIndex + i < props.digits; i++) {
    arr[startIndex + i] = pasted[i]
  }
  emitValue(arr)
  const nextFocus = Math.min(startIndex + pasted.length, props.digits - 1)
  cellRefs.value[nextFocus]?.focus()
}

// Indices : pour 6 chiffres, le séparateur "-" est entre index 2 et 3
const firstGroup  = computed(() => props.digits === 6 ? [0, 1, 2] : Array.from({ length: props.digits }, (_, i) => i))
const secondGroup = computed(() => props.digits === 6 ? [3, 4, 5] : [])
</script>

<template>
  <div class="ds-otp" :class="`ds-otp--${size}`">

    <!-- Cells -->
    <div class="ds-otp__row">
      <input
        v-for="i in firstGroup"
        :key="i"
        :ref="el => { if (el) cellRefs[i] = el as HTMLInputElement }"
        :id="i === 0 ? fieldId : undefined"
        :aria-describedby="i === 0 ? describedBy : undefined"
        :aria-invalid="i === 0 && field?.invalid.value ? true : undefined"
        class="ds-otp__cell"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        :value="cells[i]"
        :disabled="isDisabled"
        :aria-label="`Chiffre ${i + 1} sur ${digits}`"
        @input="onInput($event, i)"
        @keydown="onKeydown($event, i)"
        @paste="onPaste($event, i)"
        @focus="($event.target as HTMLInputElement).select()"
      />

      <!-- Séparateur pour 6 chiffres -->
      <span v-if="digits === 6" class="ds-otp__separator" aria-hidden="true">-</span>

      <input
        v-for="i in secondGroup"
        :key="i"
        :ref="el => { if (el) cellRefs[i] = el as HTMLInputElement }"
        class="ds-otp__cell"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        :value="cells[i]"
        :disabled="isDisabled"
        :aria-label="`Chiffre ${i + 1} sur ${digits}`"
        @input="onInput($event, i)"
        @keydown="onKeydown($event, i)"
        @paste="onPaste($event, i)"
        @focus="($event.target as HTMLInputElement).select()"
      />
    </div>
  </div>
</template>

<style scoped>
/* Component tokens (ADR-0010): an OTP cell's digit size is geometry, not a
   typographic role — 48px and 60px are off the type ramp entirely. */
.ds-otp {
  --otp-digit-font:    var(--ds-font-weight-metric-lg) 3rem/3.75rem var(--ds-typography-font-family-poppins);
  --otp-digit-font-lg: var(--ds-font-weight-metric-lg) 3.75rem/4.5rem var(--ds-typography-font-family-poppins);
}
/* ── Shell ────────────────────────────────────────────────────────── */
.ds-otp {
  display: inline-flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
  align-items: flex-start;
}

/* ── Label ────────────────────────────────────────────────────────── */
/* ── Row ──────────────────────────────────────────────────────────── */
.ds-otp__row {
  display: flex;
  align-items: center;
}

.ds-otp--sm .ds-otp__row { gap: var(--ds-spacing-md); }
.ds-otp--md .ds-otp__row { gap: var(--ds-spacing-lg); }
.ds-otp--lg .ds-otp__row { gap: var(--ds-spacing-lg); }

/* ── Cell ─────────────────────────────────────────────────────────── */
.ds-otp__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--ds-bg-default);
  border: var(--ds-border-width-default) solid var(--ds-border-default);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-control);
  box-sizing: border-box;
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-label-lg);
  color: var(--ds-text-strong);
  transition: border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default), box-shadow var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
  outline: none;
  cursor: pointer;
  -moz-appearance: textfield;
}

.ds-otp__cell::-webkit-outer-spin-button,
.ds-otp__cell::-webkit-inner-spin-button { -webkit-appearance: none; }

/* Placeholder (vide) */
.ds-otp__cell:placeholder-shown,
.ds-otp__cell:not(:focus):not([value]):not([value="0"]) {
  color: var(--ds-text-placeholder);
}

/* Focus */
.ds-otp__cell:focus {
  border-color: var(--ds-border-brand);
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* Disabled */
.ds-otp__cell:disabled {
  background: var(--ds-bg-default);
  cursor: not-allowed;
  color: var(--ds-text-placeholder);
}

/* ── Tailles ──────────────────────────────────────────────────────── */
.ds-otp--sm .ds-otp__cell {
  width: 64px;
  min-height: 64px;
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md);
  border-radius: var(--ds-radius-control);
  font: var(--otp-digit-font);
  letter-spacing: -0.96px;
}

.ds-otp--md .ds-otp__cell {
  width: 80px;
  min-height: 80px;
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-surface-sm);
  font: var(--otp-digit-font);
  letter-spacing: -0.96px;
}

.ds-otp--lg .ds-otp__cell {
  width: 96px;
  min-height: 96px;
  padding: var(--ds-spacing-lg) var(--ds-spacing-md);
  border-radius: var(--ds-radius-surface);
  font: var(--otp-digit-font-lg);
  letter-spacing: -1.2px;
}

/* ── Séparateur ───────────────────────────────────────────────────── */
.ds-otp__separator {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-label-lg);
  color: var(--ds-text-placeholder);
  flex-shrink: 0;
}

.ds-otp--sm .ds-otp__separator { font: var(--otp-digit-font); }
.ds-otp--md .ds-otp__separator { font: var(--otp-digit-font); }
.ds-otp--lg .ds-otp__separator { font: var(--otp-digit-font-lg); }

/* ── Hint ─────────────────────────────────────────────────────────── */
</style>
