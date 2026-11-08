<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { SwapTransition } from '../SwapTransition'
import { Tooltip } from '../Tooltip'
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

/* The label holds two lines; cut, it is given whole in a tooltip — only when
   cut, or a whole label would be said twice (ProjectCard's title, ADR-0109). */
const labelEl = ref<HTMLElement | null>(null)
const labelCut = ref(false)
let ro: ResizeObserver | null = null
const measure = () => {
  const el = labelEl.value
  labelCut.value = !!el && el.scrollHeight > el.clientHeight + 1
}
onMounted(() => {
  measure()
  ro = new ResizeObserver(measure)
  if (labelEl.value) ro.observe(labelEl.value)
  document.fonts?.ready.then(measure)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <!--
    Composes Card rather than drawing its own surface (ADR-0001). The audit that
    prompted this component counted "six tiles, four radii" — the radius is
    Card's to own, and no prop here can override it.
  -->
  <Card class="ds-stat-tile">
    <div class="ds-stat-tile__head">
      <Tooltip :title="label" :disabled="!labelCut" placement="top-start" class="ds-stat-tile__label-tip">
        <span ref="labelEl" class="ds-stat-tile__label">{{ label }}</span>
      </Tooltip>
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
  /* At the foot of its row (ADR-0131, track A of `3872:1427`): beside a label of
     two lines, a label of one sits against its own figure, and the line left
     over goes above it — where it reads as the card's margin — not between a
     label and its value. */
  align-self: end;
}

.ds-stat-tile__label-tip {
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

/* The figure's size answers the tile's width (ADR-0131) — measured on the
   figure's own box, the tile's content width: a container on the tile itself
   would contain its layout, and a contained element cannot be a subgrid. */
.ds-stat-tile__metric {
  container-type: inline-size;
}

.ds-stat-tile__tail {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
  margin-top: var(--ds-spacing-xs);
  min-width: 0;
}

/* `text-subtle`, not the drawing's `subtlest`: on a raised dark ground that is 4.18:1 (ADR-0048).
   Two lines at most (ADR-0131). */
.ds-stat-tile__caption {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

/*
  A narrow tile takes the figure one step down — 32px to 24px under 11rem of
  content (ADR-0131): « 28 940 tCO2e » is 156px at 32 for the 145 a tile of a
  25rem panel has, 128px at 24. Every tile of a group shares the width, so they
  share the size: one size in a group, the rule ADR-0109 kept for the cards.
  The unit stays on its line.
*/
@container (width < 11rem) {
  .ds-stat-tile__metric :deep(.ds-metric__value) {
    font: var(--ds-font-heading-xl);
    letter-spacing: var(--ds-letter-spacing-heading-xl);
  }
}

/* MetricValue carries its own label; the tile supplies it above instead. */
.ds-stat-tile__metric :deep(.ds-metric__label) { display: none; }

.ds-stat-tile__footer {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}
</style>
