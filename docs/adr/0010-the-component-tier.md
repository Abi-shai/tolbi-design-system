# ADR-0010 — The component tier holds values, not routing

**Date:** 2026-08-31
**Status:** Accepted
**Follows:** ADR-0009, which left "the component tier" open with a single member
**Benchmarked against:** Material 3, GitHub Primer, Shopify Polaris, IBM Carbon v11, Atlassian Design System, Salesforce SLDS

## Context

ADR-0009 named one component token — segmented-control selection — and deferred the tier's rules.
Five systems were measured from their token sources rather than their documentation:

| System | Component tokens | Share of colour layer |
|---|---|---|
| Material 3 | ~2,400 (61 files; `filled-button` 46, `checkbox` 66) | most of the system |
| Primer | ~292 across 27 files | ~30% |
| Polaris | 41 of 226 | 18% |
| Carbon | ~77 in **five** groups | ~10% |
| Atlassian | **7** of 441 | 1.6% |

The spectrum is wide enough to be useless as a target. The *shape inside each system* is not:

- Primer's 292 are **84% two files** — `button` (113) and `label` (133). The other twenty average **2.3**.
- Carbon's five groups are 71% two groups — `tag` (40) and `button` (15). The rest are 3–10.

Component tokens are bimodal. They are either a **variant matrix the semantic layer structurally
cannot express**, or **one or two bespoke parts**. Nothing sits in between, and no mature system
ships them for a component's ordinary chrome.

This repository had independently reproduced that distribution. Of 99 component-local custom
properties, `Badge` (65) and `BadgeGroup` (25) hold **91%**; every other component has one or two.

## Decisions

### There is no `control.*` colour layer

Primer ships one — `control.bgColor.{rest,hover,active,disabled,selected}`,
`control.fgColor.{rest,placeholder,disabled}`, `control.borderColor.*` — shared by every button,
input, checkbox and select. Five of our components assemble byte-identical chrome
(`bg-default` + `border-default` + `radius-control` + `elevation-control`), which looked like the
same duplication.

It is not. The rule is **control tokens only where a field diverges**, and measured against that,
nothing diverges:

| Slot | Token in use | Diverges from the general token? |
|---|---|---|
| resting bg / hover / disabled | `bg-default` / `bg-hover` / `bg-disabled` | no |
| resting border | `border-default` | no |
| focus border | `border-brand` | no — `Button` uses it as a *resting* border too |
| invalid border | `border-error` | no |
| field disabled text | `text-placeholder` | no — `text-disabled` is the same value |

The five components agree because the semantic tokens are correct. That is the system working, not
duplication. Primer needs a `control` layer because it holds six colour modes and high-contrast
variants together; ADR-0003 deleted all of that.

**`control` remains a real context for geometry and only geometry.** `radius-control` (md) against
`radius-surface` (xl), and `elevation-control` (xs) against `elevation-surface` (sm), are genuine
divergences. Colour has none. The two existing tokens stand unchanged.

Likewise the five focus rings differ by **tone** (brand / gray / error) and by whether elevation is
composited in (`-shadow-xs`), not by control. That is a composite-token design, not drift.

### A component token holds its own value; an alias is a variant switch

Of the 99 component-local properties, **54 alias a semantic token and 45 hold their own value**.
Only the second kind are component tokens.

`--badge-bg: var(--ds-bg-error-subtle)` carries no decision — the decision *is*
`bg-error-subtle`, merely routed so that one CSS rule can serve thirteen variants. That is a CSS
technique, the same class of thing as `currentColor`. Writing an admission rule for it would mean
governing a for-loop.

The distinction is visible in the benchmarks once read closely: Carbon's `tag-background-red` and
Primer's `label.green.bgColor.rest` resolve to **palette values**, while Primer's
`button.default.fgColor.rest` aliases `{control.fgColor.rest}` — and Primer marks exactly those
`component (internal)`. Routed values are not really tokens there either.

Consequences:

- **Component tokens** get the admission rule, the naming grammar and the semver commitment.
- **Variant switches** get one rule and nothing else: the name must be component-scoped and must
  never shadow a semantic name. `BadgeGroup`'s bare `--bg-default`, `--text` and `--border` read as
  semantic tokens with the prefix filed off; they become `--badge-group-*`.

