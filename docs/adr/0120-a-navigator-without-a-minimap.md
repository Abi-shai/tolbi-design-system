# ADR-0120 — A navigator without a mini-map

**Date:** 2026-11-06
**Amends:** ADR-0100 (`MapNavigator`'s two forms)
**Source:** etolbi — some map screens have no mini-map to give (the engine renders none), yet still want the
zoom and « Recentrer » in the corner.
**Status:** Accepted

## Decisions

- **The slot's presence decides** (ADR-0053), not a `minimap: false` prop. A prop would let a navigator be told it
  has no mini-map while it is handed one, or the reverse; the mini-map *is* `#default`, so its absence already says
  it. No `#default` ⇒ no mini-map.
- **Without a mini-map there is nothing to fold**, so there is one form: the bar alone — − **the gauge** + and
  « Recentrer », the open form's zoom row (9.25rem) in the folded form's chrome. No rule, no mini-map button, no
  `SurfaceTransition`; `v-model:collapsed` is ignored. The gauge fits: it is a 32px-tall native range, the buttons'
  own height, so the bar keeps the folded form's **42px** (4px padding, `xs` buttons, border) and its
  `radius-surface-sm` (10px). Measured: 158 × 42, radius 10px — the folded bar is 147 × 42.
- **Nothing else changes**: names and tooltips (Dézoomer, Niveau de zoom, Zoomer, Recentrer), the zoom model and its
  limits, the focus handed to the gauge when − or + reaches its end. Placed by `MapOverlay position="top-end"`, it
  stands 16px from the map's corner (ADR-0117) — measured 16 / 16.
