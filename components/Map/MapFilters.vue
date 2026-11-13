<script setup lang="ts">
import { Button } from '../Button'

/**
 * What the tools column's « Filtres » opens (ADR-0171): sections stacked
 * (`MapFilterSection` — a title and the product's controls: `MapFilterOption`
 * boxes with a colour and a count, `Tag`s to choose, a `Slider` for a range),
 * and a foot that says what is left — « 4 parcelles » — beside « Effacer ».
 * **Filters apply as they change**: there is no « Appliquer », the map and the
 * list follow each tick. Which filters, and their state, are the product's.
 */
interface Props {
  /** What is left on the map — « 4 parcelles ». Announced as it changes. */
  resultLabel?: string
  clearLabel?: string
  /** Nothing to clear: « Effacer » is off. */
  clearDisabled?: boolean
}

withDefaults(defineProps<Props>(), {
  resultLabel: undefined,
  clearLabel: 'Effacer',
  clearDisabled: false,
})

const emit = defineEmits<{ clear: [] }>()
</script>

<template>
  <div class="ds-map-filters">
    <div class="ds-map-filters__body">
      <slot />
    </div>
    <div class="ds-map-filters__foot">
      <Button :label="clearLabel" variant="link" size="sm" :disabled="clearDisabled" @click="emit('clear')" />
      <span v-if="resultLabel" class="ds-map-filters__result" role="status">{{ resultLabel }}</span>
    </div>
  </div>
</template>

<style scoped>
.ds-map-filters {
  display: flex;
  flex-direction: column;
  width: 20rem;
  max-width: 100%;
  min-height: 0;
}

.ds-map-filters__body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

.ds-map-filters__body > :deep(* + *) {
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-map-filters__foot {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-md) var(--ds-spacing-lg);
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-map-filters__result {
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
}
</style>
