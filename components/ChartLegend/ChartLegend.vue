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
}

export type ChartLegendShape = 'dot' | 'line'

interface Props {
  items?: ChartLegendItem[]
  shape?: ChartLegendShape
  /** Makes each entry a button that emits `toggle`. */
  interactive?: boolean
}

withDefaults(defineProps<Props>(), {
  items: () => [],
  shape: 'dot',
  interactive: false,
})

defineEmits<{ toggle: [key: string] }>()
</script>

<template>
  <ul class="ds-chart-legend">
    <li v-for="item in items" :key="item.key" class="ds-chart-legend__item">
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
          :class="`ds-chart-legend__mark--${shape}`"
          :style="{ backgroundColor: item.color ?? 'var(--ds-text-brand)' }"
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

.ds-chart-legend__item { min-width: 0; }

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

.ds-chart-legend__mark { flex-shrink: 0; }
.ds-chart-legend__mark--dot  { width: 8px; height: 8px; border-radius: var(--ds-radius-pill); }
.ds-chart-legend__mark--line { width: 14px; height: 3px; border-radius: var(--ds-radius-pill); }

.ds-chart-legend__label {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-default);
  white-space: nowrap;
}

.ds-chart-legend__value {
  font: var(--ds-font-body-sm-emphasis);
  color: var(--ds-text-strong);
  font-variant-numeric: tabular-nums;
}
</style>
