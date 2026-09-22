# ADR-0036 — A trigger that is nothing at rest

**Date:** 2026-09-18
**Status:** Accepted
**Extends:** ADR-0033 (`DropdownTrigger` owns the chrome), ADR-0013 (control padding is its own
scale), ADR-0030 (in dark, elevation stops being what separates), ADR-0009 (the semantic vocabulary)
**Source:** Sprint 18 — `1407:9208` (`WorkspaceSelector`), `1429:7168` and `1406:6511` (the sidebar)
**Breaking:** none. `chrome` defaults to `boxed`, which is what shipped.

## Context

`WorkspaceSelector`'s box was redrawn in Figma: no border, a tinted fill, symmetric 8px padding. It
read as exactly the failure ADR-0033 closed — a fourth shape composed out of control tokens instead
of the component that owns them — and it was "fixed" back to the component's values.

It was not drift. The divergence is deliberate, and was restored twice: in the navigation column the
catalogue's bordered white box reads as a foreign control dropped onto the ground. So the question
stopped being *how do we get this back on the component* and became *where does a second chrome
live*.

What the audit did find was the drift underneath the decision. The fill was bound to **`bg/hover`** —
a state token used as a resting ground, which made the Survol variant identical to Défaut at
1.000:1 — and the padding came from the `spacing` ramp rather than the control scale. Both are
fixed here; neither was the design.

## Decisions

### The second chrome lives on `DropdownTrigger`

ADR-0033 made that component the chrome's owner so that a fourth shape could not redraw the box. A
*deliberate* fourth shape does not weaken that argument — it changes which shapes the catalogue
carries. So the prop lands there:

```ts
chrome?: 'boxed' | 'quiet'   // default 'boxed'
```

`boxed` is a control before you touch it. `quiet` is nothing until you do. A chrome with two owners
has none, which is the whole of ADR-0033 restated.

It is `chrome` and not `variant` because `DropdownTriggerVariant` is taken: it names `Dropdown`'s
three built-in triggers (`button | icon | avatar`). `chrome` is also the word ADR-0033 used for what
this component owns.

### `quiet` escalates by **mechanism**, not intensity

Absent → `bg-neutral-subtle` → `bg-default` + `elevation-control`.

Measured on the column's `bg-neutral` ground, neither step is an edge on its own: the tint is
**1.054:1** and the open surface **1.102:1**. What makes the escalation legible is that each step is
a different *kind* of change — nothing, then a tint, then a surface that lifts.

That is also why it survives the second mode. In dark the ground is `gray-forest/700`, the tint /800
and the surface /900: the three steps run in the **opposite direction** and stay ordered. An
escalation built on intensity would have had to be re-solved; one built on mechanism did not. It
answers ADR-0030 in passing — the open state's shadow only grounds in dark, and the fill is what
separates.

### The neutral family has exactly one step above the column's ground

This is the constraint the design ran into, and it is worth naming rather than filling:

| on `bg-neutral` | light | dark |
|---|---|---|
| `bg-hover` | gray-light/50 | gray-forest/800 |
| `bg-neutral-subtle` | gray-light/50 — **same primitive** | gray-forest/800 — same |
| `bg-neutral-subtle-hover` | gray-light/100 — **is `bg-neutral`** | gray-forest/700 — same |
| `bg-disabled` | gray-light/100 — **is `bg-neutral`** | gray-forest/700 — same |

Three usable surfaces exist on that ground: the ground, **one** tint, and `bg-default`. The open
state takes the last one, so hover and focus share the tint rather than each getting its own — there
is no fourth value to give them, and a `bg-hover` on this ground would measure 1.000:1 against the
resting tint.

The general form: **a `bg-*` token is solved against `bg-default`.** On a recessed ground its
distance is not preserved, and four names collapse onto two values. `SideNavigation` met the same
wall from the other side (ADR-0033: it chose `bg-neutral` over `bg-neutral-subtle` so that hover
would not measure 1.000:1 — and bought 0.054).

