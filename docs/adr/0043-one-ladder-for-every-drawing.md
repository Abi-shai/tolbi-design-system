# ADR-0043 — One ladder for every drawing

**Date:** 2026-09-24
**Extends:** ADR-0004 (`Icon`'s sizes are a typed component API, and a glyph inside a control may go
off-scale), ADR-0005 (`ModuleIcon`'s two levels), ADR-0041 (Figma's `Size` enum against code's
number), ADR-0042 (the bar runs the two marks side by side)
**Supersedes:** `LogoSize` (`'sm' | 'md'`)
**Status:** Accepted
**Breaking:** `Logo.size` takes a number, not `'sm' | 'md'`. `LogoSize` is deleted. One call site in
the catalogue; `sm`'s wordmark tightening goes with it.

## Context

ADR-0042 put the brand mark and a module mark in the same slot, alternating. Sizing that pair
required a sentence nobody could write: **"both at the same size."**

Three components had three answers to what a size *is*.

| | type | ladder |
|---|---|---|
| `Icon` | `IconSize \| (number & {})` | `16 \| 20 \| 24 \| 32` |
| `Logo` | `LogoSize` | `'sm' \| 'md'` |
| `ModuleIcon` | `number \| string` | none |

So `Logo` said `md` and `ModuleIcon` said `48`, and the two words were not comparable — not
"different values", *different kinds of thing*. ADR-0041 had already recorded the same split across
the Figma boundary (*"an enum there, a number here"*) and read it as a disagreement between the two
sides. It was also a disagreement **inside code**.

## Decisions

### The ladder is Figma's, and it already half-existed here

```ts
export type ArtworkSize = 16 | 20 | 24 | 32 | 48 | 64
```

It is `ModuleIllustration`'s `Size` enum in Figma (ADR-0041), and it is **`Icon`'s existing ladder
with two steps added at the top**. Nothing was invented: the first four rungs have been shipping
since ADR-0004, and the two new ones are the sizes Figma draws.

Numeric, not `sm | md | lg`, for two reasons. It is what Figma names, so the two sides can be
checked against each other by reading. And it is what `Icon` already does — for artwork this system
names sizes by their number, and for controls (`Button`, `Avatar`, `FormField`) by a t-shirt word.
That split is not an inconsistency; a control's size is a role in a layout, a drawing's size is a
measurement.

Not a token, deliberately. ADR-0020 left icon sizes out of the scales on the grounds that they are
**a typed component API**, and this is the same ladder.

### The number is the artwork's *height*

That is what makes a step mean the same thing in two components. `ModuleIcon` is a square, so it is
trivially the box. `Logo` is a lockup — mark plus wordmark — and the number is **the mark's height**,
with the wordmark and the gap following from it. So `Logo` at 48 and `ModuleIcon` at 48 stand the
same height, which is the property ADR-0042 needed and could not express.

### `Logo` becomes one ratio instead of two hand-written blocks

`sm` and `md` were two tables of measured pixels. Every dimension is now a multiple of the one
number the prop carries, measured off Figma's 32px lockup:

| | ratio | at 32 | previously |
|---|---|---|---|
| mark width | 0.9516 | 30.438 | 30.45 |
| wordmark | 2.0378 × 0.875 | 65.203 × 28 | 65.209 × 28 |
| gap | 0.25 | 8 | `spacing-md` (8) |

Within 0.012px at the rung the catalogue uses, and every other rung now exists.

**The `sm` tightening does not survive, and that is the interesting part.** Its *mark* was already a
uniform 75% of `md` — the ratios above reproduce it to 0.009px. Its **wordmark** was pulled a
further 4.8% tighter: 46.578 × 20 where the ratio gives 48.906 × 21. That was a real decision for a
constrained 64px bar (ADR-0028).

It goes anyway, and not because nothing uses that rung — the bar sits on **exactly** rung 24
(ADR-0042). It goes because **a ladder with one hand-tuned rung is not a ladder**: six steps derived
from one ratio and a seventh nudged by hand is two systems wearing one name, and the next reader
cannot tell which rungs they can trust. The price is visible and small — the bar's lockup is 2.33px
wider and 1px taller than it was. Figma is the side that now has a value to update, per the house
rule that code is the source of truth.

The gap scales too, and **leaves the spacing ramp doing it** — 5px at step 20. Correct rather than
sloppy: the distance between a mark and its wordmark is the lockup's own proportion, *artwork rather
than layout rhythm*, which is the distinction ADR-0010 draws to decide what may be a local custom
property. At 32 it still computes to exactly the 8px it has always been.

