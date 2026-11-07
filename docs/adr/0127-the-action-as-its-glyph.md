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

## Amended (7 Nov.)

- On the owner's render: **no border** — « plus clean ». The glyph takes the catalogue's shape for a row's action,
  **`IconButton` `xs` `subtle`** (ADR-0112: round, borderless, the glyph alone at rest, `bg-hover` on approach, the
  pressed veil), not a bordered square: 32px, measured in the 26rem column, every title on one line.
- Busy, it keeps its focus and its place: a `Spinner` in the glyph's 16px box, `aria-busy`, the press ignored —
  not `disabled`, which would drop the focus from the button just pressed (ADR-0059). 32 → 32px.
- **No word, ever** (the owner, the same day: « sans texte… je veux sans texte »). The glyph is **the only form** of a
  row's action: the worded `Button` is gone and `actionIconOnly` is ignored (deprecated, kept so 0.108 callers still
  compile). `actionIcon` is the glyph (`download` when absent); `actionLabel` stays required — the name and the
  tooltip. ADR-0126's `Button` `secondary-gray` `sm` is superseded.
- Found on the way: a disabled `ghost` `Button` grew the filled buttons' grey box (`bg-disabled` + `border-subtle`).
  What has nothing at rest has nothing off — it now stays transparent and greys its ink, as `tertiary` and `link`
  already did — and its ink is **half** `text-disabled`, ADR-0118's rule for the subtle `IconButton`: gray 500 off
  beside gray 600 at rest read as live. Catalogue-wide.
