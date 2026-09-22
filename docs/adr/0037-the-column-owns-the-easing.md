# ADR-0037 — The column owns the easing

**Date:** 2026-09-18
**Status:** Accepted
**Extends:** ADR-0034 (the rail is the same component), ADR-0024 / ADR-0033 (`useSlidingIndicator`),
ADR-0032 (`RevealTransition`, and content arriving one step late), ADR-0025 (`0fr → 1fr`),
ADR-0021 (the exit is faster than the entrance)
**Breaking:** none. Nothing gains a prop; a collapse that used to cut now travels.

## Context

`SideNavigation` collapsed by cutting. The column's width, the rows' padding, the labels and the
selection pill all changed in one frame, which is not a state change — it is the same column, in a
different shape, and the interface had no way to say so.

The question was which of the design system's motion vocabulary speaks for it, not what would look
nice. The system already carries six durations named by intent, four easings, four transition
components and one sliding composable, and the answer had to come out of those.

## Decisions

### `easing-in-out`, which is not a choice

Its description names this case outright: *"Spatial — a thing that travels, rather than a state that
changes. Lateral movement (tab indicator, **drawer slide**)"*. A column that collapses is that
drawer. `easing-default` is excluded for the reason ADR-0032 measured rather than argued — it is a
pronounced ease-out that leaves the line flat out, 44% travelled in the first 50ms, which reads as a
snap on a surface this size.

### `enter` (200ms), decided by an existing consumer rather than by taste

The serious rival is **`considered` (400ms)**, which the scale describes literally for this — *"Heavy
surfaces — modals, drawers"* — and which has had no consumer since it was minted (ADR-0022).

It loses because the **sliding indicator inside this column already travels at `enter`**, and the two
move together during a collapse. Two durations on one gesture tear. Adopting `considered` here would
mean moving `Tabs` and `ButtonGroup` to it as well, which is a decision about selection, not about
this rail.

`considered` therefore remains unconsumed, and for a better reason than before: it is not that
nothing needs it, it is that the first thing that looked like it needed it was already committed to
its neighbour's tempo.

### The indicator stops animating while the column travels

This is the part that is not obvious from either component.

`useSlidingIndicator` re-measures on a `ResizeObserver`, which fires on **every frame** of the
column's width transition. An indicator that also ran its own 200ms transition would restart toward
a fresh target on each of those frames and trail the column's edge by a whole duration — the pill
still arriving after the rail had finished closing.

So the group withholds the `--animated` class while the column is in flight. Dropped, the pill takes
each measured frame straight: **the column owns the easing and the indicator inherits it through the
measurement.** One curve, by construction, rather than two transition lists that have to agree.

The flight's length is read off the cascade (`getComputedStyle` → `--ds-motion-duration-enter`), not
repeated in JavaScript. A duration written twice is a duration that will disagree once, and ADR-0019
already settled where the source is: this is not a case a custom property cannot serve.

### The row stops being pinned, so that it can travel

`SideNavItem` used to set `width`/`height: var(--side-nav-rail-row)` when collapsed, and the group
centred its items. Both had to go: a row pinned to 36px jumps there while the column is still
closing, and a centred item cannot travel because its own box moves under it.

The row fills the column in both forms and lets the column's width carry it down. It ends up square
regardless — the rail's inner width *is* that row, which is how ADR-0034 derived the rail in the
first place. What changes now are the things a transition can follow: the padding tightening from
`control-padding-sm` to `spacing-md`, and the gap closing, which together walk the glyph to the
middle. The height never moves — 8 + 20 + 8 in both forms — which is what ADR-0034 asked for.

### The label is the **second** movement

`RevealTransition` found the rule (ADR-0032): the offset between the surface opening and the content
arriving is the entire difference between *it opens* and *it appears*. Rotated onto this axis, the
column widens and the labels land into it.

The mechanism is ADR-0025's `0fr → 1fr` grid — on `grid-template-columns` here — because `width: auto`
is not animatable and the grid closes the column without the text reflowing on the way down. A `v-if`
was what shipped, and a `v-if` has nothing to animate.

The asymmetry falls out of CSS reading the transition off the **target** state, so each direction
carries its own list: arriving, the fade waits a `quick` and finishes just after the column settles;
leaving, it goes at `exit` with no delay, so the labels are gone before the rail closes on them.
ADR-0021's rule met from a third direction — the exit is faster than the entrance.

### Reduced motion stops the travel, and that is honest here

`transition: none`, the same argument `useSlidingIndicator` makes for letting the selection jump
(ADR-0033): nothing is hidden, only the trip is lost. The rail is still the rail when it arrives
without travelling. The opposite of ADR-0032's marquee, where stopping the loop would have hidden
every item past the clip.

## Consequences

- The header's restack is **still a cut**, and deliberately. Its two forms have different heights
  (40px against 64px, plus the rail's rule), and `flex-direction` does not interpolate.
- **`SwapTransition` is the wrong tool for it**, by its own argument. ADR-0026 chose `mode="out-in"`
  *because* two states of different heights must not overlap — and sequencing here would empty the
  header for 100ms, dropping the rows below by the full difference and back. The cut is one jump; the
  cross-fade would be two.
- The 29px the rows shift when the toggle moves under the mark is the remaining visible seam. Closing
  it means animating the header's height, which needs a fixed value per form — and a literal height
  is exactly what this system does not write.