### `Logo` is strict; `ModuleIcon` keeps `Icon`'s escape hatch

`Logo.size` is `ArtworkSize` and nothing else. `ModuleIcon.size` is
`ArtworkSize | (number & {}) | string`, the shape ADR-0004 gave `Icon` and for a compatible reason —
the `& {}` is what stops the union collapsing to `number` and losing the ladder from autocomplete.

The asymmetry is the decision, not an oversight. A glyph inside a control is an **ornament** and may
go off-scale (ADR-0004); a module's mark has two live off-ladder callers —

- a **number**, where a surface draws at a size Figma drew and the ladder does not carry:
  `ModuleCapsule` at 44, which ADR-0031 justified (a `viewBox` makes 44 pixel-identical to Figma's
  44-grid export);
- a **CSS length**, where the value must also live in the stylesheet because a second box has to
  match it — `ProjectCard`'s `--project-card-mark` (ADR-0041) and `HorizontalNavigation`'s
  `--hnav-mark` (ADR-0042) are both read twice, and a strict enum would force a second source of
  truth.

A **brand lockup** has neither. There is no surface that needs Tolbi at 37px, and a lockup drawn off
its own ratio is a drawing error rather than a size.

## What changes

- New `components/artwork-size.ts`: `ArtworkSize` and `ARTWORK_SIZES`, both exported from the
  package root.
- `Logo.size`: `'sm' | 'md'` → `ArtworkSize`, default **32** (what `md` was). `LogoSize` deleted.
- `Logo.vue`: six rungs from one ratio family, including `variant="nav"` — the wordmark alone, which
  takes the height the lockup would have given it, so `nav` at 32 is pixel-identical to `default`'s
  wordmark at 32.
- `ModuleIcon.size`: `number | string` → `ArtworkSize | (number & {}) | string`. Default unchanged.
- `HorizontalNavigation`: `size="md"` → `:size="24"`, two rungs below the module mark beside it
  (ADR-0042) — deliberately, see the ink spread below.
- Two stories: `Logo/L'échelle` and `Logo/L'échelle partagée`, the latter putting a Tolbi mark and
  two module marks on each rung — the sentence that started this ADR, as a picture.
- `ModuleIcon`'s size control stops being a 16→128 range with an off-ladder `96` in its sizes story.

## Consequences

- **The ladder equalises the box, and it cannot equalise the ink.** Measured across all eleven
  drawings, the ink inside the 48-grid runs from **8.53** units tall (`Trace`, a flat wordmark) to
  **41.8** (`Carbone`, a tall tree) — a **4.9× spread**, mean 28.49 — where the Tolbi mark fills its
  box edge to edge. So there is no margin ratio to correct for and no rung at which a module mark and
  the brand mark weigh the same; *each drawing* would have to be redrawn on a common optical grid.
  What the ladder buys is that the discrepancy is now **stateable**: `HorizontalNavigation` runs
  `Logo` at 24 against `ModuleIcon` at **48**, two rungs up, and "two rungs up" is only checkable
  because the two props finally name the same axis. Measured against the brand mark's 24px of ink,
  the eleven modules average 14.2px at rung 24, 19.0 at 32 and **28.5 at 48** — so the rung that
  balances the pair is two above, not one, and it is the drawings' own grid.
- **`Icon` is untouched**, and its ladder is now a prefix of this one rather than a coincidence. It
  keeps its own `IconSize` because extending a glyph set to 48 and 64 is an artwork question —
  ADR-0004's stroke is uncompensated (`2 × size / 24`), so a 64px Lucide glyph would carry a 5.3px
  stroke.
- **`Logo` at 16 and 20 is newly possible and newly unproven.** The wordmark is 14px tall at step 16.
  Nothing in the catalogue asks for it; it exists because a ladder with holes is the thing this ADR
  set out to remove.

## Still open

- **Figma has the tightened `sm` lockup and code no longer does.** 46.578 × 20 against the ratio's
  48.906 × 21. Code is the source of truth, so the file is what has to move.
- **`ModuleIllustration` covers 2 modules of 11 in Figma** (ADR-0041), and the `Size` axis there is
  six variants per module — nine modules × six symbols of work that code needs none of, because a
  `viewBox` makes every rung the same drawing.
- **Nothing enforces the ladder.** `ModuleIcon`'s escape hatch is honest but unpoliced: a caller can
  pass 37 and no rule fires. The two named reasons are in the prop's doc comment and nowhere a
  linter can read.
