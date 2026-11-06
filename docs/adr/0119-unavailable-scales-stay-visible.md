# ADR-0119 — Unavailable scales stay visible

**Date:** 2026-11-06
**Amends:** ADR-0100 (`MapTimeline`'s scale chip), ADR-0114 (one scale said, not offered)
**Source:** etolbi on 0.99.1, the dMRV project page: measures are yearly only, yet the product wants the
**Année / Mois / Jour** selector shown — so the reader learns the timeline is in years, and that the scale changes
elsewhere, but not for this module or this project.
**Status:** Accepted

## Decisions

- **`MapTimelineScale` takes `disabled`.** The chip « Année ⌄ » shows whenever two scales or more are passed, even if
  only one can be chosen: its chevron and its menu are what say other scales exist. The menu lists them all; an
  unavailable one is **greyed, and nothing is written to say why** — the owner: « on rend juste la variante inactive,
  pas besoin d'écrire ». Choosing it does nothing. The word alone, no menu (ADR-0114), stays the case where the
  product passes one scale.
- **A disabled `DropdownItem` stays reachable** — in the tab order, `aria-disabled`, inert when pressed (the APG menu
  rule; it used to be `tabindex="-1"`, so a keyboard never met it). Catalogue-wide.
- First drawn with the reason on the row under the name (`disabledReason`, a `DropdownItem.description` line, a 19rem
  menu) and **reverted the same day** on the owner's render: the greyed row is the statement. Neither prop shipped.

Measured (story « Échelles indisponibles »): menu 162px (`sm`), « Mois » and « Jour » `aria-disabled="true"` and in
the tab order; Enter on « Mois » leaves the scale « Année ».
