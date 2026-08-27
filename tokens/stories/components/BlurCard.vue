<script setup lang="ts">
interface Props {
  name: string
  cssVar: string
  value: string
  mode: 'light' | 'dark'
}

defineProps<Props>()
</script>

<template>
  <div
    class="card"
    :class="`card--${mode}`"
    :style="{ backdropFilter: `var(${cssVar})`, WebkitBackdropFilter: `var(${cssVar})` }"
  >
    <span class="card__name">{{ name }}</span>
    <div class="card__footer">
      <span class="card__value">{{ value }}</span>
      <span class="card__mode">{{ mode }}</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card--light { background: rgba(255, 255, 255, 0.60); }
.card--dark  { background: rgba(0, 0, 0, 0.60); }

.card__name {
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.875rem;
  font-weight: 500;
}
.card--light .card__name { color: var(--ds-color-gray-light-900, #101828); }
.card--dark  .card__name { color: #F5F5F6; }

.card__footer { display: flex; align-items: center; justify-content: space-between; }

.card__value { font-family: monospace; font-size: 0.7rem; }
.card__mode  { font-family: var(--ds-typography-font-family-poppins); font-size: 0.75rem; }

.card--light .card__value,
.card--light .card__mode  { color: var(--ds-color-gray-light-500, #667085); }

.card--dark .card__value,
.card--dark .card__mode   { color: #CECFD2; }
</style>
