# ADR-0045 — Half the movement was already there

**Date:** 2026-09-24
**Extends:** ADR-0032 (a single `requestAnimationFrame` fires before style recalculation), ADR-0025
(`height: auto` is not animatable), ADR-0039 (read the rendered pixel, not the property you just
wrote), ADR-0042 (a defect that fails asymmetrically certifies itself in the direction that works)
**Supersedes:** ADR-0037's *"the header's restack stays a cut"*. It is no longer a cut — and it was
never quite one.
**Status:** Accepted
**Breaking:** No API change. The collapse and expansion of `SideNavigation` look different.

## Context

ADR-0037 gave the column's collapse a travel and left the header's restack a **cut**, on the
argument that `SwapTransition` is the wrong tool for it: `out-in` would empty the header and drop
the rows twice instead of once. That argument is still right. It just surveyed two options where
there were three.

Filmed frame by frame, the restack was not a cut either. It was **half of each**:

| | collapsing | expanding |
|---|---|---|
| toggle, frame 0 → 1 | **212 → 112**, a 100px cut | **12 → 21**, a 9px cut |
| toggle, frame 1 → end | 112 → 12, continuous | 21 → 212, continuous |
| mark, frame 0 → 1 | **12 → 56**, a 44px cut | 56 → 12, a 44px cut |

`flex-direction` is not animatable, so both children of the header land somewhere new the instant
`collapsed` flips. But the column's own width transition then carries a centred child the rest of
the way for free — which is why the toggle already travelled 100 of its 200px without anyone
writing that. An element that lurches and then glides reads worse than one that simply jumps,
because the glide promises a continuity the lurch already broke.

**And it failed asymmetrically.** The cut collapsing was 100px; expanding it was 9px. ADR-0042's
rule, met a second time: watching the gesture expand certified it.

Ten products were surveyed for a reference and none had one. [Stripe] and [Evernote] put the toggle
on the column's **edge**, where it never moves between the two forms; [Perplexity] **relocates** it
to the bottom of the rail. They remove the problem rather than animate it. Stacking the toggle above
the mark — which is what the design does — is the only arrangement that creates a trip to draw, so
there was nothing to copy.

## Decisions

### The mark has to be one element before any of this is possible

Two DOM elements cannot travel between two places. `WorkspaceSelector` was a `v-if` pair — a bare
`<button>` collapsed, a `DropdownTrigger` expanded — so the mark's 44px was not a cut that could be
absorbed, it was a replacement. ADR-0044 merged the pair for a different reason (one element means
one contour ladder); this is what the merge bought.

### FLIP, and not a DOM swap, because the button is the one that causes the gesture

The two forms want opposite orders — expanded is mark-then-toggle across a row, collapsed is
toggle-then-mark down a column. A `<TransitionGroup>` or a `v-if` pair would reorder or remount the
`IconButton`, and **that button is what the user just pressed**. Moving or destroying a focused
element takes focus with it, dropping a keyboard user to `<body>` mid-gesture. `column-reverse`
keeps the element exactly where it was; measured after the change, `document.activeElement` is still
`ds-side-nav__toggle` after `Enter`.

The cost is that the collapsed form reads against the DOM. It is the cheap side of the trade: two
controls that neither depend on nor explain each other carry no sequence to preserve (WCAG 1.3.2)
and either order is operable (2.4.3).

### The FLIP cancels the discontinuity and **nothing else** — which is why it does not tear

This is the part worth keeping. The inverse transform is released over `enter` on `easing-in-out`,
and the layout continues to carry the rest of the journey on the *same* curve, because the column's
width transition uses the same two tokens. With `f(t)` the shared easing:

```
layout      x(t) = 112 − 100·f(t)      the column narrowing, a centred child following
transform      (t) = 100·(1 − f(t))    the FLIP releasing
visual      x(t) = 212 − 200·f(t)      one eased travel, 212 → 12
```

