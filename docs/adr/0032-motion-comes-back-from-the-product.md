# ADR-0032 — Motion comes back from the product

**Date:** 2026-09-17
**Status:** Accepted
**Extends:** ADR-0002/0015 (the duration scale), ADR-0021/0023/0026 (the transition family)
**Source:** `etolbi-v1`, branch `homepage-banner-redesign` — `app/components/section-project-metric.vue`,
commit `74b4299` *"ralentir l'entrée du bandeau et la faire réellement jouer"*

## Context

Every previous ADR moved values **into** the product. This one moves them out of it. The dashboard
banner was given motion in the product repo, the motion was debugged there against measurements, and
one of its own comments says where the result belongs:

> `--ds-motion-duration-ambient` … *posé dans `main.css` et non dans `ds-tokens.css` : ce dernier est
> généré en amont et l'ajout serait écrasé. À remonter dans le générateur de jetons à l'occasion.*

This is the occasion.

## Decisions

### `ambient` (600ms) joins the duration scale

The scale stopped at `considered` (400ms), which is still brisk for a surface that occupies the full
width of the page. `ambient` extends it by one step **at the ratio the scale already uses** —
×1.5: 200 → 300 → 400 → 600.

The name follows ADR-0015's rule that a duration is named for its character and not its length:
*a movement nobody watches*, one that sets a scene rather than answering a gesture.

### `RevealTransition` — a surface that opens its own height

The fourth member of the family, after `SurfaceTransition` (floats), `MarkTransition` (confirms) and
`SwapTransition` (hands over). This one **opens in place**.

Three things it carries out of the product:

**It is not a fade.** The height opens, and the content arriving is a second, later movement —
delayed by `enter` (200ms) so it lands as the height is nearly won. The product's comment is the
clearest statement of why: *« c'est ce décalage qui fait la différence entre "ça s'ouvre" et "ça
apparaît" »*.

**`ambient` + `easing-in-out`, not `process` + `easing-default`.** Measured in the product at 300ms
on `easing-default`: 44% open in 50ms, 71% in 100ms, then dawdling — `easing-default` is a
pronounced ease-out that leaves the line flat out, which is right for a state change and wrong for a
full-width surface.

**The two-frame problem, which is now impossible.** The product's first version toggled a flag inside
`requestAnimationFrame` and the transition *never ran at all*: rAF fires at the start of the
rendering steps, **before** style recalculation, so the `v-if` insertion and the class both landed
before the first calculation, the browser never saw the collapsed state and painted the final one.
Measured: 100% of the height on the first frame. The fix there was a second, nested rAF.

Vue's `<Transition>` has always done exactly that — `nextFrame` in `runtime-dom` is literally a
`requestAnimationFrame` inside a `requestAnimationFrame`. **The component exists so that the bug
cannot be written again**, which is a better reason to extract something than reuse.

The row is a grid going `0fr → 1fr` (ADR-0025) rather than a measured height. `height: auto` is not
animatable, and the grid also collapses the content's own padding and margins for free: the product
animates five properties — height, both paddings, both margins — to reach the same place. Unlike
`SurfaceTransition` this renders its **own** element, so the grid cannot land on the wrong one and
the styles can be scoped.

### `useMarquee` — a row that scrolls and never arrives

A marquee is **not** a transition, and the duration scale does not describe it: `instant` … `ambient`
name discrete changes of state. Only the two moments where a marquee changes state borrow from the
scale — starting up and stopping under the pointer, both over `considered`, because a row that stops
dead reads as a bug rather than as a courtesy.

Three details that cost measurement in the product and would cost it again:

- **Speed is px per second, not per frame.** The first version added 2px per `requestAnimationFrame`,
  so a 120Hz screen ran at twice the speed of a 60Hz one — the rhythm was not a setting, it was the
  hardware.
- **Elapsed time is capped** at 50ms. A backgrounded tab stops firing frames, and without a ceiling
  the first frame back applies the whole gap and the row jumps half a lap.
- **The wrap subtracts, it does not reset.** `position -= half`, not `position = 0`: the position is
  fractional and dropping the remainder is a visible stutter once per lap.

It stays an **internal** composable, like `useSlidingIndicator` (ADR-0024) — `ModuleBanner` gains
`motion="marquee"` and owns the shape the loop needs. The component renders the run **twice** itself
rather than asking the caller to, and hides the copy from assistive tech; the loop wraps on half the
track width, so the two halves have to be identical.

One rule travels with it: **the element whose transform is rewritten each frame carries no transition
of its own.** A transition there sends every frame through an interpolation and the row seizes.

### The easings were CSS-only, and the product paid 25 points for it

The entrance needed nothing new beyond `ambient`. The **ramp** did, and the gap only showed up when
the hand-written curve was checked:

