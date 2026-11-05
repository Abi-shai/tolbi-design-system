# ADR-0107 — A project's picture is a range, not a snapshot

**Date:** 2026-11-05
**Amends:** ADR-0106 (the zone mark's drawing « generated from the geometry »)
**Source:** the owner, 5 Nov., after the glyph benchmark (Figma page `3766:1427`): « la gamme actuelle est bonne … ce ne
sera pas un snapshot du projet réel, ce sera plutôt une gamme de ces illustrations … que le produit pourra utiliser en
boucle ». His range « Glyphe » (`3041:8757`).
**Status:** Accepted

## Context

ADR-0106 put the zone's drawing on `ProjectCard` and assumed the product would generate it from each project's
geometry. A benchmark of 33 captures (OneSoil, FieldView, xarvio, Regrow…) and three vector tracks drawn from GeoJSON
were set beside the owner's range; he kept **his range** — a textured, hand-drawn look none of the tracks matched — and
settled the question the tracks assumed: the picture is **an illustration**, not the project's real shape.

## Decisions

- **`ProjectGlyph`** draws one illustration from the range: `kind` (`zone | parcel | baseline`) × `status` (`done |
  running | failed`, `monitored | alert`, `up-to-date | outdated | computing`), the owner's eight drawings exported at
  2× (80px) and inlined like the package's other artwork.
- **A list cycles through the range.** Each drawing gives **eight variants** — four quarter turns, mirrored or not — and
  the variant is picked from **`seed`** (the project's id, hashed): stable for a project across renders and pages, varied
  across neighbours. `variant` (0–7) picks by hand when a list wants a strict cycle by index. More drawings in the range
  widen the cycle without changing the API.
- **Decorative** (`aria-hidden`, `alt=""`): the title names the project. It goes in `ProjectCard`'s `#zone` slot, 40px,
  no ground (ADR-0106).
- A kind given a status it does not draw falls back to its first (`zone` → `done`).

## Not done

- No GeoJSON renderer: the tracks that drew from geometry (aplat, classes, silhouette) were declined with the snapshot.
- dMRV uses the **zone**; ARR's baselines the **baseline**; the parcel waits for a parcel card.
