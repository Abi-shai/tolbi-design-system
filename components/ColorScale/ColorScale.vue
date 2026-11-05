<script setup lang="ts">
import { computed } from 'vue'
import { ChartLegend, type ChartLegendItem } from '../ChartLegend'

/**
 * How a magnitude is coloured on a map, and what the symbols on it are
 * (ADR-0100, track A of the ARR board): the title above, a **continuous**
 * gradient — the index is continuous, so steps would invent thresholds it does
 * not have — its values under it, and the key of the symbols below.
 *
 * The ramp is `--ds-chart-sequential-*` (ADR-0096) unless the caller gives its
 * own: lightness falls at every step, so the scale reads in every vision. A
 * gradient is not text, so the scale says itself once to a reader — « Indice
 * de stock, de 0,30 à 0,60 » — and the ticks are not read a second time.
 */
interface Props {
  title: string
  /** The values under the gradient, evenly spaced: the first at its start, the last at its end. */
  ticks: string[]
  /** The ramp, low to high. Any CSS colour — pass tokens. */
  colors?: string[]
  /** The symbols drawn on the map — `ChartLegend`'s shapes (ADR-0096). */
  legend?: ChartLegendItem[]
  /** What a reader hears for the gradient. Defaults to « title, de first à last ». */
  summary?: string
}

const props = withDefaults(defineProps<Props>(), {
  colors: () => [1, 2, 3, 4, 5].map((i) => `var(--ds-chart-sequential-${i})`),
  legend: () => [],
  summary: undefined,
})

const gradient = computed(() => `linear-gradient(to right, ${props.colors.join(', ')})`)
const said = computed(
  () => props.summary ?? `${props.title}, de ${props.ticks[0]} à ${props.ticks[props.ticks.length - 1]}`,
)
</script>

<template>
  <div class="ds-color-scale">
    <span class="ds-color-scale__title">{{ title }}</span>
    <div class="ds-color-scale__ramp">
      <div class="ds-color-scale__bar" role="img" :aria-label="said" :style="{ backgroundImage: gradient }" />
      <!-- Said by the bar's name; on screen, a tick sits under its place. -->
      <div class="ds-color-scale__ticks" aria-hidden="true">
        <span v-for="t in ticks" :key="t">{{ t }}</span>
      </div>
    </div>
    <ChartLegend v-if="legend.length" :items="legend" class="ds-color-scale__legend" />
  </div>
</template>

<style scoped>
.ds-color-scale {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

.ds-color-scale__title {
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
}

.ds-color-scale__ramp {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
}

/* 8px: the scale is read, not glanced at like a share bar's 6px. The hairline
   keeps the light end on a white panel (`border-inset`, ChartLegend's rule). */
.ds-color-scale__bar {
  height: 8px;
  border-radius: var(--ds-radius-pill);
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-inset);
}

/* The first tick starts at the bar's start, the last ends at its end, the
   others centre on their place. */
.ds-color-scale__ticks {
  display: flex;
  justify-content: space-between;
  font: var(--ds-font-label-xs);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
}
</style>
