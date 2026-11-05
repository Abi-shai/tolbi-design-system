# ADR-0103 — Where the pieces sit on a GIS screen

**Date:** 2026-11-05
**Extends:** ADR-0087 (`MapOverlay`'s places), ADR-0099 (`MapPanel lg`), ADR-0100/0102 (navigator, timeline,
legend)
**Source:** the owner's retained ARR frames (Figma section 15, `3631:10776` — « Onglet 1 · Vue d'ensemble » and its
siblings, a 1424 × 828 map), after a first « Écran SIG » story that placed the pieces by guess.
**Status:** Accepted

## Decisions

**The layout is the frames', measured** (map 1424 × 828):

| Piece | Place | Box |
|---|---|---|
| `MapPanel lg` — the panel a screen is read from | **the whole left side**, 16px from top, left and bottom | 400 × 796 |
| `MapLegend` | **top**, centred on the map | 480 wide |
| `MapTimeline` | **bottom**, centred on the map | 480 × 42 |
| `MapNavigator` | **top end**, 16 / 16 | 166 × 155, open |

The legend and the timeline are **one axis**: the same 480px, centred, at the top and the bottom of the map. So
`MapLegend` declares **30rem** — the timeline's width — where ADR-0102 had a 592px ceiling.

**`MapOverlay` gains two places — a whole side** (`start`, `end`): from 16px under the top edge to 16px over the
bottom one. The six corner-and-middle places hug their content, so none could hold a column; the panel in the
frames runs the full height with its foot at the bottom. **`MapPanel lg` takes the height of a place that has one**
(`flex: 1 1 auto`) and still hugs in a corner. Its foot's action keeps its own width, as drawn.

`MapControls` is not on this screen: the navigator carries zoom and recentre. The Tolbi AI launcher in the frames'
bottom-right corner is the product's, not the map's.

Measured in the story « Écran SIG — toutes les pièces » at the frames' size: panel 16 / 16, 400 × 796; legend
472 / 16, 480; timeline 472, 480 × 42, 16 from the bottom (the frames say 14 — `MapOverlay`'s 16 holds);
navigator 16 / 16 from the top right, 166 × 154.

## Still open

- In the frames the panel's fold sits at the **end** of its head; ADR-0099 put it at the **start** (track A, so the
  control it becomes stands in the same corner). The code keeps ADR-0099 until the owner says otherwise.
