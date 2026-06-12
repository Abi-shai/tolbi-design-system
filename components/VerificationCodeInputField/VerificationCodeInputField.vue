<script setup lang="ts">
import { ref, computed, useId } from 'vue'

export type OtpSize   = 'sm' | 'md' | 'lg'
export type OtpDigits = 4 | 6

interface Props {
  modelValue?: string
  digits?:     OtpDigits
  size?:       OtpSize
  label?:      string
  hint?:       string
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

const uid     = useId()
const fieldId = computed(() => props.id ?? `otp-${uid}`)

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

    <!-- Label -->
    <label v-if="label" :for="`${fieldId}-0`" class="ds-otp__label">{{ label }}</label>

    <!-- Cells -->
    <div class="ds-otp__row">
      <input
        v-for="i in firstGroup"
        :key="i"
        :ref="el => { if (el) cellRefs[i] = el as HTMLInputElement }"
        :id="i === 0 ? `${fieldId}-0` : undefined"
        class="ds-otp__cell"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        maxlength="1"
        :value="cells[i]"
        :disabled="disabled"
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
        :disabled="disabled"
        :aria-label="`Chiffre ${i + 1} sur ${digits}`"
        @input="onInput($event, i)"
        @keydown="onKeydown($event, i)"
        @paste="onPaste($event, i)"
        @focus="($event.target as HTMLInputElement).select()"
      />
    </div>

    <!-- Hint -->
    <p v-if="hint" class="ds-otp__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────────────── */
.ds-otp {
  display: inline-flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
  align-items: flex-start;
}

/* ── Label ────────────────────────────────────────────────────────── */
.ds-otp__label {
  margin: 0;
  display: block;
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-secondary);
  white-space: nowrap;
}

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
  background: var(--ds-semantic-bg-primary);
  border: 1px solid var(--ds-semantic-border-primary);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-xs);
  box-sizing: border-box;
  font-family: var(--ds-typography-font-family-inter);
  font-weight: 500;
  color: var(--ds-semantic-text-primary);
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
  color: var(--ds-semantic-text-placeholder-subtle);
}

/* Focus */
.ds-otp__cell:focus {
  border-color: var(--ds-semantic-border-brand);
  box-shadow: var(--ds-focus-ring-brand-shadow-xs);
}

/* Disabled */
.ds-otp__cell:disabled {
  background: var(--ds-semantic-bg-primary-alt);
  cursor: not-allowed;
  color: var(--ds-semantic-text-placeholder);
}

/* ── Tailles ──────────────────────────────────────────────────────── */
.ds-otp--sm .ds-otp__cell {
  width: 64px;
  min-height: 64px;
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md);
  border-radius: var(--ds-radius-md);
  font-size: 3rem;        /* 48px */
  line-height: 3.75rem;   /* 60px */
  letter-spacing: -0.96px;
}

.ds-otp--md .ds-otp__cell {
  width: 80px;
  min-height: 80px;
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-lg);
  font-size: 3rem;
  line-height: 3.75rem;
  letter-spacing: -0.96px;
}

.ds-otp--lg .ds-otp__cell {
  width: 96px;
  min-height: 96px;
  padding: var(--ds-spacing-lg) var(--ds-spacing-md);
  border-radius: var(--ds-radius-xl);
  font-size: 3.75rem;     /* 60px */
  line-height: 4.5rem;    /* 72px */
  letter-spacing: -1.2px;
}

/* ── Séparateur ───────────────────────────────────────────────────── */
.ds-otp__separator {
  font-family: var(--ds-typography-font-family-inter);
  font-weight: 500;
  color: var(--ds-semantic-text-placeholder-subtle);
  flex-shrink: 0;
}

.ds-otp--sm .ds-otp__separator { font-size: 3rem;    line-height: 3.75rem; }
.ds-otp--md .ds-otp__separator { font-size: 3rem;    line-height: 3.75rem; }
.ds-otp--lg .ds-otp__separator { font-size: 3.75rem; line-height: 4.5rem;  }

/* ── Hint ─────────────────────────────────────────────────────────── */
.ds-otp__hint {
  margin: 0;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-tertiary);
}
</style>
