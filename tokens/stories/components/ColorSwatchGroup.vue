<script setup lang="ts">
interface Swatch {
  shade: string
  value: string
  cssVar: string
  description?: string
}

interface Props {
  name: string
  swatches: Swatch[]
}

defineProps<Props>()
</script>

<template>
  <div class="group">
    <h3 class="group__name">{{ name }}</h3>
    <div class="group__swatches">
      <div v-for="swatch in swatches" :key="swatch.shade" class="swatch">
        <div
          class="swatch__color"
          :style="{ backgroundColor: swatch.value }"
          :title="swatch.description"
        />
        <p class="swatch__shade">{{ swatch.shade }}</p>
        <p class="swatch__value">{{ swatch.value }}</p>
        <p class="swatch__var">{{ swatch.cssVar }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.group { display: flex; flex-direction: column; gap: 0.75rem; }

.group__name {
  margin: 0;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ds-semantic-text-tertiary, #475467);
}

.group__swatches { display: flex; flex-wrap: wrap; gap: 0.75rem; }

.swatch { display: flex; flex-direction: column; gap: 0.3rem; width: 96px; }

.swatch__color {
  height: 56px;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.07);
}

.swatch__shade {
  margin: 0;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ds-semantic-text-primary, #101828);
}

.swatch__value {
  margin: 0;
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--ds-semantic-text-tertiary, #475467);
}

.swatch__var {
  margin: 0;
  font-family: monospace;
  font-size: 0.6rem;
  color: var(--ds-semantic-text-quarterary, #667085);
}
</style>
