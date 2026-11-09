# ADR-0139 — What the ARR prototype adds (lot 1)

**Date:** 2026-11-09
**Source:** etolbi, dMRV / ARR feedback of 9 Nov. — adopting what the ARRSaaS prototype had drawn by hand. Eight requests;
this ADR takes the four that reuse what the package already has. The alert element, the status tokens and the help
link are decisions to draw first; the parcel glyph's new statuses need the owner's drawings.
**Status:** Accepted

## Decisions

- **`OptionCard` `badge` + `badgeTone`** — a status on the title's line, after `meta` and before the control: a
  `Badge sm` (the word says the status, the tone colours it, ADR-0006). The row is described by its sentence **then its
  status** (`aria-describedby`), so a reader hears « Suivie » as it is seen. Measured: rows stay 72px, the badge
  centred on the title (0px off), 18px tall.
- **`MapPanel` `closable` + `closeLabel`, emits `close`** — a `CloseButton` at the end of the title's line: `xs` in a
  small head (beside the fold, both giving back their 8px so the line stays the title's), `sm` in a `lg` head (the
  fold's size), the last column of the head's grid (ADR-0130), so what follows the first line still takes the whole
  width. Named with the title, « Fermer Parcelle P-0412 ». The product removes the panel.
- **`MapPanel` `#folded`** — folded, one action stays beside the control the panel became, 8px apart, on its line: a
  `Button sm` stands at the same 38px (measured: both 38, same top). It leaves with the control when the panel unfolds.
- **`ShareBar` `items[].color`** (and `ProjectCard`'s `stage` / `crops` share items) — a status keeps its colour
  whatever its rank (« Éligibles » the same green from one zone to the next). Biggest-first and the `+N` rule stand:
  a segment folded into `+N` still takes the neutral, so bar and legend agree on what has a name (ADR-0038).
