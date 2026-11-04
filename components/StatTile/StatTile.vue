<script setup lang="ts">
import { SwapTransition } from '../SwapTransition'
import { Card } from '../Card'
import { MetricValue, type MetricTrend } from '../MetricValue'
import { Badge, type BadgeTone } from '../Badge'
import { Skeleton } from '../Skeleton'

interface Props {
  label: string
  value?: string
  unit?: string
  delta?: string
  trend?: MetricTrend
  /** Short qualifier shown beside the label — `Mesuré`, `Estimé`, `Standard`. */
  tag?: string
  tagTone?: BadgeTone
  loading?: boolean
  /**
   * What the figure is measured against, right under it — « sur 40 · seuil 30 »,
   * « tCO2e » (ADR-0097). The figure stays a short number; the rest goes here.
   */
  caption?: string
}

withDefaults(defineProps<Props>(), {
  trend: 'flat',
  tagTone: 'neutral',
  loading: false,
})
</script>

<template>
  <!--
    Composes Card rather than drawing its own surface (ADR-0001). The audit that
    prompted this component counted "six tiles, four radii" — the radius is
    Card's to own, and no prop here can override it.
  -->
  <Card class="ds-stat-tile">
    <div class="ds-stat-tile__head">
      <span class="ds-stat-tile__label">{{ label }}</span>
      <Badge v-if="tag" :label="tag" :tone="tagTone" size="sm" />
    </div>

    <SwapTransition>
      <div v-if="loading" class="ds-stat-tile__loading">
        <Skeleton variant="text" width="55%" height="32px" />
      </div>

      <MetricValue
        v-else
        :value="value ?? '—'"
        :unit="unit"
        :delta="delta"
        :trend="trend"
        class="ds-stat-tile__metric"
      />
    </SwapTransition>

    <div v-if="caption || $slots.default" class="ds-stat-tile__tail">
      <p v-if="caption" class="ds-stat-tile__caption">{{ caption }}</p>
      <div v-if="$slots.default" class="ds-stat-tile__footer">
        <slot />
      </div>
    </div>
  </Card>
</template>

<style scoped>
.ds-stat-tile {
  min-width: 0;
  font-family: var(--ds-typography-font-family-poppins);
}

/*
  Three rows — the label, the figure, what it is measured against — and in a
  grid they are the **row's**, not the tile's (ADR-0097): the tile spans three
  of its parent's rows and takes them as a subgrid, so every figure of a row
  sits on one line whatever its label or its caption runs to. A label of two
  lines and a caption of one, beside a label of one and a caption of two, keep
  their figures level — `margin-top: auto` (0.83) did that for the label only,
  and a two-line caption lifted its figure off the line.

  Outside a grid, `subgrid` falls back to plain rows: the tile on its own reads
  label, figure, caption, top to bottom.
*/
/* Two classes: `Card`'s own `display: flex` must lose to this one. */
.ds-card.ds-stat-tile {
  display: grid;
  grid-row: span 3;
  grid-template-rows: subgrid;
  row-gap: 0;
}

.ds-stat-tile :deep(.ds-card__body) {
  display: grid;
  grid-row: 1 / -1;
  grid-template-rows: subgrid;
  row-gap: 0;
}

.ds-stat-tile__head {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

/* A tile in a row of seven is ~152px wide: two lines before the cut (ADR-0095). */
.ds-stat-tile__label {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
}

.ds-stat-tile__metric,
.ds-stat-tile__loading { margin-top: var(--ds-spacing-md); }

.ds-stat-tile__tail {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
  margin-top: var(--ds-spacing-xs);
  min-width: 0;
}

/* `text-subtle`, not the drawing's `subtlest`: on a raised dark ground that is 4.18:1 (ADR-0048). */
.ds-stat-tile__caption {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

/* MetricValue carries its own label; the tile supplies it above instead. */
.ds-stat-tile__metric :deep(.ds-metric__label) { display: none; }

.ds-stat-tile__footer {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}
</style>
