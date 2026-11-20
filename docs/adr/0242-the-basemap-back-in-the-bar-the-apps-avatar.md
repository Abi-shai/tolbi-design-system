# ADR-0242 — The basemap back in the bar; the app's own avatar

**Status**: accepted (the owner, after 0.184, 20 Nov. 2026). Amends ADR-0241 on two points; the rest of it stands.

## Context

After ADR-0241 the owner came back on two points: where the basemap lives, and what the avatar offers.

## Decision

### The basemap returns to the bar

It leaves the tools column's foot and returns to `MapTopBar`, just left of the avatar. The bar's end now reads: the
page's action (`#action`), the basemap, then the avatar. A rule sits between two groups that are there.

- **Same API as before 0.184**: `basemaps`, `v-model:basemap` and `basemapLabel`.
- **`MapBasemapPicker` opens under its thumbnail, at its end.**
- **The thumbnail is the bar's square** (`radius-inner`, 28px), so it never reads as a second avatar beside the round
  one. The round thumbnail stays the tools column's, for a product that still puts it there: `MapNavigator` keeps
  `basemaps` as optional, and etolbi stops passing them.

### The avatar is the app's

The GIS bar's avatar offers exactly what the app bar's avatar offers, nothing more. In the app, its menu has a header
(who is signed in: `userName`, `userEmail`) and one row, « Se déconnecter ». There are no credits.

- `MapTopBar` takes **`userName`** and **`userEmail`**, and renders **the same component as `HorizontalNavigation`**:
  `Dropdown trigger="avatar"` (the 40px avatar, its ring when open), the same user header and the same default panel.
  It is not a second drawing (ADR-0001). ADR-0241's 32-in-36 target is gone.
- **Its name** is « Profil {userName} », as in the app (`accountLabel` overrides it).
- **The rows** stay the product's (`#account-menu`); etolbi passes « Se déconnecter » alone.
- **Credits stay possible**: `credits` still puts `DropdownCredits` under the header. Nothing shows them when the product
  does not pass them, which it no longer does.
- **Without `#account-menu`**, the avatar is shown, still, at 40.

## Measured

At 1 440 (« Sur la carte »):

| What | Value |
|---|---|
| End order | action, rule, basemap, rule, avatar |
| Basemap thumbnail | 28 × 28, radius 6 (`radius-inner`) |
| Avatar | 40 × 40 |
| Column | no basemap |

Opened from the avatar, the menu shows « Awa Diop / awa.diop@tolbi.ai » over « Se déconnecter » — the app bar's menu,
row for row.

Plays: every `MapTopBar`, `MapNavigator`, `MapBasemapPicker`, `Dropdown` and `MapLegendPanel` story passes. « Sur la
carte » checks that the avatar's menu has the signed-in header and the sign-out, and no credits.

## Consequences

In etolbi:

- `gis-bar.vue` passes the basemap (`:basemaps`, `v-model:basemap`, `basemap-label`) and `user-name` / `user-email` to
  `MapTopBar`;
- the three maps stop passing a basemap to `MapNavigator`.

Opened from the avatar, the GIS bar's menu and the app's are the same.
