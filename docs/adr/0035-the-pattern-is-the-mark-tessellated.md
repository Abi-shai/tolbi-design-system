# ADR-0035 — The pattern is the mark, tessellated

**Date:** 2026-09-21
**Status:** Accepted
**Source:** Figma *00 — Core Brand Visual Identity* (`pJ20XxoowumVNZ6iwB9DKz`) — `9892:11986`
(`Pattern — Kaleidoscope`). The same file and the same page as ADR-0005's module artwork.

## Context

The brand sheet carries a pattern the product already uses and the design system did not have. The
ask was the ordinary one: make it available so pages can reuse it. The work was not ordinary,
because of what the Figma node turns out to be.

`get_design_context` returns one `<img>` pointing at one SVG. That SVG is a **single flattened
vector: 7 680 `<path>` elements, 23 MB**, every one of them `fill="white" fill-opacity="0.2"`, with
no groups, no `<use>`, no `<pattern>` and no variables bound. It is a 3538 × 1769 sheet.

Two things follow immediately. 23 MB cannot ship in a component library. And a sheet is not a
pattern: it has a size, and a pattern must not.

## Decisions

### The specimen is a specimen. Measure it, do not carry it

Treating the export as the artwork was never an option, so it was treated as **evidence** instead.
Bucketing every path on (control-point count, perimeter) — both invariant under translation and
rotation — and fitting a similarity transform inside each bucket collapses the 7 680 paths onto
their prototypes. The fit is exact: **worst-case residual 0.010px** across 480 instances of the
largest path.

What it says:

| | |
|---|---|
| Distinct drawings | **1** — one stamp, 11 paths, 175.27 × 167.86 |
| Instances | **480** — 384 positions, 96 of them stamped twice |
| Rotations | **0° and 180°. Nothing else.** 240 each |
| Scale | **1.0000** on every instance, min and max |
| Mirrors | **none** |
| Columns | 16, pitch **227** |
| Rows | 24 — 12 pairs, **32.5** apart inside a pair, **155.19** between pairs |
| Row-pair shift | **83.4** horizontally |

So the sheet is one drawing, stamped 480 times on a lattice. That is the pattern. Everything else
about the export — its size, its 23 MB, its flattening — is the sheet.

The drawing is the **Tolbi mark**: the Africa of `components/Logo/logo-icon-inner.svg`, twice, at
two rotations. Which is why a rosette in the pattern reads as three arms and none of the arms is a
whole mark — two marks overlap, and the 20% ink composites where they do.

### There is exactly one exact symmetry, and it is not enough to tile with

Scoring every candidate translation against the instance set, requiring the image of every interior
stamp to exist with the same rotation, returns **one** vector at ratio 1.000: `(29.33, 931.17)`. The
horizontal candidate `(454, 8)` scores 0.545 — half, which is not a symmetry. **The sheet is not
2D-periodic.** No crop of it tiles, at any size, ever.

So the tile is not cut out of the sheet. It is **laid out again**, from the stamp, on the measured
lattice — which is also the only way the result stays small: 11 paths in `<defs>` and 94 `<use>`,
**22 KB against 23 MB** — a factor of a thousand.

### Seamless by construction, which is what licenses the rounding

Every stamp is wrapped into the tile modulo its size, then drawn again at each of the eight
neighbouring offsets it still reaches into. A `<pattern>` clips, so a stamp cut by an edge arrives
whole on the other side. **Nothing has to line up for this to work.**

That matters more than it sounds, because two measurements had to be rounded to close a tile, and
this is what makes rounding harmless rather than a visible seam:

- **The row-pair shift, 83.4 → 227/3 = 75.67.** A tile closes only when `pairs × shift` is a whole
  number of tile widths, and at 6 pairs and 2 columns the only admissible value near 83.4 is 227/3.
  It moves the diagonal the rosettes run along by **2.2°**. The alternative that keeps 2%
  (16 pairs, shift 85.125) makes the tile **2483** tall instead of 931, for a difference nobody can
  see in a texture.
- **The 1.0095° placement rotation is dropped.** The sheet is tilted a degree — that is how the
  instance sits in its frame, not a property of the pattern, and a tile that is 1° off axis fights
  every layout it lands in. The diagonal rhythm comes from the row shift, not from the tilt, so
  dropping it changes nothing anyone will notice.

The tile is **454 × 931.14**, and 931.14 is not arbitrary: `6 × 155.19`, which is the sheet's own
exact period `(29.33, 931.17)`. The one measurement that did *not* have to be rounded is the one
the tile is built on.

