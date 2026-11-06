# ADR-0118 — A timeline with one to three periods

**Date:** 2026-11-06
**Amends:** ADR-0116 (periods share the strip), ADR-0100 (‹ › and « Comparer » always offered)
**Source:** etolbi on 0.98, the dMRV project page: a project measured one year (2024), the timeline running to the
current year (2025, 2026 `disabled`) — « ‹ 2024 ······ 2025 ······ 2026 › Comparer ».
**Status:** Accepted

## Decisions

- **The gap between periods is capped at `spacing-3xl` (24px).** ADR-0116 spread the periods end to end so a few left
  no void; three of them then stood ~150px apart and no longer read as one row. The room left is measured and shared
  out — `gap: clamp(spacing-xxs, room per gap, spacing-3xl)` — and past the cap the row stays **grouped and centred**;
  the bar keeps its 480px (ADR-0116), aligned with the legend. Overflowing, the gap is `spacing-xxs` and the strip
  scrolls as before. Widths are read sub-pixel with a pixel kept in hand (rounded, five years ran one pixel over and
  took a fade).
- **‹ › leave the bar when only one period can be chosen** — they would promise a navigation that does not exist. With
  more, each is disabled when nothing choosable lies its way (as before).
- **A disabled `subtle` `IconButton` is half `text-disabled`.** `text-disabled` (gray 500) beside `subtle`'s rest (gray
  600) — 4.97 against 7.69:1 — read as the same control: the spent ‹ › still looked live. A disabled control owes no
  contrast; it owes being seen as unavailable. Catalogue-wide for `subtle` (Tolbi AI's microphone while an answer comes
  takes it too).
- **« Comparer » is off when fewer than two periods can be chosen**, and says why in a tooltip on hover —
  `compareUnavailableLabel` (default « Une seule période disponible »; the product writes « Une seule année mesurée »).
  The product no longer has to withhold `compare` itself.

Measured (story « Une à trois années »): one year — no arrows, « Comparer » off, the year centred; one year and two
ahead — gaps 24, centred, no arrows; two and three years — gaps 24, centred, arrows; five years + « Comparer » fit with
no overflow; months and days scroll as before.
