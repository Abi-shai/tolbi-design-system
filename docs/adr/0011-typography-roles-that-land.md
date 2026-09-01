# ADR-0011 — A role you can apply in one declaration

**Date:** 2026-09-01
**Status:** Accepted
**Completes:** ADR-0003's deferred component-layer migration
**Benchmarked against:** GitHub Primer, Material 3

## Context

ADR-0003 designed the typography layer well — 13 roles across 4 axes, a real Web/Mobile mode split,
tracking derived as a function of size — and filed the component migration as follow-up. That
follow-up was never done. Measured now:

| | |
|---|---|
| Role-based `font-size` | 41 |
| Hardcoded `font-size` | **57** — adoption is 42% |
| Hardcoded `line-height` / `font-weight` | 62 / 52 |
| **Role applications using all four axes** | **4 of 41** |
| `letter-spacing` dropped | 36 of 41 |
| `font-weight` dropped | 23 of 41 |
| `heading-2xl` usages | 0 |

Compare the colour layer after ADR-0009 and ADR-0010: 3 unreferenced of 65, zero raw primitives in
component source, zero literals. Both layers were rebuilt as vocabularies. **Colour also got a
codemod.** That is the whole difference.

One correction to the framing that produced this ADR: **the 36 dropped `letter-spacing` declarations
are visually inert today.** Ten of thirteen roles have zero tracking, and all three that do not
(`heading-2xl`, `heading-xl`, `metric-lg`) apply it at every call site. This is a latent defect — the
day a role's tracking leaves zero, 36 sites will not follow — not a live bug. The severity is lower
than the raw number suggests; the diagnosis is unchanged.

## Decisions

### A role is one declaration: `--ds-font-{role}`

The defect is structural, not just adoption. A role is four separate declarations, so components
apply the convenient half — 4 of 41 apply all four axes. CSS custom properties cannot bundle
declarations, so a composite has to be a `font:` shorthand, a utility class, or a component.

It is the **`font:` shorthand**, which is what Primer emits from its `$type: 'typography'` composite
tokens:

```css
.ds-toast__title { font: var(--ds-font-heading-sm); }
```

carrying **family, size, line-height and weight** in one declaration. A utility class or a `<Text>`
component would cover tracking too, but both would move the catalogue off `<style scoped>`, and
ADR-0001 would then oblige every label in every component to become `<Text>`. One lint rule is
cheaper than that.

This closes a second gap for free. `font:` requires a family, so the shorthand carries Poppins — and
the **87 references to `--ds-typography-font-family-poppins`**, the last raw primitive leak in the
system, disappear without needing a separate family role. `code-md` carries JetBrains Mono the same
way.

Two footguns, recorded here rather than discovered later:

- **`font:` resets `font-variant-numeric` to `normal`.** It must be declared *before* any
  `tabular-nums` line. Backwards, the numbers silently jitter — a defect that survives review
  because it only appears when a digit changes width at runtime.
- It also resets `font-style` and `font-stretch`. Nothing sets those today.

### The four axis tokens survive, and the lint enforces completeness

`--ds-font-size-{role}` and friends stay, because two uses are legitimate: overriding a single axis
after the shorthand, and non-text uses such as `Icon` sizing keyed off a font size.

That leaves partial application possible, so the rule moves into the linter rather than the token
set: **using any axis token of a role obliges the whole role** — the shorthand, or all four axes.

Implementation refined this: **completeness is scoped to `font-size`.** A standalone
`font-weight: var(--ds-font-weight-{role})` is legitimate and common — it overrides one axis of a
role inherited from an ancestor (`--cta-muted` resetting weight inside an emphasised link,
`__num--active` promoting a page number). Six such sites survive the migration. The rule is
therefore: a block that sets `font-size` via an axis token must set the whole role; a block that
sets only weight or line-height, from a role token, is fine. `FormField` reads
`--ds-line-height-body-md` inside a `calc()` to optically centre an icon — the non-text carve-out,
and the clearest example of why the rule cannot be blanket. A weaker "no literal `font-size`" rule would close the 57
hardcoded sizes but permit today's 4-of-41 state to reappear.

