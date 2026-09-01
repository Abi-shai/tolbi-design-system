# ADR-0024 — Selection that moves

**Date:** 2026-09-01
**Status:** Accepted
**Follows:** ADR-0023's open item — a selection background that slides rather than cross-fades
**Breaking:** `ButtonGroupItem.active` is replaced by `ButtonGroup`'s `v-model`

## Context

A sliding highlight is the motion people read as craft in a segmented control. The survey found ten
components with a selected state; only three are candidates, because sliding requires selection to
be **single** and to **move between aligned siblings**:

| | Verdict |
|---|---|
| `Tabs` | Already slides — found, not built |
| `ButtonGroup` | The natural second, and it was **blocked** |
| `Pagination` | Rejected — `visiblePages` recomputes with ellipses, so the indicator would slide onto content that just changed |
| `Table`, `DropdownSelectItem` | Multi-select, and the list scrolls |
| `Breadcrumbs`, `ProgressSteps` | The current item does not move between siblings |

So the honest first answer was: **one legitimate home, and it already has it.** What made this worth
doing was why the second was blocked.

## Decisions

### The blocker was an API defect, not a missing animation

`ButtonGroup` was a bare slot container. Each `ButtonGroupItem` carried its own `active` prop, so
**the group had no idea which segment was selected — or whether exactly one was.** A segmented
control could render with zero or two active segments, and the component permitted it.

That is also why the highlight could only cross-fade: nothing knew *where* the selection sat.

The parent now owns it. `ButtonGroup` takes `v-model`, items register themselves in DOM order
through a `provide`/`inject` context, and `active` is gone. One selected segment by construction.

Zero consumers outside its own files, so the break costs nothing but the stories.

### `useSlidingIndicator`, extracted rather than copied

`Tabs` had the mechanics inline. Rather than write a second copy — the pattern this whole series
exists to remove — it moves to `composables/useSlidingIndicator.ts` and both consume it.

Two details in there are the reason it is shared rather than re-derived:

- **The transition is withheld until after the first paint.** Without that guard the indicator flies
  in from `translateX(0)` on mount. `Tabs` had learned this; `ButtonGroup` would have had to learn
  it again.
- **A `ResizeObserver` re-measures.** The active child's geometry changes when the container reflows
  — a label wrapping, a webfont landing — and a stale indicator is worse than none.

A composable rather than a component, because the indicator element has to live inside each
container's own DOM and carry its own styling. `Tabs`' is a raised white card; `ButtonGroup`'s is the
neutral segment surface.

### The segment surface stays a component token

ADR-0009 decided that segmented-control selection must **not** use `bg-selected`, which is
brand-tinted, because a segmented control is a neutral affordance. `--segment-selected-bg` moves
from the item to the group's indicator and keeps that constraint.

The item no longer paints its own background at all — it only promotes its text.

### Verified in a browser

Measured on the live component: the indicator starts at `translateX(0)` and 65px, and after
selecting the third segment sits at `translateX(161px)`; selecting the middle one — the wide one —
it reads **96px at `translateX(65px)`**, matching that segment's measured width exactly and
covering it to within a pixel. `aria-pressed` is `true` on one segment and absent on the others.

## What changes

- `composables/useSlidingIndicator.ts`; `Tabs` migrated onto it.
- `ButtonGroup` owns selection via `v-model` and hosts a sliding indicator.
- `ButtonGroupItem.active` removed in favour of `value` + group context.
- Movement rises from 13% to **14%** of animated properties.

## Still open

- **Expansion.** Nothing in the catalogue expands, so there is nothing to animate. It arrives with
  the first accordion or disclosure.
- **`Pagination`'s highlight** still cross-fades, correctly. If its page list is ever made stable
  rather than recomputed, it becomes a third consumer.
