# ADR-0121 — A gauge that follows a moving map

**Date:** 2026-11-06
**Amends:** ADR-0100 (`MapNavigator`'s zoom gauge), ADR-0111 (the pressed veil, catalogue-wide)
**Source:** etolbi, the dMRV page — the map's zoom reaches `v-model:zoom` continuously (13.62…) while it moves
(wheel, « Recentrer », `fitBounds`); the native range's `step` rounded it to whole levels, so the thumb jumped
level to level, and on − / + it teleported while the map travelled 300ms.
**Status:** Accepted

## Decisions

- **The gauge shows any value.** The native range takes `step="any"`; `zoomStep` only sets what − / +, the arrows
  and Page Up / Down move by (Home / End go to the ends) — the keys are handled by the gauge, since `step="any"`
  leaves the browser's own step undefined. The API does not move: `v-model:zoom` is the contract.
- **Two ways the thumb moves, which must not mix.** *Following*: a value that arrives frame by frame *is* the motion,
  so the thumb sits on it with no transition — one would trail the map by a whole duration. *Gliding*: a step is one
  jump of the value, which the map then travels; the thumb travels with it over `duration-process` (the map's) on
  `easing-in-out` (a thing that travels), **pinned to its target** — the product's echo of the target, then the
  map's values on the way there, would otherwise pull it back and forth. A value outside the trip (the wheel turned
  the other way) is a new gesture, and the glide yields. A second press steps from where the thumb is *going*.
- **Dragging never glides**, and the thumb is pinned under the finger, so a map that follows a little late cannot
  pull it back; let go, it stays while the map catches up. Under reduced motion nothing glides.
- **The thumb is drawn** (`MapZoomGauge`, internal): the native one cannot be animated, so it is transparent and
  keeps the pointer, the keyboard and the reader (`aria-valuetext` rounded to a tenth); the drawn one travels the
  same span (the gauge less one thumb) by a `transform`. The focus ring moves to it.
- **A pressed `IconButton` shows it** — `ghost` / `subtle` take `Table`'s pressed veil (`text-strong` 12 %)
  everywhere, at `instant`, so an 80ms click is seen before the map moves; the release fades back at the button's
  pace. `danger` keeps its red 18 %.
- Measured, a map simulated as an engine (300ms, `easing.inOut` from `./tokens/js`, written back every frame):
  thumb − map ≤ **0.40px** on +, 0.06 on two quick presses, **0.00** on the wheel, 0.01 on « Recentrer »; zero
  reversals; the dragged thumb 0px from the finger. The pace matches only if the product's map uses the same curve:
  `easing.inOut` is exported as a function for exactly that (ADR-0032).
