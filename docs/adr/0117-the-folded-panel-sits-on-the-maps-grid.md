# ADR-0117 — The folded panel sits on the map's grid

**Date:** 2026-11-05
**Amends:** ADR-0099 / ADR-0103 (« the control stands exactly where the fold was »)
**Source:** etolbi on 0.97, the dMRV GIS screen, against the owner's frame « Panneau replié » (`3691:9170`): folded,
the panel became a button ~34px from the map's edges — the fold's own place inside the open panel, measured on press —
where the frame puts it **in the map's corner, 16px in**, like `MapOverlay`'s other controls and the navigator.
**Status:** Accepted

## Context

« One press in one place » (ADR-0103) kept the pointer still across fold and unfold, at a cost paid once the panel is
gone: a button floating 18px off the grid every other map control stands on, with nothing on screen left to explain the
offset.

## Decisions

- **Folded, the control stands at the overlay's corner** — no measured margin: 16px from the map's top and side edges
  (`MapOverlay`'s inset), on the grid of the map's controls. `Button` icon-only `secondary-gray` `sm` (38px,
  ADR-0110), as `MapControls`. On an `end` place it stands in the right corner, 16px from the right edge, and grows from
  there.
- **The 18px are accepted, not hidden**: the open panel's head keeps its padding (the fold stays a 36px target with the
  head's air around it), and the passage is the existing one — the panel leaves toward its edge (24px of travel,
  ADR-0103), then the control arrives in its corner (`SurfaceTransition`, out-in). The arrival in a different place is
  read as a different object arriving, which it is.
- **The focus still follows** the control that replaced the one pressed — measured: after folding, the active element is
  the corner control; after unfolding, the fold.

Measured (stories « Panneau de lecture » and `MapOverlay` « Côtés »): fold at 33 × 34 → control at **16 × 16**; at the
end, 16px from the right edge.
