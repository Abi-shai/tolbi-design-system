# ADR-0099 — A panel to read a map from, and how it folds

**Date:** 2026-11-04
**Extends:** ADR-0087 (`MapPanel`, `MapOverlay`, `MapControls`), ADR-0021 (`SurfaceTransition`), ADR-0082 (the
anchored `Tooltip`)
**Source:** ARR · Dynamic baseline, the floating panel (400 px, tabs, a scrolling body, a foot); board « ↪ ARR —
MapPanel · le repli » (`3649:1427`), four collapsed forms drawn on the real screen, 11-source benchmark
(`.context/arr-baseline/bench-mappanel.md`). The owner chose **A**, against my recommendation (D, a rail).
**Status:** Accepted

## Decisions

**`size="lg"`** — the panel a screen is read from: **25rem, declared** (a size, not a ceiling: a panel that hugged
its content would move the map's free edge on every tab), as tall as `MapOverlay` lets it, a head (`#header`, after
the fold) and a foot (`#footer`) that stay, a body that scrolls between them. `sm` stays what ADR-0087 made.

**It folds into a map control at its corner (A).** Not a rail (the benchmark's most frequent form, 4 of 11, and
our `SideNavigation`'s — declined), not a head that stays (no map product folds a side panel that way), not a
handle on the screen's edge (Google Maps: the control travels 488 → 0px). The control is `Button` icon-only
`secondary-gray` `sm` with `panel-left` — the shape `MapControls` gives every control on a map — at the panel's
corner, the overlay's 16px from the edges. The fold is at the head's **start**; the control that replaces it
stands **17px** up and left of where the fold was — the cost of sitting on the map controls' line rather than
floating inside the corner.

**The motion: the surface goes where the control will be.** `SurfaceTransition`, out then in: the panel leaves
toward its top-left corner (`transform-origin`, ADR-0021: the consuming surface sets it), then the control
arrives there. Filmed at a tenth of the speed: the two never share a frame. Found in the film: **`Button`
declares its own `transition`, which outweighs the surface's**, so the control arrived in one frame — the
transition is its wrapper's now. The focus moves to the replacing control **as it starts to arrive**, never left on
the page between; `aria-expanded` and `aria-controls` on both. The map is not re-framed: the panel floats, it
reserves nothing (no product in the benchmark re-centres).

**`HelpIcon` is the anchored `Tooltip`.** It drew its bubble absolute beside the icon: in a body that scrolls it
was cut. Now in the top layer, flipping when short, with the catalogue's rules — 400ms on hover, keyboard focus
only, Escape — and without the `aria-expanded` a tooltip does not have. Its `placement` values map onto the
anchored ones (`top-left` → `top-end`, `top-right` → `top-start`).
