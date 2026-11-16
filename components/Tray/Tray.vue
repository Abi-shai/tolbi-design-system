<script setup lang="ts">
/**
 * A tray (ADR-0198): the grey ground that **groups a block** — one white
 * surface laid on it, what the block holds laid on that. It was
 * `ProjectList`'s frame (ADR-0166); the owner reads it as a pattern for
 * telling one block from another, kept for some blocks, and the home page's
 * two lists now share it rather than draw it twice (ADR-0001).
 *
 * `bg-neutral-subtle` with `spacing-md` around, `radius-surface-lg` (a surface
 * that holds a surface, one step past it); inside, `bg-default`, `spacing-md`
 * around, `radius-surface`. It carries no title and no state: the block's
 * heading is the page's, its wait and its absence the content's.
 */
defineSlots<{
  /** What the block holds, laid on the white surface. */
  default?: () => unknown
}>()
</script>

<template>
  <div class="ds-tray">
    <div class="ds-tray__surface">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ds-tray {
  box-sizing: border-box;
  width: 100%;
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-surface-lg);
  background: var(--ds-bg-neutral-subtle);
}

.ds-tray__surface {
  box-sizing: border-box;
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-surface);
  background: var(--ds-bg-default);
}
</style>
