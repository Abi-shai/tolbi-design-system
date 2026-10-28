<script setup lang="ts">
/**
 * A list of checks: one row per check, its state said by the glyph, the word
 * AND the colour — never by the colour alone (ADR-0092, item 43).
 *
 * A `<dl>`: the check's name is the term, its state the definition, so the two
 * are associated without an `aria-describedby` to carry it. That is
 * `DetailRow`'s own semantics and deliberately not `DetailRow` itself — there
 * the label recedes and the value stands out, and here it is the other way
 * round: the check is the content, the verdict its answer.
 *
 * The rows are `StatusRow`s in the slot, as `Accordion` takes its items.
 */
</script>

<template>
  <dl class="ds-status-list">
    <slot />
  </dl>
</template>

<style scoped>
.ds-status-list {
  display: flex;
  flex-direction: column;
  margin: 0;
  min-width: 0;
}
</style>
