# ADR-0192 — The legend shows the map's glyphs, and arrives open

**Status**: accepted (the owner, 16 Nov. 2026 — the ARR cockpit). This amends ADR-0096 (the shapes) and ADR-0138 (the
fold).

## Context

Since 0.155 (ADR-0190/0191) the cockpit's map draws its points with the package's glyphs:
- the project's point is a disc with `land-plot`;
- the control point is a rounded square with a sight.

Its legend still said the opposite: `square` for the project, `circle` for the control. The reader did not find on
the map what the key showed.

The legend also arrived folded, and the product reopened it itself on every baseline (`v-model:expanded`, a
`ref(true)` reset per baseline).

## Decision

### 1. The mark is the glyph itself

`ChartLegendShape` gains **`glyph-project`** and **`glyph-control`**. The legend draws the map's own drawing
(`mapGlyphSvg`, through an internal `MapGlyphMark`), not an approximation of it.

- **Colour.** The entry's `color` if it has one. Otherwise **the middle of the legend's ramp**, which `MapLegend`
  hands down as `--chart-legend-glyph` (in the cockpit, `--ds-chart-sequential-3`); a lone `ChartLegend` falls back to
  `--ds-chart-sequential-3`. The colour is read on the ramp; the mark says the shape.
- **Size.**
  - In a row (horizontal or vertical), the glyph is **20px**: the label's line box.
  - In `columns` it is **24px**, because under 24 the pictogram does not read. The columns' mark box grows from 16 to
    24 for **every** column of a key that holds a glyph, so the figures and the names still start on one line.
  - The small sight (< 32px) applies at both sizes.
- **The « Symboles » chip** carries the same glyphs at **14px**, side by side rather than stacked like the colour
  dots: each is a shape to read.

### 2. Symbols arrive unfolded

A `MapLegend` that carries symbols (`ticks` + `legend`) is **open on arrival**: nobody guesses what a map's symbols
mean.

- `expanded` absent means open whenever there are symbols. A category key's « +N » still arrives folded.
- The reader can fold it, and it stays folded while the legend stays mounted: another year, another chosen point.
- **Arriving on another project opens it again** if the product keys the legend by project (`:key="baseline.id"`).
  That remount is the whole mechanism: no reset prop.
- `v-model:expanded` still wins whenever it is bound.

### 3. The cockpit's key

Four entries, in this order:
1. Point du projet — `glyph-project` — 40.
2. Point de contrôle — `glyph-control` — 200.
3. Réserve — `point` — 2 189.
4. Zone exclue — `zone` — 0.

There is no « Regroupement » entry and no « Parcelle » entry: the cluster's badge and the parcel that replaces its
glyph read for themselves. `square` and `circle` remain in `ChartLegendShape` for other keys.

## Measured (`Données/Map/Legend`)

| What | Value |
|---|---|
| « Symboles, ouverts à l'arrivée », on arrival | the chip is `aria-expanded="true"` and the block is shown; one press folds it (its `play`) |
| Columns, mark box | 24 for each column (glyphs 24, point 5 and zone 10 centred in it) |
| Columns, figures | the four figures start on one line (top 128) |
| Chip glyphs | 14px, at `#47cd89` (`sequential-3`, the ramp's middle) |
| `play` tests | « Symboles, déplié », « +N, déplié », « Déplié + menu » still pass |