This costs one thing worth naming. `--segment-selected-bg` is an alias — it resolves to
`bg-neutral-subtle` and holds no value — so it is a variant switch and gets no protection, even
though ADR-0009's point was that this slot must **not** be `bg-selected`. The prohibition lives in
that ADR, which is where a prohibition belongs. A named alias is a comment wearing a `--var`.

### The tier starts private

`--ds-{component}-{property}[-{state}]` marks a token **public**: a declared API, overridable from
any ancestor because custom properties inherit, and covered by semver. An unprefixed name is
**private** and free to rename.

Nothing is public yet. Primer keeps 113 of `Button`'s tokens internal precisely so it can
restructure Button without a major, and Salesforce's `--slds-c-*` is a support commitment taken
deliberately. A token becomes public when someone actually needs to override it, not in advance.

### Categorical values bypass the semantic tier

ADR-0009's standing rule is that components consume semantic tokens, never primitives. That rule
gets one narrow exception: **a component token may alias a primitive directly when the value is
categorical** — when the component picks an identity from an arbitrary set rather than expressing a
role.

The bright line: if you can write a sentence saying what the colour *means* ("this is an error"), it
routes through semantic. If the only available sentence is "this one is blue", it is categorical and
goes direct.

Without this clause, a categorical palette needs a semantic tier mirroring it one-to-one, where every
entry is a rename containing no decision — the `fg` failure mode ADR-0009 deleted. All three
benchmarks that ship a label palette skip the semantic tier for exactly this reason: Primer's
`label.green.bgColor.rest` points at `{base.display.color.green.0}`, a **base** reference;
Atlassian's `color.chart.blue.bold` is terminal, with no layer beneath it.

### The display palette: seven hues, four steps

`Badge` carried eight hues as raw hex with no ramp behind them. They become primitives under
`color.display.*`. Two corrections fell out of measuring them:

- **`gray-blue` is deleted.** It was byte-identical to `blue-gray` — `#F8F9FC / #D5D9EB / #363F72 /
  #717BBC / #4E5BA6`, both of them. Two names, one value, in a public API.
- **The outline slot moves from step 600 to step 700.** In `pill-outline` the border is the entire
  visual and must clear 3:1. At 600, `blue-light` measured **2.59:1**. At 700 every hue clears it,
  and the slot collapses onto the same step as the label text — so the palette needs **four** steps,
  not five.

| hue | text 700 on 50 | outline 700 on 50 | dot 500 on 50 |
|---|---|---|---|
| blue | 5.57 AA | 5.57 | 3.01 |
| blue-light | 5.49 AA | 5.49 | 1.97 · decorative |
| blue-gray | 9.45 AA | 9.45 | 3.79 |
| indigo | 7.32 AA | 7.32 | 5.54 |
| orange | 5.16 AA | 5.16 | 2.82 · decorative |
| pink | 5.61 AA | 5.61 | 3.31 |
| purple | 6.16 AA | 6.16 | 3.09 |

Seven hues × four steps (`50`, `200`, `500`, `700`) = **28 primitives**. The dot is admitted under
ADR-0009's clause 4: it is decorative, and the label carries the meaning.

**The ramps are gap-toothed on purpose**, which ADR-0003 warned against. That warning was written
about the six brand and status ramps, which are consumed across the whole system and where a missing
tint is a live risk. This palette has exactly one consumer and five known slots. Full 11-step ramps
would add 77 primitives to serve 28 that are used — the primitive layer's version of the 38%-dead
problem ADR-0009 spent a session removing. If a step is ever needed, it gets added then.

**The numbered categorical set is deferred.** Atlassian ships `color.chart.categorical.{1..8}`
alongside its hue names, for "give me N distinguishable series". Charts here would be the consumer —
but per ADR-0006 the design system ships chart *chrome and no renderer*, so the product picks its own
series colours. Nothing in this library renders a series. It gets built when something does.

### `Badge` splits `tone` from `color`

One prop cannot carry two routing rules. `color="error"` goes through semantic, `color="blue"` goes
direct to a primitive, and nothing in the API told a caller which they were getting.

```ts
tone?:  'neutral' | 'error' | 'warning' | 'success'                     // semantic, default 'neutral'
color?: 'blue' | 'blue-light' | 'blue-gray'
      | 'indigo' | 'orange' | 'pink' | 'purple'                         // categorical, wins over tone
```