The degenerate case is written into the prop's doc: `quiet` on `bg-default` has a resting form and a
hover that are the same pixel. It is for recessed grounds only.

### `bg-disabled` does not exist here, so the disabled form paints nothing

It aliases `gray-light/100`, which *is* `bg-neutral` — 1.000:1 on this column. `quiet:disabled`
therefore keeps the resting form and only dims the colour to `text-disabled`; the glyph follows as
`currentColor`. `boxed` keeps `bg-disabled`, because it sits on `bg-default` where the token was
solved.

### Focus takes the tint as well as the ring

In CSS a `box-shadow` ring renders on a transparent element, so bare focus would have worked. Two
reasons it does not stay bare. Keyboard focus should not be *quieter* than hover. And the Figma
variant cannot be bare at all — a drop shadow on a fill-less frame traces the **glyphs**, not the
control, which is the same defect the hand-drawn box in `1406:6743` had. A rendering constraint in
one tool happened to argue for the right behaviour in both.

The ring still **replaces** the elevation rather than stacking with it, which is a source-order
claim: `.ds-dropdown-trigger:focus-visible` and `.ds-dropdown-trigger--quiet.--open` have equal
specificity, so the shared focus rule is written last on purpose.

### Radius is `radius-pill`, and the column now carries two radius languages

The destinations are `radius-control` (8px); the mark is a pill. Deliberate — the mark is not a
destination. Both are **roles**, so neither is a raw step and ADR-0013 is satisfied either way; what
is recorded here is that the column is not expected to be uniform.

### Padding is `control-padding-sm` in **every** state, including the ones with no fill

Two reasons, and the first is mechanical: a padding that appears on hover moves the content 8px
under the pointer. The second is alignment — 12px is the only value that puts the mark on the
destinations' glyph abscissa (16px of column padding + 12px = **28px**, where a `SideNavItem` icon
sits).

The symmetric `spacing-md` form the design reached for is not wrong in general: it is what the
catalogue uses for **square, icon-only** controls (`IconButton`, a collapsed `SideNavItem`). The
moment a control carries a label, its padding is the control scale.

In Figma the pair is split per axis — `control-padding/sm-y` and `control-padding/sm-x` — because a
Figma variable cannot hold a paired value. `spacing/md` + `spacing/lg` give the same 8 and 12 under
the wrong names, which is what was bound before and what makes this worth writing down: **the
numbers being right is not the same as the tokens being right.**

`quiet` measures **40px** at `sm` where `boxed` measures 42. The 2px are the border, and the
descriptions of the control-padding scale omit it (ADR-0033) — here there is simply no border for
them to omit.

## Consequences

- `Dropdown`'s built-in `button` trigger, and every existing consumer, are unchanged: `boxed` is the
  default.
- `WorkspaceSelector` no longer draws a resting box. Its Storybook views are posed on `bg-neutral`,
  because on white the component's resting state is invisible — which is the point, and is exactly
  the thing a story on the default canvas would have hidden.
- A component tier token was **not** minted. Every value `quiet` uses is a semantic token already in
  the vocabulary; the decision is which one, not a new one (ADR-0010).
- **ADR-0034's rule under the header narrows to the rail.** That ADR drew it in both forms and
  exempted neither, on the reasoning that the expanded toggle "sits beside a boxed selector" — a
  premise this ADR deletes. The rule survives anyway, but only where its argument lives: the
  ambiguity it answers is *vertical stacking*, a bare `panel-left` above a bare `house`, and the
  expanded header's two controls share a row. Figma had already landed there — the 52px rail draws a
  `Filet`, neither expanded frame does.

## Still open

- The two sidebar instances in Figma are pinned to 160px inside a 228px row, which leaves the name
  76px and a 32px dead gutter. Letting the trigger fill the row recovers 24px of name. Not decided.
- The collapsed mark has no hover state. Figma draws none, and a tint behind a 24px avatar needs a
  shape the design has not given it.