```js
const easeOutQuart = (t) => 1 - (1 - t) ** 4   // "l'expression JS d'--ds-motion-easing-default"
```

It is not. Solved against the real `cubic-bezier(0.25, 0, 0, 1)`:

| t | easeOutQuart | `easing-default` |
|---|---|---|
| 0.1 | 0.344 | **0.094** |
| 0.3 | 0.760 | 0.668 |
| 0.5 | 0.938 | 0.874 |

**25 percentage points apart** at t=0.1 — the house curve holds back at the start and that one does
not. The comment was written in good faith; nothing could have checked it.

The cause is a hole in ADR-0019. That ADR says the JS platform exists "for the cases a CSS custom
property CANNOT serve — a canvas-rendered chart cannot read `var(--ds-…)`, and neither can a
**computation**". A `requestAnimationFrame` ramp is that computation exactly — and the export handed
it `"cubic-bezier(0.25, 0, 0, 1)"`, a **string**, which cannot be evaluated at t. The one consumer
that needed the curve had no choice but to re-derive it, and got it wrong.

So the export now ships the curves as **callable functions**, generated from the same token values as
the CSS so the two cannot drift:

```js
import { easing } from '@abi-shai/tolbi-design-system/tokens/js'
const eased = easing.default(elapsed / duration)
```

`useMarquee` uses it, and that import is **the one legitimate JS token import inside the library**.
The distinction is not a loophole and the linter now holds it: a resolved *value* read in JS is a
second source of truth that bypasses the cascade, but an easing curve has no cascade to bypass —
there is no `var()` that evaluates a bezier at t. `no-token-js-import` now walks `.ts` as well as
`.vue` (it only ever saw `.vue`, which is precisely why a composable could do this unobserved) and
allows exactly `easing` and `cubicBezier`.

### What was NOT added, and why

Two things about the entrance look like missing tokens and are not:

**A delay.** The content is offset by `duration-enter` used as a `transition-delay`, and nothing else
in the catalogue has a delay at all. But a delay *is* a duration in a different slot — minting
`--ds-motion-delay-*` would alias six names onto the same six values and add no decision, which is
the `fg` failure mode ADR-0009 deleted and the reason ADR-0015 gave for motion having no numeric tier.

**A travel distance.** `translateY(6px)` is a literal. ADR-0021 minted `scale-enter` because two
components had independently chosen 0.98 and 0.96 — a disagreement worth settling. Here the
catalogue has **three** translate distances and they are 6px, 16px and 20px: three sites, three
values, no convergence. ADR-0020's bar was thirty-eight sites agreeing on `1px`. Three is not a
scale, and naming it now would fix an accident rather than a decision.

`easing-in-out`'s description was widened instead: it said "Spatial — lateral movement. Tab
indicator, drawer slides", which did not cover a surface opening its own height, and that is now the
second thing it names.

### Less motion must not mean less content

Found while testing the extraction, and worth its own rule. Under
`prefers-reduced-motion: reduce` the loop stops — correct, and what the product does. But the
viewport is `overflow: hidden`, so a stopped marquee put **every capsule past the fold out of
reach**: the only way to them was dragging, which is motion the reader just asked not to have.

So the viewport hands the row back: `overflow-x: auto` when the query matches. The reader scrolls it
themselves. `useMarquee` returns `reducedMotion` for exactly this — any caller that clips its content
has to answer the same question.

This is the general form of the rule ADR-0002 states for transitions: someone asking for less motion
gets the **final state**, not a faster version of the movement — and never less of the content.

## Measured

Against the product's own figures for the same curve:

| | this | product |
|---|---|---|
| 50ms | 2% | 2% |
| 150ms | 27% | 24% |
| 300ms | 79% | 78% |
| 600ms | 100% | 100% |

and the band opens to 102px, which is the Figma height. The marquee runs **60.2 px/s** at cruise
against a target of 60, holds at **0.0px over 800ms** under the pointer, and returns to **60.0 px/s**
on leaving. Under `prefers-reduced-motion: reduce` the reveal lands at its full 102px on the first
frame and the marquee sits at 0 px/s with the viewport scrollable — the two together are what "no
motion, and nothing lost" looks like.

## Still open

- **The product still has its own copies.** `--ds-motion-duration-ambient` in `main.css`, the
  hand-rolled reveal flag with its two rAFs, and the scroll loop in
  `section-project-metric.vue` can all be deleted in favour of the token, `RevealTransition` and
  `ModuleBanner motion="marquee"`. Not done here — this repo cannot land a change in that one.
- **The product's third copy of the reduced-motion rule.** The DS handles transitions globally
  (`motion.css`), `useMarquee` watches the query itself because a rAF loop is not a transition and
  the global rule cannot reach it, and the product carries a local copy of the same rule that can go
  with the rest.
