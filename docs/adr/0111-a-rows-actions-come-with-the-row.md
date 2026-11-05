# ADR-0111 — A row's actions come with the row

**Date:** 2026-11-05
**Amends:** ADR-0080 (the row's hover: the name is no longer underlined)
**Source:** the owner, 5 Nov.: the actions of a table row should show on hover « avec une bonne motion », and the
first column's text underlined on hover « ne donne pas bien ».
**Status:** Accepted

## Context

`Table` never owned a row's actions: the product put them in a cell slot, and every story drew them on every row,
always — a column of glyphs repeated down the list. `ProjectCard` had already settled the opposite for its menu
(ADR-0038): out of the way at rest, there the moment the card is the subject. The row's hover underlined its name,
on top of the ground and the hand.

## Decisions

- **`TableColumn.actions`** marks the column that holds the row's actions. Its slot is wrapped in its own box, so the
  fade takes the buttons and never the cell's ground (a fixed cell paints it).
- **Hidden at rest, shown when the row is the subject**: pointed at, reached by the keyboard (`:focus-visible`
  inside the row — not a focus a click left behind), selected, or holding an open menu (`aria-expanded="true"`), so a
  list does not vanish from under the menu it opened.
- **The motion is `ProjectCard`'s**: opacity alone over **`quick`** (100ms) on `easing-default` — the row's own ground
  transition, so one gesture runs one duration (ADR-0037), and the pointer is already travelling toward them. No
  slide: the buttons were always in that cell, and movement must explain (ADR-0023). Measured: 0 → 0.58 → 0.95 → 1
  over the first ~80ms of the hover.
- **Still in the tab order** at `opacity: 0`; the reveal follows the keyboard (measured: the first action focused by
  Tab is at 1, the other rows at 0).
- **`hover: hover` gates it**: a touch screen has no pointer to rest, so there the actions stay.
- **The name is not underlined on hover.** The ground and the hand already say the row is the target; the focus ring
  still marks the link for the keyboard.
