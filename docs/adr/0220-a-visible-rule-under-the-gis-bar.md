# ADR-0220 — A rule and a shadow under the GIS bar

**Status**: accepted (the owner, 18 Nov. 2026 — track S3). This amends ADR-0216's rule.

## Context

In a GIS project, `MapTopBar` melted into what lies under it. Its foot rule was a rim of light: `border-map-edge`,
white at 55 %, on white glass at 90 %. It did not show, neither on the basemap's beige nor on the panel and the legend
just under the bar.

The owner compared the four border tokens on the real page (Carbone), then four shadows.

`border-default` was retained first (#d0d5dd, Felt's plain line). It was committed but never published, then replaced
by the pair below.

## Decision

The bar's foot becomes **`box-shadow: inset 0 −1px 0 border-inset, shadow-md`**.

- **The rule**: `border-inset`, black at 8 %, sits on the glass without dirtying it. It is 1px (`border-width-default`),
  drawn inside as before (ADR-0217), so the bar stays 56px.
- **The shadow**: `shadow-md` (4 / 8px −2, 2 / 4px −2), under the bar, lifts it over the map.
- **In dark**, both roles take their dark values: `border-inset` the light ink at 12 %, and `shadow-md` the ×5 alphas
  on `gray-forest/950` (ADR-0030).

### What was compared

| Option | On the real page |
|---|---|
| No shadow | the separation does not show |
| `shadow-xs` | the separation does not show enough |
| `shadow-sm` | the separation does not show enough |
| A long, soft shadow off the scale | reads as `md` does, at the cost of one more token |
| `shadow-md` | **retained** |

### Unchanged

- The glass (`bg-map-read`, `backdrop-map-read`), the height, the margins and the content.
- The map's instruments stay 12px under the bar.
- The switch's rail keeps its rim of light (`--on-glass-sunk-border`).

## Measured

| What | Light | Dark |
|---|---|---|
| Bar height | 56 | 56 |
| Rule | black 8 %, inset 1px | `gray-forest/50` (#f4f8f6) at 12 %, inset 1px |
| Shadow | `shadow-md`'s two layers (10 % and 6 %) | the same layers at 50 % and 30 % on `gray-forest/950` |

On the basemap, a grey line and a soft shadow run along the bar's foot.

## Consequences

Nothing changes on the product side.
