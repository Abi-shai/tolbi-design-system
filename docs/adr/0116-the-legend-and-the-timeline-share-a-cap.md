# ADR-0116 — The legend and the timeline share one cap

**Date:** 2026-11-05
**Amends:** ADR-0103 (`MapLegend` declared 30rem), ADR-0114 / ADR-0115 (`MapTimeline` 35rem, 40rem hugging)
**Source:** etolbi on 0.96, the dMRV GIS screen: the legend at the top and the timeline at the bottom sit on one axis
and should follow one rule — the width of their content, 480px at most.
**Status:** Accepted

## Decisions

- **Both are `fit-content`, capped at `min(var(--ds-width-sm), 100%)`** — `--ds-width-sm` is 480px, the token both read,
  so the cap cannot drift between them. Whatever they hold, both stay centred on the map's axis (measured: same centre
  in the story « Sur l'axe de la frise »).
- **`MapLegend`**: the gradient has no width of its own; it takes what the metric switch and the title leave, and never
  less than **16rem** — a ramp read, not glimpsed. A one-metric legend with a short name measures 359px.
- **`MapTimeline`**: with one scale or several, the same rule; ADR-0114's `--hug` class and ADR-0115's 35rem / 40rem are
  gone. Past 480px the periods scroll as before (‹ ›, the chosen one kept in view), and **a fade on each edge that hides
  periods** (24px, a `mask-image` read off the scroll position) says « more this way » — a period cut flat read as a
  broken one.

## Consequence

At 14px on 32px targets (ADR-0115), five years and « Comparer » measure 510px: **30px over the cap**, so the first year
sits under the fade until scrolled to. Without « Comparer », five years fit (422px).
