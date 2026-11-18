# ADR-0215 — The cover turns white under the pointer

**Status**: accepted (the owner, 18 Nov. 2026 — track H1). This amends ADR-0214's hover.

## Context

Under the pointer, an article card takes the tray's hover (`--on-tray-hover`, ADR-0199). ADR-0214 stepped the grey
cover to `bg-neutral` at the same time, and faded the pattern to 45 %. The owner saw it on the page: card and cover
became **the same grey**, one block in which you could no longer tell the card from its picture.

He compared four hovers on a board in the session, each card shown at rest, frozen in its hover state, and live:

| Track | Under the pointer |
|---|---|
| Current | card and cover share one grey; the pattern fades |
| H1 | the cover turns white; the pattern stays at 1.2 % |
| H2 | the cover turns white; the pattern goes to 2.5 % |
| H3 | the cover turns white; the pattern goes to 4 % |

He retained **H1**.

## Decision

- Under the pointer and on keyboard focus, the card still takes the tray's grey. The cover **turns white**
  (`bg-default`), the inverse of its own rest, so the card and its picture stay two things.
- The pattern **keeps its ink and its 1.2 %**. It no longer fades: on white the 1.2 % is fainter still, and the white
  alone carries the change.
- The ground changes over `quick` (`easing-default`), the card's own hover duration, and at once under reduced motion.
  Nothing moves.
- In dark the same roles apply, so the cover goes to `bg-default`'s dark value, the darkest step. It is still the
  inverse of the card's hover.

## Measured

| What | Light | Dark |
|---|---|---|
| Cover at rest | `rgb(249, 250, 251)` | `rgb(38, 49, 43)` |
| Cover under the pointer | `rgb(255, 255, 255)` | `rgb(24, 32, 28)` |
| Card under the pointer | `rgb(242, 244, 247)` | — |
| Pattern | `fill-opacity` 0.012, opacity 1 in both states | the same |
| Title on the hovered cover, where two stamps overlap | 16.93:1 | 11.92:1 |

The card stays 288 × 213. The article stories render and pass their `play`.

## Consequences

Nothing changes on the product side. The exploration board was a temporary story and has been deleted.
