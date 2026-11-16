# ADR-0189 — The folded panel keeps the map's margins

**Status**: accepted (the owner, 16 Nov. 2026). This amends ADR-0173, ADR-0181 and ADR-0182 on one point: « the
button does not move ».

## Context

Since ADR-0173 the folded capsule was placed so that the fold button landed on the pixel it held in the head. The
button sits inside the head's padding, so the capsule stood about 10px lower and further right than the open panel's
corner. It was off the margins every other surface on the map's edges keeps: the tools column, the legend, the
timeline.

## Decision

**The surface stays anchored at the corner, not the button.**

- **The capsule's top-left corner is the open panel's top-left corner**, so it keeps the same top and side margins as
  the map's other surfaces. Its old margins, and the press-time measurement that fed them, are gone.
- **The button is centred in the capsule** (6px from its edge), so it stands in two places: (41, 40) in the head and
  (30, 30) in the capsule.
- **The ~10px between those two places is carried by ADR-0182's stretch**. The head's button rides on Web Animations
  over the shell's own duration and curve (`considered` + `easing-in-out`). It is never a jump:
  - on the fold, it travels to where the capsule will hold it, then the capsule's button replaces it;
  - on the unfold, it starts where the capsule held it.
- **The product folding through `v-model:collapsed` (ADR-0183) gets the same motion.**
- **Under reduced motion it is still a fade in place**: the two forms swap with no travel.

**Found while filming.** One frame of the unfold showed the panel bare, with neither its shell nor its button
carried. The arrival was awaited one animation frame at a time, and the out-in swap inserts the panel in a callback
whose frame is painted first. It is now heard through a `MutationObserver`, whose callback runs before the paint.

## Measured (`Données/Map/GIS screen`, 1 440 × 860)

| What | Value |
|---|---|
| Open panel | top-left (24, 24) |
| Folded capsule | (24, 24) → (76, 76), the same top as the tools column and the legend (24) |
| Button | (41, 40) in the head, (30, 30) in the capsule |
| Fold, sampled every frame | 126 frames, ≤ 0.84px per frame, 0 reversals |
| Unfold, sampled every frame | 130 frames, ≤ 0.86px per frame, 0 reversals; shell and button from the first frame |
