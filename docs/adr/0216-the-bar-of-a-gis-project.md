# ADR-0216 — The bar of a GIS project

**Status**: accepted (the owner's product brief, 17–18 Nov. 2026; each piece explored and retained on the real pages).

## Context

In a GIS project, the app's bar (`HorizontalNavigation`) gives its place to a toolbar of the project's own, laid on the
map, as Felt does. Three screens are concerned: Carbone (Inset), the eligibility zone and the ARR Dynamic baseline.

In the benchmark, 9 of 17 map products replace the global bar with the document's bar on entering a map.

The owner explored and retained the whole bar piece by piece on the real pages. The product had coded none of it, so it
belongs in the package.

## Decision

### `MapTopBar`

**The bar.** 56px, the whole width, no corners. The map passes under it and takes the whole surface, with no column
margins any more.

- **Glass**: reading glass, `bg-map-read` (90 %) under `backdrop-map-read`, the map panel's. 72 % and opaque were
  compared and declined.
- **Edge**: a `border-map-edge` rule along its foot, and nothing else.
- **Margins**: `spacing-xl` in from both sides, on the edges of the panel and of the map's tools under it.
- **Layout**: three zones, a grid of `1fr auto 1fr`, so the centre sits in the bar's middle whatever the sides hold.
- **Reduced transparency**: the bar is opaque and nothing is blurred.

**Start: the module's mark, then « Retour ».**

- The mark is the app bar's own: `ModuleIcon variant="illustration"` at 48, named (ADR-0042).
- `spacing-lg` separates them, the app bar's gap before its way home.
- « Retour » is `Button sm secondary-gray` with `arrow-left`. It is a link with `backHref` and emits `back(event)`.
- There is no trail.

**Centre: the views.** `views` + `v-model:view` draw the « Carte | Analytics » switch as `ButtonGroup shape="pill"`
(below). `#center` replaces it.

**End**, `spacing-sm` apart and in this order:

1. **The project's action** (`#action`, one `Button sm`):
   - `primary` when it moves the project on: « Lancer une baseline », « Obtenir le rapport », « Soumettre pour
     validation », « Renvoyer le rapport »;
   - `secondary-gray` with a glyph when it downloads: « Télécharger le rapport ».

   `actionCount` puts the tools column's count at its top right (ADR-0171): the auditor's open requests.
2. **⋯** (`#menu`, the presence decides): `IconButton sm ghost` `ellipsis`, opening a `Dropdown` at its end. The
   dropdown is 18rem wide, because 15 cut « Synchroniser avec Verra ». The rows are the product's.
3. **Partager** (`share`): `IconButton sm ghost` `share-2`, with no word. It emits `share`.
4. **A vertical rule**, 20px, `border-subtle`.
5. **The profile**: the app bar's own trigger, `Dropdown trigger="avatar"` (`md`, 40) and the account menu when
   `#user-menu` is filled. Otherwise the avatar alone, which emits `user` (ADR-0053). An `Avatar sm` alone measured
   smaller than the app bar's.

Every control is `sm`. The earlier mix of `xs` and `sm` flattened the buttons beside the icons.

**The map's instruments go under it.** `MapOverlay` reads a new public property, `--ds-map-overlay-top`, which defaults
to `spacing-xl`. The product sets it on the map's container to `calc(3.5rem + var(--ds-spacing-lg))`. Every top place
and both sides then start 12px under the bar (measured: panel, legend and tools column all at 68).

### `ButtonGroup shape="pill"`

`shape: 'rail' | 'pill'` makes the rail, the indicator and the segments `radius-pill`. That is the legend's and the
timeline's shape, the shape of what sits on the map just under the bar. The segments stay 32px with their glyph and
word, and the rail is 42.

The inks are not part of the shape. On map glass, **in either shape**, the group takes the glass's levels from its
surface (ADR-0173):

- the rail reads `--on-glass-sunk`, `--on-glass-sunk-border` and `--on-glass-sunk-edge`;
- the chosen pill reads `--on-glass-raised` and `--on-glass-raised-shadow`;
- the focus ring reads `--on-glass-focus`.

The bar hands down `bg-map-sunk`, a `border-map-edge` rule, `bg-map-raised` and `elevation-map-raised`, as the brief
asks.

### The open state of a menu on glass

The open ⋯ takes the **active** state (grey), as the app bar's menus do. It does not take `selected` (green), which
stays with the map tools that are switched on.

- **The active state is derived.** `IconButton` ghost and subtle now take it from `aria-expanded="true"` on their own,
  with no `active` set by hand: a trigger already says it is open.
- **The tint changes on glass.** `bg-hover` is the glass's own white, so an open menu did not show. Every map surface
  (`MapTopBar`, `MapPanel`, the navigator's column and card, `MapLegend`, `MapTimeline`, `MapStatus`, `MapHoverCard`)
  hands down **`--on-glass-hover`**: `text-strong` at 7 %, ADR-0111's veil. `IconButton` ghost and subtle and
  `DropdownTrigger chrome="ghost"` read it for hover and open.

### The module drawings, centred in their box

The box was centred and the drawing was not. Inset left empty space above its ink and none below, so beside « Retour »
the mark sat low. The same offset existed in the app bar.

**Measuring the ink.** `scripts/measure-module-art.mjs` rasterises each illustration at 20× in headless Chromium. It
takes the bounding box of every pixel above 1/32 opacity: a stroke's width is ink, which `getBBox()` leaves out. It
records how far that box's centre is from (24, 24) in `scripts/module-art-raw/centre.json`.

**Centring.** `generate-module-art.mjs` moves each illustration's `viewBox` by that offset. The drawing's size is
unchanged, and so is its geometry: in the regenerated files only the `viewBox` line differs. The offsets were up to
4.43 down and 1.5 across:

| Module | Offset (x, y) |
|---|---|
| Inset | −1.5, 4.43 |
| Redd+ | −1.18, 4.43 |
| Carbone | 0.6, 3.1 |
| Data | 0.02, 1.6 |
| Yield | 0.15, 1.57 |
| Forest | 0, 1.23 |

**Checking it.** `--check` re-measures the generated drawings and fails past ±0.5px. Every one now measures within
±0.02.

**What it covers.** The **logos** keep theirs, because their tile *is* the box. `npm run module-art:centre` re-measures
and regenerates.

The generator had been **broken** since a comment with backticks went into one of its template literals. It parsed no
more, and `npm run module-art` had not been able to run. Those backticks are escaped now.

### Entering and leaving: `BarTransition`

The owner's track T1:

- the app's bar rises and fades, accelerating;
- the surface reaches the edges;
- the project's bar comes down into its place, decelerating, after the first has gone;
- the map's instruments follow;
- leaving reverses it.

`BarTransition` (Mouvement) carries the two bars:

- **The leaver** rises and fades over `enter`, on `easing-in`.
- **The arriver** comes down and fades in over `process`, on `easing-out`, **one `enter` later**. An arrival waits for
  its place to be free (ADR-0049).
- **The surface** reaching the edges is the product's layout. It travels over `considered` on `easing-in-out` (the
  story shows it).
- **Layout**: the two bars share one cell (a grid area), or the page would be pushed down during the swap.
- **Reduced motion**: nothing waits and nothing travels.

**The durations are the scale's.** The drawing said 260 / 320 / 420ms with a 200ms wait. The scale's nearest steps are
200 / 300 / 400 and 200, and the order (the leave shorter than the arrival, ADR-0021) is kept. ADR-0015: the durations
are decisions named by intent, not free values.

« Carte » → « Analytics » is a **view** replacing another under a bar that does not move. `SwapTransition` gains
**`rise`**: the arriver comes up `spacing-md` (8px) as it fades in over `enter`, and the leaver fades over `quick`.

## Measured

At 1 440 × 760 (Storybook, Chromium):

| What | Value |
|---|---|
| Bar | 1440 × 56 |
| Bar ground | white at 90 %, `blur(20px) saturate(1.6)` |
| Bar foot | 1px white at 55 % |
| Padding | 16 |
| Mark | 48 × 48, 16 from the left |
| Gap from mark to « Retour » | 12 |
| « Retour » | 103.6 × 38 |
| Switch | 231.7 × 42, centre at 720 = the bar's centre |
| Switch rail | `radius-pill`, ink at 4 %, white 55 % edge |
| Switch pill | white at 94 % with the raised shadow |
| Switch segments | 32 high |
| End | action 38 high, ⋯ and Partager 36, rule 1 × 20, avatar 40 |
| Panel, legend and tools column | all at 68 (56 + 12) |
| ⋯ open | `aria-expanded="true"`, ground `text-strong` 7 %, menu 290 wide (18rem plus its border) |

The swap was filmed frame by frame in both directions:

| Direction | Frames |
|---|---|
| Entering | the app's bar fades and rises from 0 to 200ms; the project's bar is at opacity 0 until 200ms, then comes down and settles at 507ms |
| Leaving | the mirror, ending at 506ms |

The two bars are never both visible.

## Consequences

The product, on the three GIS screens:

- mounts `MapTopBar` in a `BarTransition`;
- passes each project's action and menu, Dynamic baseline states included;
- sets `--ds-map-overlay-top`;
- empties the panel foots whose actions moved up into the bar;
- makes « Toutes les données » the Analytics view, under `SwapTransition rise`.

`MapTopBar` is `wip`: it has three consumers and none has adopted it yet.
