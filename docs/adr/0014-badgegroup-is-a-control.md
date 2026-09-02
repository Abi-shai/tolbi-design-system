# ADR-0014 — BadgeGroup is a control, and Badge's palette was already done

**Date:** 2026-09-01
**Status:** Accepted
**Closes:** two items carried on ADR-0009 and ADR-0010

## Context

Two open items pointed at the same pair of components.

**Badge's categorical palette needed no work.** The item read "eight hues … are hard-coded hex with
no primitive ramp behind them", which was true when ADR-0010 was drafted and false once it shipped:
`Badge.vue` now holds **35 references to `--ds-color-display-*` and zero hex**. The entry was stale
text, not an outstanding decision. It is closed as done.

**BadgeGroup was giving three contradictory signals about whether it is interactive.** It emitted
`click`, restyled on `:hover`, and set `cursor: default` — while rendering a bare `<div>` with no
`role`, no `tabindex` and no key handler. Anyone navigating by keyboard could not reach it at all.

## Decisions

### BadgeGroup renders a real control

`<button type="button">` by default, `<a>` when `href` is given. That is the convention the design
system already follows everywhere else — `Button`, `Tag` and `CloseButton` all render real
`<button type="button">`, and ADR-0006 made the same fix in the other direction when five components
had hand-rolled their own focus rings.

`cursor` becomes `pointer`, the UA button styles are reset explicitly (margin, `text-align`,
background, border, font), the anchor loses its underline, and focus uses
`box-shadow: var(--ds-focus-ring-brand)` per ADR-0006's one-focus-treatment rule rather than a new
one.

Verified in a browser rather than asserted: the button reports `tabIndex: 0`, takes the brand focus
ring, and computes to Poppins 12px on `brand.50` at pill radius with `cursor: pointer` — so the UA
styles the element now brings with it are genuinely overridden, not merely assumed to be.

### `brand` survives here, and that is consistent rather than an exception

ADR-0009 removed `brand` from `Badge`'s status tones on the grounds that brand is **interactive
affordance**, not a status. A BadgeGroup is now always interactive by construction, so brand is
exactly the right default for it. The rule did not bend; the component turned out to be on the other
side of it.

### `color` becomes `tone`, and `gray` becomes `neutral`

This reverses ADR-0010, which deliberately left `BadgeGroup` alone: *"renaming it for symmetry with
`Badge` would be a second breaking change on a component nobody has complained about."*

That reasoning was sound and no longer applies. The accessibility fix is itself a breaking change,
so alignment is now free rather than gratuitous — and `BadgeGroup` has **zero consumers** outside its
own files. Shipping two breaks where one would do is the cost that argument was avoiding.

`Badge` and `BadgeGroup` now speak one vocabulary: `tone`, with `neutral` rather than `gray`.

## What changes

- `BadgeGroup` renders `<button type="button">`, or `<a>` when `href` is set. New `href` prop.
- Keyboard reachable, `cursor: pointer`, UA styles reset, `--ds-focus-ring-brand` on focus.
- `color` → `tone`; `gray` → `neutral`. `BadgeGroupColor` → `BadgeGroupTone`.
- Badge's open item closed as already-done.

## Still open

- ~~**BadgeGroup is always interactive.**~~ — examined in ADR-0016 and deliberately left until something asks.

