# ADR-0028 — The bar reads its values back from Figma

**Date:** 2026-09-14
**Status:** Accepted
**Reopens:** ADR-0009's deletion of the `accent` family
**Source:** Figma *Sprint 18* — `1074:15149` (Barre de navigation), `1154:3075` (CreditsChip/démo)

## Context

The navigation bar was redesigned: off the brand fill, onto a light chrome. The brief was not
"implement the design" but "make every value in it come from the design system" — so the work
started as an audit rather than an implementation.

The audit inverted the usual assumption. Three colours in the Figma frame were unbound —
`#fefbe8`, `#feee95`, `#a15c07` — and all three turned out to be **accent-50 / 200 / 700**, the tint
triplet every status tone already uses, drawn out of the wrong column of the palette. More
awkwardly, the Figma Semantic collection **already defined** `bg/accent-subtle`,
`border/on-accent-subtle` and `text/on-accent-subtle` for exactly those values.

ADR-0009 had deleted the accent family for having zero usages. Figma had kept it. The gap was in the
code export, not in the design.

## Decisions

### Accent comes back, because it was never gone from the design system

ADR-0009 wrote the condition for its return — *"when a yellow fill is genuinely needed it returns as
a pair, in one change"* — and guessed the shape wrong. It expected a **solid** pair. What the product
wanted was a **tint** pair. The clause that mattered was the admission rule, not the prediction.

`bg-accent-subtle` (50) · `text-on-accent-subtle` (700) · `border-on-accent-subtle` (200).

There is **no `text-accent`**, and the ramp is why. Every other tone has three tiers; accent gets
one:

| Pairing | Ratio | |
|---|---|---|
| `accent-600` on `bg-default` | **3.06:1** | fails AA — so no `text-accent` |
| `accent-700` on `bg-accent-subtle` | **4.98:1** | AA |
| `accent-200` on `accent-50` | 1.13:1 | decorative, in line with the other three hairlines |

Accent is a light ramp; its 600 sits where the other families' 500 sits perceptually. A tone that
cannot be read on the page ground is a tint tone, and the token set says so by having nothing to
offer there.

### A 36px control joins the padding scale

The bar's CTA is 36px. The `control-padding` ramp had nothing for it: `sm` is also 36px but carries
14px type, and this one keeps `label-xl-strong`. So `control-padding-lg-compact` (6px 16px) — lg's
type and horizontal rhythm at a 36px height, derived the way ADR-0013 derives the rest, control
height minus the line box.

`Button` gains the matching `lg-compact` size. It is what makes the bar 64px: at `lg` (44px) the bar
is 70.

The name introduces a second axis into a scale that had one, and that is a real risk — if `md-compact`
and `xl-compact` follow, the ramp doubles. Accepted on the grounds that one compact size is a fact
about this bar, not a pattern yet.

### `IconButton` exists because Figma's did

`Nav/IconButton` had been in Figma since the bar was designed — 8px around a 20px glyph, 36px, pill,
transparent. The code had no counterpart, so `HorizontalNavigation` carried it as a private class and
nothing else could reach it.

ADR-0001 says a component that hand-rolls a design system pattern must render the real one. The rule
never fired, because the component only existed on the Figma side. **That is the same defect with the
direction reversed**, and it is worth naming: an audit that only looks for code duplicating code will
not find it.

`Button` could not cover it — `variant="ghost" iconOnly` gets the geometry right but carries
`radius-control`, and radius is not a prop (ADR-0006).

Two things the private class did not have: a focus ring, and a required `ariaLabel`. An icon-only
button with neither is a defect that a private class hides and a catalogue entry cannot.

### The bar carries no ground

The Figma frame has no fill. An earlier draft read that as an omission and gave the bar `bg-default`
plus a hairline; it was a decision. The bar takes whatever surface sits behind it, and the code says
so in a comment, because the next reader will otherwise "fix" it.

### `CreditsChip` has one axis, not three

