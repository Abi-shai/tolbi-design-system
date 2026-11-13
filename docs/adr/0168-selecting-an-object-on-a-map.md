# ADR-0168 — Selecting an object on a map

**Status**: accepted (etolbi, 13 Nov. 2026). A scenario validated by the owner and wired in the product on Carbone
(dMRV), modelled on Google Weather Lab: hover, click, selection, close.

## Context

The scenario needed four pieces the package did not have:

1. a summary card on hover;
2. a list row lit from outside;
3. the middle overlays centred in the room the sides leave;
4. a `MapPanel` that arrives and leaves when it is mounted and unmounted.

## Decision

**1. `MapHoverCard`**, a component of its own (`Données/Map/HoverCard`), not a mode of `MapTooltip`.

- `MapTooltip` is opened by a click and stays: a non-modal dialog with a close, taking the focus. This card follows
  the pointer and holds nothing — no close, no focus, `pointer-events: none` — so it never comes between the pointer
  and the map.
- It shows the code and a status `Badge`, one line of facts (`body-sm`, `text-subtle`), and one figure
  (`heading-sm` and its unit).
- It arrives after `duration-quick`, so a pointer crossing the map does not light every parcel it passes, then fades
  in. Under reduced motion it appears at once. On a touch screen (`hover: none`) it shows nothing.
- It is `aria-hidden`. The click opens the object's sheet (`MapPanel lg closable`), which is where a keyboard and a
  reader get the same facts.
- The engine places it beside the object (ADR-0006).

**2. A row lit from outside.**

- `OptionList highlighted` takes a row's value. That row takes **its own hover's look** without being chosen: the
  contour on a choosing card, the brand's ground on a card that leads (ADR-0159).
- `OptionList` emits **`hover(value | null)`** when a row is entered or left: the way back to the map.
- `OptionCard` takes a `highlighted` boolean for standalone use.
- A disabled card is never lit. A chosen card keeps its chosen look.

**3. The middle stays centred on the map** — *amended the same day (etolbi, 0.141.0 reversed)*.

- Shipped first: `top` and `bottom` centred in the room the sides leave, and glided there when a side changed. When
  the reading panel opened or folded, the legend and the timeline slid right and back — a movement the owner does
  not want, and one that bought nothing: at 1 440px the legend centred on the whole map ends at 1 000px and the
  sheet starts at 1 016px.
- Now they are centred on the **whole map** whatever the sides hold, and they do not move when a panel opens,
  folds or closes. No transition.
- Short of room, the middle **narrows rather than moves**. A side overlay (`start`, `end`) still publishes how much
  of the map it takes (`--map-overlay-start` / `--map-overlay-end` on the map's container, from a `ResizeObserver`,
  RTL included, removed while the side holds nothing). The wider of the two **caps** the middle symmetrically, so
  its centre stays the map's. Under the cap the legend's ramp gives (then its short label) and the timeline's strip
  scrolls under its edge fade (ADR-0116).
- The cap stops at **20rem**. Narrower, the timeline has no period left to show and the legend's words spill out of
  its pill (measured at 220px), which is worse than reaching a panel's edge. The map's own 16px margin always holds.

**4. A `MapPanel` arrives and leaves.**

- **The entrance** is `SurfaceTransition`'s `appear`. A panel mounted with `v-if` arrives from its edge (24px, a
  `lg` panel's travel) or from 96 % (a small one), over `enter` + `easing-out`, as a fold's return already did.
- **The leave** needs a ghost, because a component cannot animate its own removal: the parent's `v-if` takes it out
  in one frame (ADR-0052).
  - On unmount, the panel copies what it shows, inert and `aria-hidden`.
  - The copy plays the exit — `exit` + `easing-in`, toward its edge — and is then removed.
  - It is put in **a microtask later**, at the panel's index among the overlay's elements. Put in at once beside the
    panel, it lay inside the slot's fragment, and Vue swept it out with the panel: found by watching the overlay's
    mutations, the ghost was added and removed in the same tick.
  - Nothing plays under reduced motion.

The API does not change elsewhere: `MapPanel`'s `loading`, `closable` and `v-model:collapsed` already serve the
product.

## Measured

`Données/Map` « Sélection d’un objet », 1 440 × 860:

| What | Result |
|---|---|
| Legend and timeline centres (amended) | 720px with no sheet, with the sheet, panel open or folded — the same value in every frame of the fold; the legend ends at 1 000px, the sheet starts at 1 016px |
| Narrow map (`GisScreen`, panel open) | 1 240px: 360px wide, centred at 620, the strip scrolling; 1 100px: held at 320px (20rem), centred at 550 |
| Hover card | opacity 0 at 60ms, 1 at 360ms; `pointer-events: none` |
| Row under the hovered parcel | `--highlighted`, its contour `border-default` |
| Row hovered | lights the parcel back |
| Sheet entrance | `translateX` 24 → 0px and opacity 0 → 1 over `enter` |
| Sheet close | the ghost fades 1 → 0.37 in 75ms, then leaves; the end overlay is empty after |
