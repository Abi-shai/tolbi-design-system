# ADR-0187 — A cross on the mini-map

**Status**: accepted (the owner, 16 Nov. 2026). This adds to ADR-0185 and ADR-0186.

## Decision

**The open mini-map carries a close at its top-right corner**, where the old navigator's fold stood (ADR-0100):
- `IconButton xs variant="surface"`, a white disc that stands off the drawing;
- glyph `x`, 4px inside the mini-map's corner;
- an anchored tooltip;
- its name is `minimapCloseLabel`, « Fermer la mini-carte » by default.

**It does what the mini-map's button does when on**: it turns the mini-map off (`minimap-open` → `false`) and turns
its button off. The focus goes back to that button, which is the way to open it again.

The mini-map can therefore be closed **two ways**: its button in the column, and the cross on the mini-map itself.
A cross on the thing is the plainer of the two. Nothing else changes: still no press outside and no Escape
(ADR-0185), and still the last action winning (ADR-0186).

## Measured (`Données/Map/Navigator`, 1 440px)

| What | Value |
|---|---|
| Mini-map | x 1 148–1 348, y 40–168 |
| Cross | x 1 312–1 344, y 44–76 (32px, 4px inside the corner) |
| A press on the cross | the mini-map is gone, its button `aria-pressed="false"`, the focus on « Mini-carte » |
| The button pressed again | the mini-map is back |
