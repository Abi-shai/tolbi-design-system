# ADR-0026 — The handover

**Date:** 2026-09-01
**Status:** Accepted
**Corrects:** the scope of the feel agenda, which had missed its most-seen member

## Context

The feel agenda was declared finished after four families: floating surfaces, marks that confirm,
selection that moves, and in-flow expansion. Asked whether it reached every component that could
benefit, an audit said no — and the miss was the one that fires most often.

**Four components swap `v-if="loading"` for `v-else` with no transition at all**: `Table`,
`StatTile`, `ChartFrame` and `Button`. A table snapping from shimmer to rows is probably the single
most-watched transition in a data product, because it happens on every page load.

The agenda had been organised by **what changes** — surfaces, marks, selection, height — and never
by **what happens most often**. That is the classification error worth recording.

## Decisions

### `SwapTransition`: one thing replaces another in the same slot

Third sibling of `SurfaceTransition` and `MarkTransition`. A cross-fade at `quick`, and
`mode="out-in"` is **not optional**: the two states rarely have the same height — skeleton rows
against real rows, a spinner against a chart — so overlapping them would make the container jump
mid-fade. Sequencing costs the two durations back to back, which is why they are `quick` rather
than `enter`.

Applied to `Table`, `StatTile` and `ChartFrame`.

### `Table` needed two `<tbody>` elements

`<Transition>` takes a single element child, and the skeleton and content rows lived in two
`<template>` fragments inside one `<tbody>`. A table may legally carry several `<tbody>`, so the
fragments become `<tbody v-if="loading">` and `<tbody v-else>` — one element each, and the
transition has something to hold.

### `Button` is deliberately left alone, and its real defect is named

Its `v-else` is a fragment — icon, label, icon — which `<Transition>` cannot take. That is fixable
with a wrapper, but it is not the reason to stop.

**Swapping a spinner for a label changes the button's width.** Cross-fading opacity while the width
jumps reads as a wobble, which is worse than the snap it replaces. The defect to fix first is the
resize, not the missing fade: a button should hold its width while it loads. That is a layout
decision, not a motion one, and it is left open rather than smuggled in here.

### `FileDropzone`'s files arrive one at a time

`TransitionGroup` over the file list, reusing the `ds-mark` motion — a file appearing during an
upload *is* a mark that confirms, and the user is watching that exact spot.

Its leaving row is taken out of flow with `position: absolute`, or the survivors jump upward while
it is still fading.

### Proven by mutation, again

Measured on the live `Table`: the skeleton `<tbody>` takes `ds-swap-leave-active` at `0.1s`, then
the content `<tbody>` enters at `opacity: 0` under `ds-swap-enter-active`, then settles at 1 with
60 real rows.

With the fade neutralised, the content reads **`opacity: 1` at the same moment** — it snaps. That is
the discriminating measurement.

One thing the measurement caught about itself: the first attempt read
`document.querySelector('tbody')`, which found **Storybook's own args table**, and reported no
transition anywhere. The tooling around a check can be wrong in ways that look exactly like the code
being wrong.

## What changes

- `SwapTransition`, exported; `Table`, `StatTile` and `ChartFrame` hand over instead of snapping.
- `Table`'s rows split across two `<tbody>` elements.
- `FileDropzone`'s file list animates arrivals and departures.
- `Loading handover` story on `Table`.
- Movement rises to **16%** of animated properties.

## Still open

- **`Button` resizes when it enters its loading state.** The fade waits on that being fixed.
