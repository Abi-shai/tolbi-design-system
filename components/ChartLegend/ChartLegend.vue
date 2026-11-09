<script setup lang="ts">
export interface ChartLegendItem {
  /** Stable key, also emitted on toggle. */
  key: string
  label: string
  color?: string
  /** Dimmed when false — for a series the reader has switched off. */
  active?: boolean
  /** Optional figure shown after the label. */
  value?: string
  /** This entry's mark, when it is not the legend's — a map's key mixes them (ADR-0096). */
  shape?: ChartLegendShape
}

/**
 * The mark says what kind of thing the series is drawn as, so a legend whose
 * series are drawn differently names each one (ADR-0096):
 * - `dot` a series' colour; `line` a line; `dashed` a dashed line — a
 *   comparison or a threshold;
 * - `square`, `circle`, `point` the symbols a map draws — a project point, a
 *   control point, a reserve point;
 * - `zone` an area: its colour as the edge over a tint of it.
 */
export type ChartLegendShape = 'dot' | 'line' | 'dashed' | 'square' | 'circle' | 'point' | 'zone'

/**
 * `horizontal` wraps beside a chart. `vertical` is a list — the legend set on a
 * map, in a `MapPanel` (ADR-0087): one entry per row, the figure at its end in
 * the receding ink, a count read after its label.
 */
/**
 * `columns` — a key that is read, not scanned (ADR-0138): each entry a column
 * of its own, four to a row, equal widths, centred — its mark in a 16px box,
 * its figure (`value`) in `label-xl-strong`, its name under it in `label-md`.
 * A map legend's unfolded symbols: « 40 / Point du projet ».
 */
export type ChartLegendOrientation = 'horizontal' | 'vertical' | 'columns'

interface Props {
  items?: ChartLegendItem[]
  shape?: ChartLegendShape
  /** Makes each entry a button that emits `toggle`. */
  interactive?: boolean
  orientation?: ChartLegendOrientation
}

withDefaults(defineProps<Props>(), {
  items: () => [],
  shape: 'dot',
  interactive: false,
  orientation: 'horizontal',
})

defineEmits<{ toggle: [key: string] }>()

/*
 * A series with no colour falls back to the categorical palette by position,
 * never to brand — ADR-0016: charts never use brand, which is interactive-only.
 *
 * By position rather than to a fixed step, because the palette is ordered by
 * measured ΔE: the first N entries are the most distinguishable, which is the
 * whole reason ADR-0016 ordered it that way. Defaulting every colourless series
 * to the same step would paint them identically and stop the legend doing its
 * one job.
 *
 * Wraps at 7. ADR-0016 puts the comfortable ceiling at five and says to
 * aggregate beyond it — that is the caller's decision, and wrapping is a less
 * bad failure than an undefined custom property.
 */
const CATEGORICAL_STEPS = 7

function seriesColor(color: string | undefined, index: number): string {
  return color ?? `var(--ds-chart-categorical-${(index % CATEGORICAL_STEPS) + 1})`
}
</script>

<template>
  <ul class="ds-chart-legend" :class="`ds-chart-legend--${orientation}`">
    <li v-for="(item, i) in items" :key="item.key" class="ds-chart-legend__item">
      <!--
        A real button when interactive, so toggling a series is reachable by
        keyboard and its state is announced.
      -->
      <component
        :is="interactive ? 'button' : 'span'"
        :type="interactive ? 'button' : undefined"
        :aria-pressed="interactive ? item.active !== false : undefined"
        class="ds-chart-legend__entry"
        :class="{ 'ds-chart-legend__entry--off': item.active === false }"
        @click="interactive && $emit('toggle', item.key)"
      >
        <span
          class="ds-chart-legend__mark"
          :class="`ds-chart-legend__mark--${item.shape ?? shape}`"
          :style="{ '--chart-legend-mark': seriesColor(item.color, i) }"
          aria-hidden="true"
        />
        <span class="ds-chart-legend__label">{{ item.label }}</span>
        <span v-if="item.value" class="ds-chart-legend__value">{{ item.value }}</span>
      </component>
    </li>
  </ul>
</template>

<style scoped>
.ds-chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-spacing-md) var(--ds-spacing-xl);
  margin: 0;
  padding: 0;
  list-style: none;
  font-family: var(--ds-typography-font-family-poppins);
}

/* A flex item, not a line box: an inline-flex entry takes its baseline from its
   first child — the mark — so a 5px point or a 0-high dash dropped its label. */
.ds-chart-legend__item { display: flex; min-width: 0; }

