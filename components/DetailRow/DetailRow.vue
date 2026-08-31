<script setup lang="ts">
export type DetailRowLayout = 'row' | 'stacked'

interface Props {
  label: string
  /** Plain text value. Use the default slot instead for a Badge, link or chip. */
  value?: string
  layout?: DetailRowLayout
  /** Widens the label column. `row` layout only. */
  labelWidth?: string
  /** Renders the value in the monospace face — for IDs, keys and references. */
  mono?: boolean
}

withDefaults(defineProps<Props>(), {
  layout: 'row',
  labelWidth: '40%',
  mono: false,
})

const slots = defineSlots<{ default?: () => unknown }>()
</script>

<template>
  <div class="ds-detail-row" :class="`ds-detail-row--${layout}`">
    <dt
      class="ds-detail-row__label"
      :style="layout === 'row' ? { flexBasis: labelWidth } : undefined"
    >
      {{ label }}
    </dt>
    <dd class="ds-detail-row__value" :class="{ 'ds-detail-row__value--mono': mono }">
      <slot>{{ value }}</slot>
    </dd>
  </div>
</template>

<style scoped>
/*
 * `dt`/`dd` so a stack of rows is a real description list to assistive tech.
 * Wrap a group in <dl> — the row does not, because three shells shared this
 * line and each owned its own container.
 */
.ds-detail-row {
  display: flex;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-lg) 0;
  border-bottom: 1px solid var(--ds-border-subtlest);
  font-family: var(--ds-typography-font-family-poppins);
  min-width: 0;
}

.ds-detail-row--stacked {
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
}

.ds-detail-row__label {
  margin: 0;
  flex-shrink: 0;
  font-size: var(--ds-font-size-body-md);
  line-height: var(--ds-line-height-body-md);
  font-weight: var(--ds-font-weight-label-md);
  color: var(--ds-text-subtle);
}

.ds-detail-row__value {
  margin: 0;
  flex: 1 1 auto;
  min-width: 0;
  font-size: var(--ds-font-size-body-md);
  line-height: var(--ds-line-height-body-md);
  font-weight: var(--ds-font-weight-body-md);
  color: var(--ds-text-strong);
  overflow-wrap: anywhere;
}

.ds-detail-row--row .ds-detail-row__value { text-align: right; }

.ds-detail-row__value--mono {
  font-family: var(--ds-typography-font-family-mono);
  font-size: var(--ds-font-size-code-md);
  line-height: var(--ds-line-height-code-md);
}
</style>
