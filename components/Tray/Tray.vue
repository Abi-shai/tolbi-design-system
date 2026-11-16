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
 *
 * **One hover for the pattern** (ADR-0199): `bg-hover` is the tray's own grey,
 * so on its white surface a hovered row barely showed. The surface hands down
 * `--on-tray-hover` (`bg-neutral-subtle-hover`) and `--on-tray-hover-strong`
 * (`bg-neutral-strong`, for a grey inside what is hovered) — private context
 * variables, as the map's `--on-glass-*`: whatever is clickable on a tray
 * reads them, on hover and on keyboard focus alike.
 *
 * **One placeholder tone** (ADR-0200): a `Skeleton` on the tray takes its
 * default tone, the one solved against `bg-default` — the tray's surface. So
 * the tray hands nothing down for it: what it asks of its content is to leave
 * the tone alone (no `surface="tinted"`, no `emphasis="strong"`).
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
  --on-tray-hover: var(--ds-bg-neutral-subtle-hover);
  --on-tray-hover-strong: var(--ds-bg-neutral-strong);
}
</style>
