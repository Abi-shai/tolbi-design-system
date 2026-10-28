<script setup lang="ts">
import { computed } from 'vue'
import { Icon, type IconName } from '../Icon'

export type StatusTone = 'success' | 'warning' | 'error' | 'neutral'

interface Props {
  /**
   * What is being checked. The row's content, not a field's label — which is
   * why it does not recede the way `DetailRow`'s does (ADR-0092).
   */
  label: string
  tone: StatusTone
  /**
   * The word. Required, and the product's: « En attente » and « Non analysé »
   * are two facts under one tone, so the component never writes it.
   */
  status: string
}

const props = defineProps<Props>()

/*
  The tone picks the glyph as it picks the ink — a tone never carries the
  meaning alone (ADR-0006). There is no override: a consumer free to swap the
  glyph is free to break the very pairing the rule exists to keep.
*/
const GLYPH: Record<StatusTone, IconName> = {
  success: 'circle-check',
  warning: 'triangle-alert',
  error:   'circle-x',
  neutral: 'circle',
}

const glyph = computed(() => GLYPH[props.tone])
</script>

<template>
  <div class="ds-status-row" :class="`ds-status-row--${tone}`">
    <dt class="ds-status-row__label">
      <!-- In a box one line tall, so the glyph sits on the first line whether
           the name wraps or not (ADR-0065's own measure). -->
      <span class="ds-status-row__mark" aria-hidden="true">
        <Icon :name="glyph" :size="16" />
      </span>
      <span class="ds-status-row__name">{{ label }}</span>
    </dt>
    <dd class="ds-status-row__status">{{ status }}</dd>
  </div>
</template>

<style scoped>
/*
  A rule BETWEEN the rows, never around them — `Accordion`'s and `Divider`'s
  own rule (ADR-0088). `DetailRow` puts one under every row, which leaves a
  trailing hairline against the bottom of whatever holds the list.
*/
.ds-status-row {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-lg) 0;
  font-family: var(--ds-typography-font-family-poppins);
  min-width: 0;
}

.ds-status-row + .ds-status-row {
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtlest);
}

.ds-status-row__label {
  display: flex;
  flex: 1 1 auto;
  align-items: flex-start;
  gap: var(--ds-spacing-md);
  min-width: 0;
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
}

.ds-status-row__mark {
  display: inline-flex;
  flex: none;
  align-items: center;
  height: 1lh;
}

.ds-status-row__name {
  min-width: 0;
  overflow-wrap: anywhere;
}

/* The verdict: the row's value, so it stands where a value stands. */
.ds-status-row__status {
  flex: none;
  margin: 0;
  font: var(--ds-font-body-md-emphasis);
  white-space: nowrap;
}

/* ── Tones ─────────────────────────────────────────────────────────── */
/*
  The ON-TINT partner, on `bg-default` — ADR-0032's rule, for the second time.
  Measured here: `text-success` is 3.906:1 on white and `text-warning` 3.486:1,
  both under AA for a word; their partners are 5.691 and 5.427. In dark the two
  are the SAME value (6.031 / 7.089 / 5.972 either way), so the rule costs
  nothing there and buys the light mode.
*/
.ds-status-row--success .ds-status-row__mark,
.ds-status-row--success .ds-status-row__status { color: var(--ds-text-on-success-subtle); }

.ds-status-row--warning .ds-status-row__mark,
.ds-status-row--warning .ds-status-row__status { color: var(--ds-text-on-warning-subtle); }

.ds-status-row--error .ds-status-row__mark,
.ds-status-row--error .ds-status-row__status { color: var(--ds-text-on-error-subtle); }

/* Neutral is not a tone with a colour — it is the absence of a verdict, and
   it recedes rather than claiming one. */
.ds-status-row--neutral .ds-status-row__mark,
.ds-status-row--neutral .ds-status-row__status { color: var(--ds-text-subtle); }
</style>
