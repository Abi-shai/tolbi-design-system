# ADR-0106 — The zone as the card's mark

**Date:** 2026-11-05
**Extends:** ADR-0041 (`ProjectCard`'s `module` mark), ADR-0040 (a prop as the fallback of a slot), ADR-0038
(the picture of a project is generated, never chosen)
**Source:** the owner's drawings — the dMRV card (Figma `3757:1607`, « Marque du module ») and the ARR baseline card
(`3123:20808`), both marked with the drawing of the project's zone.
**Status:** Accepted

## Context

ADR-0041 put the **module's** artwork on the title's line. Two modules have no artwork in the package — dMRV and ARR's
baselines — and their cards had no mark at all. The owner's drawings mark them with **the zone**: the outline of the
project's parcels, small. Asked whether to add it, he answered that it was already drawn.

## Decisions

- `ProjectCard` takes **`zone`** (an image source) and a **`#zone` slot**, the prop as its fallback (ADR-0040's
  shape) — an inline SVG or a `<canvas>` goes in the slot.
- **One mark per card**: the zone, when given, takes the module mark's place.
- **The owner's box**: 40px, the drawing inside it, **no ground** — **amended the same day** by the owner (« pas de
  background brand derrière, on aura aucun background »): the drawn tile was `bg-brand-subtle`, the drawing now stands on
  the card itself — **8px** from the name (`spacing-md`, where the module mark keeps `spacing-xs`).
- The row's floor follows: `--project-card-mark` is 40px on a zone card, so every card of a module that shows its zones
  shares one height (ADR-0041's rule, at the new size).
- **Decorative**: `aria-hidden`, `alt=""` — the title names the project.
- The drawing is the **product's**, generated from the geometry (ADR-0038's snapshot rule); the card owns the tile,
  never the drawing.

## The drawings are the owner's range

His component « Glyphe » (Figma `3041:8757`) sets what the tile holds: an **object** — zone, parcelle, baseline — in its
**status**, at 32 or 40, « forme réelle, nord en haut ». A zone draws its parcels by verdict (green eligible, red not,
orange to review; grey while it runs; a dashed red outline when it failed); a parcel its VRT texture (red where it
alerts); a baseline its reference zone dashed, its control points as grey squares, its projects' parcels in green
(grey while it computes). The stories use his drawings: ARR's three baselines take Baseline · À jour / À mettre à jour /
En calcul, dMRV's monitoring takes Zone · Terminée / En cours.

## Still open

- **The drawing generated from the geometry.** The range is eight examples; a project's own glyph is its real shape in
  those styles. A component that draws it (GeoJSON in, the range's rules out) is the next step — the parcel's VRT
  texture is a raster and stays the product's image.

