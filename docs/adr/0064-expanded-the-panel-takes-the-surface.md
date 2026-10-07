# ADR-0064 — Expanded, the panel takes the surface

**Date:** 2026-10-07
**Amends:** ADR-0062 (the panel is a column) — what « Agrandir » does
**Extends:** ADR-0037 (one gesture, one duration), ADR-0046 (an edge that travels)
**Source:** Figma, Big design dump, `3 · Piste A, état par état` (`2310:3618`), frame
`4 · Agrandi — pour une longue réponse` (`2310:4829`)
**Status:** Accepted

## Context

ADR-0062 shipped « Agrandir » as the docked column at 720px: the same travel, 400 → 720, the page
making room once more. The frame drawn for it says something else: « Le panneau prend la surface :
colonne de lecture de 720, saisie en bas, barre et navigation intactes. On ne quitte pas la page —
« Réduire » rend la carte telle qu'on l'a laissée. » The 720 is the reading column, not the panel.

## Decisions

### The surface takes the row; the footprint stays

Expanded, the surface covers the row the panel stands in — the page's whole surface — and stops there:
the bar and the navigation are outside the row, so they are untouched. The panel's footprint in the row
does **not** change. The page stays 412px narrower, under the surface, at the width it had — which is
what makes « Réduire » honest: a page squeezed to nothing and widened back would reframe its map twice.
Filmed at a tenth of the speed, the page holds 812px in every frame of both gestures.

The surface overflows the panel to the left, where `justify-content: flex-end` already sent its
overflow. Its width is the row's, **measured** — a surface cannot otherwise know how much page there
is — and set without a transition: a window that resizes is not a gesture, and a surface trailing it by
200ms would uncover the page at its edge. Collapsing the navigation under an expanded panel, the
surface holds the row's edge to within half a pixel in every frame.

### A clip, not overflow

What hid a closing panel was `overflow: hidden`; it is now a `clip-path`. A clip can open past the
panel's own box — `inset(0 0 0 footprint − row)`, the row exactly — and it travels with the gesture,
which `overflow` cannot. Every gesture is then one edge:

- **Expand and reduce**: the surface's left edge travels between the panel and the row's edge.
- **Close while expanded**: the surface keeps its width and the clip closes over it from the left — the
  page comes back under one edge that travels, as it does when the docked panel closes. Measured, the
  edge never passes the page's right edge, so no ground opens between them.
- `expanded` **survives a close**: the panel reopens as it was left, the same edge in reverse.

Five gestures filmed — open, expand, reduce, close expanded, reopen expanded — no reversal on any edge.

### One rule for the column

The reading column is a padding of `max(spacing-2xl, (100% − 720px) / 2)`: 360 docked, 720 expanded, and
everything between while the surface travels, so the column follows the surface instead of switching at
either end. The composer's box stands `2xl − xl` past the column on either side at both widths —
Figma's 368 on 360, 728 on 720. The frame draws 920 because its padding was a fixed 252, set for a
1224px surface with the navigation open, and the navigation was then collapsed; the note's 720 is the
decision.

Above the column, 20 → 32 (`spacing-4xl`), and the welcome's sign 64 → 96 — on the same travel, not at
its start. The sign's size is a presentation attribute, which the cascade sees change, so a transition
on the sign is enough.

### What is covered is out of reach

Expanded, the panel makes the rest of the row `inert`: the keyboard and a screen reader would otherwise
walk a page no one can see. It hands back only what it made inert. Shift+Tab from the panel's head lands
in the bar.

### The page stacks on its own

The panel paints after the page at level 0: it covers whatever in the page has no `z-index` of its own.
A map's controls have one (Mapbox: 2) and would paint through. Raising the panel is not the answer — at
`z-raised` it would cover the tooltips of the navigation's rail, which sits there earlier in the DOM; at
`z-popover`, the bar's menus. So **the page is its own stacking context**, `isolation: isolate`: the
component's documentation asks for it, the stories do it, and it is the product's to apply.

## What changes

- `TolbiAiPanel`: expanded covers the row; the reading column; a `clip-path` instead of `overflow`; the
  row's other children inert while it is expanded. `TolbiAiWelcome`: the sign's size travels.
- Stories: « Dans la page » is the product's frame — navigation, bar, a page with its map, the panel —
  and « Agrandi » opens on frame 4.
- In the product: `isolation: isolate` on the page beside the panel.

## Still open

- **The column reflows while it widens** — over the first part of the trip, until the surface is 760px.
  Fixing the column at either width would trade the reflow for a cut.
- **Narrow screens**, still (ADR-0062).
