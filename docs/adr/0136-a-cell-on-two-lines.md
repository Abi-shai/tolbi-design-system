# ADR-0136 — A cell on two lines

**Date:** 2026-11-08
**Source:** etolbi — in a parcel list, the code on the first line and the producer under it, as Figma's
`Table/Cellule · Lignes=Deux` (`2709:1510`, property « Second »). `TableColumn` had no second line: the product either
wrote its own markup in `#cell-*` or added a column.
**Status:** Accepted

## Decisions

- **`TableColumn.secondary`** — a row key or a function of the row (one prop, both forms: a key covers the plain case, a
  function the composed one, « 1,4 % de la zone »). Empty, `null` or absent, the cell is one line.
- **As drawn**: `body-sm` / `text-subtle`, 16px directly under the 20px line, no gap — Figma's cell goes 52 → 68 and so
  does ours (measured 68, plus the row's 1px rule). One line, cut with « … », in the column's alignment (right for a
  `numeric` column, as Figma's `Alignement=Droite`).
- **In the primary cell it sits under the row's link, not in it**: the link keeps the name alone (« P-0412 », not
  « P-0412 Traoré Moussa »), and a click elsewhere on the row is still handed to it (ADR-0080). Over a second line the link
  becomes a block — inline, its line box took a strut and the cell stood 70.2px.
- **A `#cell-*` slot replaces the first line only**; the second stays the table's. Not on an `actions` column.
- **Loading previews the second line** (a 12px skeleton), so a two-line list does not arrive as a one-line one.