.ds-chart-legend__entry {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  border-radius: var(--ds-radius-inner-sm);
  transition: opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

button.ds-chart-legend__entry { cursor: pointer; }

button.ds-chart-legend__entry:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

/* Dim the whole entry, mark included, so "off" is unmistakable. */
.ds-chart-legend__entry--off { opacity: 0.4; }

/* The series colour is the caller's, so it can be the ground's own — a white
   series on a white card had no edge at all. The avatar's hairline is drawn
   for exactly that: translucent, so it darkens a light swatch's edge in light
   mode, lightens a dark one's in dark, and leaves a saturated one as it is.
   Inset, over the colour, so the mark keeps its size. */
.ds-chart-legend__mark {
  flex-shrink: 0;
  background-color: var(--chart-legend-mark);
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-inset);
}
.ds-chart-legend__mark--dot    { width: 8px; height: 8px; border-radius: var(--ds-radius-pill); }
.ds-chart-legend__mark--line   { width: 14px; height: 3px; border-radius: var(--ds-radius-pill); }
.ds-chart-legend__mark--square { width: 8px; height: 8px; border-radius: 1px; } /* token-lint-disable no-raw-radius — a map symbol's corner, drawn at 8px, not a surface's radius */
/* A circle is a symbol, not a swatch: it is drawn ringed, as on the map. */
.ds-chart-legend__mark--circle { width: 8px; height: 8px; border-radius: var(--ds-radius-pill); box-shadow: 0 0 0 var(--ds-border-width-default) var(--ds-bg-default), inset 0 0 0 var(--ds-border-width-default) var(--ds-border-inset); }
.ds-chart-legend__mark--point  { width: 5px; height: 5px; border-radius: var(--ds-radius-pill); margin-inline: 1.5px; }
/* Lines carry no hairline: they are the drawing itself, not a swatch of it. */
.ds-chart-legend__mark--dashed {
  width: 14px;
  height: 0;
  background: none;
  box-shadow: none;
  border-top: var(--ds-border-width-strong) dashed var(--chart-legend-mark);
}
.ds-chart-legend__mark--zone {
  width: 14px;
  height: 10px;
  border-radius: 2px; /* token-lint-disable no-raw-radius — the zone symbol's corner, as drawn on the map */
  background-color: color-mix(in srgb, var(--chart-legend-mark) 12%, transparent);
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--chart-legend-mark);
}

.ds-chart-legend__label {
  /* 12px, 14 in a reading panel (ADR-0132). */
  font: var(--reading-secondary-font, var(--ds-font-body-sm));
  color: var(--ds-text-default);
  white-space: nowrap;
}

.ds-chart-legend__value {
  font: var(--reading-secondary-font-emphasis, var(--ds-font-body-sm-emphasis));
  color: var(--ds-text-strong);
  font-variant-numeric: tabular-nums;
}

/* ── Vertical: a list (ADR-0087) ──────────────────────────────────── */
.ds-chart-legend--vertical {
  flex-direction: column;
  flex-wrap: nowrap;
  gap: var(--ds-spacing-sm);
}

.ds-chart-legend--vertical .ds-chart-legend__entry {
  display: flex;
  width: 100%;
}

.ds-chart-legend--vertical .ds-chart-legend__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-chart-legend--vertical .ds-chart-legend__value {
  font: var(--ds-font-body-sm);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
}

/* ── Columns: a key that is read (ADR-0138) ───────────────────────── */
.ds-chart-legend--columns {
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--ds-spacing-lg) 0;
}

.ds-chart-legend--columns .ds-chart-legend__item {
  flex: 0 0 25%;
  justify-content: center;
}

.ds-chart-legend--columns .ds-chart-legend__entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-xs);
  min-width: 0;
  padding-inline: var(--ds-spacing-xs);
  text-align: center;
}

/* The mark at its own size, centred in a 16px box: the shapes keep their
   proportions, and every column starts its words on one line. */
.ds-chart-legend--columns .ds-chart-legend__mark {
  margin-block: calc((16px - var(--chart-legend-mark-h, 8px)) / 2);
}

.ds-chart-legend--columns .ds-chart-legend__mark--zone { --chart-legend-mark-h: 10px; }
.ds-chart-legend--columns .ds-chart-legend__mark--line { --chart-legend-mark-h: 3px; }
.ds-chart-legend--columns .ds-chart-legend__mark--point { --chart-legend-mark-h: 5px; }
.ds-chart-legend--columns .ds-chart-legend__mark--dashed { --chart-legend-mark-h: 2px; }

.ds-chart-legend--columns .ds-chart-legend__value {
  order: 1;
  font: var(--ds-font-label-xl-strong);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
}

.ds-chart-legend--columns .ds-chart-legend__label {
  order: 2;
  max-width: 100%;
  overflow: hidden;
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
  text-overflow: ellipsis;
}
</style>
