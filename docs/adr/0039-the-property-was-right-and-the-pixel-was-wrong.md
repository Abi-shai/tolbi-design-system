# ADR-0039 — The property was right and the pixel was wrong

**Date:** 2026-09-22
**Status:** Accepted
**Extends:** ADR-0033 (two tokens that alias one primitive), ADR-0032 (a marquee is not a
transition; easings re-derived by eye), ADR-0012 (discipline is enforced, not documented),
ADR-0009 (the four admission clauses), ADR-0004 (icon sizes are a typed API)
**Breaking:** none. `Skeleton` and `IconButton` each gain an optional axis and keep their old
default; every existing call renders as before, one shade darker and one shimmer livelier.

## Context

Three defects surfaced while building `ProjectCard`. None of them failed a build, a lint rule or a
test. All three read as correct in the source:

- `Skeleton`'s shimmer animated between `bg-neutral-subtle` and `bg-hover` — two legitimate tokens
  that alias the same primitive, so the animation ran, correctly, from a colour to itself.
- `IconButton` derived its size from its padding, so the moment a consumer painted a border on it,
  a 32px control was 34px.
- Both looping animations in the catalogue wrote a raw period, and one wrote `ease-in-out` — the CSS
  keyword, which is not the curve the token of that name carries.

What they have in common is the thing worth writing down: **the declaration was right and the
rendering was not**, and every check this system owns reads declarations. The shimmer *looked* like
a flat skeleton. The button *looked* right until it was measured. The easing *read* as the token
because it shares the token's name.

## Decisions

### `Skeleton` carries a weight, and its shimmer has two values

The dead shimmer is fixed by giving the gradient two stops that differ, and the sheen is always
**one step toward the page** — lighter in light, darker in dark, because `bg-default` sits on the
far side of `bg-neutral-subtle` in both modes.

The weight is a second finding. Figma draws placeholders in **two** greys, not one: the heavier
where prominent content lands (title, figure, snapshot), the lighter where secondary copy does.
That is a hierarchy, not decoration — **a skeleton previews the weight of what is coming**, not only
its box — so it is an axis: `emphasis: 'default' | 'strong'`.

Bars take `radius-inner-sm` (4px). A placeholder is not a control and does not borrow a control's
radius.

### A control's box is declared, not derived

`IconButton` was 8px of padding around a 20px glyph, which is true and is how the Figma component is
built — and it meant the outer size depended on what anyone else painted on the element.
`Button --icon-only` and `CloseButton` had already declared theirs with `width`/`height`;
`IconButton` was the one deriving. It now declares, in `border-box`, so the size is the size.

### Below the floor, the glyph gives

36px is the catalogue's floor for a round control — all three of them start there. `xs` goes to 32.

Above 36 the catalogue holds the glyph at 20 and grows the box, because a larger target needs no
larger mark. Below it there is no room for that: 20px inside 32 leaves 6px a side and the glyph all
but touches the ring. **So the ramp turns over at the floor** — the padding stays and the glyph
steps to the next size down, which exists (ADR-0004: 16 is a size, 18 is not).

### A loop's period is not a duration, and a loop runs `linear`

The duration scale names durations by the intent of a **state change**. A loop has no start to time,
so `1.6s` and `0.6s` are periods and take nothing from the scale. ADR-0032 already recorded this
exemption for the marquee; it is stated here for the two animations that are not transitions at all.

The easing is a different matter, and it was simply wrong. `ease-in-out` is
`cubic-bezier(0.42, 0, 0.58, 1)`; `--ds-motion-easing-in-out` is `cubic-bezier(0.4, 0, 0.2, 1)`. The
shared name is what hid it — ADR-0032 caught the same slip in JS, where re-deriving a curve by eye
landed 25 points off. Both loops now run **`linear`**, for the reason the spinner already did: a
rotation that eases pulses, and so does a sweep, at every wrap.

Each declares its period once, so the spinner's reduced-motion slowdown is
`calc(var(--spinner-period) * 4)` rather than a second literal that happened to be four times the
first.

### `--ds-bg-pending`

Three places wanted `gray-light/200` as a fill and none could have it: the skeleton's heavy bar, a
pending snapshot, a stage not yet reached. The neutral grounds go 50, 100, 300, and ADR-0009's
emphasis vocabulary — strong / default / subtle / subtlest — is already spent on the three.

So it is named by **role rather than prominence**, under the decorative clause: the mark for what is
not there yet. Nothing sits on it, so it takes no on-colour partner and adds no pairing to the
contrast suite. Dark resolves to `gray-forest/600`, which is what all three already rendered.

## Consequences

- **The linter still cannot read motion.** Sixteen rules cover colour, spacing, radius, border
  width, z-index, typography, focus rings and dark parity; not one reads a duration or a curve. That
  is why both loop animations had drifted the same way with nobody noticing. A `no-literal-easing`
  rule — a CSS keyword where a token of that name exists — is cheap and should be next. A duration
  rule is not: it has to carry the exemption above, and nothing in the CSS tells you that `1.6s` is
  a period rather than a duration.
- **Two tokens that alias one primitive are invisible to every rule we own.** `bg-hover` and
  `bg-neutral-subtle`; `bg-neutral-subtle-hover` and `bg-neutral`. Both pairs are legitimate, and
  both have now produced a bug — ADR-0033's 1.000:1 hover on the sidebar's ground, and this ADR's
  shimmer. What would catch the next one is not a rule over source, it is measuring the rendered
  value.
- **`IconButton` has no `Size` variant in Figma**, where the code now has two; the cards are
  instance overrides. The component is shared with the sidebar's toggles, so adding the variant has
  a blast radius and was deliberately not taken here.
- The method that found all three, and the one to keep: **read the rendered pixel, not the property
  you just wrote.** The same session bound a Figma stroke to the right variable and left the paint's
  literal colour black — the inspection said `border/subtle`, the canvas drew a black edge.
