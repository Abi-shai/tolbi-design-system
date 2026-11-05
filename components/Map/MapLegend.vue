<script setup lang="ts">
import { computed } from 'vue'
import { ChartLegend, type ChartLegendItem } from '../ChartLegend'
import { Tabs, type TabsItem } from '../Tabs'

/**
 * The legend of a map in full GIS mode (ADR-0102, Figma « Indicateur »
 * `3670:39635`): **what the colours on the map mean** — the indicator's name,
 * its continuous scale (a gradient, its unit, its bounds) — and what the
 * symbols on it are. When the screen offers several indicators, the legend
 * **switches between them** (`metrics` + `v-model:metric`, `Tabs xs`): the
 * switch sits above the scale it changes, so the reader never looks for the
 * key to what they just chose. Which indicators exist is the module's; the
 * product answers a switch with another `title`, `unit`, `ticks` and map.
 *
 * It was `ColorScale` for an afternoon — a name for one of its parts: the
 * gradient is what it draws, the legend is what it is, and the switch is not a
 * scale at all. `ChartLegend` names a chart's series; `MapLegend` says how to
 * read a map.
 *
 * The ramp is `--ds-chart-sequential-*` (ADR-0096) unless the caller gives its
 * own: lightness falls at every step, so it reads in every vision. A gradient
 * is not text, so it says itself once — « Carbone, de 0 t à 16 t CO2e/ha » —
 * and the bounds are not read a second time.
 *
 * Its own surface, as drawn — a map's instrument, like `MapNavigator`:
 * `bg-default`, `border-subtle`, `elevation-raised`, 8px around.
 */
interface Props {
  title: string
  /** The values under the gradient, evenly spaced: the first at its start, the last at its end. */
  ticks: string[]
  /** Above the gradient's end — `CO2e/ha`. Said with the bounds to a reader. */
  unit?: string
  /** The ramp, low to high. Any CSS colour — pass tokens. */
  colors?: string[]
  /** The symbols drawn on the map — `ChartLegend`'s shapes (ADR-0096). */
  legend?: ChartLegendItem[]
  /** The indicators the map can show. Two or more draw the switch. */
  metrics?: TabsItem[]
  /** The switch's name. */
  metricsLabel?: string
  /** What a reader hears for the gradient. Defaults to « title, de first à last unit ». */
  summary?: string
}

const props = withDefaults(defineProps<Props>(), {
  unit: undefined,
  colors: () => [1, 2, 3, 4, 5].map((i) => `var(--ds-chart-sequential-${i})`),
  legend: () => [],
  metrics: () => [],
  metricsLabel: 'Indicateur affiché',
  summary: undefined,
})

const metric = defineModel<string>('metric')

const gradient = computed(() => `linear-gradient(to right, ${props.colors.join(', ')})`)
const said = computed(() => {
  if (props.summary) return props.summary
  const range = `de ${props.ticks[0]} à ${props.ticks[props.ticks.length - 1]}`
  return `${props.title}, ${range}${props.unit ? ` ${props.unit}` : ''}`
})
</script>

<template>
  <div class="ds-map-legend">
    <Tabs
      v-if="metrics.length > 1"
      :model-value="metric ?? metrics[0].value"
      class="ds-map-legend__metrics"
      size="xs"
      :tabs="metrics"
      :aria-label="metricsLabel"
      @update:model-value="metric = $event"
    />
    <div class="ds-map-legend__scale-row">
      <span class="ds-map-legend__title">{{ title }}</span>
      <div class="ds-map-legend__scale">
        <span v-if="unit" class="ds-map-legend__unit" aria-hidden="true">{{ unit }}</span>
        <div class="ds-map-legend__bar" role="img" :aria-label="said" :style="{ backgroundImage: gradient }" />
        <!-- Said by the bar's name; on screen, a bound sits under its place. -->
        <div class="ds-map-legend__ticks" aria-hidden="true">
          <span v-for="t in ticks" :key="t">{{ t }}</span>
        </div>
      </div>
    </div>
    <ChartLegend v-if="legend.length" :items="legend" class="ds-map-legend__symbols" />
  </div>
</template>

<style scoped>
/*
  As drawn: the surface 8px around, the switch flush with it, the scale and the
  symbols each 8px further in. **480px, declared** (ADR-0103) — the timeline's
  own width: on the GIS screen the two are centred on one axis, the legend at
  the top of the map and the timeline at its bottom.
*/
.ds-map-legend {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 30rem;
  max-width: 100%;
  padding: var(--ds-spacing-md);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-raised);
}

/* The name at the start, the scale beside it, 16px apart: one line to read. */
.ds-map-legend__scale-row {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xl);
  padding: var(--ds-spacing-md);
}

.ds-map-legend__title {
  flex: none;
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
  white-space: nowrap;
}

.ds-map-legend__scale {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--ds-spacing-xs);
  min-width: 0;
}

.ds-map-legend__unit,
.ds-map-legend__ticks {
  font: var(--ds-font-label-xs);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
}

/* 8px, read rather than glanced at; the hairline keeps the light end on white
   (`border-inset`, ChartLegend's rule). */
.ds-map-legend__bar {
  align-self: stretch;
  height: 8px;
  border-radius: var(--ds-radius-inner-sm);
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-inset);
}

/* The first bound starts at the bar's start, the last ends at its end. */
.ds-map-legend__ticks {
  display: flex;
  align-self: stretch;
  justify-content: space-between;
}

.ds-map-legend__symbols {
  padding: 0 var(--ds-spacing-md) var(--ds-spacing-md);
}
</style>