`brand` is gone — ADR-0009 made it interactive-only. `gray` becomes `tone="neutral"`. The old default
`color: 'brand'` becomes `tone: 'neutral'`.

They are **not mutually exclusive in the type**, and `color` wins when both are set. Vue cannot
express an exclusive prop union cleanly, and a runtime warning is more use than a type gymnastic
nobody reads. Badge has two call sites in the repository, so the break is cheap.

**`BadgeGroup` is deliberately not changed.** It has no categorical palette, so its single prop
carries no ambiguity, and renaming it for symmetry with `Badge` would be a second breaking change on
a component nobody has complained about. The two components using the word "color" for different
things is a real asymmetry, accepted because the alternative costs more than it fixes.

### `bg-overlay` returns, with the alpha baked in

ADR-0009 deleted it for having zero usages, reading its clause-2 failure — no `text-on-*` names it —
as proof it was a trap. That was the wrong read. Three of the five benchmarks carry a scrim
(`backdrop-bg`, `overlay`, `blanket`), and Atlassian keeps `color.blanket` as one of only **seven**
component tokens it has at all. A scrim is not a ground that failed to find a foreground; it is a
different kind of thing.

It is admitted under **clause 1**, not a new clause, because a scrim does declare a contrast
contract — it is simply between two surfaces rather than between text and a ground. The dialog above
it must separate from the page beneath it:

| scrim alpha | `bg-default` vs the dimmed page |
|---|---|
| 32% (Material's value) | 2.10 — **under 3:1** |
| 48% | 3.33 — the floor |
| **60% (chosen)** | **4.94** |
| 70% (Untitled UI) | 7.08 — blacks out the context |

Material can sit under the floor because its dialogs carry elevation and a tonal surface tint; ours
would be relying on the scrim alone.

The old token was `{color.gray-light.950}` — **opaque**, with a description telling callers to apply
their own alpha. That is the `MetricValue` trap ADR-0006 removed: the default was the broken one and
you had to remember to escape it. The alpha is now part of the token:

```
--ds-bg-overlay: color-mix(in srgb, var(--ds-color-gray-light-950) 60%, transparent);
```

This takes the semantic colour layer from 64 tokens to **65**.

### The tier, in full

| Component | Tokens | Admitted as |
|---|---|---|
| `Badge` | 28 | Categorical matrix — 7 hues × 4 slots |
| `ChartTooltip` | 2 | `min-width` / `max-width` — the widths ramp starts at 320px, no honest token |
| `AvatarGroup` | 2 | `stack-overlap`, `stack-ring` — bespoke geometry |
| `Scrollbar` | 1 | `fade-size` |

**33 component tokens.** Everything else — `Badge`'s tone blocks, all of `BadgeGroup`,
`ButtonGroupItem`'s segment, `Card`'s padding, `Scrollbar`'s fade colour — is a variant switch.

`Button` gets **zero**, where Carbon gives it 15, Primer 113 and Material 46. Every value our Button
uses is already semantic. That is the divergence rule working, not a gap.

## What changes

- 28 primitives added under `color.display.*`; `gray-blue` deleted.
- `Badge`: `color` splits into `tone` + `color`; the eight hex hues become primitive aliases; the
  outline slot moves to step 700.
- `BadgeGroup`: variant switches renamed `--badge-group-*` to stop shadowing semantic names. No API
  change.
- `InputField` and `TextareaInputField`: disabled text moves from `--ds-text-placeholder` to
  `--ds-text-disabled`. Same value today, so no visual change — but the day the two diverge, two
  fields would have broken silently.
- No `control.*` layer, and none is coming.

## Still open

- ~~**Naming enforcement.**~~ Closed by ADR-0012: the `no-shadowing-var` rule checks that a variant
  switch never carries a semantic token's name with the prefix filed off, which is how
  `BadgeGroup`'s `--bg-default` was found.
- ~~**The four `blur-*` tokens**~~ — closed by ADR-0015: deleted. The scrim does not blur.
- ~~**`BadgeGroup.color` still accepts `brand`**~~ — closed by ADR-0014, which also reverses the
  "leave BadgeGroup alone" decision above: `color` became `tone` and `gray` became `neutral`.
- **The numbered categorical set**, deferred above until something renders a data series.
- ~~**Radius has no agreed role for four of its steps**~~ — closed by ADR-0013.
