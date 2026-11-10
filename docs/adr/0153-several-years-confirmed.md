# ADR-0153 — Several years, confirmed

**Status:** accepted — 10 Nov. 2026 (etolbi, after 0.127.0)

## Context

Creating a Yield project chooses one year or **several, not contiguous** — 2021, 2023, 2026 — in a hand-made grid
with a « Valider » button (`year-picker-grid.vue`). `DatePicker` (ADR-0152) had one year, or a range of them; a set
was the one case it could not replace.

## Decision

**`DatePicker multiple`** — `granularity="year"` only (ignored on days); `v-model` is a **`number[]`**, sorted.

- **Picked one by one** in the same year grid: a press toggles a year (Enter or Space on the keyboard); chosen years
  take the brand's fill, as one chosen year does. The grid says `aria-multiselectable`.
- **Confirmed, not taken on every press**: a foot under the grid — the count (« 3 années », a `status`) and
  **« Valider »** (`Button primary sm`, `confirmLabel`). Closing without it — Escape, a press outside — keeps the value
  as it was. A set is built in several gestures, and a value that changed on each would re-run whatever the product
  hangs on it for every year added.
- **The field lists, it is not typed**: « 2021, 2023, 2026 », cut at the box's edge; « Choisir des années »
  (`multiplePlaceholder`) while empty. A press on the list opens the grid too; the keyboard has the calendar button.
  Typing several years in segments would need a separator grammar for no gain over the grid.

## Measured

`Saisie/DatePicker` « Plusieurs années », a `play` test: 2021, 2023, 2024, 2026 pressed and 2024 again — « 3 années »,
the value still `[]`; « Valider » → `[2021, 2023, 2026]`, the panel closed, the field reading « 2021, 2023, 2026 »;
reopened, 2018 pressed, Escape → the value unchanged.

## Amended — the panel follows its field (etolbi, 0.127)

The panel stood at 300px under a ~470px field, and wrote its grid at the floor's 14px under a field that writes at
`body-lg`. A panel that opens from a field is the size of the field, as a select's list is (ADR-0101):

- **Width**: `max(300px, var(--anchor-width))` — the field's width, which `useAnchoredSurface` already sets, never
  under the 300 of the owner's frame. Not `matchWidth`, which writes the width inline and would have no floor. Years
  stretch with their columns; **a day stays round** — a square centred in its column, `min(cell, 100%)` on an
  `aspect-ratio: 1`, so at 300px the seven 40s that do not fit (304 > 276) give to the column (35.7) rather than spill.
- **Text**: `DateCalendar` takes the field's `size`, as `DropdownItem` does. `md`: cells and weekdays `label-lg`, title
  (the month chip, the page of years, a range's ends) and the chosen cell `label-lg-strong`, cells **40** high — the
  36 of `sm` × 24 / 20, the two line boxes, on the 4px grid. `sm`: as it was, 14 on 36.

Measured on « À la largeur du champ » (470px): panel 470 under a 470 field, day cells 40 × 40 at 16px, the month chip
16px / 600; `sm` years 106.5 × 36 at 14px; at 300px no horizontal overflow in either size.
