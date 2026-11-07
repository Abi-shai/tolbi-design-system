# ADR-0127 — The action as its glyph

**Date:** 2026-11-07
**Amends:** ADR-0126 (a row that holds an action)
**Source:** etolbi — in a narrow column (`MapPanel lg`, ~26rem) the worded « Télécharger » took a third of the row:
the title folded on two or three lines, the sentence on four.
**Status:** Accepted

## Decisions

- **`actionIconOnly`**: the action drawn as its glyph alone — `Button` icon-only `secondary-gray` `sm`, a 38px square
  (ADR-0110), `actionIcon` its glyph. Measured in a 26rem column: every title on one line, where the word folded them.
- **The word stays**: `actionLabel` is still required — the button's accessible name and its anchored `Tooltip`
  (ADR-0082: 400ms, `:focus-visible`, shown on a disabled trigger too) — and the button is still described by the row
  (title + sentence), so a list of glyphs still says which file each one gets.
- `actionLoading` spins in the same square (38 → 38px, ADR-0027); `disabled` greys the row and the button.
- A glyph alone needs a glyph: without `actionIcon` the word stays on screen rather than draw an empty square.
- The rest of ADR-0126 holds: the row is not a control and carries one action.
