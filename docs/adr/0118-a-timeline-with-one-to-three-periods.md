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
- **« Comparer » is off when fewer than two periods can be chosen**, and says why in a tooltip —
  `compareUnavailableLabel` (default « Une seule période disponible »; the product writes « Une seule année mesurée »).
  It is **`aria-disabled`, not `disabled`**: a disabled button takes no focus, so the reason reached the pointer only.
  It stays in the tab order, is read as unavailable with the reason as its description, and does nothing when pressed
  (measured: focused by Tab, `aria-describedby` → « Une seule année mesurée », Enter leaves it off). The product no
  longer has to withhold `compare` itself.

Measured (story « Une à trois années »): one year — no arrows, « Comparer » off, the year centred; one year and two
ahead — gaps 24, centred, no arrows; two and three years — gaps 24, centred, arrows; five years + « Comparer » fit with
no overflow; months and days scroll as before.

## Research (the owner asked for a round before release)

12 sources measured (`.context/timeline-few/bench/`, 23 captures, `manifest.json`): Earth Engine Timelapse, NASA
Worldview, Global Forest Watch / Nature Watch, Esri Wayback and Land Cover, Copernicus Browser, ESA WorldCover,
MapBiomas, ArcGIS TimeSlider, MUI DatePicker, Ant Segmented, Carbon ContentSwitcher.

- **No map timeline shows 1–3 periods**: under three, products drop the timeline for a list (GFW's 2000/2010, ESA
  WorldCover's 2020/2021). Every timeline observed has eight periods or more — so the evidence is from neighbouring
  cases, not identical ones.
- **Spread vs grouped**: the six that spread are **proportional sliders** (spacing *is* time there); among discrete
  controls, three group (Timelapse, Ant, MUI) and one fills (Carbon). Our periods are discrete pills → **grouped**.
- **Arrows**: at an end, « disabled and visible » is the norm (Worldview, MUI); Copernicus keeps › live at the last date
  and a press does nothing — the defect we avoid. With nothing at all to step to, products remove the device rather
  than disable it → our removal holds.
- **Compare with one date**: observed nowhere; ESA WorldCover is the one product that says why two years do not compare
  (a banner). Ours says it in a tooltip → not contradicted, not proven.
- **Future periods**: map timelines stop at the last vintage (6 of 7 absent); date pickers show them disabled (MUI).
  The component renders what it is given — the product should pass future periods only when they mean something to the
  user (a campaign under way), and omit them otherwise.
