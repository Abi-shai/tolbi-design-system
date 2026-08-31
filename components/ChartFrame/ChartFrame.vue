<script setup lang="ts">
import { computed } from 'vue'
import { Spinner } from '../Spinner'
import { EmptyState } from '../EmptyState'

interface Props {
  title?: string
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
    <figcaption v-if="title || $slots.legend" class="ds-chart-frame__head">
      <span v-if="title" class="ds-chart-frame__title">{{ title }}</span>
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

.ds-chart-frame__title {
  font-size: var(--ds-font-size-heading-md);
  line-height: var(--ds-line-height-heading-md);
  font-weight: var(--ds-font-weight-heading-md);
  color: var(--ds-text-strong);
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
  font-size: var(--ds-font-size-label-xs);
  line-height: var(--ds-line-height-label-xs);
  font-weight: var(--ds-font-weight-label-xs);
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
