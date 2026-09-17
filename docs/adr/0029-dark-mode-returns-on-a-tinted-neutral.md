# ADR-0029 — Dark mode returns, on a neutral tinted to the brand

**Date:** 2026-09-16
**Status:** Accepted
**Reopens:** ADR-0003's deletion of dark mode
**Source:** Figma *Sprint 18* — `1284:3640` (`gray-forest — rampe et rôles`)

## Context

ADR-0003 deleted dark mode and wrote the condition for its return in the same paragraph:

> If dark mode ever returns it comes back as a Figma mode first. Keeping a half-maintained dark
> branch in code costs more than rebuilding it from a real design decision later.

It came back as a Figma mode first. The frame carries a twelve-step neutral ramp and a table of
sixteen roles headed *"les rôles qui portent la bascule"* — the roles that carry the switch.

The frame's light column was checked against `semantic.json` before anything was built: **sixteen of
sixteen** match the values already shipping. That is what establishes the third column as the dark
value rather than a proposal for both. The dark column was then recomputed from the primitives —
all eight stated ratios reproduce to within **0.03**.

## Decisions

### The dark neutral is tinted to the brand, and that is the decision

`gray-forest` is a neutral at **hue 150** — the hue of `brand/500` (`#066938`). The frame is explicit
that this is a departure, not a default: of eight products surveyed on Mobbin, *none* tints its
neutral toward its own brand — Mintlify is green and its gray sits at 240°.

Light keeps `gray-light` (a blue-ish neutral at ~220°). The two modes therefore do **not** share a
neutral, and nothing tries to make them. A mode is a different set of values under the same names.

### Sixteen roles were specified; sixty-nine ship

The frame specifies the roles that carry the switch. The layer is 69 tokens, and a token without a
dark value does not fail — it **inherits the light one**, which on a dark page is a white flash. So
the remaining 53 are derived, under four rules taken from the sixteen:

**A layer rises.** Light recesses away from white (`50` → `100` → `300`); dark lifts away from the
ground (`800` → `700` → `600`). `bg-default` is `gray-forest/900`, not `950` — the frame's note reads
*"la surface de lecture — remontée d'un cran"*, and the step it is raised off is where a recess goes.

**Accents travel toward the light end, by different distances.** `warning` and `success` move
600 → 500, `error` moves 600 → 400, `brand` moves 600 → **200**. The frame's reasoning is that the
target is a contrast, not a position: *"à indice égal, un jaune brille bien plus qu'un rouge."* Brand
travels furthest because `brand/600` on `gray-forest/900` is **1.63:1** — the deep green needs a
light step, not a darker one.

**Tinted grounds are minted, not borrowed.** See below.

**Inverse flips with the mode.** `bg-inverse` is a *light* surface in dark mode (`gray-forest/50`),
and `text-on-inverse` is `gray-forest/900`. "Inverse" names a relationship, not a colour; a token
that stayed dark in dark mode would be the only one that stopped meaning what it says.

### `{tone}/dark-subtle` and `{tone}/dark-border` are new primitives

The frame names `success/dark-subtle` and `success/dark-border` and gives **no hex** — it gives their
contrast against `bg-default` instead (**1.15:1** and **1.55:1**) plus the rule *"les fonds teintés
descendent en 950 / teinte fondue dans le neutre"*. They are solved from those two targets, by
blending the tone's base step into `gray-forest/900`, and minted for all five tinted tones.

The existing `950` steps were tried first and rejected: they land at 1.03 / 1.19 / 1.19 / 1.19 / 1.38
against the dark ground — a spread, not a register. The dedicated step is what makes the five tints
read as one system.

The blend fraction is **not** constant (brand 19%, error 15%, success and warning 9%, accent 8%) and
that is the same point the frame makes about the accents: equal contrast, not equal index.

Two figures say the derivation landed in the right place: every `dark-border` sits at **1.35:1** on
its own `dark-subtle`, and light's `border-on-success-subtle` sits at **1.33:1** on `bg-success-subtle`.
The hairline has the same weight in both modes without either having been aimed at the other.

> **These five pairs are derived, not read off Figma.** If the Figma variable collection defines its
> own `dark-subtle` / `dark-border`, those win — replace the ten hexes and nothing else moves.

### The mode is an attribute, never `prefers-color-scheme`

