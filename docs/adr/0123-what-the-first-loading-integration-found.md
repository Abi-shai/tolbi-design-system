# ADR-0123 — What the first loading integration found

**Date:** 2026-11-06
**Amends:** ADR-0122 (a map that fills in), ADR-0024 / ADR-0033 (`useSlidingIndicator`), ADR-0042 (the trail)
**Source:** etolbi on 0.103.0, the dMRV page.
**Status:** Accepted

## Decisions

- **A strip that arrives after mount is measured like one that was there.** `MapTimeline :loading` then `periods`
  going from `[]` to four years with the choice set to « 2024 » in the same tick: the chosen pill sat **12px** off
  its period and the label was cut by the strip's edge (« 202▌ »), and stayed so. Two causes, both silent:
  `useSlidingIndicator` observed its container **once, at mount** — the placeholders' strip, never the real one — and
  the timeline's gap is a style that lands on the render *after* it is computed, moving the periods inside a track
  whose size does not change, so no observer saw it. Now the composable **observes a container that arrives later**
  (and places the indicator there without a transition: a first placement is not a movement), and the timeline
  **places the choice again once its gap has landed**. Measured on the product's sequence: pill − period −0.33px on
  every one of 102 frames from its first, no slide; a timeline mounted with its periods measures +0.19px.
- **A crumb can wait.** `BreadcrumbsItem.loading` (the product's proposal): the crumb keeps its place and draws a
  placeholder **a name wide** (10rem, capped by the label's own 20ch), `strong` so it reads on the current crumb's
  white as on the bar's ground; it is not a link while it waits, keeps the crumb's 28px, and `label` is what a reader
  hears (« Chargement du projet »). `HorizontalNavigation` passes it through — no slot was needed. ADR-0122's note
  asked the product for a `Skeleton` the package gave it no place to put.
