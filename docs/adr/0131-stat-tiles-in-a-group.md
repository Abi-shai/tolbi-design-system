# ADR-0131 — Stat tiles in a group

**Date:** 2026-11-08
**Amends:** ADR-0095, ADR-0097 (`StatTile`)
**Source:** etolbi — an ARR Dynamic baseline panel (`MapPanel lg`, 25rem) shows four `StatTile` in 2 × 2, each product
drawing its own grid; the same group lives in four columns in the 2xl window. In a ~10rem column the figure and its
unit ran out of the tile, a label of one line kept a void under it, nothing stepped down.
**Board:** Figma « ↪ StatGroup — tuiles en groupe · pistes » (`3872:1427`), renders of the code: today, **A** (the
figure a step down in a narrow group, the unit on its line, a short label against its figure), B (the product's ask:
the unit under the value, the label at the top), C (A with the label at the top). **A chosen** by the owner.
**Status:** Accepted

## Decisions

- **`StatGroup`** holds the tiles and chooses its columns **from its own width** (a container query): tiles of at least
  10rem, at most four a row — a 2 × 2 in the 25rem panel, a row of four in the window; one column under 10rem. The
  gap is the package's (`spacing-md`). The rows are the tiles' subgrid (ADR-0097): figures on one line, captions on one
  line.
- **The figure a step down, not the unit under it.** Under 11rem of content the figure goes from 32px (`metric-lg`) to
  24px (`heading-xl`): « 28 940 tCO2e » is 156px at 32 for the 145 a panel's tile has, 128px at 24. Every tile of a
  group shares the width, so they share the size — ADR-0109's « one size everywhere » held within a group. The unit
  under the value (track B) is what ADR-0109 refused twice: one tile's unit dropping beside a neighbour's that stays.
- **A short label sits against its figure.** Beside a label of two lines, a label of one sits at the foot of its line
  and the spare line goes above it, where it reads as the card's margin, not between a label and its value.
- **A number never breaks** — « 28 940 » broke on its space, « 28 » over « 940 tCO2e ». The number and the unit are each
  unbreakable; if the two ever cannot share a line, the unit is what moves, never half the number.
- **The label and the caption hold two lines**; a cut label is given whole in a `Tooltip`, only when cut.
- Found while building: a query container on the tile **cannot be a subgrid** — `container-type` applies layout
  containment, and the rows collapsed onto each other. The container is the figure's own box, the tile's content width.
- Measured: the panel 2 columns, figures 24px, no overflow, labels' feet on one line; the window 4 columns at 32px.
