# ADR-0031 — The capsule that was drawn in the dark

**Date:** 2026-09-16
**Status:** Accepted
**Amends:** ADR-0029 (two token values), ADR-0030 (the `-solid` border rule)
**Source:** Figma *Sprint 18* — `1308:5261` (`Bandeau/Capsule`), `1283:3568` (the progress section),
`1326:4203`/`1326:4215`/`1325:4212`/`1327:4203`/`1326:4222` (`ModuleIllustration`)

## Context

ADR-0028 audited the nav bar and found the gap was in the **code export**: Figma already had values
the code had deleted. This time the direction reversed. The capsule was drawn **against** ADR-0029's
dark tokens — it is the first surface in the catalogue designed for the second mode rather than
ported into it — so Figma's resolved hexes are an independent check on a derivation that was, at the
time, an explicitly flagged assumption.

## Decisions

### The derivation holds, and one hex was one unit out

ADR-0029 shipped `{tone}/dark-subtle` and `{tone}/dark-border` **solved from contrast targets**
because the frame named them without hexes, and flagged them as the one assumption in the work.
Figma binds two of them here:

| token | derived | Figma | |
|---|---|---|---|
| `bg-warning-subtle` → `warning/dark-subtle` | `#2C2A1A` | `#2c2a1a` | **exact** |
| `border-on-warning-subtle` → `warning/dark-border` | `#4D3B17` | `#4e3b17` | one unit of red |

Figma's value is adopted — it measures **1.55:1** on `bg-default`, which is the target the solve was
aiming at, landed exactly. The remaining eight derived hexes stay; the method that produced an exact
match on one and a one-unit miss on the other is not worth second-guessing on the strength of that.

`bg-neutral-subtle` is the better result. The frame never specified it: ADR-0029 derived
`gray-forest/800` from the rule that *a layer rises in dark*. Figma binds `#26312b`, which is
`gray-forest/800`. The rule was right, not just the arithmetic.

### A `-solid` border does two jobs, and usage decides which wins

Figma binds `border/success-solid` to `#17b26a` — `success/500`, where ADR-0029 had `success/700`.
Measuring says Figma is right, and says why:

| | on `gray-forest/900` | paired with its fill? | standalone? |
|---|---|---|---|
| `border-brand-solid` (500) | 2.44:1 | Button, FileDropzone, ProgressSteps, ResizableSplit | no |
| `border-error-solid` (600) | **3.44:1** | Button `--danger` | Badge outline |
| `border-warning-solid` (700 → **500**) | 3.07 → **7.09:1** | no | Badge outline |
| `border-success-solid` (700 → **500**) | **2.92:1** → **6.03:1** | no | Badge outline |

The token is doing two different jobs. Where a component paints it *next to its own fill* it has to
match that fill; where `Badge`'s `pill-outline` uses it *alone on the ground* it has to clear 3:1.
Those wanted the same step in light. In dark they diverge, and `success/700` at **2.92:1** is the
one that actually fails.

So usage decides. `error` is the tone where one step satisfies both — it is left alone. `brand` is
never standalone — left alone. `warning` and `success` are never paired — they brighten.

### "A wider range of sizes" needed no artwork at all

The five `ModuleIllustration` frames are 64×64 tiles holding a **44×44** drawing, where the shipped
artwork is drawn on a **48** grid. That reads like a re-export, and it is not: the path data is the
same drawing scaled uniformly — `34.9844 × 44/48 = 32.07`, against Figma's `32.0833`.

Our art is an SVG with a `viewBox`, so rendering the 48-grid drawing at `size="44"` is
pixel-identical to Figma's 44-grid export. `ModuleIcon` already takes any size. **Nothing to add** —
the measurement is the whole decision, and the alternative was importing eleven redundant assets.

What the frames *do* settle is the pairing: a 64px tile of `bg-neutral-subtle` at `radius-surface`,
holding the **illustration** at 44. ADR-0005 said the illustration is the primitive, to be reached
for "when the module is already framed by its own surface". This is that surface.

### The banner is two components: a band, and the capsules in it

`1308:5261` holds seven capsules across 6138px, and the first reading of it — *a spec sheet, seven
unrelated modules laid out for review* — was wrong. Sampling the render settles it: the frame is
**filled**, at `#26312B`, with uniform 6px padding and 6px gaps, and every capsule inside it is
`#18201C`. A spec sheet has no fill and no padding rhythm. It is a band.

Those two hexes are `gray-forest/800` and `gray-forest/900` — `bg-neutral-subtle` and `bg-default`.
**That pair is what gives a capsule an edge**, and it is the whole reason the omission was visible:
a capsule on its own is `bg-default` on `bg-default` and has no edge at all. The band is not
decoration around the capsules; it is the other half of the only contrast they have.

The band is square-cornered — sampled at every corner, the fill runs to the pixel — so it is a
full-bleed strip across the page, not a card. The capsules keep the 8px `radius-control`.

`ModuleBanner` is therefore a separate component from `ModuleCapsule`, holding them in a slot.

The capsule itself has a full form and reduced ones. The full form is the **first** of the seven —
`Bandeau/Capsule — TOLBI Yield`, the only one that is an *instance* of a published Figma component
(`1219:3489`); `A`–`E` are the same component with sections turned off. Reading the row as six equal
variants misses that, and the first pass did that too.

The full form adds four things the reduced ones do not show:

