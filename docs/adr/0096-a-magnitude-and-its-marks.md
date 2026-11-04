# ADR-0096 — A magnitude, and the marks that name it

**Date:** 2026-11-04
**Extends:** ADR-0016 (the categorical palette, ordered by ΔE), ADR-0006 (chart chrome, no engine),
ADR-0019 (tokens in JS for what a custom property cannot serve)
**Source:** ARR · Dynamic baseline (VM0047), Figma `3519:1427` section 15 (`3631:10776`); brief of 4 Nov.,
items 2, 5, 8, 11 — lot 1 of the delivery order the owner accepted (« je prends tes recommandations »).
**Status:** Accepted

## Decisions

**A sequential ramp, not red → yellow → green.** The map colours its points by a stock index (0.30–0.60).
The drawing ran red → yellow → green, which fails twice: red and green fall together for about one man in
twelve, and the index is a **magnitude** — more stock — not a deviation around a meaningful midpoint (0.45 is
the zero of nothing), so a diverging ramp claims a centre the data does not have. Measured with Machado's
CVD matrices: the drawn ramp kept **ΔE 18.9 end to end** in protan vision — the worst and the best nearly the
same colour. `--ds-chart-sequential-1…5` is one hue family taken from the primitives (accent 200, 400 →
success 400, 600, 800), lightness falling at every step (L* 93.6 → 34.4), **adjacent ΔE ≥ 20.0 in normal,
protan, deutan and tritan vision** — four candidates were measured, this one is the only one above 20 in all
four with lightness monotone in all four. Nothing was minted: primitives only. A diverging ramp waits for a
datum that has a real zero.

**In JS too.** A map engine and a chart engine paint on a canvas and cannot read a custom property, which is
exactly what ADR-0019's resolved export is for: `chartSequential` (the five stops, to interpolate between)
and `chartThreshold` (`--ds-chart-threshold`, gray-light 500, 4.8:1 on white) join `chartCategorical`.

**A mark per entry.** `ChartLegend` had one shape for the whole legend, a dot or a line; a map's key mixes a
square (a project point), a ringed circle (a control point), a small point (a reserve) and an area (an
excluded zone), and a comparison mixes a line and a dashed line. `shape` moves to the entry as well
(`dashed`, `square`, `circle`, `point`, `zone` join `dot` and `line`); the legend's own `shape` stays the
default. A zone is its colour as the edge over a 12 % tint of it. Found in the render: an entry was
`inline-flex`, whose baseline is its first child's — the mark — so a 5px point or a 0-high dash dropped its
label 4px off the line; each entry is a flex item now.

**A sentence under a title.** `ChartFrame` and `ChartTooltip` take a `description` — what is measured and
the threshold it is held to (« Seuil : 95 % des points du projet »), the rows a tooltip lists (« Ses 5 points
de contrôle, du plus proche au plus éloigné »).

## Not decided here

The series stay the product's (ADR-0006). The drawing's bars above the threshold in a green tint and its
project curve in the brand's green are the product's to redraw: charts never take `brand` (ADR-0016) — the
project takes `chart-categorical-1`, what passes the threshold a neutral, and the one bar under it its value.