### Emphasis variants are roles, not weight overrides

Eight rules override a role's weight. Three of them borrow `--ds-font-weight-label-md` onto a body
role, which is exactly what ADR-0003 forbids — *"roles are not interchangeable even when they
resolve to the same pixels."*

Two suffixes, `-emphasis` (medium) and `-strong` (semibold), minted only where demand exists.

**The migration found more demand than the audit did, and in the other direction.** Mapping literals
onto roles by pixel value silently dropped eight sites from semibold to medium — `Button`,
`ButtonGroupItem`, `Dropdown`'s trigger, `HorizontalNavigation`'s learn button, `Tooltip`'s title.
Those were deliberate, and they are precisely the case ADR-0003 anticipated in
`label-lg`'s own description: *"Label/lg strong raises this to semibold."* So the `-strong` half of
the axis had six consumers before anyone asked for it.

Minted: **`body-lg-emphasis`, `body-md-emphasis`, `body-sm-emphasis`** (medium) and
**`label-md-strong`, `label-lg-strong`, `label-xl-strong`** (semibold).

The other five overrides are not missing roles:

- `Breadcrumbs` and `ProgressBar` write a literal `500` on `label-lg`, which **already is** medium.
  They point at the role they are already inside.
- `ProgressBar`'s 12px semibold percentage and `Slider`'s 12px semibold value are **labels, not body
  copy**. They move to `label-md` rather than minting `body-sm-strong`. Relabelling fixes the misuse;
  minting would enshrine it.

Minting on demand leaves the axis deliberately gap-toothed — `body-md-emphasis` exists,
`body-md-strong` does not. That is ADR-0009's vocabulary rule applied consistently: a role earns its
place. The risk is that the next person wanting semibold 14px body finds the gap and reaches for a
literal, which is how the 57 got here. The lint is what makes that fail loudly instead of silently.

### `tabular-nums` is a rule, not a token

`font-variant-numeric: tabular-nums` is hand-written in eight places across six components, and
**missing from five that render changing digits** — `Pagination`, `Tabs` (its badge count),
`CreditsChip`, `ProgressCircle`, `Slider`. The decision is followed about half the time.

A token would be `--ds-font-numeric-tabular: tabular-nums`, which renames a CSS keyword and encodes
nothing. It fails ADR-0009's admission test.

The rule instead: **any element rendering an interpolated number sets
`font-variant-numeric: tabular-nums`, after the `font:` shorthand.** Applied to the five components
missing it, and lintable on both counts — presence, and ordering.

### The role set: 13 → 16

**`heading-2xl` is deleted.** Zero uses, and its own description names its consumer —
*"Onboarding, empty states"* — while `EmptyState` uses `heading-sm`. The description documents an
intention nobody implemented. Under ADR-0009 an unreferenced *semantic* token is a wrong turn, not a
palette entry; 32px stays reachable as `metric-lg`. It comes back with the onboarding screen that
wants it.

**`metric-xl` is added** at 40px, which needs two primitives the ramp does not have: font-size `40`
and line-height `48`. `MetricValue.vue:115` currently hardcodes `2.5rem / 3rem` — the component that
exists because of the metric role goes off the primitive layer for its own largest size.

**`metric-lg` (32px) is unchanged, and `MetricValue.sm` keeps `heading-lg`.** A `metric-sm` at 20px
would be the same pixels and the same weight as `heading-lg`, differing only in a mobile scale
nobody has shipped and a tabular rule that lives outside the role. ADR-0003's "separate names for
separate decisions" justified duplicates *inherited* from Figma; it is not a licence to mint new
ones.

**`VerificationCodeInputField`'s 48px and 60px digits become component tokens** under ADR-0010's
bespoke-part clause. An OTP cell's digit size is geometry, not a typographic role.

**`Button`'s `2xl` label became a component token.** 18px/28px is off the ramp and has exactly one
consumer; a role for a single call site is the sprawl ADR-0009 exists to prevent. ADR-0010's
bespoke-part clause covers it.

