<script setup lang="ts">
import { Badge, type BadgeTone } from '../Badge'

export interface ChartTooltipSeries {
  label: string
  value?: string
  /** Any CSS colour. Pass a semantic token, not a literal. */
  color?: string
}

interface Props {
  /** What is being pointed at — usually a formatted date. */
  title?: string
  /** Short qualifier on the reading: `Mesuré`, `Estimé`. */
  tag?: string
  tagTone?: BadgeTone
  /** The hero. A tooltip has one headline figure, not a table of them. */
  value?: string
  unit?: string
  series?: ChartTooltipSeries[]
}

withDefaults(defineProps<Props>(), {
  tagTone: 'neutral',
  series: () => [],
})
</script>

<template>
  <!--
    Presentation only: no positioning, no pointer tracking, no data. The chart
    engine decides where this goes. Every colour comes from a token, which is
    the one thing the pattern this replaces got wrong — its palette was
    entirely hard-coded.
  -->
  <div class="ds-chart-tooltip" role="tooltip">
    <div v-if="title || tag" class="ds-chart-tooltip__head">
      <span v-if="title" class="ds-chart-tooltip__title">{{ title }}</span>
      <Badge v-if="tag" :label="tag" :tone="tagTone" size="sm" />
    </div>

    <div v-if="value" class="ds-chart-tooltip__value">
      {{ value }}<span v-if="unit" class="ds-chart-tooltip__unit">{{ unit }}</span>
    </div>

    <ul v-if="series.length" class="ds-chart-tooltip__series">
      <li v-for="s in series" :key="s.label" class="ds-chart-tooltip__serie">
        <span
          class="ds-chart-tooltip__swatch"
          :style="{ backgroundColor: s.color ?? 'var(--ds-text-brand)' }"
          aria-hidden="true"
        />
        <span class="ds-chart-tooltip__serie-label">{{ s.label }}</span>
        <span v-if="s.value" class="ds-chart-tooltip__serie-value">{{ s.value }}</span>
      </li>
    </ul>

    <slot />
  </div>
</template>

<style scoped>
.ds-chart-tooltip {
  /*
   * No semantic token fits: the widths ramp starts at 320px, and reaching for
   * --ds-space-* would mean consuming a raw primitive. Declared here so the
   * measure is one named knob a caller can override, not a magic number.
   */
  --tooltip-min-width: 10rem;
  --tooltip-max-width: 16rem;

  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  min-width: var(--tooltip-min-width);
  max-width: var(--tooltip-max-width);
  padding: var(--ds-spacing-lg);
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-lg);
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-overlay);
  font-family: var(--ds-typography-font-family-poppins);
}

.ds-chart-tooltip__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
}

.ds-chart-tooltip__title {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
  white-space: nowrap;
}

.ds-chart-tooltip__value {
  font: var(--ds-font-heading-xl);
  letter-spacing: var(--ds-letter-spacing-heading-xl);
  color: var(--ds-text-strong);
  font-variant-numeric: tabular-nums;
}

.ds-chart-tooltip__unit {
  margin-left: 0.25em;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-chart-tooltip__series {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-chart-tooltip__serie {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  font: var(--ds-font-body-sm);
}

.ds-chart-tooltip__swatch {
  width: 8px;
  height: 8px;
  border-radius: var(--ds-radius-pill);
  flex-shrink: 0;
}

.ds-chart-tooltip__serie-label {
  color: var(--ds-text-default);
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-chart-tooltip__serie-value {
  color: var(--ds-text-strong);
  font-weight: var(--ds-font-weight-label-md);
  font-variant-numeric: tabular-nums;
}
</style>
