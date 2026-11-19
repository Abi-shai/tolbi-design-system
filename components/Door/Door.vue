<script setup lang="ts">
import { BrandPattern } from '../BrandPattern'

/**
 * A door on the home page (ADR-0231) — the block that leads somewhere (the
 * producers, the credits). Two doors were copying one frame, so it is one
 * component with two zones:
 *
 * - **`#lead`**, the statement: an illustration, a figure or a title, and the
 *   action. It keeps **its own width**, 24rem at most;
 * - **`#aside`**, the surface beside it — a `Tray` — which takes **the rest**.
 *
 * The ground is `BrandPattern surface="accent"` at the sheet's scale: the
 * yellow a step deeper than the credits' tint, the pattern in the brand's ink
 * at 1.2 %, `radius-surface`, `spacing-xl` in.
 *
 * **Side by side** when the door has the room (a container query, **40rem** of
 * its own width — the package has no breakpoints; 48 stacked the home page's
 * door at 1 440 beside « Actions rapides », 47.25rem, ADR-0233), `spacing-4xl` apart: the
 * statement and its detail answer each other from a distance. **The aside does
 * not grow the row** (`contain: size`): it takes the statement's height and what
 * it holds scrolls inside it. Narrower, the two are stacked, and the aside is
 * capped at 22rem.
 */
defineSlots<{
  /** The statement: an illustration, a figure or a title, and the action. */
  lead?: () => unknown
  /** The surface beside it — a `Tray`. */
  aside?: () => unknown
}>()
</script>

<template>
  <BrandPattern surface="accent" scale="lg" class="ds-door">
    <div class="ds-door__row">
      <div class="ds-door__lead"><slot name="lead" /></div>
      <div v-if="$slots.aside" class="ds-door__aside"><slot name="aside" /></div>
    </div>
  </BrandPattern>
</template>

<style scoped>
.ds-door {
  container-type: inline-size;
  border-radius: var(--ds-radius-surface);
}

.ds-door__row {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
  padding: var(--ds-spacing-xl);
}

/* The statement keeps its own width and stands `spacing-md` further in than
   the tray beside it. */
.ds-door__lead {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--ds-spacing-2xl);
  min-width: 0;
  padding: var(--ds-spacing-md);
}

/* The surface beside it is a column, so a tray in it can take its height. */
.ds-door__aside {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-height: 22rem;
}

.ds-door__aside > :deep(*) {
  flex: 1 1 auto;
  min-height: 0;
}

@container (width >= 40rem) {
  .ds-door__row {
    flex-direction: row;
    align-items: stretch;
    gap: var(--ds-spacing-4xl);
  }

  .ds-door__lead {
    flex: 0 0 auto;
    max-width: 24rem;
  }

  /* The statement's height, not the list's: it scrolls inside. */
  .ds-door__aside {
    flex: 1 1 auto;
    max-height: none;
    contain: size;
  }
}
</style>
