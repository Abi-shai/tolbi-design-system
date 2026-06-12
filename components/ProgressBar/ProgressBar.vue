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
  border-radius: var(--ds-radius-full, 9999px);
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
  background-color: var(--ds-semantic-bg-tertiary);
  border-radius: var(--ds-radius-full, 9999px);
}

/* ── Fill ──────────────────────────────────────────────────────────── */
.ds-progress-bar__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 8px;
  min-width: 0;
  max-width: 100%;
  background-color: var(--ds-semantic-fg-brand-primary);
  border-radius: var(--ds-radius-full, 9999px);
  transition: width var(--ds-motion-duration-process) var(--ds-motion-easing-out);
}

/* ── Inline label ──────────────────────────────────────────────────── */
.ds-progress-bar__label {
  font-family: var(--ds-typography-font-family-inter);
  font-size: var(--ds-typography-font-size-text-sm);
  font-weight: 500;
  line-height: var(--ds-typography-line-height-text-sm);
  color: var(--ds-semantic-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Floating tooltip ──────────────────────────────────────────────── */
.ds-progress-bar__tooltip {
  position: absolute;
  right: 0;
  transform: translateX(50%);
  background-color: var(--ds-semantic-bg-primary-alt, #fff);
  border: 1px solid var(--ds-semantic-border-secondary);
  border-radius: 8px;
  padding: 8px 12px;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: var(--ds-typography-font-size-text-xs);
  font-weight: 600;
  line-height: var(--ds-typography-line-height-text-xs);
  color: var(--ds-semantic-text-secondary);
  white-space: nowrap;
  box-shadow:
    0px 4px 6px -2px rgba(16, 24, 40, 0.03),
    0px 12px 16px -4px rgba(16, 24, 40, 0.08);
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
