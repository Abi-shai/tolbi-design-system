<script setup lang="ts">
import { computed, useId } from 'vue'
import { ChartLegend, type ChartLegendItem } from '../ChartLegend'
import { Skeleton } from '../Skeleton'
import { TabPanel, Tabs, type TabsItem } from '../Tabs'

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
  /**
   * The values under the gradient, evenly spaced: the first at its start, the
   * last at its end. **Absent, with a `legend`, there is no gradient**: the map
   * is coloured by category, and the legend is its key (ADR-0129).
   */
  ticks?: string[]
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
  /**
   * The bounds are on their way (ADR-0122): the ramp is drawn — its colours are
   * the indicator's, known before any data — and the unit and the bounds are
   * placeholders. With no `ticks` and not loading, the bounds are « — »
   * (ADR-0105): nothing measured yet.
   */
  loading?: boolean
  /** Said with the title while there are no bounds. */
  emptyLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  ticks: undefined,
  unit: undefined,
  colors: () => [1, 2, 3, 4, 5].map((i) => `var(--ds-chart-sequential-${i})`),
  legend: () => [],
  metrics: () => [],
  metricsLabel: 'Indicateur affiché',
  summary: undefined,
  loading: false,
  emptyLabel: 'pas encore de mesure',
})

const metric = defineModel<string>('metric')
const current = computed(() => metric.value ?? props.metrics[0]?.value ?? '')

/* The switch is a tab list, so what it shows is its panel (ADR-0098): the
   scale of the chosen indicator. Changing indicator is a swap — `TabPanel`'s
   cross-fade, out then in at `quick` (ADR-0026) — and a reader is told which
   indicator the scale now reads. */
const tabsId = `ds-map-legend-${useId()}`

const gradient = computed(() => `linear-gradient(to right, ${props.colors.join(', ')})`)
/* A map coloured by category has no ramp: no ticks, a legend (ADR-0129). */
const categorical = computed(() => props.ticks === undefined && props.legend.length > 0)
const ticks = computed(() => props.ticks ?? [])
const empty = computed(() => !props.loading && ticks.value.length === 0)
/* Said once, as the gradient is: the title, then each entry with its figure. */
const keySaid = computed(() =>
  `${props.title} : ${props.legend.map((i) => (i.value ? `${i.label} ${i.value}` : i.label)).join(', ')}`)
const said = computed(() => {
  if (props.loading) return props.title
  if (empty.value) return `${props.title}, ${props.emptyLabel}`
  if (props.summary) return props.summary
  const range = `de ${ticks.value[0]} à ${ticks.value[ticks.value.length - 1]}`
  return `${props.title}, ${range}${props.unit ? ` ${props.unit}` : ''}`
})
</script>

<template>
  <div class="ds-map-legend" :aria-busy="loading || undefined">
    <Tabs
      v-if="metrics.length > 1"
      :id="tabsId"
      :model-value="current"
      class="ds-map-legend__metrics"
      size="xs"
      :tabs="metrics"
      :aria-label="metricsLabel"
      @update:model-value="metric = $event"
    />
    <component
      :is="metrics.length > 1 ? TabPanel : 'div'"
      v-bind="metrics.length > 1 ? { tabsId, value: current } : {}"
      class="ds-map-legend__panel"
    >
      <!-- By category: the title, then the key on the same line — the line the
           gradient would take, so a screen of each kind reads the same. -->
      <div v-if="categorical" class="ds-map-legend__scale-row" role="img" :aria-label="loading ? title : keySaid">
        <span class="ds-map-legend__title" aria-hidden="true">{{ title }}</span>
        <div v-if="loading" class="ds-map-legend__key ds-map-legend__key--pending" aria-hidden="true">
          <Skeleton v-for="i in legend.length" :key="i" width="5.5em" height="0.5rem" />
        </div>
        <ChartLegend v-else :items="legend" shape="zone" class="ds-map-legend__key" aria-hidden="true" />
      </div>
      <div v-else class="ds-map-legend__scale-row">
        <span class="ds-map-legend__title">{{ title }}</span>
        <div class="ds-map-legend__scale">
          <span v-if="loading" class="ds-map-legend__unit" aria-hidden="true"><Skeleton width="3.5em" height="0.5rem" /></span>
          <span v-else-if="unit && !empty" class="ds-map-legend__unit" aria-hidden="true">{{ unit }}</span>
          <div class="ds-map-legend__bar" role="img" :aria-label="said" :style="{ backgroundImage: gradient }" />
          <!-- Said by the bar's name; on screen, a bound sits under its place. -->
          <div class="ds-map-legend__ticks" aria-hidden="true">
            <template v-if="loading"><Skeleton v-for="i in 3" :key="i" width="2em" height="0.5rem" /></template>
            <template v-else-if="empty"><span class="ds-map-legend__none">—</span><span class="ds-map-legend__none">—</span></template>
            <span v-for="t in ticks" v-else :key="t">{{ t }}</span>
          </div>
        </div>
      </div>
    </component>
    <ChartLegend v-if="legend.length && !categorical" :items="legend" class="ds-map-legend__symbols" />
  </div>
</template>

<style scoped>
/*
  As drawn: the surface 8px around, the switch flush with it, the scale and the
  symbols each 8px further in. **`--ds-width-sm` (480px), declared**
  (ADR-0116) — the timeline's own width and the same token: on the GIS screen
  the two are centred on one axis, the legend at the top of the map and the
  timeline at its bottom, and they are **one width**, edge over edge. A width
  of content was tried: on one axis, two widths read as a mistake.
*/
.ds-map-legend {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: var(--ds-width-sm);
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
  /* The gradient has no width of its own: it takes what the switch and the
     title leave, and never less than 16rem — a ramp read, not glimpsed. */
  min-width: 16rem;
}

.ds-map-legend__unit,
.ds-map-legend__ticks {
  font: var(--ds-font-body-sm);
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
  align-items: center;
  justify-content: space-between;
  /* One line box whatever it holds, so the legend keeps its height when the
     placeholders become values. */
  min-height: 1lh;
}

/* A placeholder sits in the line box the unit will take. */
.ds-map-legend__unit {
  display: flex;
  align-items: center;
  min-height: 1lh;
}

/* What is not there yet is « — », in the receding ink (ADR-0105). */
.ds-map-legend__none {
  color: var(--ds-text-subtlest);
}

/* The key takes what the title leaves and wraps there, never under the title. */
.ds-map-legend__key {
  flex: 1 1 auto;
  min-width: 0;
}

.ds-map-legend__key--pending {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ds-spacing-md) var(--ds-spacing-xl);
  min-height: 1lh;
}

.ds-map-legend__symbols {
  padding: 0 var(--ds-spacing-md) var(--ds-spacing-md);
}
</style>
