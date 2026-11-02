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
        label=""
        :value="value ?? '—'"
        :unit="unit"
        :delta="delta"
        :trend="trend"
        class="ds-stat-tile__metric"
      />
    </SwapTransition>

    <div v-if="$slots.default" class="ds-stat-tile__footer">
      <slot />
    </div>
  </Card>
</template>

<style scoped>
.ds-stat-tile {
  min-width: 0;
  font-family: var(--ds-typography-font-family-poppins);
}

/*
  A tile in a row of seven is ~152px wide: one line cut « Polygones non éli… ».
  The label takes two lines before it is cut (ADR-0095), and the figure goes to
  the foot of the body, so a tile whose label wraps keeps its figure on the
  same line as its neighbours' — the row stretches every tile to one height.
*/
.ds-stat-tile :deep(.ds-card__body) {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
}

.ds-stat-tile__head {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-md);
  min-width: 0;
  margin-bottom: var(--ds-spacing-md);
}

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
.ds-stat-tile__loading { margin-top: auto; }

/* MetricValue carries its own label; the tile supplies it above instead. */
.ds-stat-tile__metric :deep(.ds-metric__label) { display: none; }

.ds-stat-tile__footer {
  margin-top: var(--ds-spacing-lg);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}
</style>
