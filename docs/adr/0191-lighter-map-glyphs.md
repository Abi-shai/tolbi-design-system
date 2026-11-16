# ADR-0191 — Lighter map glyphs

**Status**: accepted (the owner, 16 Nov. 2026). This amends ADR-0190.

## Context

Seen on the renders, the glyphs were too bold: dozens of them at full ink saturated the map. The owner's instruction
was to lighten the drawing, and if that was not enough, to lower the opacity so they were less raw.

Three tracks were drawn on the TOLBI basemap, each with 14 projects and 26 controls:
- **A**: lighter strokes only.
- **B**: A, plus the ink at 70 %.
- **C**: A, plus the whole glyph at 85 %.

C lowers the opacity of the **ground**, and the ground is the datum. Its colour no longer matched the legend's, and
overlapping glyphs mixed into one another. B lowers only what was raw, the ink, and keeps the colour whole.

## Decision

**Track B.**

- **Lighter strokes.**
  - The white edge goes 2.5 → **2**.
  - The ink contour goes 1.4 → **1**.
  - The pictograms take **Lucide's own weight**, 2: `land-plot` was 2.6, the regular sight 2.8.
  - The small sight goes 3.4 → **2.6**.
- **Ink at 70 %.** The contour and an ink pictogram are drawn at 70 %. The ground stays at full colour.
- **A chosen glyph keeps its contour at full ink**, 3 thick: it is the choice, and it now stands out more from the rest.
- **White versus ink.** The choice is measured against the ink **as it is seen**, at its alpha over the ground. So the
  pictogram turns white on `success-600` as well as `success-800`: on that step, white (3.91:1) now beats the lighter
  ink. The rule is unchanged; the steps it picks follow from it.
- **Clusters and flights draw the same glyph**, so they follow.

## Measured (the pictogram on each step of the sequential ramp)

| Step | Ground | Pictogram | Contrast |
|---|---|---|---|
| 1 | `#feee95` | ink at 70 % | 6.17:1 |
| 2 | `#fac720` | ink at 70 % | 5.33:1 |
| 3 | `#47cd89` | ink at 70 % | 4.63:1 |
| 4 | `#079455` | white | 3.91:1 |
| 5 | `#085d3a` | white | 7.96:1 |

Every step is above the 3:1 a graphic needs.
