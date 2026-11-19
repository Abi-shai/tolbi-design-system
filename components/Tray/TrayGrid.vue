<script setup lang="ts">
import { Scrollbar } from '../Scrollbar'

/**
 * A white cell per thing, on a tray (ADR-0231) — a door's modules, each its
 * own `TrayCell`. Put it in a `Tray :surface="false"`: the tray is the ground
 * and the frame, the cells draw their own white.
 *
 * The cells run in columns of **at least `minColumn`** (14rem), one, two or
 * three as the room allows, `spacing-sm` apart. The list scrolls in the
 * package's `Scrollbar` — the content fading under a mask, the trailing fade
 * **long** (64px) so a list cut by its block reads as going on — and the bar
 * runs in a gutter of its own, never over the figures. Given a height (a
 * door's aside), it takes it; otherwise it is as tall as its cells, capped by
 * `maxHeight`.
 */
interface Props {
  /** The narrowest a column may be — any CSS length. */
  minColumn?: string
  /** Caps the list's height; past it, it scrolls. Any CSS length. */
  maxHeight?: string
  /** What the list is, for a reader. */
  label?: string
}

/* token-lint-disable-next-line no-literal-dimension-js — a column's floor, the product's measured 14rem (ADR-0231), not a spacing step */
withDefaults(defineProps<Props>(), { minColumn: '14rem', maxHeight: undefined, label: undefined })

defineSlots<{
  /** The cells — `TrayCell`s. */
  default?: () => unknown
}>()
</script>

<template>
  <Scrollbar shadows mask fade="long" :max-height="maxHeight" class="ds-tray-grid">
    <ul class="ds-tray-grid__cells" :aria-label="label" :style="{ '--tray-grid-column': minColumn }">
      <slot />
    </ul>
  </Scrollbar>
</template>

<style scoped>
/* It takes the height it is given in a column (a door's aside), and the bar's
   gutter lies outside the cells: the scroller reaches into the tray's padding,
   the cells keep it as their own padding. */
.ds-tray-grid {
  flex: 1 1 auto;
  min-height: 0;
  margin-inline-end: calc(-1 * var(--ds-spacing-md));
}

.ds-tray-grid__cells {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(var(--tray-grid-column), 100%), 1fr));
  gap: var(--ds-spacing-sm);
  margin: 0;
  padding: 0 var(--ds-spacing-md) 0 0;
  list-style: none;
}
</style>