| | |
|---|---|
| a **third identity line** | `Culture` + a neutral outline badge — an attribute of the thing, not its status. `label-lg`, where the module name above is `body-md` |
| a **delta** under the figure | glyph + figure + "comparé au 08 septembre 2025", the comparison ellipsizing rather than widening the column |
| the **Phénologie** column | stade + badge + `ProgressBar` + a delta of its own |
| a **third measure**, and a tone on it | `18,2 %` is `text-warning` in Figma — the layer is named *"valeur — sous le seuil"*. A measure past its threshold says so in its own colour, not only in its value |

Figma's own component description names the two axes, and both are collapses worth keeping:
**Campagne** drives the status badge *and* the wording of the figure's badge together — warning tint
with "Rendement prévu" while running, success with "Rendement estimé" once closed — because "the two
never diverge, so there is no separate axis for it". **Comparaison** is *hausse · baisse · aucune*,
the last showing only a date, which is why `CapsuleDelta` has an optional glyph and figure and a
required comparison.

### A delta takes the on-tint partner, on `bg-default`

Figma binds the delta figure to `text-on-success-subtle` rather than `text-success`, which is
off-label — the `on-` partners name a tint ground. It is kept, because it is **exactly right in the
mode this was drawn in and better in the other**: in dark the two resolve to the same step, so it is
pixel-exact; in light `text-success` is 3.91:1 and `text-warning` 3.49:1 — the pre-existing AA
failure ADR-0030 left open — and the partner is the legible one. The same reasoning carries the
threshold tone on a measure.

The glyph beside a measure is `text-default`, not `text-subtlest`: Figma binds it to `gray-forest/200`.
A glyph labelling a strong figure is not the faintest thing on the row.

### The capsule hugs, and the unit has two placements

Every capsule in Figma is hug-width — the columns are either fixed (identity 260, progress 300) or
content-sized, so a stretched box only trails empty ground. `width: fit-content`; a full-bleed
banner is the caller's `width: 100%`.

`unitPlacement` is a prop because Figma carries both and the rule behind the choice is legible: two
of six set the unit **below** the figure, and both are the ones whose unit is wider than the figure
it belongs to.

### Nothing was minted

Both badges in the design resolve onto `Badge`'s existing tone blocks with no change —
`tone="warning" variant="pill-color"` and `tone="success" variant="pill-outline"` already carry
exactly the five tokens Figma binds. The progress bar's fill is already `text-brand`, the same token
Figma binds. All ten glyphs were already in the 189-icon manifest. Radius 8/12 are `radius-control`
and `radius-surface`.

Measured against the reference when first built, the full banner landed at **1258.7 × 90** where
Figma is **1259 × 90**, with every column exact: 64 / 260 / 1 / 300 / 1 / 300 / 1 / 224. The column
widths have since been loosened on purpose — see below — so the capsule is now 1198px. The height,
the padding, the gaps and every colour are unchanged.

### One value in the band is a decision, not a measurement

Whether the band scrolls. The frame is 6138px of capsules on a page no screen is that wide, and a
static frame cannot say what happens at the edge. `scroll` defaults to true; everything else in the
component was measured.

### A drawn width is a ceiling, not a size

Figma fixes the identity column at 260px and the full hero at 300px. Reproduced literally, that left
**343px of empty ground** across the seven capsules of the band — measured, by letting each column
size to `max-content` and taking the difference:

| capsule | identity is | needs | empty |
|---|---|---|---|
| Scan | 260 | 167 | **93** |
| ID · INA | 260 | 195 | **65** each |
| Yield | 260 | 221 | 39 |
| Carbone | 260 | 228 | 32 |
| Data | 260 | **282** | −22 — it truncates |

A capsule whose title is "Périmètre de Podor" was as wide as one titled "Recensement ménages —
Kaolack", and the rule after it sat a centimetre from the text it was meant to divide.

So `width` becomes `max-width`: the column hugs its content and stops where the design drew the
line. Both halves matter. Hugging alone would let "Recensement ménages — Kaolack" widen the capsule
past the frame; the cap alone is what shipped. Data is the proof the ceiling still holds — it wants
282, gets 260, and truncates exactly as the Figma render does.

343px → **15px**, and the 15 is the one column that deliberately does *not* hug.

**The progress column keeps its fixed 300.** A bar is a scale, and its length is part of reading it:
let it follow its label and two capsules side by side would measure the same percentage against
different rulers.

The trade-off is real and worth naming: capsules **stacked vertically** no longer align their
separators, because each is now as wide as its own content. In the band they sit in a row, where
there is nothing to align to and 343px of ground to win back. If a stacked layout ever needs the
columns to line up, that is a second mode, not a default.

### `ina` and `conformite` are out on purpose

Both appear as `ModuleIllustration` frames in the banner, and neither is in `ModuleName`. That is a
**decision, not a missing export** — the same one ADR-0005 already recorded for `Eudr`, which has a
`logo/eudr.svg` on disk and is deliberately absent from the module list. A module enters
`ModuleName` when its artwork is exported to `scripts/module-art-raw/` in **both** variants
(`moduleNames` is built from the ones that have a *logo*); these two have not been, and are not
waiting to be.

The consequence for the catalogue is one story: the INA capsule renders `Survey`'s drawing under the
label `INA`, which is what `moduleLabel` is for — a capsule can name a thing the system carries no
artwork for.

## Still open

- **The figures in five of the six capsules** are Figma layer names (`valeur`, `unité`), not content.
  The `Data` capsule is reproduced content for content; the rest carry representative figures with
  the real modules, titles and glyphs.
