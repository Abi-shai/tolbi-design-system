# ADR-0022 — The duration scale was fine; the transitions were not

**Date:** 2026-09-01
**Status:** Accepted
**Follows:** ADR-0021, item 2 of the feel agenda

## Context

`moderate` (150ms) carried **68% of all motion**. `instant` (50ms) and `considered` (400ms) had
**zero consumers**. The obvious reading is that the scale has too many steps.

That reading is wrong, and measuring said so.

## Decisions

### The cause was blanket transitions, not a bad scale

All 25 blocks using `moderate` declare it on a **base selector** — one `transition` per component,
covering hover, focus, disabled and state changes at once. That is ordinary CSS, and it means a
single duration serves several intents. The scale looked unused because nothing ever reached past
the one declaration.

### `instant` had no consumers because focus rings were wired to `moderate`

Every state-driven `box-shadow` change in the catalogue is a **focus ring** — verified across all
eleven components that transition it; none animates elevation on a state. They all ran at 150ms.

**A focus ring at 150ms reads as lag.** It confirms a keystroke, so it has to be immediate.
ADR-0002's description of `instant` says, in its own words, *"press states, focus rings"* — the token
was correct and the wiring drifted.

`box-shadow` is now split out of every blanket transition and runs at `instant`:

```css
transition:
  border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
  box-shadow   var(--ds-motion-duration-instant)  var(--ds-motion-easing-default);
```

Measured in the browser on a live `Button`: `box-shadow` **0.05s**, `background-color` / `color` /
`border-color` **0.15s**. Per-property, as intended.

| | before | after |
|---|---|---|
| `instant` | **0** | **11** |
| dominant duration's share | **68%** | **50%** |

### `considered` keeps its place, and it is not alone

400ms for "heavy surfaces — modals, drawers". Neither exists, so it has no consumer.

It stays, because it is the third member of a set all waiting on the same component:
`--ds-bg-overlay` (ADR-0015), `--ds-z-overlay` (ADR-0020) and `--ds-motion-duration-considered`. A
modal will need a scrim, a layer and a duration on the day it arrives; deleting one of the three
would leave a gap-toothed answer to one question.

That is a narrower licence than "keep unreferenced tokens" — the consumer is **named**, not
hypothetical, which is the same test that brought `bg-overlay` back.

### `focus-ring-instant` keeps it from drifting back

A fourteenth lint rule: a `transition` on `box-shadow` must use `duration-instant`. A component that
one day animates elevation on a state can suppress it with a reason.

Twenty tests, and the rule was mutation-checked like the rest — neutralising it fails five.

## What changes

- 11 focus rings moved from `moderate` to `instant`, split per-property out of blanket transitions.
- Fourteenth lint rule plus its firing test, silent test and multi-line case.

## Still open

- **`moderate` still carries 50%.** That is defensible — colour is most of the catalogue's motion and
  150ms is right for colour — and it should fall further as movement is added, which is item 1 of the
  agenda and the next piece of work.
- **`considered` has no consumer**, deliberately, until a modal exists.
