# ADR-0188 — The mini-map is a frame around a picture

**Status**: accepted (the owner, 16 Nov. 2026). This amends ADR-0185.

## Context

The open mini-map was one grey: the card was glass and the map inside it sat on `bg-neutral-subtle`, so the eye
could not tell the thing from what holds it. The owner pointed at « Derniers projets » (`ProjectList`, ADR-0166),
a recessed frame (`bg-neutral-subtle`) around content on `bg-default`, and asked for the same reading.

## Decision

**The card is the frame and the map is the content**:
- the card is the reading glass's 90 %, tinted to **`bg-neutral-subtle`**;
- the map is on **`bg-default`**, white in light;
- when less transparency is asked for, the card is `bg-neutral-subtle`, opaque.

The map draws no hairline of its own, as `ProjectList`'s grid draws none: the step between the two grounds is the
edge. A drawing put in the slot no longer paints its own ground; the stories' SVGs dropped theirs.

In dark the same two tokens hold. The frame rises (`gray-forest/800`) and the content recedes (`bg-default`), which is
`ProjectList` in dark, and the ramp of ADR-0048 read from the other end.

## Measured (`Données/Map/Navigator`, 1 440px)

| What | Value |
|---|---|
| The card | `bg-neutral-subtle` at 0.9 (gray-50) |
| The map | `rgb(255, 255, 255)` |
