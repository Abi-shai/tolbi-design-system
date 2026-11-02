<script setup lang="ts">
/**
 * The column a form's blocks stand in, and one fact: 24px between them
 * (ADR-0094). The blocks are `FormSection`s and lone `FormField`s alike — a
 * form alternates the two, and only the container can space them all the same.
 *
 * No surface, no margin, no element of its own beyond a `<div>`: the `<form>`
 * is the product's, which knows where it submits.
 */
</script>

<template>
  <div class="ds-form-layout">
    <slot />
  </div>
</template>

<style scoped>
.ds-form-layout {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-3xl);
  min-width: 0;
}
</style>
