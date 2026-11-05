# ADR-0116 — The legend and the timeline are one width

**Date:** 2026-11-05
**Amends:** ADR-0103 (both centred on one axis), ADR-0114 (the timeline hugging), ADR-0115 (35rem / 40rem)
**Source:** etolbi on 0.96, the dMRV GIS screen: the legend at the top and the timeline at the bottom should follow one
rule — the width of their content, 480px at most. Shipped to main that way, then the owner, on the render: « ils n'ont
pas la même largeur » — on one axis, two widths read as a mistake.
**Status:** Accepted

## Decisions

- **Both are `--ds-width-sm` (480px) wide, declared**, `max-width: 100%` — one token, so the two are one width on the
  map's axis, edge over edge (measured: 160 → 640 for both in « Sur l'axe de la frise »). The width of their content
  was tried first and reverted the same day.
- **`MapLegend`**: the gradient has no width of its own; it takes what the metric switch and the title leave, never
  less than **16rem**.
- **`MapTimeline`**: ADR-0114's `--hug` and ADR-0115's 35rem / 40rem are gone. At a declared width, a few periods
  would leave a void again (ADR-0114's defect), so **while the periods fit they share the strip** — spread end to end
  (`justify-content: space-between` on a track at least the strip's width); once they do not, they keep their own
  width and the strip scrolls with ‹ ›, the chosen one kept in view.
- To keep five years and « Comparer » inside 480 at 14px on 32px targets (ADR-0115), a period's side padding is
  `spacing-sm` (6px, it was 8) and the gap between targets `spacing-xxs`: five years + « Comparer » fit whole; seven
  scroll (88px over).
- **A fade on each edge that hides periods** (24px, a `mask-image` read off the scroll position) says « more this way »
  — a period cut flat read as a broken one. The edges are read on scroll, on resize, once the face has loaded, and when
  the chosen pill lands (`transitionend`): the pill is absolutely placed and counts in the scroll width while it
  slides, and a read taken mid-slide faded a strip that fit.
