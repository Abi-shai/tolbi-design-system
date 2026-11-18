# ADR-0220 — A visible rule under the GIS bar

**Status**: accepted (the owner, 18 Nov. 2026). This amends ADR-0216's rule.

## Context

In a GIS project, `MapTopBar` melted into what lies under it. Its foot rule was a rim of light: `border-map-edge`,
white at 55 %, on white glass at 90 %. It did not show, neither on the basemap's beige nor on the panel and the legend
just under the bar. Felt parts its bar from its map with a plain line.

The owner compared the four border tokens on the real page (Carbone):

| Token | On the real page |
|---|---|
| `border-subtlest` | disappears on the basemap's beige |
| `border-subtle` | disappears on the basemap's beige |
| `border-inset` (black at 8 %) | barely perceptible |
| `border-default` (#d0d5dd) | reads as a thin, clean line — the grey of the product's field outlines |

He retained **`border-default`**.

## Decision

The bar's foot rule is `border-default`, still drawn inside as an inset shadow (ADR-0217): 1px
(`border-width-default`), and the bar stays 56px.

In dark the same role takes its dark value, `gray-forest-600`.

### Unchanged

- The glass (`bg-map-read`, `backdrop-map-read`), the height, the margins and the content.
- The map's instruments stay 12px under the bar.
- The switch's rail keeps its rim of light (`--on-glass-sunk-border`), as drawn in ADR-0216.

## Measured

| What | Light | Dark |
|---|---|---|
| Bar height | 56 | 56 |
| Rule | `rgb(208, 213, 221)`, inset 1px | `rgb(70, 88, 79)`, inset 1px |

On the basemap the rule is seen as a continuous grey line along the bar's foot.

## Consequences

Nothing changes on the product side.
