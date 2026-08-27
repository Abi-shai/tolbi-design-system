# ADR-0003 — Foundations realignment: single mode, role-based typography

**Date:** 2026-08-25
**Status:** Accepted
**Source of truth:** Figma `00 — Core Brand Visual Identity` (`pJ20XxoowumVNZ6iwB9DKz`), foundations handoff of 2026-08-25

## Context

The Figma foundations were rebuilt. Three changes invalidated the token layer:

1. Dark mode was **deleted**, not deprecated. `1. Color modes` now has a single `Light mode`.
2. All 914 Figma colour *styles* were deleted. Colour comes exclusively from variables.
3. Typography went from 68 styles to **15 styles over 13 semantic roles**, with a Web/Mobile mode split replacing one fixed scale.

## Decisions

### Dark mode is gone from the token layer

`semantic.dark.json`, the `gray-dark` primitive ramp, the `semantic-dark.css` output and the
`[data-theme="dark"]` selector are all deleted. There is no `prefers-color-scheme` branch.

If dark mode ever returns it comes back as a Figma mode first. Keeping a half-maintained dark
branch in code costs more than rebuilding it from a real design decision later.

### The six `_alt` colour tokens are deleted

`bg-primary_alt`, `bg-secondary_alt`, `bg-brand-primary_alt`, `fg-brand-primary_alt`,
`border-brand-solid_alt` and `text-brand-tertiary_alt` existed **only** to resolve differently in
dark mode. In light mode each was byte-identical to a surviving twin, so once dark mode went they
carried zero information. Consumers were repointed to the twin.

### Typography roles, not sizes

Components consume `--ds-font-size-{role}` / `--ds-line-height-{role}` /
`--ds-letter-spacing-{role}` / `--ds-font-weight-{role}` for the 13 roles. The numeric primitive
ramps (`--ds-typography-font-size-16`, `--ds-typography-line-height-24`) exist **to be aliased and
must never be referenced directly** — same rule as raw colour primitives.

Roles are **not interchangeable even when they resolve to the same pixels.** `heading-sm` and
`label-lg` are both 14px on web; they stay distinct because they diverge on mobile (15 vs 16) and
will diverge again at the next typeface change.

### The mobile scale is opt-in, not viewport-driven

Web values sit on `:root`. Mobile values are emitted under `[data-typography="mobile"]`.

They are **not** wired to a media query. In Figma, "Mobile" means a native or webview context —
the handoff requires those values to resolve to `sp` on Android and to scale with Dynamic Type on
iOS. A narrow desktop browser window is not that context, and silently reflowing type at a
breakpoint would misread the mode as a responsive rule.

### Three weights only

Regular 400, Medium 500, Semibold 600. **Bold 700 is dropped** — at 14–16px it is barely
distinguishable from Semibold, and two heavy weights guarantee inconsistent use.

### Poppins everywhere; JetBrains Mono for code only

The `inter` font-family token is deleted and all 30 consumers were repointed to `poppins`. Poppins
has no monospace cut, so `code-md` uses JetBrains Mono Regular via
`--ds-typography-font-family-mono`.

### Tracking is a function of size, so it is encoded per role

`0` at ≤20px, `-0.5%` at 22–24px, `-1%` at 28–32px. Every role's tracking happens to be identical
across web and mobile, so `letter-spacing` is defined once on `:root` with no mobile override.

### Duplicate semantics are kept on purpose

Many semantic tokens resolve to the same primitive in a single-mode system (`text-error-primary`
and `border-error-solid` both → `Error/600`). **Do not dedupe them.** Same reasoning as the role
rule above: they are separate names because they are separate decisions.

Likewise, colour ramp steps with no current reference are kept. A ramp is a palette, not a usage
list, and gap-toothed ramps break the first time a tint is needed.

## Follow-up — component layer

Only foundations changed in Figma; the component layer has not been reviewed there. Two known
consequences:

- Most components still hardcode `rem` font sizes rather than consuming role tokens. They should
  move onto roles when the component layer is reviewed.
- The four components that already used scale tokens were migrated by **preserving pixel values**
  via the handoff's §1.7 size map, not by picking the semantically ideal role. Notably `Tabs`
  labels landed on `heading-md` / `heading-sm` to stay 16px/14px Semibold, where a tab is
  semantically a `label-lg`. Revisit with the component-layer pass.
