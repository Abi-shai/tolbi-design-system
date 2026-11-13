<script setup lang="ts">
import { useId } from 'vue'
import { Checkbox } from '../Checkbox'

/**
 * A box in a `MapFilterSection` (ADR-0171): the value's colour on the map (an
 * outline's ink — `--ds-chart-status-critical`, a categorical step), its name
 * and how many objects carry it. A real checkbox, the row its label.
 */
interface Props {
  label: string
  /** The colour this value has on the map: any CSS colour, a token's `var()`. */
  color?: string
  count?: number
  disabled?: boolean
}

withDefaults(defineProps<Props>(), { color: undefined, count: undefined, disabled: false })

const checked = defineModel<boolean>({ default: false })
const id = useId()
</script>

<template>
  <label class="ds-map-filter-option" :class="{ 'ds-map-filter-option--disabled': disabled }" :for="id">
    <input :id="id" v-model="checked" class="ds-map-filter-option__input" type="checkbox" :disabled="disabled" />
    <Checkbox :model-value="checked" :disabled="disabled" visual-only />
    <span v-if="color" class="ds-map-filter-option__dot" :style="{ '--dot': color }" aria-hidden="true" />
    <span class="ds-map-filter-option__label">{{ label }}</span>
    <span v-if="count !== undefined" class="ds-map-filter-option__count">{{ count }}</span>
  </label>
</template>

<style scoped>
.ds-map-filter-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-height: 32px;
  padding-inline: var(--ds-spacing-xs);
  border-radius: var(--ds-radius-control);
  cursor: pointer;
}

.ds-map-filter-option:hover:not(.ds-map-filter-option--disabled) {
  background: var(--ds-bg-hover);
}

.ds-map-filter-option--disabled {
  cursor: not-allowed;
}

/* The real box: present for the keyboard and the reader, drawn by `Checkbox`. */
.ds-map-filter-option__input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.ds-map-filter-option__input:focus-visible + :deep(.ds-checkbox__control) {
  box-shadow: var(--ds-focus-ring-brand);
}

/* A ring, as the outline is drawn on the map. */
.ds-map-filter-option__dot {
  flex: none;
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  border: var(--ds-border-width-strong) solid var(--dot);
  border-radius: var(--ds-radius-pill);
}

.ds-map-filter-option__label {
  flex: 1 1 auto;
  min-width: 0;
  font: var(--ds-font-label-md);
  color: var(--ds-text-default);
}

.ds-map-filter-option--disabled .ds-map-filter-option__label {
  color: var(--ds-text-disabled);
}

.ds-map-filter-option__count {
  flex: none;
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
}
</style>
