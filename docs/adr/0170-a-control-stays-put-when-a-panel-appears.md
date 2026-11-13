# ADR-0170 — A control stays put when a panel appears

**Status**: accepted (etolbi, 13 Nov. 2026; the owner: « un contrôle ne bouge pas quand un panneau apparaît »).

## Context

In Carbone at 1 440px, `MapNavigator` and a parcel's sheet (`MapPanel lg`) share `MapOverlay position="end"`: the
navigator, then the sheet under it.

| Sheet | Navigator x |
|---|---|
| Closed | 1 254px, against the right edge |
| Open | 1 012px, 242px to the left |

When the sheet opens, the overlay widens to the sheet's 400px and the navigator jumps left. The ARR screens, with the
mini-map, do the same.

The cause is the navigator's own `align-self: flex-start`. It was written so the card keeps its own height in a row,
because « a stretched card is a hole in the map ». In the overlay's column it is the **cross** axis, horizontal. A
self-alignment overrides the container's, so `end`'s `align-items: flex-end` never reached it. The navigator sat at
the start of the column, which is the right edge only while it is the widest thing there.

## Decision

- **A control is placed by its overlay**: against the overlay's edge — `flex-end` on `end` / `top-end`,
  `flex-start` on `start` / `top-start` — whatever is stacked under it.
- The navigator no longer declares an `align-self`.
- What the line was for, not being stretched in a row, is now said by the navigator's **height**:
  `height: fit-content`. A flex item with a definite cross size is not stretched, and in a column it is the size it
  already had.
- No API change.
- The other pieces that go into an overlay (`MapPanel`, `MapControls`, `MapLegend`, `MapTimeline`, `MapStatus`)
  declare no self-alignment on their root. `MapLegend` and `MapTimeline` have `align-self: center` only on inner
  rules.

## Measured

`Données/Map` « Sélection d’un objet », which now stacks the navigator over the sheet in `end`, as Carbone does,
at 1 440px:

| State | Navigator x | Height |
|---|---|---|
| Sheet closed | 1 258–1 416 | 42px |
| Every frame of the sheet's entrance (overlay 1 016–1 416) | 1 258–1 416 | 42px |
| Sheet closed again | 1 258–1 416 | 42px |
| Old rule, sheet open | 1 016–1 174 — the 242px jump, reproduced | |
| « Écran SIG », with the mini-map in `top-end` | 1 250–1 416 | 154px, unchanged |
