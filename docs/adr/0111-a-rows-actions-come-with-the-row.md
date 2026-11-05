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

## Amended (5 Nov.) — an action pointed at, on a pointed row: a veil

Pointing at an action on a hovered row changed nothing: a ghost control's hover is `bg-hover`, **the very ground of the
hovered row** (1.000:1 — ADR-0036's sentence: a `bg-*` token is solved against `bg-default`). The owner asked for a
benchmark first: 13 systems measured (`.context/table-actions/bench/`) — a **translucent veil** that stacks on the row's
tint in 6 of 10 (Polaris, Atlassian, Primer, MUI, GitLab, Radix; alphas 4–16 %, 1.09–1.15:1), a darker solid step in 3
(Carbon 1.25:1), our defect in 1 (Fluent, which compensates with a filled blue glyph); no contour anywhere. Three tracks
were prototyped in the real `Table`, light and dark (Figma `3784:1427`); **A was chosen**:

- Inside the actions column, a ghost or subtle `IconButton` and a ghost `Button` take **`text-strong` at 7 %** on hover
  and while its menu is open, **12 %** pressed, and the ink steps to `text-strong`. Translucent, it stacks on whatever
  the row wears — hovered, selected, light or dark. Measured: **1.154:1 light, 1.194:1 dark** against the hovered row.
- The veil is a variant switch (`--table-action-veil`, ADR-0010), not a token: one place, one reason.
- Not chosen: B, `bg-neutral-strong` (1.41 / 1.78 — the token of inert rails); C, the button rising as a surface with a
  contour (heavier, and no system does it in a table).
