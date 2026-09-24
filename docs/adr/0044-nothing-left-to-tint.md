# ADR-0044 — Nothing left to tint

**Date:** 2026-09-24
**Extends:** ADR-0036 (`quiet` is nothing at rest; a `bg-*` token is solved against `bg-default`;
symmetric padding is for a square icon-only control), ADR-0030 (in dark, elevation stops being what
separates), ADR-0039 (read the rendered pixel, not the property you just wrote)
**Supersedes:** ADR-0034 on four counts — the rail is 60px not 52, the head's gaps are `spacing-md`
not `spacing-xs`, the collapsed switcher keeps a box instead of dropping to a bare `Avatar`, and the
collapse toggle sits **above** the mark rather than below it. ADR-0036 on one: `WorkspaceSelector`
is no longer `chrome="quiet"`.
**Status:** Accepted
**Breaking:** `DropdownTriggerChrome` gains `'surface'`. The collapsed rail widens 52px → 60px, so a
shell that reserved the old width is 8px short.

## Context

The workspace switcher was `chrome="quiet"` — nothing at rest, a tint under the pointer, a surface
when open. Drawn in Figma (`1627:10521`, `1627:10515`), the resting state became **a raised white
pill**: `bg-default` + `elevation-surface` + `radius-pill`.

That is one rung *above* what the component set's `État=Ouvert` was. So the redesign does not adjust
the ladder, it **spends it**: ADR-0036's own sentence — *a `bg-*` token is solved against
`bg-default`* — arrives from the other end, because the rest state now **is** `bg-default`.

Measured on the white pill, in light:

| candidate fill | on the pill |
|---|---|
| `bg-hover` / `bg-neutral-subtle` (gray.50) | **1.045:1** |
| `bg-neutral` (gray.100) | 1.102:1 |
| `bg-pending` (gray.200) | 1.183:1 |
| `border-default` as a fill (gray.300) | 1.474:1 |
| `bg-selected` (brand.50) | **1.165:1** |

There is no tint. Not a faint one — none. Every state after rest has to come from somewhere else.

Worth recording what this replaced, because it was not good either: on `bg-neutral`, `quiet`'s hover
measured **1.054:1** and its open state **1.102:1**. The surface axis was never carrying those
states; `text-strong` and a shadow were. Moving the surface to rest did not break a working ladder,
it made a broken one impossible to keep.

## Decisions

### The escalation is the contour and the ink, and neither is a rung of the other

```
rest    no contour                 text-default
hover   border-default             text-strong
focus   border-default + the ring  text-strong
open    border-brand               text-strong
```

The first step is a **mechanism** — absent to present — which is why it reads at 1.474:1 without
owing 3:1. The second is a **register change**, neutral to brand, on a contour that is already
there. That is ADR-0036's "escalate by mechanism, not intensity" with one mechanism doing both jobs
in sequence, rather than three rungs of one thing.

**`border-brand` is not a taste.** It is the one brand value over 3:1 on a white pill in **both**
modes, because `semantic.dark.json` keeps `brand/300` where every other brand token travels:

| | light | dark |
|---|---|---|
| `border-default` | 1.474:1 | 2.194:1 |
| **`border-brand`** | **3.289:1** | **5.058:1** |
| `bg-brand-solid` | 7.700:1 | **2.445:1** ✗ |

`bg-brand-solid` is the obvious choice and it fails in dark, where it resolves to `brand/500` on
`gray-forest/900`. It would have passed the linter, passed the pairing suite, and looked right in
the mode it was drawn in.

**Elevation was the first drawing and it lost twice.** `surface → raised → overlay` is a real ladder
on one axis, and at 48px in light the three rungs are not distinguishable; in dark they are
*identical*, because a shadow stops separating there at all (ADR-0030). A mechanism that only works
in one mode is not a mechanism.

**Focus is hover plus the ring** — the same state, reached by the other input. Not a fourth
appearance to design. `focus-ring-gray-shadow-sm` carries shadow.sm, which *is* `elevation-surface`,
so the pill keeps its relief instead of flattening for the ring's duration.

**Disabled takes the surface away** rather than fading it: no shadow, `bg-neutral-subtle`,
`text-disabled`. A control you cannot use is not a raised object.

### The contour is a custom property, so the states move a colour

`--dropdown-trigger-contour` is a **variant switch**, not a token (ADR-0010): a component-scoped
name aliasing a semantic one. It sits inside one `box-shadow` that also carries the elevation, so a
state rule sets a colour instead of rewriting a shadow list — and `:focus-visible` reads the
property rather than restating it, which is what lets a trigger that is open *and* focused keep the
brand contour. A custom property resolves from the winning cascade value, not from where the
declaration that uses it happens to be written.

### The collapsed form is 36px, and the padding is never written down

Figma drew the collapsed box at **40px** — the 32px mark plus `spacing-xs` each side. That is 4px
wider than every row in the column, and the switcher would have been the one thing in the rail wider
than the rail is built on.

It ships at **36px**, which is `--side-nav-rail-row`. The box is the row and the mark is centred in
it, so the 2px around it is a **remainder, not a value** — the way ADR-0034 derived the rail from
the row rather than asserting it. It is also why this is not a narrower `DropdownTrigger`: that
control's padding comes off the control scale, and 2px is not on any scale.

**And it has a box at all**, where ADR-0034 had the collapsed form drop to a bare `Avatar` on a
survey of four icon-only rails. That survey is not wrong; its premise is gone. A switcher that is a
surface when the column is open and nothing when it is closed is two controls, not one.

