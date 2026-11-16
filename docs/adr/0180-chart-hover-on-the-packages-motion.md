# ADR-0180 — A chart's hover, on the package's motion

**Status**: accepted (the owner, 16 Nov. 2026).

## Context

`ChartFrame` had no hover. The product wrote one by hand in three charts: bars by year, a line against a reference,
and two lines (project / controls). Its passage from one year to the next jumped: the bubble leapt, and the guide and
the dots teleported, on no motion token. The product removes those hovers once the package ships this one.

- Captures: etolbi `.context/bench-org/gv-planche.png`, `gs-cockpit-survol*.png`.
- Benchmark: `.context/bench-charts/` (Polaris, Carbon, Pachama, OneSoil).

## Decision

**`ChartFrame` takes a hover**, drawn by an internal layer (`ChartHoverLayer`) over the plot. The plot stays the
product's engine (ADR-0006).

**API**
- `columns`: how many columns the chart has. Given, the plot takes a hover.
- `xScale`: where the columns sit. `band` is a bar's centre; `point` is a line's points, first and last on the edges.
- `v-model:hover`: the hovered column, `null` off the chart.
- `markers` (`ChartMarker`: a value per column, a colour, and `dashed` for a reference, drawn as a ring) on a
  `yDomain`.
- `guide`: the vertical hairline. It defaults to on for `point` or when there are markers.
- `#tooltip="{ index }"`: where the product puts its `ChartTooltip`.
- The default slot receives `{ hover }`.

**Pointer and keyboard**
- **One target per column over the whole height**: a short bar is as easy to point at as a tall one.
- The keyboard reaches the chart (`tabindex`). Reached that way, it shows its **latest** column; ← → move, Home and
  End jump, Escape clears.
- The bubble is the chart's description while it shows, and its words are announced once through a `status` region.

**Placement.** The frame places the bubble beside the column, 12px away (`spacing-lg`), inside the plot:
- after the column while it fits, before it otherwise;
- **never past the plot's edges**;
- its top `spacing-md` under the plot's top;
- it grows from the side facing the column.

**Motion, on the tokens**

| What | Motion |
|---|---|
| The bubble arrives | fade + `scale-enter` (`SurfaceTransition`), `enter` / `easing-out` |
| The bubble leaves | over `exit`, **in place**: the last column stays its place, so a leaving bubble does not slide back to the start |
| From one column to the next | the bubble, the guide and the dots **glide** (`transform`, `moderate`, `easing-default`) |
| The bubble's content | changes through `SwapTransition`, never by a cut |
| A change of side | the **same glide**, never a jump from edge to edge |
| The first frame of a hover | nothing glides in from where the last hover ended; the glide starts after a double rAF |
| The other bars | fade to **0.35** over `quick`. The product tags its marks `data-chart-column="<index>"`, and the layer marks the others `data-chart-dimmed` (Polaris' signal) |
| Reduced motion | nothing glides; the bubble changes in place |

**Colour.** The package imposes nothing: the product passes its data's colour (`--ds-chart-sequential-4` for
Tolbi's green, `--ds-chart-threshold` for a reference). The guide is `border-default`.

## Measured (`Données/ChartFrame` « Survol — … »)

| What | Value |
|---|---|
| Plot | 346 × 180 |
| Pointer 4px above the plot's foot, first column | `2021`; the five other bars at **0.35** |
| Column 3 | the bubble after it (156 → 342) |
| Column 5 | not enough room after it, so the bubble crosses before it **by gliding**: 274 → 263 → 227 → 191 → 184 → 180 over about 100ms, no jump |
| Off the chart | nothing dimmed; the leaving bubble stays at 96–101px while it fades |
| Tab | the latest year (2026) |
| ← | 2025, announced « 2025 38 tCO2e/ha Depuis 2021 +14,5 % » |
| Escape | clears |
| Line against a reference | the guide on the column; a full dot on the series, a ring on the reference |
