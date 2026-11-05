<script setup lang="ts">
import { SwapTransition } from '../SwapTransition'
import { computed } from 'vue'
import { Spinner } from '../Spinner'
import { EmptyState } from '../EmptyState'

/**
 * The frame around a chart (ADR-0006): title, description, legend, axis ticks,
 * grid, loading and empty states — **everything but the data**. The plot comes
 * from the product's charting engine, in the default slot; the system ships no
 * engine.
 *
 * **Not `Sparkline`, and the two do not nest.** Reach for `ChartFrame` when the
 * reader must *read values off* the chart — axes, a legend, a tooltip from the
 * engine. Reach for `Sparkline` when a figure is already said beside it and the
 * line only says *which way it went*: no axis, no title, no interaction. A
 * sparkline in a frame grows axes and stops being one; a frame that drew its own
 * line would be an engine. The family: `ChartLegend` and `ChartTooltip` go with
 * a `ChartFrame`; `Sparkline` stands alone, beside a figure (`ProjectCard`'s
 * `#insight`, a `StatTile`); `ColorScale` and `MapTooltip` are a map's.
 */
interface Props {
  title?: string
  /** One sentence under the title — what is measured, the threshold it is held to (ADR-0096). */
  description?: string
  /** Height of the plot area. The frame never guesses it from content. */
  height?: number | string
  /** Left-hand tick labels, top to bottom. */
  yTicks?: string[]
  /** Bottom labels, left to right. */
  xTicks?: string[]
  /** Horizontal grid lines behind the plot. */
  grid?: boolean
  loading?: boolean
  /** Renders the empty state instead of the plot. */
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: 240,
  yTicks: () => [],
  xTicks: () => [],
  grid: true,
  loading: false,
  empty: false,
  emptyTitle: 'Aucune donnée sur la période',
})

const plotHeight = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
)

/*
 * One grid line per y tick keeps the rules and the labels on the same rhythm.
 * With no ticks, fall back to four bands, which reads as a chart rather than an
 * empty box.
 */
const gridLines = computed(() => (props.yTicks.length ? props.yTicks.length : 5))
</script>

<template>
  <figure class="ds-chart-frame">
    <figcaption v-if="title || description || $slots.legend" class="ds-chart-frame__head">
      <div v-if="title || description" class="ds-chart-frame__heading">
        <span v-if="title" class="ds-chart-frame__title">{{ title }}</span>
        <span v-if="description" class="ds-chart-frame__description">{{ description }}</span>
      </div>
      <div v-if="$slots.legend" class="ds-chart-frame__legend">
        <slot name="legend" />
      </div>
    </figcaption>

    <div class="ds-chart-frame__body">
      <div v-if="yTicks.length" class="ds-chart-frame__y-axis" aria-hidden="true">
        <span v-for="t in yTicks" :key="t" class="ds-chart-frame__tick">{{ t }}</span>
      </div>

      <div class="ds-chart-frame__plot-col">
        <div class="ds-chart-frame__plot" :style="{ height: plotHeight }">
          <div v-if="grid && !empty" class="ds-chart-frame__grid" aria-hidden="true">
            <span v-for="n in gridLines" :key="n" class="ds-chart-frame__grid-line" />
          </div>

          <SwapTransition>
            <div v-if="loading" class="ds-chart-frame__overlay">
              <Spinner :size="24" label="Chargement du graphique" />
            </div>

            <EmptyState
              v-else-if="empty"
              size="sm"
              icon="chart-line"
              :title="emptyTitle"
              :description="emptyDescription"
              class="ds-chart-frame__empty"
            />

            <!-- The plot itself. The design system supplies no renderer. -->
            <div v-else class="ds-chart-frame__slot">
              <slot />
            </div>
          </SwapTransition>
        </div>

        <div v-if="xTicks.length && !empty" class="ds-chart-frame__x-axis" aria-hidden="true">
          <span v-for="t in xTicks" :key="t" class="ds-chart-frame__tick">{{ t }}</span>
        </div>
      </div>
    </div>
  </figure>
</template>

<style scoped>
.ds-chart-frame {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
  margin: 0;
  min-width: 0;
  font-family: var(--ds-typography-font-family-poppins);
}

.ds-chart-frame__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--ds-spacing-xl);
  flex-wrap: wrap;
}

.ds-chart-frame__heading {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  min-width: 0;
}

.ds-chart-frame__title {
  font: var(--ds-font-heading-md);
  color: var(--ds-text-strong);
}

.ds-chart-frame__description {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-chart-frame__body {
  display: flex;
  gap: var(--ds-spacing-lg);
  min-width: 0;
}

.ds-chart-frame__plot-col {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  flex: 1 1 auto;
  min-width: 0;
}

.ds-chart-frame__plot {
  position: relative;
  min-width: 0;
}

/* ── Axes ─────────────────────────────────────────────────────────── */
.ds-chart-frame__y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  flex-shrink: 0;
  /* Aligns the first tick with the first grid line rather than the box top. */
  transform: translateY(-0.5em);
}

.ds-chart-frame__x-axis {
  display: flex;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

.ds-chart-frame__tick {
  font: var(--ds-font-label-xs);
  color: var(--ds-text-subtlest);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ── Grid ─────────────────────────────────────────────────────────── */
.ds-chart-frame__grid {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.ds-chart-frame__grid-line {
  height: 1px;
  background-color: var(--ds-border-subtlest);
}

/* ── States ───────────────────────────────────────────────────────── */
.ds-chart-frame__slot,
.ds-chart-frame__overlay {
  position: absolute;
  inset: 0;
}

.ds-chart-frame__overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ds-text-subtlest);
}

.ds-chart-frame__empty { padding-block: var(--ds-spacing-xl); }
</style>
