# ADR-0171 — The map's tools column

**Status**: accepted (etolbi, 13 Nov. 2026). The direction was validated by the owner after a benchmark (Google
Weather Lab, Felt, OneSoil, Google Maps, Global Nature Watch, Copernicus Browser) and mock-ups on Carbone and the ARR
cockpit (etolbi `.context/sig-weatherlab/` — `option-b`, `proposition-v4`, `mini-carte`, `v3-2-chercher`).

## Principles

1. Nothing is added on a map outside a group of tools.
2. A control never moves when a panel appears (ADR-0170, made structural).
3. One thing at a time on the right: a sheet, the search, the filters or the mini-map.

## Decision

### 1. `MapNavigator` becomes a vertical column at the map's end edge, under its top

**Order, from the top:**
- The product's **tools**. `tools: MapTool[]` gives each one a glyph, a name, an optional count (`badge`), and
  `pressed` and `disabled` states. Etolbi plans Rechercher (`search`), Filtres (`filter`, its count the active
  filters) and Couches (`layers`).
- « Mini-carte » (`map`), present only when `#default` holds a mini-map.
- A rule, then + / **the gauge, upright** / −.
- A rule, then « Recentrer ».

**Geometry**: 44px wide. The buttons are `IconButton xs subtle`, 32px. The column is on the map's floating surface
(`bg-default`, `border-subtle`, `elevation-raised`, `radius-surface`).

**`IconButton` gains `shape: 'round' | 'square'`.** `square` takes `radius-control`: in a column, discs read as
separate badges.

**`IconButton` gains `selected`.** A tool that is on takes ADR-0050's mark, `bg-selected` + `text-on-brand-subtle`.
That is the brand-50 / brand-700 the request names, through the semantic layer so dark mode follows. `Button` has
the same prop. The meaning (`aria-expanded`, `aria-pressed`) stays the caller's.

**The count** rides the button's corner: a 16px pill in the brand's fill, the type at the reading floor, with a
2px `bg-default` ring. Two reasons it is not a `Badge`:
- A `Badge sm` is 20px and covered the 16px glyph whole.
- It counts what a control holds, which is ADR-0149's ground for the brand.

**The gauge stands up** (`MapZoomGauge vertical`, 64px of trip):
- The native range is turned a quarter, so the pointer, the arrows and the reader keep the native control.
- The drawn thumb rises as the zoom grows.
- ADR-0121's following, gliding and pinning are unchanged.

**The mini-map is no longer in the navigator**: it is the « Mini-carte » tool. `v-model:collapsed`,
`expandLabel` and `collapseLabel` are deprecated and ignored; `minimapLabel` names the tool.

### 2. What a tool opens: a card to the column's left

**Placement and state**
- The card's top is on its button's top, measured; it sits `spacing-md` from the column.
- It uses the same floating surface and grows from its top-right corner (`SurfaceTransition`).
- `v-model:tool` holds the open tool, and the button stays `selected` and `aria-expanded` while its card is open.

**Opening and focus**
- A tool opens a card when it has a `#tool-<value>` slot, or when it is the mini-map.
- Opened by a press, the card takes the focus: `[data-autofocus]` first, then the first field or control. Opened by
  the product, it does not (ADR-0062).
- A tool with nothing to show is a **toggle**: it emits `press`, and the product says whether it is on (`pressed`,
  `aria-pressed`).

**Closing**
- Escape closes the card and hands the focus back to the button.
- So does pressing the button again.
- A press outside closes it without moving the focus.
- **A sheet arriving** in the same overlay closes it. A `MutationObserver` looks for a `.ds-map-panel` inside what is
  added, because `MapPanel` arrives in a host with no box of its own. If the focus was in the card, it goes back to
  the tool; without that, choosing a search result with Enter dropped it on the body.

**`MapSearch`** (`Données/Map/Search`)
- A search field, then the results **grouped by kind**. The product gives the groups and their order, because it
  knows its objects and does the geocoding.
- A row is a glyph (`#media`, or `icon` on a tile), a name, a line of facts and an optional `Badge`.
- The keyboard is a combobox's (APG): ↓ ↑ move across every group, Enter chooses, and the focus stays in the field.
- Choosing emits `select`; the product selects the object (sheet, pin).

**`MapFilters` + `MapFilterSection` + `MapFilterOption`** (`Données/Map/Filters`)
- Stacked sections, each a title over the product's controls.
- `MapFilterOption` is a real checkbox whose row is its label. It shows the value's colour on the map (a ring, as
  the outline is drawn) and its count.
- Tags to choose and a range `Slider` come from the catalogue.
- The foot holds « Effacer » and what is left (« 4 parcelles », a `status`).
- **Filters apply as they change.**

**The mini-map** keeps its ring, points and view frame, in the same card, at 200 × 128.

### 3. The sheet sits to the column's left; nothing moves

When `MapOverlay position="end"` holds the column, it lays its side out as a grid:
- the column against the edge, under the top;
- a sheet (`MapPanel lg`) to its left, full height;
- a `TolbiAiLauncher` at the column's foot, on its axis. **`placement="map"`** is new: the launcher's default floats
  over the page (ADR-0070).

None of them moves when the sheet opens or closes.

The sheet's 25rem track is **always there**, so the side publishes the same width, sheet or not.

### 4. The legend and the timeline keep one width

This is ADR-0168's cap fed by that constant width: `100% − 2 × (side + 16)`.

On a map 1 392px wide (the product at 1 440), that is **26.5rem (424px)**, ending before the sheet, centred and the
same open or closed. The ramp narrows, and the timeline scrolls its years, three in view.

## Left to the product

- What the search returns (objects and geocoding).
- The filters of each module (Carbone: alert, lot, area; ARR zone: status, area; Yield: crop, stage, zone, producer,
  area).
- The « N sur M » count in the list, and the filters' state in the address.

## Measured (1 440 × 680, `Données/Map/Navigator`)

| What | Result |
|---|---|
| Column | x 1 372–1 416, 44px wide, top 24 |
| Search card | top 29 = its button's top; 322px wide, 8px to the column's left |
| Sheet | 964–1 364, 24 → 632 (full height), 8px from the column |
| Launcher | centred on the column's axis (1 394) |
| Opening the sheet | none of the column, the sheet or the launcher moves |
| Keyboard | Search opens with the focus in the field; ↓ lights a row; Escape closes and the focus returns to « Rechercher » |
| Pointer | a press outside closes; Enter on a result opens the sheet, closes the card and returns the focus to the tool |
| Toggle | « Couches » is `aria-pressed="true"` after a press |

In `Données/Map` « Sélection d’un objet » (map 1 424px), the legend and the timeline are 492–948 open and closed,
and the sheet starts at 964.
