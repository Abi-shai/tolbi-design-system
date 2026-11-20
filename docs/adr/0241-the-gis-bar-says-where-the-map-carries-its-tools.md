# ADR-0241 — The GIS bar says where one is; the map carries its tools

**Status**: accepted (the product's brief of 20 Nov. 2026, mock-up validated by injection into the real pages: Inset
project, ARR zone, Dynamic baseline). Amends ADR-0221 (the mark as a menu, the end's three groups) and ADR-0171 (the
tools column).

## Context

The owner found a GIS project's bar loaded with actions that do not belong there. The principle: the bar says where one
is and lets one leave; the map carries the map's tools.

Already done in etolbi:

- the way out says « Quitter » (« Exit ») on every GIS screen (`backLabel`);
- « Partager » is no longer asked for.

## Decision

### `MapTopBar`

- **The mark alone.** Without `#module-menu` the module's drawing (48, `variant="illustration"`) is named and not
  interactive: no chevron, no hover zone, no `Dropdown`. It only says which module one is in. `#module-menu` still makes
  it ADR-0221's menu for a product that keeps one; etolbi no longer passes it.
- **The end is the page's action, then the person.**
  - Search and the basemap leave the bar: `search`, `searchLabel`, `searchOpen`, `@search`, `basemaps`,
    `v-model:basemap` and `basemapLabel` are **removed** from it and go to `MapNavigator`.
  - **`share` is off by default.** The product passes nothing, and absent must mean absent.
  - `#downloads` stays, for a product that asks.
- **The avatar**, last (`userInitials` / `userSrc`, `accountLabel` « Compte »).
  - It is a 32px `Avatar` in a 36px round target: the bar's icon buttons' size, the 2px around it a remainder
    (ADR-0044).
  - It takes the glass's veil under the pointer and while open, and the map's ring on focus.
  - With **`#account-menu`** it opens a `Dropdown` at its end, 18rem. The module's credits are at its head
    (`DropdownCredits`, `credits`, `creditsHref`) — what the mark's menu carried — then the product's rows: Accueil;
    Paramètres, Notifications; Se déconnecter (`danger`). « Retour aux projets du module » is gone: « Quitter » does it.
  - Without the slot the avatar is shown, still.
- **Rules** sit between the groups that are there: action | file | person.
- **Unchanged**: the modes switch, its size, the bar's glass, its height (`--ds-map-top-bar-height`), « Quitter » and
  the project's name.

### `MapNavigator`

- **« Rechercher » at the column's head**, in a group of its own above the tools (Informations, Mini-carte):
  `search`, `searchLabel`, `searchOpen`, `@search`.
  - With a `#tool-search` slot it opens its card to the column's left, as every tool does. That settles etolbi's
    `.gis-search` TODO.
  - Without the slot it emits `search` and wears `searchOpen`.
  - A `search` tool passed in `tools` is dropped while the prop is on, so there are never two.
- **The basemap at the column's foot**, after « Recentrer » and its rule (`basemaps`, `v-model:basemap`,
  `basemapLabel`; fewer than two: nothing).
  - It shows the chosen basemap's picture, **round**: 36px, the picture in a circle inside a 3px white margin and the
    hairline. It is among round buttons, as the map's chosen state is.
  - Tried: the current thumbnail at 4px (a square among circles, the « disunion » the owner pointed at), and 12 / 9px
    (better, still apart).
  - It opens `MapBasemapPicker`'s tray to the column's left.

### What it took

- **`MapBasemapPicker`** gains `shape: 'square' | 'round'`, `side` and `tooltipPlacement`.
- **`Dropdown`'s `side`** gains `left` / `right`, which `useAnchoredSurface` already placed. A beside panel takes
  `spacing-md` as its inline margin and centres on its trigger.

## Measured

At 1 440 and 1 000px:

| What | Value |
|---|---|
| Mark | 48 × 48, no menu |
| Avatar | 36 × 36 at the bar's end |
| End order | action, rule, (downloads), rule, avatar |
| Column | 52 wide; first tool `search` at the head |
| Basemap trigger | 36 × 36, radius pill; picture 28 × 28 inside |
| Basemap tray | opens to the left, 8px from the trigger, centred on it |

Plays: every `MapTopBar`, `MapNavigator`, `MapBasemapPicker`, `Dropdown` and `MapLegendPanel` story passes.
« Sur la carte » now checks that the mark is not a menu, that the avatar opens on the credits, and that search and the
basemap are in the column.

## Consequences

In etolbi:

- `gis-bar.vue` no longer passes search or basemaps to `MapTopBar`, nor `#module-menu`. It passes `userInitials` (or
  `userSrc`) and `#account-menu`, keeping `credits` / `creditsHref`.
- The GIS pages pass `search` / `searchOpen` / `@search` (or `#tool-search`) and `basemaps` / `v-model:basemap` to
  `MapNavigator`.
- **Breaking** for whoever still passes search or basemaps to `MapTopBar` — they are ignored as unknown attributes. And
  `share` is now off unless asked.
