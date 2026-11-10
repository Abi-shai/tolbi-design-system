# ADR-0148 — An eligible zone's panel

**Status:** accepted — 10 Nov. 2026 (etolbi; the owner's frame, Figma `4058:1446`)

## Context

The owner drew the « Données » panel of an eligible zone in all its cases: *Parcelles éligibles*, *Parcelles
écartées* (one row per reason, each with the parcels it set aside), *Critères d'éligibilité* (a yes, a no or « à
prouver » per criterion) and a foot. Four pieces were missing or provisional in the product: a hairline around each
block, a pile of parcel glyphs (`ArrParcelStack`), a status row without its glyph, and a list that unfolds — the
product had a link-button standing in for `AlertsBlock`'s behaviour.

## Decision

- **`PanelBlock` carries a hairline**, always — the owner drew it on every block, and a block's tint alone is 1.05:1
  on the panel's white. **`border-subtle`, not the frame's `border-subtlest`**: in dark `border-subtlest` *is* the
  block's ground (`gray-forest/800`, 1.000:1) and the edge would vanish; `border-subtle` is 1.18:1 on the panel in
  light and 1.64:1 in dark — the edge every elevated surface already carries (ADR-0030). `Card sunk` already draws a
  transparent 1px border, so nothing moves. It reaches `AlertsBlock` too, which is a `PanelBlock`.
- **`ProjectGlyph count`** — the owner's « Zone/Pile de parcelles », measured: a box 30 % larger than the drawing
  (52 at 40), a step of 15 % (6px), **one** drawing centred for 1, **two** on the diagonal for 2 (the back one at 0.6),
  **three** from corner to corner past that (0.35, 0.6, 1) — back up and to the right, front down and to the left.
  Every layer is the same drawing in the same variant. `count` absent keeps the single drawing in its own box; given,
  even `1` takes the pile's box, so a list of piles keeps one geometry. A prop, not a `ProjectGlyphStack`: the pile is
  the drawing's, and a second component would have to repeat `kind`, `status`, `seed` and `size`.
- **`StatusRow :glyph="false"`** — the word alone, in its tone's ink (the on-tint partners of ADR-0092, not the
  frame's `text-success`/`text-error`, which fail AA for a word on white). ADR-0006 holds: the tone never speaks
  alone, the word does — « Oui », « Non », « À prouver ». For verdicts whose word is already unambiguous, where a
  column of marks would say each answer twice. A boolean that turns a part off, like `toggle` and `home`.
- **`PanelBlock limit`** owns the list that unfolds — `limit`, `seeAllLabel`, `collapseLabel`, `v-model:expanded`:
  the first `limit` items, then one button « Tout voir (n) » that turns to « Réduire », the rest opening in place
  (ADR-0025's `0fr → 1fr`, `enter` in, `exit` out). An item is a top-level node of the slot, a `v-for` counting as
  its items. **`AlertsBlock` now renders it** rather than carrying its own copy (ADR-0001): its rows go in the slot,
  its 6px rhythm through `--panel-block-list-gap` (a variant switch), its press-on-the-block shortcut stays its own.
  Measured unchanged: 226px folded, 312 unfolded, the same `play` test.

## Measured

`Structure/PanelBlock` « Zone éligible »: both blocks `rgb(234, 236, 240)` at the edge; four piles, each 52px, of 3,
3, 2 and 1 layers for 15, 6, 2 and 1 parcels; two motifs shown, « Tout voir (4) » unfolds to four, « Réduire »
folds back — a `play` test. `AlertsBlock` « Se déplie au clic » passes unchanged.

## Still open

- `ProjectGlyph` statuses for clearing, overlap and wetland (the product's « plus tard ») — drawings first.
- The frame's block is 16 around and 12 between; `PanelBlock` stays at ADR-0143's 12 and 8.
