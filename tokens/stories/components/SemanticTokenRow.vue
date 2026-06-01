<script setup lang="ts">
interface Props {
  cssVar: string
  lightPrimitiveCssVar: string
  darkPrimitiveCssVar: string
}

defineProps<Props>()
</script>

<template>
  <tr class="row">
    <td class="row__name">{{ cssVar }}</td>
    <td class="row__swatch">
      <div class="swatch swatch--light" :style="{ background: `var(${cssVar})` }" />
    </td>
    <td class="row__swatch row__swatch--dark">
      <div
        class="swatch swatch--dark"
        data-theme="dark"
        :style="{ background: `var(${cssVar})` }"
      />
    </td>
    <td class="row__ref">
      <span class="ref ref--light">{{ lightPrimitiveCssVar }}</span>
      <span class="ref ref--dark">{{ darkPrimitiveCssVar }}</span>
    </td>
  </tr>
</template>

<style scoped>
.row { border-bottom: 1px solid var(--ds-semantic-border-tertiary, #f2f4f7); }

.row__name {
  padding: 0.625rem 1.5rem 0.625rem 0;
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--ds-semantic-text-secondary, #344054);
  white-space: nowrap;
}

.row__swatch { padding: 0.625rem 0.75rem; text-align: center; }
.row__swatch--dark { background: #161B26; border-radius: 4px; }

.swatch {
  display: inline-block;
  width: 36px;
  height: 36px;
  border-radius: 6px;
}

.swatch--light { border: 1px solid rgba(0, 0, 0, 0.08); }
.swatch--dark  { border: 1px solid rgba(255, 255, 255, 0.12); }

.row__ref {
  padding: 0.625rem 0 0.625rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.ref {
  font-family: monospace;
  font-size: 0.7rem;
  line-height: 1.6;
}
.ref--light { color: var(--ds-semantic-text-secondary, #344054); }
.ref--dark  { color: var(--ds-semantic-text-quarterary, #667085); }
</style>
