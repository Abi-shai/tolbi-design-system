<script setup lang="ts">
interface Props {
  label: string
  cssVar: string
  px: string
  /** Fraction of the widest step in the ramp, 0–1. Drives the bar length. */
  ratio: number
  highlight?: boolean
}

withDefaults(defineProps<Props>(), { highlight: false })
</script>

<template>
  <div class="row">
    <span class="row__label">{{ label }}</span>
    <div class="row__track">
      <div
        class="row__bar"
        :class="{ 'row__bar--highlight': highlight }"
        :style="{ width: `${Math.max(ratio * 100, 1)}%` }"
      />
    </div>
    <span class="row__meta">{{ px }}</span>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--ds-semantic-border-tertiary, #f2f4f7);
}

.row__label {
  width: 9.5rem;
  font-family: monospace;
  font-size: 0.72rem;
  color: var(--ds-semantic-text-secondary, #344054);
  flex-shrink: 0;
}

.row__track {
  flex: 1;
  min-width: 0;
  background: var(--ds-semantic-bg-secondary, #f9fafb);
  border-radius: 2px;
}

.row__bar {
  height: 10px;
  border-radius: 2px;
  background: var(--ds-color-brand-500, #066938);
}

.row__bar--highlight { background: var(--ds-color-accent-400, #fac720); }

.row__meta {
  width: 4rem;
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--ds-semantic-text-quarterary, #667085);
  text-align: right;
  flex-shrink: 0;
}
</style>
