# ADR-0129 — A legend by category

**Date:** 2026-11-07
**Amends:** ADR-0102 (`MapLegend`), ADR-0122 (its « — » when there are no bounds)
**Source:** etolbi — the page of an ARR eligible zone colours its parcels by reason (Éligibles, Forêt en 2014, Contour
invalide), not by a continuous indicator: there is no ramp and no bounds, yet `MapLegend` required `ticks`, always drew
the ramp, and without ticks said « — ».
**Status:** Accepted

## Decisions

- **`ticks` is optional.** Absent, with a `legend`, the map is coloured by category and **the legend is its key**: the
  title, then the `ChartLegend` entries (shape `zone` by default — each entry may name its own — colour, label,
  optional figure such as « 85 % »), on the line the gradient would take, with no ramp, no unit, no bounds.
- **Same surface, same width, same place**: `bg-default`, `border-subtle`, `elevation-raised`, `--ds-width-sm`
  (ADR-0116), `MapOverlay position="top"` — so an eligible zone and a baseline cockpit read the same. The key wraps
  under itself, never under the title (measured: three entries with their shares take two lines in the 480px).
- **Said once**, as the gradient is (ADR-0102): « Parcelles : Éligibles 85 %, Forêt en 2014 12 %, Contour invalide
  4 % » — the row is an image of that name, its parts hidden.
- The colours are the product's — `--ds-chart-categorical-1…` in the order of the shares, so the largest takes the most
  distinguishable hue (ADR-0016, ADR-0038).
- **`ticks: []` still means « not measured yet »** (« — », ADR-0105): an empty scale and no scale are two facts.
  `loading` in a key draws one placeholder per entry.
