<script setup lang="ts">
/**
 * A group of `StatTile`s (ADR-0131) — the grid every product drew for itself.
 * It chooses **how many columns from its own width** (a container query, one to
 * four): a tile never under 9.5rem, never more than four in a row, so the same
 * group is a 2 × 2 in a 25rem `MapPanel` and a row of four in a 2xl window.
 * The gap is the package's (`spacing-md`).
 *
 * The tiles of a row **share their three lines** — label, figure, what it is
 * measured against — as a subgrid (ADR-0097): figures on one line, captions on
 * one line. A label of one line beside one of two sits at the foot of its line,
 * against its figure (ADR-0131, track A of `3872:1427`).
 *
 * It draws nothing itself and names nothing: a list of figures is read tile by
 * tile, each its label, its figure, its caption.
 */
defineSlots<{
  /** The `StatTile`s. */
  default?: () => unknown
}>()
</script>

<template>
  <div class="ds-stat-group">
    <div class="ds-stat-group__grid"><slot /></div>
  </div>
</template>

<style scoped>
.ds-stat-group {
  container-type: inline-size;
  min-width: 0;
}

/*
  As many 9.5rem columns as fit, never more than four: `max()` makes a quarter
  the floor once the group is wide enough for four, so the columns stay equal
  and a fifth never opens. Below 9.5rem, one column. 9.5, not 10 (ADR-0132): a
  `SectionCard` in a 25rem panel leaves the group 324px, and two 10rem tiles
  want 328 — the 2 × 2 fell to one column.
*/
.ds-stat-group__grid {
  display: grid;
  grid-template-columns:
    repeat(auto-fill, minmax(max(9.5rem, calc((100% - 3 * var(--ds-spacing-md)) / 4)), 1fr));
  gap: var(--ds-spacing-md);
}

@container (width < 9.5rem) {
  .ds-stat-group__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* A narrow group tightens its tiles' inset, 16 → 12 (Card's own `sm`): in the
   324px of a panel's section, that is what keeps « 28 940 tCO2e » on one line
   at 24px — 128px for 132. */
@container (width < 22rem) {
  .ds-stat-group__grid > :deep(.ds-card.ds-stat-tile) {
    --card-pad: var(--ds-spacing-lg);
  }
}
</style>
