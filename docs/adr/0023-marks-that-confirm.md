# ADR-0023 — Marks that confirm

**Date:** 2026-09-01
**Status:** Accepted
**Follows:** ADR-0021, item 1 of the feel agenda — movement beyond overlays

## Context

**91% of what the catalogue animates is colour.** Six animated transforms against sixty colour and
opacity transitions. Movement is the part of motion a user reads as quality, and there was almost
none of it.

## Decisions

### Movement must explain, not decorate

The survey turned up twelve candidates. Most were rejected on one test: **does the thing change
state?**

`Badge`'s dot, `Tag`'s dot, `ChartLegend`'s swatch and `Tooltip`'s arrow are static indicators —
they are already there when you look, so animating them would be decoration. What earns movement is
a **mark that appears because you did something**: a checkbox tick, a selected item's check, a step
completing.

`Tabs`' indicator already slides between tabs, with a `--animated` guard so it does not fly in from
zero on first paint. That was found, not built.

### A mark stamps; a surface arrives

`MarkTransition`, sibling of `SurfaceTransition`:

```
scale(0.6) → 1 + fade      enter 100ms easing-out · exit 100ms easing-in
```

Smaller and faster than the surface entrance (0.96 over 200ms) because the two do different jobs. A
surface **arrives** — it should feel like it came from somewhere. A mark **confirms** — it should
land before you finish looking for it.

`--ds-motion-scale-mark` (0.6) joins `--ds-motion-scale-enter` (0.96).

`mode="out-in"` is deliberate. A mark sits in a centred flex box, so two children present at once
would sit side by side and jump. It costs nothing in the common case — nothing → mark has no
outgoing element — and shows only on the rare swap, indeterminate → checked.

### Two mechanisms, one motion

The marks are not built the same way, and forcing them into one component would have been wrong:

- **`v-if` mounted** — `Checkbox`'s tick, `DropdownSelectItem`'s check, `ProgressSteps`' step check.
  These wrap in `MarkTransition`.
- **Class-driven** — `Checkbox`'s radio dot is a `::after` toggled by `--checked`. A component
  cannot wrap a pseudo-element, so it takes the same values through a CSS transition.

It had been fading over 150ms without scaling. Now it stamps at 100ms like the rest.

### The browser caught what the build could not

`Checkbox` has **two render paths** — a display-only span and a full interactive mode — each with
its own icon block. The first pass wrapped one of them. The build passed, the typecheck passed, and
the story rendered a mark with **no transition classes and a `0s` duration**.

Verified after the fix, on the live component: classes `ds-mark-enter-from` / `ds-mark-enter-active`
reach the slotted element, mid-flight `opacity: 0` and `matrix(0.6, …)` over `0.1s`, settling at
`opacity: 1` and `none`. The radio dot reads `scale(0.6)` unchecked and `scale(1)` checked, both at
`0.1s` on `cubic-bezier(0, 0, 0.2, 1)`.

That is the third time in this series that a browser check found something static analysis could
not — the first two being the `font:` shorthand's silent failure mode and the scoped-style trap.
For motion specifically, **there is no substitute**: a transition that never runs looks exactly like
one that runs correctly, in every artefact except a running page.

## What changes

- `--ds-motion-scale-mark` (0.6) and `MarkTransition`, exported.
- `Checkbox` (both render paths), `DropdownSelectItem` and `ProgressSteps` wrapped.
- `Checkbox`'s radio dot scales as well as fades, at `quick` rather than `moderate`.
- Movement rises from **9% to 13%** of animated properties.

## Still open

- ~~**13% is still low.**~~ — the sliding selection is closed by ADR-0024, which found the blocker
  was an API defect rather than a missing animation. Expansion remains, and stays there until a
  component expands.
- **`moderate` now carries 48%.** Falling as predicted, and it will keep falling as movement grows.
