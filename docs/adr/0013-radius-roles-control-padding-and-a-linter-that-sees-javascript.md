# ADR-0013 — Radius roles, the control-padding scale, and a linter that sees JavaScript

**Date:** 2026-09-01
**Status:** Accepted
**Closes:** the three items left open by ADR-0009 through ADR-0012

## Context

Three things had been carried forward, the oldest since ADR-0009: radius had no role for four of its
steps, control padding was an unnamed scale, and the linter could only see CSS.

## Decisions

### Radius gets two more roles, and 10px turns out to be real

ADR-0009 promoted four roles (`control`, `surface`, `pill`, `inner`) and left `lg`, `xs`, `2xl` and
`4xl` on the primitive ramp, saying that naming them without deciding what they meant would be the
"six tiles, four radii" defect wearing a token. Deciding what they meant was the work.

**`xs` (4px) is a ramp step, and `Checkbox` proves it in one rule:** `--sm` takes 4px, `--md` takes
6px. The mark inside a control tracks the control's size. So `radius-inner-sm` (4px) joins
`radius-inner` (6px), and `PasswordField`'s toggle, `Tag`'s count and `ChartLegend`'s swatch all
resolve to it.

**`lg` (10px) looked like drift and is not.** The sibling comparison suggested drift — three
floating panels carried three radii (`Tooltip` 8, `ChartTooltip` 10, `Toast` 12), and three input
types disagreed (`InputField` 8, `TextareaInputField` 8, OTP cell 10). But
`VerificationCodeInputField` settles it: its cells go **8px at `sm`, 10px at `md`, 12px at `lg`**.
Radius scales with the element, and 10px is the step between a control and a surface.

It becomes **`radius-surface-sm`**, described as the compact panel: `ChartTooltip`,
`FileDropzone`'s file row, `ProgressSteps`' featured icon, `Tabs`' small track, the mid OTP cell.

Three sites were genuine drift and were snapped to existing roles: `ModulesList` from `2xl` to
`surface` (matching `Card`, `Table` and `Toast`), `HorizontalNavigation`'s icon button from `4xl` to
`pill` (24px on a 40px button is a pill), and `Tooltip` from `control` to `surface-sm` — a tooltip is
a compact panel, not a control, which is what made the three-floating-radii inconsistency real.

Every radius primitive now has a role, so a raw step in a component is drift by definition and the
`no-raw-radius` rule says so.

### Control padding is its own scale, derived from control heights

ADR-0012 deferred this rather than guessing, and the guess would have been wrong. The spacing ramp
is Tailwind-shaped — `0.25rem` increments to `1.5rem`, then jumps — and contains **no 10, 14, 18 or
22px**. Those are half-steps, and they are not layout rhythm: they are a control's height minus its
line box.

The evidence that this is a scale and not four stray values: **`Button`, `InputField`, `Dropdown`
and `InputDropdown` all landed on `10px 14px` independently.**

Four half-step primitives are added (`space.2-5`, `3-5`, `4-5`, `5-5`) and a `control-padding` set
sits over them, as a **paired value applied in one declaration** — the same shape as ADR-0011's
`font:` shorthand:

| Token | Value | Control height |
|---|---|---|
| `control-padding-sm` | 8px 12px | 36px |
| `control-padding-md` | 10px 14px | 40px |
| `control-padding-lg` | 10px 16px | 44px |
| `control-padding-xl` | 12px 18px | 48px |
| `control-padding-2xl` | 16px 22px | 56px |

It is its own semantic set referencing space primitives directly, following the precedent already
set by `widths` and `containers` — not an extension of the t-shirt spacing ramp, where a step
between `md` (8px) and `lg` (12px) has no name that is not a lie.

`Button`'s ramp had become half-tokenised and unreadable (`padding: 10px var(--ds-spacing-xl)`);
all five sizes are now one token each.

### The linter reads JavaScript, and a suppression must argue for itself

ADR-0011 found `ProgressCircle` carrying a parallel type ramp in a JS style object, which a
CSS-only linter cannot see. Extending it found a second one immediately: **`Avatar` scales its
initials through a six-entry table**, including 10px and 18px, both off the type ramp. Nobody had
noticed.

The rule is deliberately not keyed on property names. A rule looking for `fontSize` sails straight
past `ProgressCircle`, whose tables are keyed `size:` and `line:`. It flags **any bare dimensional
literal** in a `<script>` block instead, and zero is excluded because zero is not a decision.

That makes false positives normal, so the rule needs an escape — and the escape has to cost
something. `token-lint-disable <rule> — <reason>` requires the rule name **and** an em-dash reason;
a bare `token-lint-disable` is ignored, verified by probe. Three components declare one: `Avatar` and
`ProgressCircle` because their dimensions track their own geometry, `HelpIcon` because `-12px`
aligns a tooltip tail to its trigger and no token expresses that relationship.

### Two more linter bugs, found the same way as the first

ADR-0012 established that a linter reporting zero is indistinguishable from a broken one. That paid
again, twice:

- The JS rule reported zero because it keyed on `fontSize`. Broadening it surfaced 31 findings
  across three components.
- The suppression mechanism reported zero because `const sup` inside the file loop **shadowed** the
  module-level `sup` that `report` reads — so no suppression ever applied, and every documented
  exception was still firing.

Both were found by probing, not by reading. The practice holds: every rule and every escape hatch is
verified against a deliberately broken file.

## What changes

- Radius: `radius-inner-sm` and `radius-surface-sm` added; 12 sites remapped; `no-raw-radius` rule.
- Spacing: four half-step primitives; `control-padding-{sm,md,lg,xl,2xl}`; `Button`, `InputField`,
  `Dropdown` and `InputDropdown` migrated.
- Linter: `no-literal-dimension-js`, the suppression mechanism, and the shadowing fix. **Ten rules.**

## Still open

- ~~**Nine bespoke spacing literals**~~ — reviewed and recorded in ADR-0015; one had a token after all.
- **The suppression list is three components long.** That is the right size today; if it grows, the
  `no-literal-dimension-js` rule is mis-scoped rather than the components being wrong.
