# ADR-0173 — Glass finish: levels by light, ink rules, a fold that keeps its button

**Status**: accepted (etolbi, 13 Nov. 2026). The owner's review of 0.144 (ADR-0172) found three faults:
- the nested blocks could not be told apart;
- the rules looked « amateur »;
- the fold button changed shape when the panel folded.

Captures: etolbi `.context/sig-weatherlab/fi-planche-*.png`, `fi-f-*.png`.

## Decision

### 1. Three levels told by light, not by grey borders

This applies inside `MapPanel` and the navigator's tool card. The context variables are ADR-0172's `--on-glass-*`.

| Level | Where | Ground | Edge |
|---|---|---|---|
| **Hollow** | `Card sunk` (so `SectionCard`, `PanelBlock`), the `Tabs` track | the ink at 4 %: `--ds-bg-map-sunk`, `gray-900` in light, `text-strong`'s `gray-forest/100` in dark | no border; an inner line, `inset 0 0 0 1px`, of ink at 3 % |
| **Relief** | `Card outlined`, `OptionCard` | `--ds-bg-map-raised`: white at 94 % (was 70 %), `gray-forest/800` at 94 % in dark | ink at 6 % and `--ds-elevation-map-raised` (`0 1px 2px`, ink 6 %) |
| **Chosen tab** (its indicator) | `Tabs` | | `--ds-elevation-map-selected` (`0 1px 3px`, ink 10 %) |

The icon tile of an `OptionCard` (and of `MapSearch`'s rows) is ink at 5 %.

### 2. Rules in translucent ink

- `Divider`, the column's rules, `Card`'s header rule and the lines of `MapSearch` and `MapFilters` take
  `--on-glass-rule`: ink at 8 % (`text-strong`, so it inverts in dark). Off glass they keep `border-subtle`.
- `MapPanel lg`'s **head and foot** rules are ink at 6 %. The head gains its rule, inset like the foot's: the head
  stays while the body scrolls, and the line says where the scroll begins.

### 3. The glass's edge catches the light

Every map surface (both glass levels, the launcher at the map's foot) takes `--ds-elevation-map-glass`:
- an inner rim of light along the top, `inset 0 1px 0` white at 85 %;
- a wider, softer shadow: `0 12px 32px -8px` ink 18 % and `0 2px 6px` ink 5 %.

In dark the rim is white at 10 % and the shadows are on `gray-forest/950` (×5 alphas, ADR-0030).

### 4. The scroll fades by a mask

`Scrollbar` gains **`mask`**. With `shadows`, the edges fade the **content**: a `mask-image` on the viewport,
24px, only where there is more that way. Before, `__fade` was painted in the ground's colour, and on glass there
is no ground to paint, so it made an opaque white band over a translucent pane. `MapPanel lg` uses it.

### 5. The folded panel keeps its button

Folded, a `MapPanel` with its own head (`lg` or `#header`) shows **the same `IconButton`** as the open head: `sm`,
36px, round, `subtle`.
- It sits **on the same pixel**. Its place is measured on the press: centred on the tabs, it is not at the head's
  padding, and a fixed offset was 5px out. When the product folds the panel, the head's padding stands in.
- It sits in a **pill of pilot glass**, 8px around it.
- The panel's **title** is beside it (`label-lg-strong`, one line, cut), so what is folded can be read. The title
  takes the pointer too; the button keeps the name (`aria-hidden` on the words).

The previous form was a `Button secondary-gray`: square-rounded, 38px, and 17px higher than the head's button.

**Measured** (`Données/Map` « Écran SIG »): the open fold button sits at (41, 42, 36 × 36), and folded at
**(41, 42, 36 × 36)**. The pill is 135 × 54. The focus goes to the button, and a press on the title reopens the
panel. A small panel keeps its titled `Button` (ADR-0099).

## Measured (`Données/Map/Panel` « Panneau de lecture », computed)

| Element | Value |
|---|---|
| `Card sunk` | ink 0.04, `inset 0 0 0 1px` ink 0.03, border transparent, 16px |
| `Tabs` track | the same |
| Indicator | `0 1px 3px` ink 0.10 |
| Panel | the rim (white 0.85) + 0.18 / 0.05 shadows |
| Viewport mask | `--mask-start` 0 / 24px / 24px and `--mask-end` 24 / 24 / 0px at the top, the middle and the end of the scroll, and no `__fade` element |
