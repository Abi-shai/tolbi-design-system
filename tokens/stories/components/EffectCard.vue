<script setup lang="ts">
interface Props {
  name: string
  cssVar: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="card" :style="{ boxShadow: `var(${cssVar})` }">
    <span class="card__name">{{ name }}</span>
    <span class="card__meta">{{ description }}</span>
  </div>
</template>

<style scoped>
.card {
  background: var(--ds-semantic-bg-primary, #ffffff);
  border: 1px solid var(--ds-semantic-border-secondary, #eaecf0);
  border-radius: 12px;
  width: 200px;
  height: 160px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card__name {
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ds-semantic-text-primary, #101828);
}

.card__meta {
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--ds-semantic-text-tertiary, #475467);
  line-height: 1.6;
}
</style>
