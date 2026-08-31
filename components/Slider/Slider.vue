<script setup lang="ts">
import { computed } from 'vue'

export type SliderValueDisplay = 'none' | 'bottom' | 'top-floating'

interface Props {
  modelValue?: [number, number]
  min?: number
  max?: number
  step?: number
  /** Where the current value is shown. Not a caption — that is FormField's `label`. */
  valueDisplay?: SliderValueDisplay
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [0, 100],
  min: 0,
  max: 100,
  step: 1,
  valueDisplay: 'none',
})

const emit = defineEmits<{
  'update:modelValue': [[number, number]]
}>()

const leftVal = computed(() => props.modelValue[0])
const rightVal = computed(() => props.modelValue[1])

const range = computed(() => props.max - props.min)
const leftPct = computed(() => ((leftVal.value - props.min) / range.value) * 100)
const rightPct = computed(() => ((rightVal.value - props.min) / range.value) * 100)

const fillStyle = computed(() => ({
  left: `${leftPct.value}%`,
  right: `${100 - rightPct.value}%`,
}))

// When left handle is past the midpoint it needs higher z-index so it stays grabbable
const leftZIndex = computed(() => (leftPct.value > 50 ? 4 : 3))
const rightZIndex = computed(() => (leftPct.value > 50 ? 3 : 4))

function onLeftInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  emit('update:modelValue', [Math.min(v, rightVal.value - props.step), rightVal.value])
}

function onRightInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  emit('update:modelValue', [leftVal.value, Math.max(v, leftVal.value + props.step)])
}

function display(v: number): string {
  return props.min === 0 && props.max === 100 ? `${v}%` : String(v)
}
</script>

<template>
  <div :class="['ds-slider', `ds-slider--value-${valueDisplay}`]">
    <div class="ds-slider__body">
      <template v-if="valueDisplay === 'top-floating'">
        <div class="ds-slider__tooltip-anchor" :style="{ left: `${leftPct}%` }">
          <div class="ds-slider__tooltip">{{ display(leftVal) }}</div>
        </div>
        <div class="ds-slider__tooltip-anchor" :style="{ left: `${rightPct}%` }">
          <div class="ds-slider__tooltip">{{ display(rightVal) }}</div>
        </div>
      </template>

      <div class="ds-slider__track">
        <div class="ds-slider__bg" />
        <div class="ds-slider__fill" :style="fillStyle" />
      </div>

      <input
        class="ds-slider__input"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="leftVal"
        :style="{ zIndex: leftZIndex }"
        @input="onLeftInput"
      />
      <input
        class="ds-slider__input"
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :value="rightVal"
        :style="{ zIndex: rightZIndex }"
        @input="onRightInput"
      />

      <template v-if="valueDisplay === 'bottom'">
        <div class="ds-slider__label-anchor" :style="{ left: `${leftPct}%` }">
          <span class="ds-slider__label">{{ display(leftVal) }}</span>
        </div>
        <div class="ds-slider__label-anchor" :style="{ left: `${rightPct}%` }">
          <span class="ds-slider__label">{{ display(rightVal) }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
/* ── Container ─────────────────────────────────────────────────────── */
.ds-slider {
  width: 100%;
}

/* ── Body (positioning root for all layers) ────────────────────────── */
.ds-slider__body {
  position: relative;
  height: 24px;
  overflow: visible;
}

.ds-slider--value-bottom .ds-slider__body {
  margin-bottom: 36px;
}

/* ── Track ─────────────────────────────────────────────────────────── */
.ds-slider__track {
  position: absolute;
  left: 0;
  right: 0;
  top: 8px; /* center 8px track in 24px body: (24 - 8) / 2 */
  height: 8px;
  pointer-events: none;
}

.ds-slider__bg {
  position: absolute;
  inset: 0;
  background: var(--ds-bg-neutral-strong);
  border-radius: var(--ds-radius-pill, 9999px);
}

.ds-slider__fill {
  position: absolute;
  top: 0;
  height: 8px;
  background: var(--ds-text-brand);
  border-radius: var(--ds-radius-pill, 9999px);
}

/* ── Range inputs ──────────────────────────────────────────────────── */
.ds-slider__input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  appearance: none;
  background: transparent;
  pointer-events: none;
  outline: none;
}

.ds-slider__input::-webkit-slider-runnable-track {
  height: 8px;
  background: transparent;
}

.ds-slider__input::-webkit-slider-thumb {
  appearance: none;
  pointer-events: all;
  width: 24px;
  height: 24px;
  margin-top: -8px;
  border-radius: 50%;
  background: var(--ds-bg-default);
  border: 2px solid var(--ds-bg-brand-solid);
  box-shadow: var(--ds-elevation-raised);
  cursor: grab;
  transition: border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default), box-shadow var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-slider__input::-webkit-slider-thumb:active {
  cursor: grabbing;
}

.ds-slider__input::-moz-range-track {
  height: 8px;
  background: transparent;
  border: none;
}

.ds-slider__input::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ds-bg-default);
  border: 2px solid var(--ds-bg-brand-solid);
  box-shadow: var(--ds-elevation-raised);
  cursor: grab;
}

.ds-slider__input:focus-visible::-webkit-slider-thumb {
  box-shadow: var(--ds-focus-ring-brand), var(--ds-elevation-raised);
}

/* ── Top-floating tooltip ──────────────────────────────────────────── */
.ds-slider__tooltip-anchor {
  position: absolute;
  top: 0;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 5;
}

.ds-slider__tooltip {
  position: absolute;
  bottom: 32px; /* 24px thumb height + 8px gap */
  left: 50%;
  transform: translateX(-50%);
  background: var(--ds-bg-default);
  border: 1px solid var(--ds-border-subtle);
  border-radius: 8px;
  padding: 8px 12px;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: var(--ds-font-size-body-sm);
  font-weight: 600;
  line-height: var(--ds-line-height-body-sm);
  color: var(--ds-text-default);
  white-space: nowrap;
  box-shadow: var(--ds-elevation-overlay);
}

/* ── Bottom label ──────────────────────────────────────────────────── */
.ds-slider__label-anchor {
  position: absolute;
  top: 32px; /* 24px thumb height + 8px gap */
  transform: translateX(-50%);
  pointer-events: none;
}

.ds-slider__label {
  font-family: var(--ds-typography-font-family-poppins);
  font-size: var(--ds-font-size-body-lg);
  font-weight: 500;
  line-height: var(--ds-line-height-body-lg);
  color: var(--ds-text-strong);
  white-space: nowrap;
}
</style>
