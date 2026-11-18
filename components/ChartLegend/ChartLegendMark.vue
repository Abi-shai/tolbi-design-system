<script setup lang="ts">
import { computed } from 'vue'
import MapGlyphMark from '../Map/MapGlyphMark.vue'
import type { ChartLegendShape } from './ChartLegend.vue'

/**
 * One legend mark (ADR-0226) — what `ChartLegend` draws before each label,
 * taken out so a map's key (`MapLegendPanel`) draws **the same marks** rather
 * than its own (ADR-0001). Internal. The glyph shapes draw the map's own glyph
 * (ADR-0192); the others are CSS, their colour the caller's.
 */
interface Props {
  shape: ChartLegendShape
  /** The series' colour. A glyph without one takes the legend's ramp middle. */
  color?: string
  /** A glyph's box: 20 in a row, 24 in `columns`. */
  glyphSize?: number
  /**
   * `md` — the marks a step up, for a key read from a distance (ADR-0227):
   * a fill and a ring 14, a point 8, a zone 18 × 14, a dot and a circle 12,
   * a line 20.
   */
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), { color: undefined, glyphSize: 20, size: 'sm' })

/* A map glyph's family, or nothing: the glyph is drawn, the other shapes are CSS. */
const family = computed(() =>
  props.shape === 'glyph-project' ? 'project' : props.shape === 'glyph-control' ? 'control' : props.shape === 'glyph-monitored' ? 'monitored' : null,
)
</script>

<template>
  <MapGlyphMark
    v-if="family"
    class="ds-chart-legend__glyph"
    :family="family"
    :color="color ?? 'var(--chart-legend-glyph, var(--ds-chart-sequential-3))'"
    :size="glyphSize"
  />
  <span
    v-else
    class="ds-chart-legend__mark"
    :class="[`ds-chart-legend__mark--${shape}`, { 'ds-chart-legend__mark--md': size === 'md' }]"
    :style="{ '--chart-legend-mark': color }"
    aria-hidden="true"
  />
</template>

<style scoped>
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
/* A ring is an outline and nothing inside it — a perimeter, a buffer (ADR-0226). */
.ds-chart-legend__mark--ring {
  width: 10px;
  height: 10px;
  border-radius: var(--ds-radius-pill);
  background: none;
  box-shadow: inset 0 0 0 var(--ds-border-width-strong) var(--chart-legend-mark);
}


/* A step up (ADR-0227): the same shapes, drawn for a key read from a distance. */
.ds-chart-legend__mark--md.ds-chart-legend__mark--dot,
.ds-chart-legend__mark--md.ds-chart-legend__mark--circle { width: 12px; height: 12px; }
.ds-chart-legend__mark--md.ds-chart-legend__mark--square { width: 14px; height: 14px; border-radius: 2px; } /* token-lint-disable no-raw-radius — a map symbol's corner, drawn at 14px */
.ds-chart-legend__mark--md.ds-chart-legend__mark--ring { width: 14px; height: 14px; }
.ds-chart-legend__mark--md.ds-chart-legend__mark--point { width: 8px; height: 8px; margin-inline: 3px; }
.ds-chart-legend__mark--md.ds-chart-legend__mark--zone { width: 18px; height: 14px; border-radius: 3px; } /* token-lint-disable no-raw-radius — the zone symbol's corner, as drawn on the map */
.ds-chart-legend__mark--md:is(.ds-chart-legend__mark--line, .ds-chart-legend__mark--dashed) { width: 20px; }
</style>
