<script setup lang="ts">
import { computed } from 'vue'

/**
 * A trend in a line, where a chart would be too much (ADR-0100) — a card's
 * insight, a panel's figure. No axis, no grid, no point: the figure beside it
 * says the number, the line says which way it went.
 *
 * `comparison` is a second series on the **same scale**, dashed and in the
 * receding ink: what the first is read against (the control points). Without a
 * shared scale, two lines side by side would say nothing about each other.
 *
 * It is a picture, so it says itself once — `label`, the sentence a reader
 * hears (« +12 % contre +4 % pour les points de contrôle »). It is not a
 * charting engine (ADR-0006): no tooltip, no interaction; past a few dozen
 * points or one axis, it is a chart, and the engine's.
 */
interface Props {
  values: number[]
  comparison?: number[]
  /** What a reader hears instead of the line. */
  label: string
  /** The line's colour — the first categorical series unless said (charts never use brand, ADR-0016). */
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  comparison: () => [],
  color: 'var(--ds-chart-categorical-1)',
})

/* A viewBox the SVG stretches to its box (`preserveAspectRatio="none"`); the
   strokes do not stretch with it (`non-scaling-stroke`). The 2 units above and
   below keep a stroke at the extremes inside the box. */
const W = 100
const H = 32
const PAD = 2

const all = computed(() => [...props.values, ...props.comparison])
const min = computed(() => Math.min(...all.value))
const max = computed(() => Math.max(...all.value))

function path(series: number[]): string {
  if (series.length < 2) return ''
  const span = max.value - min.value || 1
  return series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * W
      const y = H - PAD - ((v - min.value) / span) * (H - 2 * PAD)
      return `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}
</script>

<template>
  <svg
    class="ds-sparkline"
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="none"
    role="img"
    :aria-label="label"
  >
    <path
      v-if="comparison.length > 1"
      class="ds-sparkline__comparison"
      :d="path(comparison)"
      vector-effect="non-scaling-stroke"
    />
    <path class="ds-sparkline__line" :d="path(values)" :style="{ stroke: color }" vector-effect="non-scaling-stroke" />
  </svg>
</template>

<style scoped>
/* The box is the caller's width and 32px tall — one `label-xl` line and change,
   so it sits under a figure without becoming a chart. */
.ds-sparkline {
  display: block;
  width: 100%;
  height: 32px;
  overflow: visible;
}

.ds-sparkline path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ds-sparkline__line {
  stroke-width: var(--ds-border-width-strong);
}

/* `--ds-chart-threshold`: the neutral of a reference line (ADR-0096). */
.ds-sparkline__comparison {
  stroke: var(--ds-chart-threshold);
  stroke-width: var(--ds-border-width-default);
  stroke-dasharray: 4 3;
}
</style>
