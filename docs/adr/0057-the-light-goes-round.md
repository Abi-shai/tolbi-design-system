# ADR-0057 — The light goes round

**Date:** 2026-10-07
**Extends:** ADR-0056 (the sign is one drawing, each leaf its own path), ADR-0032 and ADR-0039 (a
loop's period is not a duration)
**Source:** Figma Sprint 18, `TolbiAI/Réflexion` (`2395:14767`) — eight sizes on a 0.8 s looping
timeline. The second of the eight Tolbi AI steps.
**Status:** Accepted

## Context

While Tolbi AI works, its sign « thinks »: the light goes round the four leaves, one at a time, for as
long as the work lasts. The product shows three bouncing dots today. Figma settled the motion as a
component of its own, with Motion data on each leaf.

## Decisions

### A state of the sign, not a second component

`TolbiAiSpark` gains `state="thinking"`. Figma needed a separate set because a variant cannot loop;
in code it is the same drawing with its leaves animated, and `TolbiAI/Étincelle` already listed the
four frames (Gauche, Haut, Droite, Bas) as states of the sign. The sign's whole life — not loaded,
working, there — is now one prop: `off → thinking → rest`.

### Four tracks are one curve

Figma's Motion data has a track per leaf. Read together they are one curve, offset by a quarter
turn: lit, down to 20 % over 200 ms, held for 400 ms, back up over 200 ms, both halves on
`easing-in-out` — the curve whose description is "a thing that travels". So there is one
`@keyframes` and three negative delays (−¾, −½, −¼ of the period). At every moment one leaf rises
while the one before it falls; nothing holds at full.

The period, 800 ms, is the component's own (ADR-0010): a loop has no start to time, so it is not a
duration and takes no token (ADR-0032, ADR-0039). Its quarter is the 200 ms Figma gives each
cross-fade.

### The first frame is the fixed view

Figma's timeline starts with the south leaf lit, while its fixed view — what the component shows at
rest — has the west lit. Started from Figma's t = 0, the loop would open by jumping from one to the
other. Code starts on the fixed view: the same loop, shifted 200 ms, so the first frame *is* the
loop.

### The wrap is seamless by construction

Rise and fall meet at the peak with zero velocity on both sides, so 0 % and 100 % agree in value
**and** in speed: no frame can tell where a turn ends. Checked in a browser, which is where the
handoff asked for it:

- seeked in 5 ms steps over two turns, the four leaves sit on Figma's curve to under 1e-5, and
  o(t) = o(t + 800) exactly;
- played in real time for 4 s — 486 frames, four wraps — every frame lands on the curve at the
  animation's own clock.

### A `var()` in a keyframe is dropped

The first version set the curve per keyframe, with `animation-timing-function:
var(--ds-motion-easing-in-out)` inside the `@keyframes`. Chrome drops it and the segment falls back
to `ease`: sampled, a leaf a quarter of the way up was at **0.527** where in-out puts it at 0.389.
The declaration was right and the pixel was wrong — ADR-0039's family again, and the reason the check
above reads opacities instead of trusting the stylesheet. The curve moved onto the element, and one
curve is all the keyframes need: the hold runs from 20 % to 20 %, where no curve can show.

### No yellow while thinking

`accent` is ignored in `thinking`. Figma's reason, kept: the loop says only that work is happening,
and the small spark comes back when the answer does.

### Reduced motion: `off`, then `rest`

No loop. The leaves hold at 20 % until the caller sets `rest`. The component says so with
`animation: none` rather than leaving it to `motion.css`'s global override, which would run each
leaf's curve once in 0.01 ms and land on the same frame only by the accident of the base opacity.

## What changes

- `TolbiAiSparkState` gains `'thinking'`.
- `TolbiAiSpark/Réflexion — la boucle`: the loop at every size, on the three grounds.

## Still open

- **`thinking → rest` is a cut.** The loop stops wherever it is and every leaf goes to full. The only
  surface that shows the loop — the waiting line, next — is replaced whole by the answer, so nothing
  shows that change yet; a settle would be designed when something does.
