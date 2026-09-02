<script setup lang="ts">
interface Props {
  cssVar: string
  primitiveCssVar: string
  /** ADR-0009: the clause admitting this token, plus its contrast evidence. */
  description?: string
}

defineProps<Props>()
</script>

<template>
  <tr class="row">
    <td class="row__name">{{ cssVar }}</td>
    <td class="row__swatch">
      <div class="swatch" :style="{ background: `var(${cssVar})` }" />
    </td>
    <td class="row__ref">
      <span class="ref">{{ primitiveCssVar }}</span>
    </td>
    <td class="row__why">
      <span class="why" v-if="description">{{ description }}</span>
    </td>
  </tr>
</template>

<style scoped>
.row { border-bottom: 1px solid var(--ds-border-subtlest); }

.row__name {
  padding: 0.625rem 1.5rem 0.625rem 0;
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--ds-text-default);
  white-space: nowrap;
}

.row__swatch { padding: 0.625rem 0.75rem; text-align: center; }

.swatch {
  display: inline-block;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.row__ref { padding: 0.625rem 0 0.625rem 1rem; }

.ref {
  font-family: monospace;
  font-size: 0.7rem;
  line-height: 1.6;
  color: var(--ds-text-default);
}

.row__why { padding: 0.625rem 0 0.625rem 1.25rem; }

.why {
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.7rem;
  line-height: 1.5;
  color: var(--ds-text-subtle);
}
</style>
