<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import { Skeleton } from '../Skeleton'

export type MetricTrend = 'up' | 'down' | 'flat'
/**
 * `xl` is the one figure a block is about (ADR-0231) — a door's total: the
 * figure in `metric-2xl` (48), its unit beside it on the baseline in
 * `label-xl` / `text-default`, `spacing-sm` apart, and what it counts under it
 * (`caption`) in `body-md` / `text-subtle`. No label above it: the unit and
 * the caption say what the figure is.
 */
export type MetricSize = 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  /** Omitted when the block it sits in already names it — a `SectionCard`'s title (ADR-0097). */
  label?: string
  value: string
  /** Unit shown after the value at a smaller size — `t/ha`, `%`, `ha`. */
  unit?: string
  /** Signed change, e.g. `+12 %`. Rendered next to the value. */
  delta?: string
  /**
   * Direction of the change. Drives the colour AND the arrow, so the meaning
   * survives for anyone who cannot separate the two hues.
   */
  trend?: MetricTrend
  size?: MetricSize
  /** What the figure counts, under it — « pour tous les modules » (ADR-0231). */
  caption?: string
  /** The figure is on its way: a placeholder in its place, the unit and caption kept. */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'flat',
  size: 'md',
  caption: undefined,
  loading: false,
})

const arrow = computed(() =>
  props.trend === 'up' ? 'trending-up' : props.trend === 'down' ? 'trending-down' : 'minus',
)
</script>

<template>
  <div class="ds-metric" :class="`ds-metric--${size}`">
    <span v-if="label" class="ds-metric__label">{{ label }}</span>

    <div class="ds-metric__row">
      <span class="ds-metric__value">
        <span class="ds-metric__number"><Skeleton v-if="loading" width="3.5em" class="ds-metric__pending" /><template v-else>{{ value }}</template></span><span v-if="unit" class="ds-metric__unit">{{ unit }}</span>
      </span>

      <span
        v-if="delta"
        class="ds-metric__delta"
        :class="`ds-metric__delta--${trend}`"
      >
        <Icon :name="arrow" :size="16" />
        {{ delta }}
      </span>
    </div>

    <span v-if="caption" class="ds-metric__caption">{{ caption }}</span>
  </div>
</template>

<style scoped>
.ds-metric {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  min-width: 0;
  font-family: var(--ds-typography-font-family-poppins);
}

.ds-metric__label {
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
}

.ds-metric__row {
  display: flex;
  align-items: baseline;
  gap: var(--ds-spacing-md);
  flex-wrap: wrap;
}

.ds-metric__value {
  font: var(--ds-font-metric-lg);
  letter-spacing: var(--ds-letter-spacing-metric-lg);
  color: var(--ds-text-strong);
  /* Digits must not jitter as a value updates. */
  font-variant-numeric: tabular-nums;
}

/* A number never breaks inside: « 28 940 » is one word to the eye, and its
   French thin space is a breaking one (ADR-0131). If a figure and its unit
   cannot share the line, the unit is what moves, never half the number. */
.ds-metric__number,
.ds-metric__unit {
  white-space: nowrap;
}

/* The unit is set by its figure, and the figures did not grow (ADR-0144): so
   it holds its 14px by taking the role a step down — at 16 « 28 940 tCO2e »
   ran 2px out of a 2 × 2 tile in a reading panel. */
.ds-metric__unit {
  margin-left: 0.25em;
  font: var(--ds-font-body-sm);
  line-height: 1;
  color: var(--ds-text-subtle);
}

.ds-metric__delta {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xxs);
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
}

.ds-metric__delta--up   { color: var(--ds-text-success); }
.ds-metric__delta--down { color: var(--ds-text-error); }
.ds-metric__delta--flat { color: var(--ds-text-subtlest); }

/* ── Sizes ────────────────────────────────────────────────────────── */
.ds-metric--sm .ds-metric__value {
  font: var(--ds-font-heading-lg);
}
.ds-metric--lg .ds-metric__value { font: var(--ds-font-metric-xl); letter-spacing: var(--ds-letter-spacing-metric-xl); }
/* The unit grows with its figure (ADR-0132): 14px beside 40 read as a footnote.
   16px, held by a role a step down since ADR-0144 (body-lg went to 18). */
.ds-metric--lg .ds-metric__unit { font: var(--ds-font-body-md); line-height: 1; }

/* xl (ADR-0231): the one figure a block is about. The unit sits on the figure's
   baseline `spacing-sm` away, in the reading ink a step down; what the figure
   counts goes under it, 2px below — one statement, three sizes. */
.ds-metric--xl {
  gap: var(--ds-spacing-xxs);
}

.ds-metric--xl .ds-metric__value {
  font: var(--ds-font-metric-2xl);
  letter-spacing: var(--ds-letter-spacing-metric-2xl);
  font-variant-numeric: tabular-nums;
}

.ds-metric--xl .ds-metric__unit {
  margin-left: var(--ds-spacing-sm);
  font: var(--ds-font-label-xl);
  letter-spacing: normal;
  color: var(--ds-text-default);
}

.ds-metric__caption {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-metric--xl .ds-metric__caption {
  font: var(--ds-font-body-md);
}

/* The placeholder sits on the figure's line, as wide as a few digits. */
.ds-metric__pending {
  display: inline-block;
  vertical-align: middle;
}

/*
 * Deliberately no brand-surface variant. The metric is only supported on the
 * default surface, which makes the bad pairing impossible by construction
 * rather than something the caller has to remember to opt out of (ADR-0006).
 */
</style>
