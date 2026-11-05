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

**The foot's rule is inset** (the owner, 5 Nov.): it stops at the content's edges, 16px in from the panel's, as
`Dialog`'s side panel draws it (ADR-0079) — a rule that runs to the border reads as a seam in the surface. Measured:
the rule and the action both start 16px inside the panel.

**The fold stays at the start of the head** (ADR-0099). It was moved to the end to match the frames, and brought
back the same day by the owner once the reason was plain again: the folded panel becomes its control in the panel's
top-left corner, so a fold at the start puts the two presses — fold, unfold, fold — in one place, the pointer
barely moving (`MapNavigator`'s rule, ADR-0100). The frames follow the code. Measured, « barely » was not enough:
the control sat in the overlay's corner, 25px from the fold's centre, and the pointer that folded landed on its
very corner — the second press missed. The fold's offset inside the panel is now **measured as it is pressed**
and the control takes it as its margin: the two centres are **0px** apart, six presses in one place, open ↔ folded
every time.

**The motion is the catalogue's, chosen by what moves** (the owner: « que la motion vienne vraiment du design
system, logique avec ce composant et cette interaction »). `MapPanel lg` stands on a whole side, so it is a **side
panel** and moves as `Dialog`'s side panel does (ADR-0079): `SurfaceTransition`'s fade and timings (`enter` +
`easing-out` in, `exit` + `easing-in` out, the exit faster — ADR-0021) with **24px of travel toward its edge** in
place of the scale; on `end` it goes right (`--map-panel-side`, set by `MapOverlay`). The control it becomes floats
in a corner, so it keeps the surface's scale. It was the scale for both — which said « a surface appears », not
« the panel goes back to its side ». Filmed at ×10: the panel travels 0 → −24px with no scale and no reversal, the
control scales 0.96 → 1, never a frame with both, the focus on the replacing control each way.
