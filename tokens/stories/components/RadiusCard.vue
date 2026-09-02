<script setup lang="ts">
interface Props {
  label: string
  cssVar: string
  rem: string
  px: string
}

defineProps<Props>()
</script>

<template>
  <div class="row">
    <span class="row__label">{{ label }}</span>
    <div class="row__corner">
      <div class="row__corner-inner" :style="{ borderRadius: `var(${cssVar})` }" />
    </div>
    <span class="row__meta">{{ cssVar }} · {{ rem }} · {{ px }}</span>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid var(--ds-border-subtlest, #f2f4f7);
}

.row__label {
  width: 5.5rem;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ds-text-strong, #101828);
  flex-shrink: 0;
  text-align: right;
}

.row__corner {
  width: 72px;
  height: 40px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
}

.row__corner-inner {
  position: absolute;
  right: 0;
  top: 0;
  width: 144px;
  height: 80px;
  background: var(--ds-color-brand-100, #cce3d5);
  border: 2px solid var(--ds-color-brand-600, #056033);
}

.row__meta {
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--ds-text-subtlest, #667085);
}
</style>