The two halves **sum to a single eased trip** rather than stacking two motions on one gesture
(ADR-0037's tear). That is the same rule that ADR already found for the indicator — *the column owns
the easing and the indicator inherits it through the measurement* — extended to an element that
inherits it for only part of its path. Nothing in the composable or the stylesheet repeats a
duration: both are read off the cascade at the moment of the flip.

The double `requestAnimationFrame` is not a precaution. A single one fires *before* style
recalculation, so the inverse transform would never become a start value and the element would
appear in place — ADR-0032 found exactly this in the product's reveal.

### `align-items: stretch` on the collapsed header is a motion decision, not a layout one

Centred, a child's x is `padding + (header − child) / 2`, so any disagreement between the two widths
is **amplified** on the way down. Measured with the mark resolving its own `width` against a header
still following the column: x ran 16 → 12.30, **reversed to 13.81**, and snapped 1.8px to 12 on the
last frame. Stretched, every child is the header's width and x is just the padding — one curve, and
nothing left to disagree.

### Two lengths, or the height does not travel

`height: auto` is not animatable (ADR-0025), and the mark's box was snapping 48 → 36 at frame 0
while everything around it travelled. `--side-nav-header-row: 48px` joins `--side-nav-rail-row:
36px` — an own-value, so a component token (ADR-0010). 48 is the control's own height
(8 + `Avatar sm` + 8), not a step of layout rhythm, which is ADR-0013's argument for why control
padding is its own scale.

### A collapsing track must stop *growing*, not just stop showing

`grid-template-columns: 0fr` empties the track's content; `flex: 1 1 auto` still lets the element
absorb whatever the box has spare. Measured, that was 4px of a 36px mark — the avatar flush against
the left edge, the ring 0 on one side and 4 on the other, and `justify-content: center` with nothing
to centre because the line was already full.

`flex-grow: 0`, and specifically **not** `flex: none`: `none` resolves the base size from the
content, and a `1fr` column mid-transition still reports max-content, so the track would snap to the
whole name's width on the first frame.

## Consequences

**Measured after, both directions, rAF-locked at full precision:** zero reversals on x, y, width and
height for the toggle and the mark collapsing; one left on the mark's width expanding. The toggle is
36×36 in both forms, where it used to render **32×36** — a `flex: 1 1 auto` sibling was squeezing it
and there was no `flex` of its own to stop it, which at `radius-pill` is an ellipse rather than a
round button. ADR-0039's family again, and 4px of *growth* had been folded into the cut.

**The verification is a reversal count, and it is new here.** A screenshot cannot show a 1.5px
wobble and a filmstrip cannot either; what shows it is sampling the rectangle on every animation
frame at full precision and counting sign changes in consecutive deltas. Every decision above except
the focus one was made or unmade by that number. It found the centring amplification, it found the
4px the track was eating, and it is what says the remaining defect is one reversal and not none.

**The regression it did not catch, and why.** Chasing the wobble, the collapsed box lost its
declared width on the theory that the header's `stretch` would supply it. It does — and only there.
Outside a `SideNavigation` the mark grew to whatever container it was dropped in, measured **143px**
in its own story. The reversal check ran on the collapse story, where the motion shows; the two form
stories were never reopened. *A component that only renders correctly inside one parent* is the
defect, and validating in the one story where the change is visible is how it shipped — which is
ADR-0042's rule pointing at the process rather than at a direction of travel.

## Still open

- **One reversal survives**, on the mark's width while expanding: the slot gains the toggle's 44px
  the instant the restack happens, and the FLIP only translates. Pinning the width through the
  flight costs more than the frame is worth, but it is the last discontinuity in the gesture.
- **Nothing in the build reads a motion property.** ADR-0039 left that open for durations and
  curves; this adds geometry to the list. The reversal check is a script that was run, not a test
  that runs — it needs a browser, and the suite is `node --test` with zero dependencies.
- **The FLIP is inline in `SideNavigation`.** `useSlidingIndicator` and `useMarquee` were extracted
  when a second consumer appeared; this has one. The next restacking surface decides.

[Stripe]: https://mobbin.com/flows/81c3d330-82bd-45c3-8a17-51598918bc2b
[Evernote]: https://mobbin.com/flows/0ba9d2fd-97b7-4db5-913d-123c26c44e17
[Perplexity]: https://mobbin.com/flows/bb48df59-858c-48e9-ad45-57c06f0cbc67
