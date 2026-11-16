# ADR-0177 — Map shapes back to their 0.143 curves

**Status**: accepted (the owner, 16 Nov. 2026). This reverses ADR-0172's §2, « Round shapes ».

## Decision

The rounded shapes that 0.144 gave map surfaces return to their 0.143 curves.

**Nothing else moves.** These stay as they are:
- ADR-0172's glass: grounds at 72 % and 90 %, backdrops, the `border-map-edge` rim, `--on-glass-*` grounds and
  rules, `text-subtlest` read as subtle;
- ADR-0173's finish: levels by light, ink rules, the rim of light and shadow, the masked scroll fade, and the folded
  button on the same pixel;
- ADR-0174 and ADR-0175's audit: contrasts, `--ds-focus-ring-map`, forced colours, brand ink on pilot glass.

The focus ring is a `box-shadow`, so it follows each control's own curve, as before 0.144.

| What | Back to |
|---|---|
| `MapNavigator`'s column | `radius-surface`: a column, no longer a capsule |
| The column's buttons | `IconButton shape="square"` (`radius-control`) |
| The tool card | `radius-surface` |
| `MapPanel lg` | `radius-surface` |
| A small `MapPanel` | `radius-surface-sm` |
| `MapHoverCard` | `radius-control`, as `MapTooltip` (which 0.144 never changed) |
| `MapSearch`'s rows, `OptionCard row`, `Card` inside a panel | their own radius |
| `Button`, `CloseButton`, `InputField` (so the search field), `Tabs` (track, tab, indicator) on map glass | their own radius; nothing forces a pill |
| The folded panel's capsule | `radius-surface`; its button is `IconButton`'s default (round), at the same place and size, with the same title |
| `TolbiAiLauncher placement="map"`, `MapLegend`, `MapTimeline`, `MapStatus` | unchanged: they were round or pills before 0.144 |

**Mechanism.** The context variables `--on-glass-control-radius`, `--on-glass-card-radius` and
`--on-glass-row-radius` are removed: from the glass surfaces that set them and from the seven components that read
them (`Button`, `CloseButton`, `InputField`, `Tabs`, `Card`, `OptionCard`, `MapSearch`).

**`--ds-radius-surface-xl` (24px) is deleted.** It had no other use. The `4xl` step goes back to having no role.

## Measured (computed)

| Element | Radius |
|---|---|
| The column | 12px |
| A tool | 8px |
| The tool card | 12px |
| The search field | 8px |
| A search row | 8px |
| `MapPanel lg` | 12px (ground still white at 0.90) |
| Its `Tabs` track | 10px |
| A tab, the indicator | 6px |
| `Card` | 12px |
| `Button` | 8px |
| A small `MapPanel` | 10px |
| `MapHoverCard` | 8px |
| The folded capsule | 12px; its button round, at (41, 42) open and folded |
