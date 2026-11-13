<script setup lang="ts">
import { useId } from 'vue'

/**
 * One section of `MapFilters` (ADR-0171): a title, and the product's controls
 * under it — named by the title (`role="group"`).
 */
defineProps<{ title: string }>()
const id = useId()
</script>

<template>
  <div class="ds-map-filter-section" role="group" :aria-labelledby="id">
    <div :id="id" class="ds-map-filter-section__title">{{ title }}</div>
    <div class="ds-map-filter-section__body"><slot /></div>
  </div>
</template>

<style scoped>
.ds-map-filter-section {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-lg);
}

.ds-map-filter-section__title {
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
}

.ds-map-filter-section__body {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
}
</style>
