# ADR-0119 — Unavailable scales stay visible

**Date:** 2026-11-06
**Amends:** ADR-0100 (`MapTimeline`'s scale chip), ADR-0114 (one scale said, not offered)
**Source:** etolbi on 0.99.1, the dMRV project page: measures are yearly only, yet the product wants the
**Année / Mois / Jour** selector shown — so the reader learns the timeline is in years, and that the scale changes
elsewhere, but not for this module or this project.
**Status:** Accepted

## Decisions

- **`MapTimelineScale` takes `disabled` and `disabledReason`.** The chip « Année ⌄ » shows whenever two scales or more
  are passed, even if only one can be chosen: its chevron and its menu are what say other scales exist. The menu lists
  them all; an unavailable one is **greyed, with its reason on the row under its name** (« Pas de mesure mensuelle pour
  ce projet »), and choosing it does nothing. The word alone, no menu (ADR-0114), stays the case where the product
  passes one scale.
- **`DropdownItem` takes `description`** — a second line under the name, the row's `aria-describedby`. On a disabled
  row only the name and its mark recede (`text-disabled`); the description stays `text-subtle`, because at the row's
  usual half opacity it measured ~2:1 and a reason must be read.
- **A disabled `DropdownItem` stays reachable** — in the tab order, `aria-disabled`, read with its description, inert
  when pressed (the APG menu rule; it used to be `tabindex="-1"`, so a keyboard never met the reason). Catalogue-wide.
- The scale menu widens to 19rem when a reason is shown, so a reason holds one line (it wrapped at 15 and 17).

Measured (story « Échelles indisponibles »): « Mois » and « Jour » reached by Tab, `aria-disabled="true"`, described by
their reason; Enter on « Mois » leaves the menu open and the scale « Année »; rows 34 / 52 / 52px in a 306px panel.
