# ADR-0140 — Three parcel statuses

**Date:** 2026-11-09
**Amends:** ADR-0107 (`ProjectGlyph`, the owner's range « Glyphe »)
**Source:** etolbi, ARR prototype feedback of 9 Nov., point 4 — the parcel needs « Qualité » (dMRV), « Forêt en 2016 »
and « Contour invalide » (ARR); the range held only « Suivie » and « En alerte ».
**Board:** Figma « ↪ Glyphes de parcelle — trois statuts · pistes (9 nov.) » (`3939:1427`). Track A of each, chosen by
the owner (« on fait ça » to the recommendations).
**Status:** Accepted

## Decisions

- **`ProjectGlyph kind="parcel"` gains `quality`, `forest` and `invalid`.** Like the range, they are rasters (80px,
  2× of 40), not vectors — and they are **made from the owner's « Suivie » drawing** (same polygon, same pixel texture
  of an index, same outline; `.context/glyph/gen.py` on the board's day), so each status differs by **one thing**:
  - **`quality`** — clouds over the reading, the outline in amber: the measure is there, partly hidden, as on a real
    satellite image.
  - **`forest`** — a dense canopy of crowns on a deep green: told from « Suivie » by its form (rounds), not only by a
    darker tint; the outline stays green — it is a fact, not an alert.
  - **`invalid`** — the reading faded and the outline in the **red dashes of the zone's « Échec »**: the range's own
    sign for a shape in fault.
- Declined: hatching, gaps, a tree pattern, a self-crossing outline, the dashes alone (tracks B/C on the board).
- The drawings are **not** added to the Figma component: the code is the source of truth (the board keeps them).