`[data-theme="dark"]`, opt-in, for the reason ADR-0003 gave for the mobile type scale: the OS
preference is not the product's decision. Emitted after `semantic.css` at equal specificity, so the
attribute wins wherever it is set — on `<html>`, or on a subtree.

### Dark is a CSS concern, so the JS export does not get it

`semantic.dark.json` is deliberately absent from `ALL_SOURCES`. It carries the **same 69 paths** as
the light file, so adding it would not add tokens to `./tokens/js` — it would silently overwrite the
light values. A mode lives in the cascade, and the cascade is exactly what ADR-0019 says the JS
platform cannot have.

### Parity is enforced, not documented

Two rules, following ADR-0012, over the token sources rather than a `.vue` file:

- `dark-mode-parity` — the two files carry the same token names. Catches the forgotten twin.
- `mode-neutral-ramp` — light references `gray-light`, dark references `gray-forest`, never the
  other way. Catches the copy-paste that survived.

Both are asserted both ways and mutation-checked against the shipped sources, per ADR-0018.

### One place dark does not mirror light

`text-disabled` is `gray-forest/500` (**3.14:1**), where light's is `gray-light/500` (**4.97:1**,
identical to `text-subtlest`). Light's disabled reads as live text; dark's recedes. The divergence is
deliberate and carries its reason in the token's own description.

### A focus ring is the alpha, not the base

`focus-ring-*` was built on `brand-500` and `gray-light-400`. On `gray-forest/900` the first is
**1.63:1** and the second haloes nothing, so the second mode shipped without a visible focus
indicator — WCAG 2.4.7, which is not optional in one mode and not the other.

The fix keeps every **alpha** (24% / 14% / 20%) and swaps only the base the alpha is taken from:
`brand-300`, `gray-forest-400`, `error-400`. The percentage is the design decision and it was never
what was wrong.

## The component pass

Almost nothing had to change, which is the point of a token layer: 67 components reference semantic
colour tokens and all 67 follow the mode for free. What did **not** follow was the colour that is
not a token.

Three components hardcoded `white` where the token already existed — and each was a real dark-mode
bug, because white is the one literal a second mode breaks: it does not move, and everything around
it does.

| | was | now | why it matters in dark |
|---|---|---|---|
| `CloseButton` (`--dark`) | `color: white` | `text-on-inverse` | its own hover rules already mixed `text-on-inverse`; `bg-inverse` is a **light** surface in dark, so the icon must go dark |
| `ProgressSteps` | `color: white` | `text-on-brand-solid` | the check sits on `bg-brand-solid` — this is exactly ADR-0009's pairing contract |
| `Avatar` | `background: white` | `bg-default` | the company plate's own border was already `bg-default`; they were the same colour by coincidence |

### The linter could not see any of them

`no-colour-literal` matched `#rrggbb` and `rgb()`. It never looked at colour **keywords**, so three
`color: white` declarations sat in the catalogue under a rule reporting zero — the precise failure
ADR-0018 was written to make impossible, found the same way ADR-0013's four were: by probing.

The rule now also covers keywords (`white`, `black`), 3/4/8-digit hex and `hsl()`. `transparent`,
`currentColor` and `inherit` stay silent — they are not colours in this sense. Zero findings across
all 271 components, and a named regression test so it cannot come back.

## A note on the frame's fifth column

The frame's **light** ratio column does not reproduce: it reads 17,0 / 12,1 / 8,8 / 6,1 for
`text-strong` / `default` / `subtle` / `subtlest`, where the shipping values measure
17.75 / 10.46 / 7.69 / 4.97 — the figures `semantic.json` has carried since ADR-0009. Its **dark**
column is exact. Recorded because the frame is the source of truth for this work and someone will
read that column later: the fourth column was computed for this exercise, the fifth was not.

## Still open

- **`Badge`'s categorical palette** and **elevation** — both closed by ADR-0030.
- **The scrim.** `bg-overlay` is denser in dark (72% vs 60%), but a dark scrim cannot do what a light
  one does: `gray-forest/900` over a `950` scrim is **1.18:1**. Separation in dark has to come from
  elevation. `bg-overlay`, `z-overlay` and `duration-considered` are still the three things waiting
  on the modal that does not exist yet (ADR-0022) — settle it there, with a raised surface.
