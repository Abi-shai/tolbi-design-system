# Raw brand-pattern artwork

`kaleidoscope-stamp.svg` — the repeating unit of Figma's `Pattern — Kaleidoscope`
(file `00 — Core Brand Visual Identity`, key `pJ20XxoowumVNZ6iwB9DKz`, node `9892:11986`).

**Committed on purpose** — the Figma MCP asset URLs are short-lived, and the node itself cannot be
re-exported usefully: it is a single flattened vector of **7 680 paths, 23 MB**. Nothing in a design
system can ship that, and nothing can tile it.

Do not hand-edit this file. It is the input to `npm run brand-pattern`, which lays it out on the
lattice and writes `components/BrandPattern/tile.ts`.

## What the specimen actually is

The 23 MB export is not a pattern definition, it is a 3538×1769 *specimen* — one composed sheet.
Measured against it (`docs/adr/0035-the-pattern-is-the-mark-tessellated.md` records the method):

| | |
|---|---|
| Distinct drawings | **1** — one stamp, 11 paths, 175.27 × 167.86 |
| Stamps | **480** — 384 positions, 96 of them doubled |
| Rotations | **0° and 180°, nothing else** — 240 each, unscaled, unmirrored |
| Fill | `white` at `fill-opacity="0.2"`, every path |
| Columns | 16, pitch **227** |
| Rows | 24 — 12 pairs; **32.5** apart inside a pair, **155.19** between pairs |
| Row-pair shift | **83.4** horizontally per pair |
| Exact period | one, `(29.33, 931.17)` — **6 pairs**. There is no second one: the sheet is not 2D-periodic |
| Placement rotation | 1.0095°, deliberately not carried — it is how the instance sits in its frame |

The stamp is the Tolbi mark — the Africa drawing of `components/Logo/logo-icon-inner.svg` — twice,
at two rotations. That is why a rosette reads as three arms: two stamps overlap.

## How the stamp was extracted

1. Every path's control points give a centroid and a rotation-invariant perimeter. Bucketing on
   (point count, perimeter) and fitting a similarity transform (Procrustes) inside each bucket
   collapses 7 680 paths onto their prototypes — and shows every instance is a pure translation plus
   0° or 180°, scale exactly 1.000, no reflections.
2. The largest prototype has **480** instances. Assigning every other path to its nearest instance
   and clustering the resulting offsets gives **11 slots of ≈480** — the stamp.
3. One interior instance supplies the 11 paths, translated so the stamp's bounding box starts at
   `0,0` and rounded to 0.01. Nothing else is touched.

The **first path is the outline**, and its centroid is the anchor the lattice was measured against —
`(123.53, 97.48)`. The generator recomputes it rather than hard-coding it, so re-exporting the stamp
cannot silently shift the pattern. Reordering the paths in this file *would*: keep the outline first.

## Re-pulling from Figma

```
get_design_context { fileKey: "pJ20XxoowumVNZ6iwB9DKz", nodeId: "9892-11986" }
```

returns an `…/asset/*.svg` URL for the flattened sheet. The extraction above then has to be redone —
`.context/` is where that work happened; it is not part of the build.
