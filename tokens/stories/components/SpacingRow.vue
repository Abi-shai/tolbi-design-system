<script setup lang="ts">
interface Props {
  label: string
  cssVar: string
  px: string
  accent?: 'primitive' | 'semantic'
}

withDefaults(defineProps<Props>(), { accent: 'primitive' })
</script>

<template>
  <div class="row">
    <span class="row__label">{{ label }}</span>
    <div
      class="row__bar"
      :class="`row__bar--${accent}`"
      :style="{ width: `var(${cssVar})`, maxWidth: '60%' }"
    />
    <span class="row__meta">{{ cssVar }} · {{ px }}</span>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--ds-semantic-border-tertiary, #f2f4f7);
}

.row__label {
  width: 4rem;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ds-semantic-text-primary, #101828);
  flex-shrink: 0;
  text-align: right;
}

.row__bar {
  height: 10px;
  border-radius: 2px;
  flex-shrink: 0;
  min-width: 2px;
}

.row__bar--primitive { background: var(--ds-color-brand-400, #388760); }
.row__bar--semantic  { background: var(--ds-color-brand-500, #066938); }

.row__meta {
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--ds-semantic-text-quarterary, #667085);
}
</style>
