# ADR-0217 — The map alone, then the bar opens

**Status**: accepted (the owner, 18 Nov. 2026). This amends ADR-0216's entrance.

## Context

In 0.167 (ADR-0216), entering a GIS project made the app's bar rise out and `MapTopBar` slide down into its place.

The owner then retained a different arrival:

1. For a moment, **only the map** is on screen.
2. Then the project's bar **opens its height**, as the home page's band does (`RevealTransition`).
3. Its content arrives after the bar has started opening.

The offset is what draws the eye to the bar. The product had laid this over `BarTransition`'s classes (`app.vue`,
`.app-gis-bar`) while waiting for the package.

## Decision

### `BarTransition variant="reveal"` + `hold`

`variant` (`slide` by default, `reveal`) is read when the bar **enters**. The product binds it to where the user is
going: `reveal` into a project, `slide` back out. Leaving therefore plays as in 0.167: the project's bar rises, then the
app's comes back down.

The app's bar leaves as before: it rises and fades over `enter` (200ms). Then:

1. **Hold.** The map stays alone for **`hold`** (800ms by default).
2. **Opening.** The entering element becomes a one-row grid going `grid-template-rows: 0fr → 1fr` over `ambient`
   (600ms), on `easing-in-out`. That is `RevealTransition`'s mechanism (ADR-0032), not a slide: the glass and its rule
   grow from the top edge. The bar, its row, takes `min-height: 0` so the row can reach 0.
3. **Content.** The bar's own children (mark, « Retour », switch, actions) come up `spacing-sm` (6px) and fade in over
   `considered` (400ms) on `easing-out`, **one `enter`** (200ms) after the opening starts.
4. **Clipping.** The element clips (`overflow: hidden`) only while it opens. Afterwards the ⋯ menu overflows normally.

Two more rules:

- The element that enters must **wrap** the bar (`<div><MapTopBar/></div>`): the wrapper is the grid, the bar its row.
- **Reduced motion**: immediate, with no hold. `motion.css` cuts the durations, and every delay (the hold included) is
  cut here.

**The hold is a prop, not a token.** A delay is a duration in another slot (ADR-0032), and this one is a staging choice
of one screen. The opening and the content take their durations from the scale.

### `MapTopBar` says its height as a row, and draws its rule inside

Two things had kept the bar from opening from 0:

- **Its height.** A declared height is the grid row's floor. The 56 is now the bar's own row
  (`grid-template-rows: 3.5rem`).
- **Its rule.** A border is a floor too: it held **1px** of glass over the map for the whole hold (filmed). The rule
  along its foot is now an inset `box-shadow` of the same `border-map-edge`.

The bar still measures 1440 × 56.

### Unchanged

- **Going from one GIS project to another**: the bar is not replaced, so nothing plays.
- **The map's instruments** are already in place under the bar (`--ds-map-overlay-top`) and do not move while it opens.

## Measured

Filmed every animation frame (Storybook, Chromium, 1280px):

| Phase | Time | What is seen |
|---|---|---|
| The app's bar leaves | 0 → 200ms | opacity 1 → 0 |
| Hold | 200 → 1000ms | the bar's wrapper is **0px** high, nothing over the map |
| Opening | 1000 → 1600ms | 0 → 4.8 → 25.6 → 48.3 → 55.8 → 56px |
| Content | 1200 → 1600ms | opacity 0 → 1, 6px → 0 |
| After | from 1602ms | `overflow` back to `visible` |
| Leaving | as 0.167 | the project's bar gone at 200ms, the app's back at 506ms |

## Consequences

The product passes `:variant="inProject ? 'reveal' : 'slide'"` and removes its `.app-gis-bar.ds-bar-enter-*` rules from
`app.vue`.
