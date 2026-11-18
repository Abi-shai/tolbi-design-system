# ADR-0222 — The basemap on a tray

**Status**: accepted (the owner's product brief, 18 Nov. 2026, track B4). Amends ADR-0221's panel; the trigger, `basemaps`
and `v-model:basemap` are unchanged.

## Context

In 0.170, `MapBasemapPicker`'s panel was a white, untitled menu of square thumbnails of about 72px. The owner compared
three tracks on the real page:

- the tray with the « Accès rapide » tiles;
- the tray with the « Derniers projets » thumbnails;
- the package's menu with a label.

He kept **B4**: the tray, wider thumbnails, and the active state the package already follows.

## Decision

### `Dropdown surface="tray"`

The panel is the home page's tray, floating. `Dropdown` gains `surface: 'menu' | 'tray'` (default `menu`), so the
picker keeps all of `Dropdown`'s behaviour — top layer, placement, outside click, Escape and the focus handed back —
rather than redrawing a popover (ADR-0001).

- **Drawing**: the panel renders a `Tray` titled with `label` (`heading-sm`, `text-strong`, the tray's head `spacing-xs
  spacing-md spacing-md`, as « Derniers projets »). The tray brings its own ground (`bg-neutral-subtle`), its
  `border-subtlest` hairline, `radius-surface-lg`, its `spacing-md` padding and its white surface.
- **The panel itself** keeps only `elevation-overlay`, since it opens over the map, and clips to the tray's curve. Its
  width follows the content.
- **A tray is a `dialog`**, whatever `role` says: it holds a heading, which a menu may not. `Dropdown`'s arrows and the
  role it provides (ADR-0221) follow that effective role.
- **What it leaves out**: a tray holds no `#header`, `#footer` or user header.

### The tiles

On the tray's white surface the basemaps sit in a row, `spacing-sm` apart.

- **The tile**: 7.5rem wide, `spacing-xs` in, `radius-surface-sm`.
- **The picture**: 4:3, `radius-control`, with an inset `border-subtle` hairline drawn over it (ADR-0201).
- **The name**: under the picture, centred, `label-md` / `text-strong`, on one line.
- **The active basemap keeps the package's mark** (ADR-0050), on the whole tile: `bg-selected`, its picture ringed in
  `border-brand-solid` at `border-width-strong`, its name in `label-md-strong` / `text-on-brand-subtle`. There is no
  check.
- **Hover and keyboard focus** take `--on-tray-hover`, like everything clickable on a tray (ADR-0199). The active tile
  takes `bg-selected-hover` instead.

### The keyboard

The choices are a `radiogroup` of `radio`s (they were `menuitemradio`s in a menu), with a roving tabindex: Tab reaches
the active basemap.

- **The arrows** move the choice and the focus together, and the panel stays open (APG: the map follows).
- **A press** (click, Enter or Space) chooses and closes.
- **Escape** closes and hands the focus back to the trigger.

## Measured

At 1 440 × 760 (Storybook, Chromium, the bar's « Actions » story):

| What | Value |
|---|---|
| Panel | 280 × 186, radius 16, `elevation-overlay` |
| Title | « Fond de carte », 24 high, 17 in from the tray's edge |
| White surface | 262 × 132, radius 12 |
| Tiles | 120 × 116, radius 10, 6 apart |
| Pictures | 112 × 84 (4:3), radius 8 |
| Active tile | `bg-selected` (230, 240, 235) |

Plays: the tray is a dialog named « Fond de carte »; → moves the choice and the focus to « Satellite » with the panel
open; a click chooses and closes.

## Consequences

Nothing changes for the product: it updates the package.
