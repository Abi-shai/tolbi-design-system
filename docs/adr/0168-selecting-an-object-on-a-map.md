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

**3. The middle centres in the free room.**

- A side overlay (`start`, `end`) publishes how much of the map it takes, from the map's edge to its own far edge, as
  `--map-overlay-start` / `--map-overlay-end` on the map's container. It is measured by a `ResizeObserver`, works for
  RTL, and is removed while the side holds nothing.
- `top` and `bottom` now span the room between those marks and centre what they hold.
- They glide there over `duration-enter` + `easing-in-out` when a side changes: a reading panel folded into its
  button, a parcel's sheet opened. Under reduced motion they move at once.
- Before, the legend and the timeline stayed centred on the whole map and passed under the sheet.

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
  - The ghost holds the panel's room while it leaves, so the middle overlays recentre **after** the sheet has gone,
    not under it.
  - Nothing plays under reduced motion.

The API does not change elsewhere: `MapPanel`'s `loading`, `closable` and `v-model:collapsed` already serve the
product.

## Measured

`Données/Map` « Sélection d’un objet », 1 440 × 860:

| What | Result |
|---|---|
| Legend and timeline centres, no sheet | 928px, the free room's centre between the 400px panel and the map's edge (the map's own centre is 720) |
| Legend and timeline centres, sheet open | 720px; the legend ends at 1 000px, the sheet starts at 1 016px |
| Hover card | opacity 0 at 60ms, 1 at 360ms; `pointer-events: none` |
| Row under the hovered parcel | `--highlighted`, its contour `border-default` |
| Row hovered | lights the parcel back |
| Sheet entrance | `translateX` 24 → 0px and opacity 0 → 1 over `enter` |
| Sheet close | the ghost fades 1 → 0.37 in 75ms, then leaves; the end overlay is empty after |
