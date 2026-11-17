<script setup lang="ts">
import { useId } from 'vue'

/**
 * A tray (ADR-0198): the grey ground that **groups a block** — one white
 * surface laid on it, what the block holds laid on that. It was
 * `ProjectList`'s frame (ADR-0166); the owner reads it as a pattern for
 * telling one block from another, kept for some blocks, and the home page's
 * two lists now share it rather than draw it twice (ADR-0001).
 *
 * `bg-neutral-subtle` with `spacing-md` around, `radius-surface-lg` (a surface
 * that holds a surface, one step past it), a `border-subtlest` hairline
 * (ADR-0211); inside, `bg-default`, `spacing-md`
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
 * **It carries its block's title** (ADR-0205, track T1): with `title`, the
 * grey ground holds a line **above the white surface** — the title (`heading-sm`,
 * `text-strong`, an `h2` by default) at the start, `#action` (« Voir tout ») at
 * the end — and the tray becomes a `<section>` named by it, a region. The grey
 * holds the title, the white the content: the block reads as one group. The
 * line is `spacing-xs` above, `spacing-md` at the sides and below, so the title
 * stands on the surface's inner edge. Without `title`, the tray is unchanged.
 *
 * **One placeholder tone** (ADR-0200): a `Skeleton` on the tray takes its
 * default tone, the one solved against `bg-default` — the tray's surface. So
 * the tray hands nothing down for it: what it asks of its content is to leave
 * the tone alone (no `surface="tinted"`, no `emphasis="strong"`).
 */
interface Props {
  /** The block's title, in the grey above the surface; it names the region. */
  title?: string
  /** The title's level — `h2` on a page's home, `h3` under a section. */
  headingLevel?: 2 | 3 | 4
}

withDefaults(defineProps<Props>(), { title: undefined, headingLevel: 2 })

defineSlots<{
  /** What the block holds, laid on the white surface. */
  default?: () => unknown
  /** At the end of the title's line — « Voir tout », a `Button variant="link" size="sm"`. */
  action?: () => unknown
}>()

const titleId = `ds-tray-title-${useId()}`
</script>

<template>
  <component :is="title ? 'section' : 'div'" class="ds-tray" :aria-labelledby="title ? titleId : undefined">
    <div v-if="title" class="ds-tray__head">
      <component :is="`h${headingLevel}`" :id="titleId" class="ds-tray__title">{{ title }}</component>
      <div v-if="$slots.action" class="ds-tray__action"><slot name="action" /></div>
    </div>
    <div class="ds-tray__surface">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.ds-tray {
  box-sizing: border-box;
  width: 100%;
  padding: var(--ds-spacing-md);
  /* A hairline round the tray (ADR-0211): its grey is lost on a white page; the
     faintest border makes the edge guessed, not a frame. */
  border: var(--ds-border-width-default) solid var(--ds-border-subtlest);
  border-radius: var(--ds-radius-surface-lg);
  background: var(--ds-bg-neutral-subtle);
}

/* The title's line, in the grey (ADR-0205): 4 above, 8 at the sides and below,
   so the title stands on the white surface's inner edge. */
.ds-tray__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-xs) var(--ds-spacing-md) var(--ds-spacing-md);
}

.ds-tray__title {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  font: var(--ds-font-heading-sm);
  color: var(--ds-text-strong);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ds-tray__action {
  flex: none;
  display: flex;
  align-items: center;
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
