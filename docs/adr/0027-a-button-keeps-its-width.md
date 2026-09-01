# ADR-0027 — A button keeps its width

**Date:** 2026-09-01
**Status:** Accepted
**Closes:** the item ADR-0026 left open

## Context

ADR-0026 excluded `Button` from the loading handover and named the reason: swapping a spinner for a
label changes the button's width, and cross-fading through a resize reads as a wobble. **Fix the
resize first.**

Measured: a button labelled *"Enregistrer les modifications"* collapses from **233px to 44px** when
it enters its loading state — 189px, taking whatever sits beside it along for the ride.

## Decisions

### Both children share one grid cell

The body — icon, label, icon — stays in the layout while loading and keeps defining the width. The
spinner sits in the same cell on top of it.

```css
.ds-button__stack { display: grid; place-items: center; }
.ds-button__stack > * { grid-area: 1 / 1; }
```

`visibility: hidden` on the body rather than `display: none`, because it has to **hold the space and
leave the accessibility tree** at the same time. That also makes the fade possible, so `Button`
rejoins the handover without needing `SwapTransition` — the two states are already stacked.

### Which cost the button its name, until it did not

`visibility: hidden` takes the label out of the accessibility tree along with the layout. The
button's accessible name came from its text content, so while loading it had **none** — a screen
reader would announce "button, busy" and nothing else.

`aria-label` now carries the name whenever the label is hidden: `iconOnly || loading`.

**I introduced that regression and found it ten minutes later, by checking.** The width fix looked
complete — the measurement said 233px held across all three states — and it had quietly broken
something the measurement was not asking about. Verified now: width **233px** and accessible name
*"Enregistrer les modifications"* in all three states.

### Three measurements in this session read the wrong thing

Worth recording together, because they share a shape:

- A `tbody` selector found **Storybook's own args table** and reported no transition anywhere.
- Two runs read a page still carrying state from a previous script, so the step labels were offset
  by one and the numbers looked inverted.

None was a bug in the code. **The tooling around a check can be wrong in ways that look exactly like
the code being wrong**, and the tell is a result that contradicts something you already know — a
44px button with a 29-character label, a component with no transition when you just wrote one.

## What changes

- `Button`'s body and spinner share a grid cell; the width holds at every state.
- `aria-label` carries the name while loading.
- `Loading keeps its width` story.

## Still open

Nothing on the feel agenda.
