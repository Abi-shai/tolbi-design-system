<script setup lang="ts">
import { computed } from 'vue'

export type ProgressBarLabel = 'none' | 'right' | 'bottom' | 'top-floating' | 'bottom-floating'

interface Props {
  value?: number
  label?: ProgressBarLabel
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  label: 'none',
})

const clamped = computed(() => Math.min(100, Math.max(0, props.value)))
const pct = computed(() => `${clamped.value}%`)
const hasInlineLabel = computed(() => props.label === 'right' || props.label === 'bottom')
const hasFloatingLabel = computed(() => props.label === 'top-floating' || props.label === 'bottom-floating')
</script>

<template>
  <div :class="['ds-progress-bar', `ds-progress-bar--label-${label}`]">
    <div class="ds-progress-bar__track">
      <div class="ds-progress-bar__bg" />
      <div class="ds-progress-bar__fill" :style="{ width: pct }">
        <div
          v-if="hasFloatingLabel"
          :class="['ds-progress-bar__tooltip', `ds-progress-bar__tooltip--${label === 'top-floating' ? 'top' : 'bottom'}`]"
        >
          {{ pct }}
        </div>
      </div>
    </div>
    <span v-if="hasInlineLabel" class="ds-progress-bar__label">{{ pct }}</span>
  </div>
</template>

<style scoped>
.ds-progress-bar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.ds-progress-bar--label-bottom {
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.ds-progress-bar--label-top-floating,
.ds-progress-bar--label-bottom-floating {
  flex-direction: column;
  gap: 0;
}

/* ── Track ─────────────────────────────────────────────────────────── */
.ds-progress-bar__track {
  position: relative;
  height: 8px;
  flex: 1 0 0;
  border-radius: var(--ds-radius-pill, 9999px);
  overflow: visible;
}

.ds-progress-bar--label-bottom .ds-progress-bar__track,
.ds-progress-bar--label-top-floating .ds-progress-bar__track,
.ds-progress-bar--label-bottom-floating .ds-progress-bar__track {
  flex: none;
  width: 100%;
}

/* ── Background ────────────────────────────────────────────────────── */
.ds-progress-bar__bg {
  position: absolute;
  inset: 0;
  background-color: var(--ds-bg-neutral);
  border-radius: var(--ds-radius-pill, 9999px);
}

/* ── Fill ──────────────────────────────────────────────────────────── */
.ds-progress-bar__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 8px;
  min-width: 0;
  max-width: 100%;
  background-color: var(--ds-text-brand);
  border-radius: var(--ds-radius-pill, 9999px);
  transition: width var(--ds-motion-duration-process) var(--ds-motion-easing-out);
}

/* ── Inline label ──────────────────────────────────────────────────── */
.ds-progress-bar__label {
  font: var(--ds-font-label-lg);
  color: var(--ds-text-default);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Floating tooltip ──────────────────────────────────────────────── */
.ds-progress-bar__tooltip {
  position: absolute;
  right: 0;
  transform: translateX(50%);
  background-color: var(--ds-bg-default);
  border: 1px solid var(--ds-border-subtle);
  border-radius: 8px;
  padding: 8px 12px;
  font: var(--ds-font-label-md);
  color: var(--ds-text-default);
  white-space: nowrap;
  box-shadow: var(--ds-elevation-overlay);
  pointer-events: none;
  z-index: 1;
}

.ds-progress-bar__tooltip--top {
  bottom: calc(100% + 8px);
}

.ds-progress-bar__tooltip--bottom {
  top: calc(100% + 8px);
}
</style>
