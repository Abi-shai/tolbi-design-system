# ADR-0179 — Larger targets in the tools column

**Status**: accepted (the owner, 16 Nov. 2026). The tools column was too small under a pointer:
- 32 × 32 buttons (`IconButton xs`) in a 44px column;
- a 12px zoom thumb.

The references were Google Maps (about 40px) and WCAG 2.5.5 AAA (44).

## Decision

**`IconButton` gains `size="md"`**: 40 × 40, the glyph still 20. Above 36 the box grows and the mark does not, as
`Button` does.

The column's buttons (tools, +, −, « Recentrer ») take it:
- the curve stays `radius-control` (`shape="square"`, 8px, ADR-0177);
- the focus ring (`--ds-focus-ring-map`) is a `box-shadow`, so it follows the new box.

**The column** is **52px** wide: 40px buttons in 6px of margin. Its vertical padding is `spacing-sm`, and its rules
are **24px**. `MapOverlay end` reserves a 52px track for it; ADR-0171's grid is unchanged. Tolbi xAI's launcher,
centred in that track, stays on the column's axis.

**The zoom gauge** (`MapZoomGauge vertical`):
- its box is **40px** wide, like its buttons;
- its thumb is **16px** (was 12);
- its channel is **6px** (was 4), so it stays in proportion.

The three sizes are now custom properties of the gauge (`--gauge-thumb / -track / -cross`), declared once and raised
in the upright form. The native thumb, the drawn thumb and the span it travels all read them.

**Unchanged**:
- **The count** rides its button's corner, 4px out, so it follows the larger button.
- **The tool card** keeps its gap to the column, and its top stays on its button's top (measured on open).
- The tools' order, the glass and the behaviour.

## Measured (`Données/Map/Navigator` « Filtres », 1 440px)

| What | Value |
|---|---|
| Column | x 1 364, 52 wide |
| Seven buttons | 40 × 40 each, x 1 370 (6px in) |
| Gauge | 40 × 64 |
| Thumb | 16 × 16; keyboard focus = the map ring |
| Rules | 24 × 1 |
| Count | on the filter button's corner (x 1 397, y 69) |
| Tool card | top 73, the filter button's top |
| Launcher | 1 365–1 415, centred on the column's axis (1 390) |
