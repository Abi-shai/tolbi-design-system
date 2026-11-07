# ADR-0128 — A reading panel folds one way

**Date:** 2026-11-07
**Amends:** ADR-0099, ADR-0117 (`MapPanel size="lg"`)
**Source:** etolbi — on the same map-first screen, the page of an ARR eligible zone (no tabs, so no `#header`) folded
by a title + chevron into a titled button, where the baseline cockpit and the dMRV panel fold by the square at the
start of their head into a control at the corner.
**Status:** Accepted

## Decisions

- **The fold is the size's, not the head's.** A `lg` panel folds by the square (`IconButton` `sm` `subtle`,
  `panel-left`) at the start of its head and becomes the map control at the overlay's corner (ADR-0117), **whether
  `#header` is filled or not**. Without `#header` the head is the square, then the title (one line, cut). The title +
  chevron and the button that bears the title stay `sm`'s — a small panel folds in its own place.
- The title is read in the button's name both ways (« Replier Soubré nord » / « Déplier Soubré nord »). Without a
  title while `loading`, the title's place is a placeholder.
- Measured: the square 17 / 13px into the untabbed panel (17 / 18 under tabs, which are taller), the control at 16 /
  16px of the map once folded, the focus on it.
