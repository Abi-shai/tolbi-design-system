# ADR-0020 — Two scales the components had already agreed on

**Date:** 2026-09-01
**Status:** Accepted
**Closes:** the two coverage gaps found by auditing what the token architecture does *not* cover

## Context

Ten dimensions were tokenised. An audit of the components found four that were not, and two of them
had the same signature as every real gap this series has fixed: **several components independently
chose the same value**, which means a shared decision nobody had named.

- **`1px` appears 38 times** as a border width — the single most repeated value in the catalogue.
- **Four components chose `z-index: 100`** for their floating panel: `Dropdown`, `InputDropdown`,
  `HelpIcon` and `HorizontalNavigation`'s tip. A fifth, the nav's module panel, chose `200` to sit
  above them.

Undocumented layering is how a dropdown ends up under a modal.

## Decisions

### `border-width`: two tokens, and 1.5px is not a third

```
--ds-border-width-default   1px    the hairline
--ds-border-width-strong    2px    a ring that has to read
```

The catalogue held `1px`, `1.5px`, `2px`, plus `0.361px`, `0.75px` and `1.083px`. The sub-pixel
values are Figma export artifacts — `0.361px` does not render distinctly anywhere — and they snap to
the hairline.

**`1.5px` and `2px` are the same decision with two values**, which is the "six tiles, four radii"
shape (ADR-0006). Rather than mint both, the three `1.5px` sites snap up to `strong`: a half-pixel
change that removes a sub-pixel value from the system.

Two things stay literal, and the rule is scoped so they are not flagged:

- `Tooltip`'s `6px`/`8px` — a CSS triangle. That is geometry, not a border.
- `Toast`'s `3px` left rule — a tone accent stripe, not a border width.

### `z`: three layers, and stacking below 10 is not a layer

```
--ds-z-raised     1      lifted above a sibling in the same component
--ds-z-popover  100      anchored floating chrome — dropdowns, tooltips
--ds-z-overlay  200      anything that must cover a popover
```

`z-popover` is the interesting one: **four components arrived at 100 independently**, which is
exactly what makes it a layer rather than a number. `z-overlay` names what the nav's module panel
already does and states the obvious next tenant — a modal scrim, pairing with `bg-overlay`.

Values below 10 — `Avatar`'s ring at 2 and status dot at 3, `Slider`'s tooltip anchor at 5, `Tabs`'
indicator at 0 — are **stacking inside one component**, and stay literal. A token for "the avatar's
ring sits above its image" would be noise. The lint rule fires only at 10 and above, so the
distinction is enforced rather than merely described.

### Two dimensions are deliberately still absent

- **Breakpoints.** There is no media query in the catalogue except `prefers-reduced-motion`, and
  `container-padding-mobile`/`-desktop` have two consumers between them. There is no responsive
  behaviour to tokenise, and adding breakpoints would be the `blur-*` ramp again.
- **Icon sizes.** `16 | 20 | 24 | 32` is a TypeScript union in `Icon.vue` — a component API
  (ADR-0004), typed at the call site. That is the right place for it.

**Opacity** was considered and rejected: `0.4`, `0.5` and `0.7` across six sites, all meaning
"disabled or inactive". One concept, three values, and the disabled state is better served by the
colour tokens that already exist.

### A dead build entry from ADR-0015, found on the way

`tokens/build.js` still referenced `tokens/src/effect/blurs.json` after ADR-0015 deleted it. That
ADR's string replacement had not matched — the whitespace differed — and it went unnoticed because
**Style Dictionary silently ignores a missing source file**. Removed.

Nothing was broken by it, but it is the second time a string replacement has silently missed
(ADR-0011 found a `font-weight: 700` that survived ADR-0009's pass for the same reason). The lesson
holds: a codemod should assert its match, not assume it.

## What changes

- `tokens/src/border/semantic.json` and `tokens/src/layer/semantic.json`; two new emitted files.
- 47 border declarations and 12 z-index declarations migrated across 29 components.
- Sub-pixel border widths eliminated.
- Two lint rules — `no-literal-border-width`, `no-literal-z-index` — **13 rules, 19 tests**, each
  new rule with a firing test, a silent test and a mutation proving it bites.
- The orphaned `blurs` build entry removed.

## Still open

Nothing on the token architecture. What remains is deferred against a named trigger: native
platforms when a native app exists, and the mobile type scale when it has a consumer.