**`ProgressCircle` turned out to carry a parallel type ramp in JavaScript** — ten hardcoded
size/line pairs in `VALUE_FONT` and `LABEL_FONT`, most of them off the ramp entirely (30px, 36px,
48px, and 18px line-heights). The audit missed it because it grepped CSS declarations, not JS style
objects. The value scales with the ring diameter, so it is geometry rather than a typographic role
and stays as a table — but it is now labelled as a component token rather than passing as an
oversight.

**`label-xl` is added** at 16px medium. `label-lg` (14px) was the largest label role, but ten sites
want a 16px control label — `Button` at `lg` and `xl`, `Checkbox` and `Toggle`'s `--md` labels,
`DropdownSelectItem`, `ProgressSteps` at `lg`, and three in `CreditsChip`. Without it every one of
them stays a literal.

Net: **20 roles** — 13, minus `heading-2xl`, plus `metric-xl`, `label-xl`, three `-emphasis` and
three `-strong`.

### The adoption pass is semi-mechanical, and says so

ADR-0009's codemod was 499 near-blind renames because colour tokens mapped one-to-one. Typography
does not: **21 sites sit at 14px, which is `body-md`, `heading-sm` *or* `label-lg`**; 19 sit at 16px,
which is `body-lg` or `heading-md`; 9 at 12px, which is `body-sm` or `label-md`.

The selector name is a strong signal — `__label` → a label role, `__supporting` / `__cell-text` /
`__header-email` → a body role, `.ds-badge--lg` / `.ds-tag--lg` → a label role. So the codemod
**proposes** a role per site from the selector and emits an explicit review list for the ambiguous
remainder. It is not applied blind.

### Verified in a browser, not asserted

`font:` with nested `var()` fails **silently** — one undefined reference makes the whole declaration
invalid at computed-value time and the element falls back to the inherited font. Every role was
therefore checked against computed styles rather than reasoned about:

- All 20 roles resolve to the intended size, line-height and weight. `code-md` correctly picks up
  JetBrains Mono; the other 19 get Poppins.
- The mobile mode resolves under `[data-typography="mobile"]` — `body-md` 15px, `label-xl` 17px,
  `metric-xl` 32px.
- **The ordering footgun is real.** Measured: `font-variant-numeric: tabular-nums` followed by
  `font:` computes to `normal`; the reverse order computes to `tabular-nums`. All eleven sites in
  the codebase were checked and are in the correct order.

## What changes

- `--ds-font-{role}` shorthand added for all 16 roles, on `:root` and under
  `[data-typography="mobile"]`.
- Primitives: font-size `40`, line-height `48`.
- Roles: `heading-2xl` removed; `metric-xl`, `body-lg-emphasis`, `body-md-emphasis`,
  `body-sm-emphasis` added.
- 57 hardcoded `font-size`, 62 `line-height`, 52 `font-weight` migrated.
- 87 `--ds-typography-font-family-poppins` references removed — the last raw primitive in component
  source.
- `tabular-nums` added to five components; ordering fixed everywhere.
- `MetricValue` `lg` moves onto `metric-xl`; `VerificationCodeInputField` gets component tokens;
  `ProgressBar` and `Slider` are relabelled to `label-md`.
- Lint: role completeness (scoped to `font-size`), no literal type values, `font:` before
  `font-variant-numeric`.
- One regression caught and fixed during the pass: `Badge` set `line-height: 1` on its base for a
  tight pill, and the size modifiers' shorthand — later and more specific — overrode it, growing
  every badge. The tight line-height now follows each shorthand. `Tag` had the same pattern and was
  already correct, which is what made the difference visible.
- One survivor of ADR-0009's literals pass: a second `font-weight: 700` in `CreditsChip`, missed
  because that codemod replaced only the first occurrence. ADR-0003 dropped Bold 700.

## Still open

- ~~**The lint does not exist yet.**~~ Closed by ADR-0012: eight rules, including the three from
  this ADR, run on every build. Spacing went 47% → 87% in the same pass.
- **The mobile scale has never been exercised.** `[data-typography="mobile"]` has no consumer, so the
  shorthand's mobile variant ships untested.
- ~~**Radius has no agreed role for four of its steps**~~ — closed by ADR-0013.
