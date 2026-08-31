<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'

export type MetricTrend = 'up' | 'down' | 'flat'
export type MetricSize = 'sm' | 'md' | 'lg'

interface Props {
  label: string
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
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'flat',
  size: 'md',
})

const arrow = computed(() =>
  props.trend === 'up' ? 'trending-up' : props.trend === 'down' ? 'trending-down' : 'minus',
)
</script>

<template>
  <div class="ds-metric" :class="`ds-metric--${size}`">
    <span class="ds-metric__label">{{ label }}</span>

    <div class="ds-metric__row">
      <span class="ds-metric__value">
        {{ value }}<span v-if="unit" class="ds-metric__unit">{{ unit }}</span>
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
  font-size: var(--ds-font-size-label-md);
  line-height: var(--ds-line-height-label-md);
  font-weight: var(--ds-font-weight-label-md);
  color: var(--ds-text-subtle);
}

.ds-metric__row {
  display: flex;
  align-items: baseline;
  gap: var(--ds-spacing-md);
  flex-wrap: wrap;
}

.ds-metric__value {
  font-size: var(--ds-font-size-metric-lg);
  line-height: var(--ds-line-height-metric-lg);
  letter-spacing: var(--ds-letter-spacing-metric-lg);
  font-weight: var(--ds-font-weight-metric-lg);
  color: var(--ds-text-strong);
  /* Digits must not jitter as a value updates. */
  font-variant-numeric: tabular-nums;
}

.ds-metric__unit {
  margin-left: 0.25em;
  font-size: var(--ds-font-size-body-md);
  line-height: 1;
  font-weight: var(--ds-font-weight-body-md);
  color: var(--ds-text-subtle);
}

.ds-metric__delta {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xxs);
  font-size: var(--ds-font-size-label-md);
  line-height: var(--ds-line-height-label-md);
  font-weight: var(--ds-font-weight-label-md);
  font-variant-numeric: tabular-nums;
}

.ds-metric__delta--up   { color: var(--ds-text-success); }
.ds-metric__delta--down { color: var(--ds-text-error); }
.ds-metric__delta--flat { color: var(--ds-text-subtlest); }

/* ── Sizes ────────────────────────────────────────────────────────── */
.ds-metric--sm .ds-metric__value {
  font-size: var(--ds-font-size-heading-lg);
  line-height: var(--ds-line-height-heading-lg);
  letter-spacing: var(--ds-letter-spacing-heading-lg);
}
.ds-metric--lg .ds-metric__value { font-size: 2.5rem; line-height: 3rem; }

/*
 * Deliberately no brand-surface variant. The metric is only supported on the
 * default surface, which makes the bad pairing impossible by construction
 * rather than something the caller has to remember to opt out of (ADR-0006).
 */
</style>