The chip ended the work carrying two models at once: the old `state` / `context` ladder **and** the
new expiry badge, because the migration added rather than replaced. Storybook showed five states
where the design has three, and nothing distinguished the live ones from the dead ones.

Figma has three separate components and the code matched none of them — the old `CreditsChip` (3
variants), `CreditsChip — v2` (12, an exploration), and `CreditsChip/démo` (3). What ships is
`démo` plus the compact form from v2.

There is no state prop at all now. The presence of `reminder` decides the form, the way `FormField`
derives invalidity from `error` rather than declaring it (ADR-0008). The expiry escalates in three
steps, and the last one **changes register** rather than deepening the tint: `expired` is a solid
fill, which needs no hairline and cannot carry `text-*`, so it takes the on-colour its ground names.
A tint cannot say "too late".

The thresholds do not ship. 14 days against 7 is product policy; the caller picks the step.

### Opacity is not a contrast strategy

Figma runs the unit label at **75% opacity** over the tint. Composited, that is **3.15:1** — it fails
AA for 14px text, and 90% fails too. The opacity is dropped and the hierarchy is carried by weight
and size, which is what the emphasis vocabulary is for. An alpha applied to a token silently voids
the contract the token was admitted under.

### In Figma, a glyph stroke takes a primitive

`text/default` is scoped `TEXT_FILL`. Binding it to a vector stroke reaches past the scope, and
Figma's own picker would not offer it. Glyph strokes therefore bind to `gray-light/700` and friends.

This is a Figma-only concession and it does **not** cross into code, where `Icon.vue` is
`stroke="currentColor"` and inherits the button's `color` — which *is* a `text-*` token. ADR-0009
deleted the `fg` group on exactly that reasoning. The two will disagree on provenance for the same
pixel, and `no-raw-primitive` would reject the primitive if anyone wrote it in a component.

## What changes

- Four tokens, none invented: `bg-accent-subtle`, `text-on-accent-subtle`, `border-on-accent-subtle`,
  `control-padding-lg-compact`. Each mirrors a variable Figma already had.
- `Button` gains `lg-compact`. `Logo` gains `size`. `IconButton` is new.
- `HorizontalNavigation` is the redesign, with no opt-out prop — a second appearance is a parallel
  version, and this is a replacement.
- `CreditsChip` loses `state`, `context`, `contact-sales`, `CreditsState` and `CreditsContext`.
- `credits-icon.png` becomes `credits-coin.svg`, taking the published bundle from **854 kB to 428 kB**
  (gzip 378 to 99) — the PNG was 318 kB inlined. ADR-0016 carries a note, since it named the file.
- Figma: every editable value in the bar is bound. The audit returns empty.

Measured against Figma at 1440px: bar, logo, icon buttons and avatar are exact. The badge and CTA
differ by 2px, which is Figma's inside stroke against CSS's outside border — the convention `Button`
already documents.

## Still open

- **The coin is two drawings.** Figma's is 27×28; the code ships a 24×24 built on `accent-400` and
  `accent-500`. Figma's fills are near-misses of those primitives — **ΔE 0.76 and 3.75** — so they are
  off-palette by a hair. The on-palette artwork was kept deliberately, at a cost of 3px: the chip
  measures 339 against Figma's 341.
- **`CreditsChip — v2` has 28 instances.** The 12-variant exploration is superseded but still
  referenced 28 times in the file. Deleting it breaks all of them; nobody has looked at where they
  live.
- **`Tolbi logos` is unbound inside.** Its gap and its white fill are the component's own business,
  and its 32 vector fills are the mark's artwork — already on `accent-400` and `brand-500`, and
  arguably right to stay literal, because a logo is a brand constant rather than something that
  should follow a token that might move.
- **`HelpIcon` and `Dropdown`'s trigger** are still private icon buttons, at 16px and 20px with
  different radii. `IconButton` does not fit them as it stands.
