# ADR-0087 — What sits on a map

**Date:** 2026-10-27
**Extends:** ADR-0001 (`Button`, `IconButton`, `ChartLegend`), ADR-0082 (`Tooltip` anchored)
**Source:** etolbi, EUDR items 3 (« MapControls + bouton de carte »), 4 (« MapOverlay — surface calée dans un coin
de la carte ») and 13 (« ChartLegend posée sur une carte »). Figma « ↪ EUDR — Carte · contrôles, encarts,
légende » (`3213:1427`), 15 sources; the reference is the owner's own exploration, « Tester la conformité »
(`2747:2900`). Validated « on va aller avec tes recommandations » on 27 Oct.
**Status:** Accepted

## Context

The product draws, by hand, on every map: a stack of buttons, panels in the corners, a legend. The owner's frame
had settled the geometry — 16px from the map's edges, separate 36px buttons 8px apart, white panels at
`elevation-raised` — and the benchmark said where it meets common use (white chrome on imagery 9 / 14, legends on
the map 8 / 10, collapsible 5 / 8) and where it parts from it (zoom grouped in one block 12 / 14, 10px margins
8 / 12). The recommendation kept the owner's drawing; it was validated.

## Decisions

Three pieces, none of which draws what the package already draws.

**`MapOverlay`** is a place: one of six — the four corners of the drawing and the middle of the top and bottom
edges (a toolbar centred, Global Nature Watch, Felt). It sits **16px** from the edges (the page's rhythm; the
majority's 10 was declined) and draws nothing: what it holds **stacks toward the map's centre**, 8px apart —
down from a top corner, up from a bottom one (MapLibre: « stacked toward the center of the map »). Only its
children take the pointer, so the map between them stays draggable. The map's container must be positioned.

**`MapPanel`** is the surface — the drawing's own: `bg-default`, `border-subtle`, `elevation-raised`,
`radius-surface-sm`, 12px inside. Its width is its content's, capped at **20rem for text**; what cannot wrap (a row
of buttons) widens it rather than spilling out — measured, the toolbar's two buttons overran the cap by 45px
before `min-width: min-content`. With a `title` it is named by it; `collapsible` puts a chevron in its head that
folds it into a `Button` bearing the title, in its place (Planetary), and the focus follows to the control that
replaced the one pressed.

**`MapControls`** is the stack: each button is **`Button` icon-only `secondary-gray` `sm`** (36px), not a drawing of
its own (ADR-0001) — its `border-default` reads better on imagery than the Figma component's `border-subtle`. Its
label is its name and its anchored `Tooltip`, which opens **away from the edge** (left by default: controls stand
on the right, 10 / 14). A tool that stays on is `pressed` — `Button`'s chosen mark and `aria-pressed`; a zoom at
its limit is `disabled`. A `role="group"`, not a toolbar: a toolbar promises arrow keys between its buttons.

**The legend is `ChartLegend`**, which gains `orientation="vertical"`: one entry per row, its figure at the end in
the receding ink — set in a `MapPanel`. The swatch keeps its `border-inset` hairline (ADR-0077), which 2 / 6 of
the map legends benchmarked bother with.

Found on the way: an anchored `Tooltip`'s hidden description was read again as text after its button (« Zoomer,
Zoomer »). It is `aria-hidden` now; a description is read through the reference, which still holds.

Verified in the browser: the five places 16px from their edges; four buttons 36px, 8px apart; the « Tracer »
tooltip 4px to the left, its arrow pointing back; pressed toggles, the zoom disables at its limit; the legend folds
into a button that takes the focus, and unfolds back to the fold.

## Still open

- A continuous legend (an NDVI ramp) waits for a sequential palette — ADR-0016 has only the categorical one.
- A layers button opens whatever the product wants; no popover of layers is shipped.
