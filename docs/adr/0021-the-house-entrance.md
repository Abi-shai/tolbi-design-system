# ADR-0021 — The house entrance

**Date:** 2026-09-01
**Status:** Accepted
**Follows:** a change of objective — optimise for what a *product* needs (feel, layering, motion)
rather than for what a *published design system* needs (governance, traceability, enforcement)

## Context

Benchmarking against Primer, Polaris, Carbon and Atlassian was measuring the wrong thing. Those
systems are published because they coordinate hundreds of engineers; that is a different problem
from making one excellent product.

Reading Linear's shipped CSS instead — 568 custom properties — changes the picture. They carry
**18 easings** (the full Penner set) and **14 named z-layers** with insertion gaps and a `debug`
layer at 11000. They also use ordinals to `quinary`, keep `fg`/`bg`/`border`/`line` as four
families, and ship numeric radius with no semantic roles — three things this repository argued
against. The "industry consensus" those arguments cited is a **design-system-publisher** consensus,
not a best-product one.

The lesson is not "copy the 18 easings". **Linear's easings are a consequence of having a great deal
of movement, not a cause of it.** Ported without the movement they would be the `blur-*` ramp again.

## Decisions

### The measurement, and a correction to it

A first pass reported one animated `transform` in 48 components. **That was wrong**: `grep` is
line-based and the transitions are written across two lines, with `transform` on the second. Scanned
properly there are **six, across four components** — `Dropdown`, `HelpIcon`, `Tabs`, `Toggle`.

What survives the correction is the real finding:

| Surface | Entrance |
|---|---|
| `Dropdown` | `scale(0.98)` + `translateY(-6px)`, leave 150ms |
| `HelpIcon` | `scale(0.96)`, leave 150ms |
| `InputDropdown` | **none** |

The same decision, answered three ways — the signature of every genuine gap in this series.

`Tooltip`, `Toast` and `ChartTooltip` animate nothing and correctly so: they do not own their own
visibility. ADR-0006 made `ChartTooltip` presentation-only on purpose.

### Scale and fade, from the anchor

A floating surface grows from **96%** while fading in, scaled from its anchor. It ties the panel to
whatever opened it and moves nothing around it.

```
enter   200ms   easing-out    opacity 0 → 1, scale(0.96) → 1
exit    100ms   easing-in
```

**The exit is deliberately faster than the entrance** — a surface should get out of the way quicker
than it arrives. That principle was in ADR-0002's prose and in nothing else; it is now a token.

### `duration.exit` is a seventh duration, not an alias of `quick`

`exit` is 100ms and so is `quick`. Same value, different decision — the rule ADR-0003 set for
duplicate semantics and ADR-0009 kept. A component reaching for "the exit duration" should not have
to know it happens to equal "quick" today.

`motion.scale.enter` (0.96) joins it. `Dropdown` had 0.98 and `HelpIcon` 0.96; one decision, one
value.

### `SurfaceTransition` owns the entrance

A component, not a convention, so ADR-0001 applies: anything that floats uses it rather than
re-deriving the timing.

Its `<style>` is **deliberately not scoped**, and that is worth knowing rather than discovering:
Vue applies transition classes to the *slotted* element, which carries the parent's scope id and not
this component's. A scoped rule would never match, and it would fail **silently** — no error, just
no animation. The `ds-surface-` prefix is the namespace instead.

`transform-origin` stays with the consuming surface, because only it knows where its anchor is:
`Dropdown` and `InputDropdown` open below-left, `HelpIcon` above-centre.

### Verified in a browser

A typecheck cannot tell you an animation runs. Measured on the live component:

- Classes reach the slotted element: `ds-surface-enter-from`, `ds-surface-enter-active`.
- Mid-flight: `opacity: 0`, `transform: matrix(0.96, …)`, over `0.2s`.
- `transform-origin: 0px 0px` — top left, as the panel declares.
- Leave: `0.1s` with `cubic-bezier(0.4, 0, 1, 1)` — `easing-in`.

## What changes

- `motion.duration.exit` (100ms) and `motion.scale.enter` (0.96).
- `SurfaceTransition`, exported.
- `Dropdown` and `HelpIcon` migrated off their private copies; `InputDropdown` gains an entrance.

## Still open — the rest of the feel agenda, in order

1. **Movement beyond overlays.** Six animated transforms in the catalogue. Selection, expansion and
   the tab indicator are the obvious next candidates.
2. **The duration scale does not work.** `moderate` carries **68% of all motion**, while `instant`
   and `considered` have **zero consumers** — ADR-0002 added them "for future use" and the future
   did not arrive. Either they are wrong, or nothing reaches for them because nothing moves yet.
3. **The layer scale is thin.** Three layers against Linear's fourteen. Ours is right for the
   surfaces that exist; it grows when a modal, a command menu or a context menu does.
4. **More easings — last.** Only once there are transforms to apply them to.
