# ADR-0063 — The awakening is the exception

**Date:** 2026-10-07
**Departs from:** ADR-0002 (motion principles: length, choreography, decoration) and the brand
charter (no glow), for one moment, with the owner's acceptance
**Extends:** ADR-0056 (the sign is one drawing), ADR-0057 (the light goes round)
**Source:** Figma Sprint 18, `TolbiAI/Éveil` (`2393:101704`) — eight sizes on a 3.2s timeline, played
once — « version retenue par Abishaï le 7 oct. 2026 ». The last of the eight Tolbi AI steps.
**Status:** Accepted

## Context

ADR-0002 keeps motion short, single and plain: no decorative choreography, no fanfare, nothing longer
than a heavy surface's 400ms. The brand charter has no glow. The awakening breaks all of it: 3.2s, a
turn, two rounds of light, a delayed entrance and a soft golden halo. It is the sign's first
appearance — the panel's first opening — and the owner accepted it for that one moment, so the work
here is to make it exactly what was accepted and to keep it in its place.

## Decisions

### A state of the sign

`TolbiAiSpark` gains `state="awakening"`. Figma needed a set because a variant cannot play once; in code
it is the same drawing — the four leaves in a group that turns and grows, the spark in a group with
its glow.

### Transcribed, not redesigned

Every track is Figma's Motion data: the turn (0 → 360° by 1.65s), the growth (94 → 100 % by 0.5s), each
leaf's opacity through two rounds from the north — N, E, S, W, a leaf every ~0.2s, all full at 1.75s —
the spark (in at 1.70s, over 250ms) and its glow (rises 400ms, holds 400ms, fades 700ms). Seeked every
10ms in a browser, the eight tracks sit on Figma's curves to under 0.001 — the turn to 0.0005°.

The turn and the growth run on one group with different timings, so they are the individual `rotate`
and `scale` properties, two animations on one element, rather than one `transform`.

### Its curves are its own

`ease-in-out` here is motion.dev's easeInOut — exactly the CSS keyword, (0.42, 0, 0.58, 1) — not the
`easing-in-out` token; the turn and the arrivals ease out on (0.18, 1, 0.3, 1); the last rise of the
light on (0.42, 0, 0.25, 1). None of them is the system's, and that is the point: an exception borrows
nothing from the scale it departs from. They are literals in the keyframes, where a `var()` would be
dropped anyway (ADR-0057). ADR-0002's hard line still holds — no control point above 1, no overshoot.

### The glow is the spark, blurred

A copy of the spark beneath it, through an SVG `feGaussianBlur` of 1.25 in the drawing's own units —
Figma's layer blur of 2.5, halved as CSS halves it — so the glow scales with the sign. The filter's
region is widened: its default 10 % margin cut the halo's edge.

### It ends at rest, and says so

The last frame is `rest`, value for value — leaves full, the turn at 360°, the spark in, the glow gone —
so the state can stay `awakening` or change afterwards without a jump. `awake` fires once, on the
turn's end. Under reduced motion the final state shows at once, and `awake` fires at once too: nothing
plays, so nothing would ever end.

### When is the product's

The first opening is the product's to know. `TolbiAiWelcome` takes `awaken`, and plays it **as the
panel opens**, not while it is closed: a CSS animation starts when its class lands, so an awakening
mounted in a closed panel would play unseen and be over by the time anyone looked. On `awake`, stop
asking for it, or the next opening plays it again.

**Amended by ADR-0071:** the turn alone — its 1.65s and its curve, nothing else — answers the launcher's
hover, from rest to rest, through `TolbiAiSpark.turn()`. Everything else stays with the first opening:
the two rounds of light, the spark's arrival, the glow.

## What changes

- `TolbiAiSparkState` gains `'awakening'`; `TolbiAiSpark` emits `awake`.
- `TolbiAiWelcome` gains `awaken` and `awake`; the panel's context carries `open`.
- `TolbiAiSpark/Éveil — l'exception`, with a replay; the panel's page story awakens on its first
  opening.

## Still open

- **The charter** should say that the glow exists, once, here — Figma's charter page (00.8) is where
  « no glow » is written.
- **The size.** The panel's welcome sign is 64px (96 expanded); the overview shows the awakening on its
  own at 96. The motion is the same drawing at any rung.
