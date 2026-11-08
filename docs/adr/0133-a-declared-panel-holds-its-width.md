# ADR-0133 — A declared panel holds its width

**Date:** 2026-11-08
**Amends:** ADR-0099 (`MapPanel lg`), ADR-0132 (secondary text in a reading panel)
**Source:** etolbi, 0.112.0 — on an ARR eligible zone, `MapPanel size="lg"` went from 400px (25rem declared) to 470,
and its body showed a scroll bar on macOS with « always show scroll bars ». The product rolled back to 0.111.0.
**Status:** Accepted

## What happened

Reproduced from the product's page (blocks, words and figures as written there): the panel measured **479px**. The
culprit was not the `StatGroup` — a query container contributes no min-content — but **`ShareBar`'s legend**: its track
lays every entry out in full and clips, so its min-content was the whole legend, « Éligibles 62 % · Forêt en 2016 30 % ·
Contour invalide 8 % », 411px at 14px. At 12px it had fitted under 368; ADR-0132's 14px pushed it past. And
`MapPanel` carried `min-width: min-content` for every size — `sm`'s rule, « what cannot wrap widens it » — so `lg`'s
declared 25rem gave way to it.

## Decisions

- **A declared width is held**: `MapPanel lg` takes `min-width: 0`. The content adapts to the panel, never the panel to
  the content. `sm` keeps its rule — it has no declared width.
- **The body never scrolls sideways** (`overflow-x: hidden`); it scrolls down only when the content runs past the foot.
  No gutter is reserved. Measured with classic scroll bars: 0px of bar when the content fits, 15px when it does not.
- **`ShareBar`'s legend asks for no width** (`flex: 1 1 0; width: 0`): it takes the room it is given.
- **In a reading panel the legend wraps** instead of being cut: with the panel held at 25rem, the third share read
  « Contou… ». The « never wraps » rule (ADR-0038) keeps a grid of cards level, and a panel has no grid. `MapPanel lg`
  and `Dialog` set `--reading-legend-wrap: wrap` and `--reading-legend-fade: none` beside ADR-0132's
  `--reading-secondary-font`; a `ProjectCard` resets both, so a card's legend is still one line, clipped, with `+N`.
- **The unit stays on its line** — the product's note asked for the unit under the figure as a fallback; that was refused
  twice (ADR-0109, ADR-0131). In the 400px panel with a 15px bar the tiles have 129px and « 25 560 tCO2e » is 127px at
  24px; the 20px step under 8rem (ADR-0132) is the next give.
