# ADR-0141 — A tab never cuts its content

**Date:** 2026-11-09
**Source:** etolbi — in a `MapPanel lg` head (the fold, then three tabs), « Parcelles 28 » / « Parcelles 128 » was cut:
`.ds-tabs__tab` was `flex: 1 0 0; overflow: hidden`, equal widths, so a tab under ~100px clipped its label and badge
while « Rapport » beside it had room to spare.
**Status:** Accepted

## Decisions

- **A tab is at least as wide as what it holds, then the room left is shared** — `flex: 1 1 auto`, `min-width: 0`. The
  sliding indicator already follows each tab's measured width (ADR-0024), so nothing else changes.
- **Past the strip's width the tabs shrink together and only the label gives**: it ellipsises (`overflow` moved from the
  tab to the label), and the badge is `flex: none` — a cut « 12… » would be a wrong number. The tab no longer clips, so
  nothing else in it can be cut.
- Measured: the `MapPanel lg` head gives the strip **322px**; « Données · Parcelles 128 · Rapport » takes 87 / 134 / 82
  with nothing cut (it still fits at 318). At 240 the three labels ellipsise and « 128 » stays whole. Equal labels still
  look equal: the shared room is shared equally.