### The rail is 60px, because collapsed the column's padding goes symmetric

| | Figma | code before |
|---|---|---|
| rail width | **60px** | 52px |
| padding, collapsed | **12 all round** | 12 / 8 |
| toggle ↔ mark | **8px** | 4px |
| mark ↔ rule | **8px** | 4px |
| rule ↔ first destination | 24px | 24px |
| between destinations | 8px | 8px |

Expanded the column is 12/16; collapsed it is **12 all round**. That is ADR-0036's rule for a square
icon-only control — symmetric padding — applied to the column instead of to something inside it, and
it is the whole derivation: `row + 2 × spacing-lg`, still a `calc()` and never `60px`. The old value
dropped two ramp steps where the design drops one, and produced a column that squeezed its own edges
harder than it squeezed anything in them.

**The two 4px gaps go to `spacing-md`, and that deletes a reason rather than a number.** ADR-0034
wrote that 4px *binds the mark, the toggle and the rule into one object* — true while the gap was
the only thing saying so. The 1px rule says it, and the 24px above the navigation says it again, so
the gap was doing a third time what two other things already did. One rhythm runs the column: 8px
between adjacent things, 24px between the two blocks.

### The toggle goes above the mark, in CSS, because a DOM swap drops focus

Figma's collapsed head is toggle-then-mark; expanded is mark-then-toggle. The two orders are
opposite, so one form will read against the DOM whatever we do — the decision is only where that
cost lands.

`flex-direction: column-reverse`, not a `v-if` pair, because **a DOM swap unmounts the `IconButton`
that causes the collapse**. Activated from the keyboard it would destroy the element holding focus
mid-gesture. Measured after the change: `document.activeElement` is still `ds-side-nav__toggle`
after `Enter`. Against that, the reversed pair is two controls that neither depend on nor explain
each other, so the sequence carries no meaning to preserve (WCAG 1.3.2) and either order is operable
(2.4.3). The DOM keeps identity first, which is the better sentence to hear anyway.

### Both forms open the same panel the same way

Collapsed, the panel overrides **one** declaration — `width: 240px` — and inherits placement,
offset and `transform-origin` from the expanded rule and from `Dropdown`. It used to open *beside*
the rail (`left: 100%`, `top: 0`), which was a second placement **and a second gesture**:
`transform-origin: top left` grows a surface downward from under its trigger, not sideways out of a
column. Verified rendered: same left edge as the mark, 8px below it, origin `0px 0px`.

The width is the one thing that cannot follow, because the expanded rule is `width: 100%` and 100%
of 36px is 36px. One exception, and it is stated.

## Consequences

**Four defects, all found by rendering rather than by reading.** ADR-0039's method, and its family
of failure — the declaration right, the pixel wrong.

1. **The collapsed panel opened on top of its own trigger.** Pre-existing. Both selectors are one
   class plus a `:deep()`, so they carry equal specificity and order decides; the collapsed rule was
   written first and lost, taking `width: 100%` from the general case — a 36px panel over the 36px
   control that opened it.
2. **Hover beat open on the collapsed mark.** Mine. `:not(:disabled)` counts its argument, so
   `:hover:not(:disabled)` outweighs `[aria-expanded='true']` and the contour walked back to grey
   while the panel was out. Both rules now exclude the open state.
3. **In Figma, `setBoundVariableForPaint` left the fallback colour white** on a paint constructed
   white, so half the board rendered white text on a white pill while `boundTo` read `text/default`.
   The fix is to resolve the variable and bake its value before binding.
4. **The chevron double-negated.** `rotation = 180` was applied, then the icon was swapped to
   `chevron-up`; the first conclusion — that the rotation had been refused on an auto-layout child —
   was wrong, and the render is what said so. The code swaps the icon and never rotates, so Figma
   now does the same.

**Figma was corrected once, in the direction the standing rule sets:** `border/brand` in the
*Sombre* mode pointed at `brand/dark-border` (#0F472B), which measures **1.549:1** on the dark pill.
Code keeps `brand/300`. Figma now does too.

**The component set gained a second axis.** `WorkspaceSelector` in Figma had five `État` variants
and no collapsed form at all; it is now `État × Forme` = 10, with the collapsed column at 36px.

**Three tracks were drawn before one was chosen** — elevation, contour, ink — each in both forms,
on `bg-neutral`, with a dark strip to see which survived the second mode. The chosen hybrid was then
*revised from its own render*: the expanded hover had been ink-only, which read as nothing, and
gained the contour so both forms run one ladder. Choosing from a rendered board rather than from a
description is the whole reason the elevation track died early instead of in code.

**A new test, because the ladder's two steps are uncoupled.** `border-default` and `border-brand`
are different token families and nothing makes them stay in order; `contrast.test.mjs` now asserts
that the open contour outranks the hover contour on the pill, in both modes, alongside the 3:1 floor
for the open one and AA for `text-brand`.

## Still open

- **ADR-0034's 52px and its 4px are superseded here, but that ADR still reads as current.** An ADR
  records what was decided then, so it is not edited — but nothing in the repo links the two, and
  the next reader of ADR-0034 has no way to know.
- **The focus ring measures 1.107:1 on `bg-neutral`.** `focus-ring-gray` is a 4px ring of
  `gray-light/400` at 14%, shared by the whole catalogue. The contour carries focus in practice here; the ring itself
  does not, and fixing it is not this component's decision.
- **`surface` has one consumer**, and the pill radius is baked into the chrome rather than offered.
  The second consumer will say whether that was a shape or a coincidence.
