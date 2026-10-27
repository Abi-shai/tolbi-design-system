<script setup lang="ts">
/**
 * A section of a `Report` (ADR-0089), numbered by itself — 1, 2, 3 — in the
 * order it appears, as the DDS's numbered fields are. Its title never ends a
 * printed page.
 */
defineProps<{ title: string }>()
</script>

<template>
  <section class="ds-report-section">
    <h2 class="ds-report-section__title">
      <span class="ds-report-section__number" />
      {{ title }}
    </h2>
    <div class="ds-report-section__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.ds-report-section {
  counter-increment: ds-report-section;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
}

.ds-report-section__title {
  display: flex;
  gap: var(--ds-spacing-md);
  margin: 0;
  font: var(--ds-font-heading-sm);
  color: var(--ds-text-strong);
  break-after: avoid;
}

.ds-report-section__number::before {
  content: counter(ds-report-section);
  color: var(--ds-text-subtle);
  font-variant-numeric: tabular-nums;
}

.ds-report-section__body {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-lg);
}
</style>
