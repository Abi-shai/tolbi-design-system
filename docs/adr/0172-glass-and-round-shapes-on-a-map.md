# ADR-0172 — Glass and round shapes on a map

**Status**: accepted (etolbi, 13 Nov. 2026). Chosen by the owner on captures of the app, with Google Weather Lab as the
reference (etolbi `.context/sig-weatherlab/ro-*.png`, `gl-*.png`). It applies to surfaces placed on a map **only**.

## Decision

### 1. Glass, two levels

| Level | Surfaces | Ground | Backdrop |
|---|---|---|---|
| **Pilot** | `MapLegend`, `MapTimeline`, `MapNavigator`'s column, `MapStatus`, `MapHoverCard`, `TolbiAiLauncher placement="map"` | `--ds-bg-map-control` (`bg-default` at 72 %) | `--ds-backdrop-map-control` (`blur(24px) saturate(1.8)`) |
| **Reading** | `MapPanel`, the navigator's tool card | `--ds-bg-map-read` (90 %) | `--ds-backdrop-map-read` (`blur(20px) saturate(1.6)`) |

**Tokens.** The request proposed `--ds-map-surface-*`. The grounds are named in ADR-0009's vocabulary instead
(`bg-map-*`, `border-map-edge`), with light and dark values; the filters are `backdrop-*`, beside the layers.

**The edge** is `--ds-border-map-edge`: white at 55 %, a rim of light where `border-subtle` read as dirt on imagery.
The shadow is unchanged.

**Dark mode** takes the same rule on `gray-forest/900`, the dark `bg-default`. The edge drops to white at **12 %**,
because light's 55 % glares around a dark pane.

**What the glass holds follows it.** A reading surface sets private context variables (`--on-glass-*`), which the
components inside it read with their usual value as the fallback. This is ADR-0132's `--reading-secondary-font`
mechanism.

| Inside reading glass | Ground |
|---|---|
| `Card outlined`, every `OptionCard` | `--on-glass-raised`: `--ds-bg-map-raised`, `bg-default` at 70 % |
| `Card sunk` (so `SectionCard` and `PanelBlock`), the `Tabs` track | `--on-glass-sunk`: `--ds-bg-map-sunk`, `bg-neutral-subtle` at 55 % |

Without this, white blocks on glass read as a patchwork.

**Accessibility.**
- The owner measured on the darkest map area behind each surface: strong ≥ 10.6, default ≥ 6.2, subtle ≥ 4.6 (just,
  at 72 %), subtlest 3.0–4.3, which fails.
- **On every glass surface, `--ds-text-subtlest` takes `--ds-text-subtle`'s value.** The role keeps its name and
  changes its value, under a named lint suppression.
- Recomputed here on a dark forest ground (`#1f3a1c`), unblurred, `subtle` at 72 % is **4.48:1**: at the AA line,
  not over it. The blur averages the area behind it, which is why the owner's in-app reading is 4.6.

**`prefers-reduced-transparency: reduce`**: the surfaces become opaque (`bg-default`), nothing is blurred, the edge
goes back to `border-subtle`, and the held blocks go back to their opaque grounds.

### 2. Round shapes: what is pressed is a pill, what is read takes a large curve

| What | Shape |
|---|---|
| `MapNavigator`'s column | a capsule (`radius-pill`) |
| The column's buttons | round `IconButton`s; `shape="square"` from ADR-0171 is no longer used there |
| Inside map glass: `Button`, `CloseButton`, `InputField` (so `MapSearch`'s field), and `Tabs` (strip, tab, indicator) | **a pill**, through `--on-glass-control-radius`. Every glass surface sets it |
| `MapPanel lg` and the tool card | **24px**: `--ds-radius-surface-xl`, minted, the role of a reading panel on a map |
| A small `MapPanel` and `MapHoverCard` | 16px (`surface-lg`) |
| A `Card` inside a reading panel | 16px (`--on-glass-card-radius`) |
| `OptionCard row`, `MapSearch`'s rows | 12px (`--on-glass-row-radius`) |
| `MapLegend`, `MapTimeline`, `MapStatus` | already pills, unchanged |

The global radius roles are **not** redefined in the subtree: `radius-control` also draws rows that must stay at
12px, and `radius-surface` draws the `Tabs` strip that must become a pill. One context variable per need, read by
the components that have it.

## Measured (`Données/Map` « Écran SIG », computed styles)

| Element | Ground | Backdrop | Radius | Edge |
|---|---|---|---|---|
| Panel | rgba(255,255,255,0.90) | `blur(20px) saturate(1.6)` | 24px | white 0.55 |
| Legend | 0.72 | `blur(24px) saturate(1.8)` | 24px | white 0.55 |
| Column | 0.72 | `blur(24px) saturate(1.8)` | 9999px | white 0.55 |
| The panel's `Tabs` | `gray-light/50` at 0.55 | | 9999px (strip and tab) | |
| The panel's `Button` | | | 9999px | |

`--ds-text-subtlest` resolves to `#475467` (subtle) in the panel. Dark mode renders on `gray-forest/900`.
