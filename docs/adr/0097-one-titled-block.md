# ADR-0097 — One titled block, one share bar, one row of figures

**Date:** 2026-11-04
**Extends:** ADR-0094 (`FormSection`), ADR-0038 (`ProjectCard`'s spread), ADR-0095 (`StatTile` in a row),
ADR-0001 (render the component, never redraw it)
**Source:** ARR · Dynamic baseline, Figma section 15 — the panel « Vue d'ensemble » (`3577:9513`) and the tile
`Tuile/Chiffre` (`3586:6652`); brief items 2, 3, 13. Lot 2.
**Status:** Accepted

## Decisions

**`FormSection` is `SectionCard`.** The panel drew FormSection's object around figures and a chart — a title,
a sentence, content on the sunk ground, 20 around and under the head, 16 between children. Two components for
one object is the drift ADR-0001 exists to stop, so it is one, named for what it is, with **`#actions`** on the
title's line (« 7× plus vite » as a `Badge` with its glyph — a tone never alone). `FormSection` stays as its
alias: published in 0.82, adopted nowhere yet, so the rename was free now and would not be later. Two words,
because `Section` is the HTML element's name (Vue's own rule for component names).

**`ShareBar` leaves `ProjectCard`.** The part-of-whole bar the panel needed (« Grâce au projet · Sans lui »)
already existed, locked inside the card's spread (ADR-0038): biggest first, five hues, the tail neutral and
counted `+N`, a legend that never wraps. It is a component now and the card renders it. One addition:
**`rest`** — the remainder of a whole, neutral and last whatever its size, because it is not one of the parts.
`showShare` turns the « 42 % » off where the figure is said larger above. Not a `ProgressBar`: nothing
progresses. Found on the way: a `<template v-if>` with a leading space inside it lost the space to Vue's
whitespace condensing (« Arachide46 % ») — the legend writes one string now.

**A row of figures is the row's.** `StatTile` gains **`caption`** — what the figure is measured against
(« sur 40 · seuil 30 »), in `text-subtle`, not the drawing's `subtlest` (4.18:1 on the raised dark ground,
ADR-0048); the figure stays a short number. 0.83 pushed the figure to the tile's foot so a two-line label
kept a row level; with a caption that broke — a two-line caption lifted its figure off the line. The tile now
spans **three of its parent's rows as a subgrid** (label, figure, caption), so in any grid every figure of a
row sits on one line whatever its label or caption runs to; outside a grid, `subgrid` falls back to plain
rows. Measured: the panel's 2×2, the window's four and the row of seven — figures level to the pixel.
`MetricValue`'s `label` is optional, for a figure its block already names.
