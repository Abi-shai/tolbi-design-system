# ADR-0070 — Tolbi AI floats in the corner

**Date:** 2026-10-08
**Amends:** ADR-0062 (the panel is a column) — the entry in the bar
**Extends:** ADR-0021 (anything that floats), ADR-0049 (an arrival waits for its place), ADR-0044 (no
tint says hover on white), ADR-0066 (each control says what it does)
**Source:** Figma, « Tolbi xAI exploration », `Piste A · Cartographie` (`2308:2429`) — the button at the
bottom right of the screen, pointed at by the owner on 8 Oct.
**Status:** Accepted

## Context

ADR-0062 put Tolbi AI's entry in the bar: the sign and the name in a `Button`, the first of the bar's
controls, through a `#assistant` slot. The owner said it is neither the place nor the look: the panel is
opened from a floating button at the bottom right of the screen, as the frame draws it — a white disc
carrying the sign, over the page, and nothing about Tolbi AI left in the bar.

## Decisions

### A disc in the page's corner

`TolbiAiLauncher` is Figma's button: the sign at 32px, `spacing-md` around it and a `border-subtlest`
hairline — **50px**, declared in `border-box` (ADR-0039) — on `bg-default` with `elevation-control`. It is
fixed to the screen, over the page's bottom-right corner, `spacing-5xl` in from both of the page's edges:
the page's right edge is 12px in from the screen's (the column's margin, ADR-0047) and its bottom is the
screen's, so the disc lands at 52 / 40 from the screen where Figma measures 54 / 38. Measured in the
product's frame at 1512 × 920: 50 × 50, 52px from the right, 40px from the bottom.

On white no tint can say hover (ADR-0044), so hover steps the contour up to `border-default`, as
`IconButton`'s white disc does; the focus ring joins the disc's own shadow (`focus-ring-gray-shadow-xs`)
rather than replacing it, at `instant` (ADR-0022). Its name is « Tolbi AI » — the disc shows only the sign —
and after 400ms on hover or focus a tooltip says what it does, « Interroger Tolbi xAI », to its left: below
and to the right is the screen's edge.

**Amended (8 Oct.)**: the tooltip first read « Interroger Tolbi AI sur ce projet · ⌘J »; the owner cut it to
« Interroger Tolbi xAI » and nothing else. The shortcut is no longer written on the screen — it still works,
and `aria-keyshortcuts` still declares it.

**Amended by ADR-0071:** the pointer's arrival — or the keyboard's focus — also turns the sign once: the
awakening's turn, alone, from rest to rest; not when the focus is handed back as the panel closes.

### It gives way to the panel

Open, the panel stands where the disc floats; so the disc leaves as anything that floats does — scale and
fade over `exit` (ADR-0021) — and the panel's own close is the way back. Closing, it returns on `enter`,
**one `enter` late**: the panel closes over `enter`, and the disc would otherwise grow under its closing
edge (ADR-0049, an arrival waits for its place). Measured: still at opacity 0 120ms into the close, there
by 700ms. The focus comes back to it when the panel closes from inside, as it came back to the bar's
entry. ⌘J (Ctrl+J elsewhere) still opens and closes from anywhere, now listened for by the launcher.

### The bar has nothing of Tolbi AI's

`TolbiAiNavButton` is deleted, and `HorizontalNavigation` loses its `#assistant` slot: the bar is about the
app, and the one entry it held was this one. `Button` keeps `#leading` and `selected`, which outlive their
first consumer.

## What changes

- New: `TolbiAiLauncher` (`Actions/TolbiAiLauncher`) — `v-model:open` (the panel's), `controls`, `label`,
  `tooltip`, `shortcut`.
- Deleted: `TolbiAiNavButton`; `HorizontalNavigation`'s `#assistant` slot.
- In the product: take `<TolbiAiNavButton>` out of the bar and put `<TolbiAiLauncher v-model:open="open"
  controls="…" />` once in the page, beside the panel.
- Stories: « Dans la page » and its siblings open the panel from the disc.

## Still open

- **Whatever else lives in that corner** — a map's attribution, toasts placed bottom right — meets the
  disc there; the page decides, the launcher does not move for them.
- **In dark** the sign's leaves stay 2.44:1 on `bg-default` (ADR-0056).
- **The name**: the tooltip says « Tolbi xAI », the owner's words; the button's name, the panel's and the
  waiting line's still say « Tolbi AI ». One of the two is the product's name.
- **Figma**: `TolbiAI/Lanceur` is the frame's button made a component; `Nav/TolbiAI` leaves the retained
  components.