### The doubled stamp is the whole of the tonal variation

96 of the 384 positions carry the stamp **twice, at the same point** — 20% ink composited onto 20%
ink, 36%. That is where the bright rosettes come from. There is no second colour, no second
opacity and no gradient anywhere in the sheet.

The doubling is regular: **every other pair doubles every other column**. Both parities are even, so
a 6-pair, 2-column tile carries it across its own seams without a special case. The generator emits
a repeated placement rather than a flag, because "draw it twice" is what the sheet does.

### The surface owns the ink, so there are three surfaces and no opacity prop

ADR-0006: a component that puts text on a coloured surface owns the foreground/background pair. A
pattern is only ever the backdrop for something, so `BrandPattern` paints the ground **and** names
the colour that reads on it — the same token does the ink and the slot's text.

| `surface` | ground | ink and text |
|---|---|---|
| `inverse` (default) | `bg-inverse` | `text-on-inverse` |
| `brand` | `bg-brand-solid` | `text-on-brand-solid` |
| `neutral` | `bg-neutral` | `text-default` |

One alpha, 0.2, the sheet's own, on all three and in both modes. Measured, the texture-to-ground
contrast lands between **1.405:1 and 1.844:1**, and between **1.911:1 and 3.319:1** where the stamp
doubles — a tight enough family that per-surface tuning would be invention, not correction. (The
intuition was wrong, incidentally: `neutral` in light *looks* the loudest of the three and measures
the softest.)

`inverse` flips with the mode, because that is what `inverse` means here (ADR-0029). A band that
must stay dark in both modes is `brand`.

There is no opacity prop and no colour prop. A slider on the ink is not a design decision, it is an
opportunity to make a bad one.

### The radius is inherited, not a prop

`border-radius: inherit`. ADR-0006 gave the radius to `Card` precisely so components stop minting
their own, and a pattern that took a radius prop would be a sixth one. Inheriting means the pattern
takes the shape of whatever it is dropped into — `Card padding="none"` with the pattern as first
child is the whole recipe — and cannot disagree with it.

### `scale` is a ratio ladder, and the sheet's size is the top of it, not the middle

`sm` 0.25, `md` 0.5, `lg` 1 — each step doubles the mark, and `lg` is the sheet 1:1. The default is
`md`, not `lg`, for ADR-0031's reason in another costume: **a width Figma draws is a ceiling, not a
size.** The sheet is 3538px wide; nothing in the product is. At `lg` on a 1200px page the marks are
poster-sized. At `md` they read as a page backdrop, which is the job.

The ratios live in the component and the only length lives in the generated tile, so the mark's size
has one source.

### What the raw file is

ADR-0005 commits raw Figma exports because the MCP asset URLs are short-lived. The same reason
applies and the same answer cannot: the export is 23 MB. So
`scripts/brand-pattern-raw/kaleidoscope-stamp.svg` is the **stamp** — 11 paths, 19 KB, translated so
its bounding box starts at `0,0` and rounded to 0.01, otherwise untouched Figma geometry. The
README next to it carries every number above, so the extraction can be redone rather than
rediscovered.

The **first path is the outline**, and the generator recomputes the rotation anchor as its centroid
rather than storing it — a re-export cannot silently shift the pattern, though reordering the paths
by hand would, which the README says.

## Consequences

- `BrandPattern` ships under `Identité & média`, `stable`. Not `primitive`: it composes a slot.
- `npm run brand-pattern` joins `icons` and `module-art` as a generator. `components/BrandPattern/tile.ts`
  is build output.
- The catalogue's brand tier is now three components — `Logo`, `ModuleIcon`, `BrandPattern` — all
  three generated from the same Figma file, all three off the same page.

## Still open

- **The specimen's jitter is not reproduced.** Row pairs in the sheet sit at 153.7–158.4 rather than
  a constant 155.19, and column pitches vary ±2. It is hand-composition, and the tile is regular
  where the sheet is not. Nobody has asked for the jitter back; if anyone does, it is a per-stamp
  offset table, not a change of approach.
- **One glyph is carried, not two.** The stamp is the mark twice at two rotations *as one 11-path
  drawing*, which is how Figma flattened it. If the brand later needs the mark at a third rotation,
  that is a second stamp in the raw folder, not a transform — Figma bakes rotations into the path
  data and re-deriving them from ours would be a second source of truth.
- **A `<pattern>` with 94 `<use>` rasterises once per scale.** It measured fine; if a page ever
  carries many instances at many scales, the answer is to share one `<pattern>` per scale across
  instances, not to shrink the tile.
