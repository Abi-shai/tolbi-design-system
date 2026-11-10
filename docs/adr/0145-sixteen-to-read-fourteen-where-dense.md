# ADR-0145 — Sixteen to read, fourteen where it is dense

**Status:** accepted — 10 Nov. 2026 (etolbi, after integrating 0.120.0)

## Context

ADR-0144 raised the desktop body to 16 and the floor to 14, everywhere. The product then looked into the rule
itself: WCAG sets no type size (1.4.4 asks for text that survives 200 % zoom, 1.4.10 for reflow at 320px), and
Atlassian and Carbon keep 14 in the interface and 16 for long text. Its decision: **16 to read, 14 accepted where
the interface is dense** — and named the dense places. It also asked us to check six components at 200 % and at
320px.

## Decision

The scale does not move. A dense place takes **the floor** (`body-sm` / `label-md`, 14/20) — locally, as an option or
from its context, never by changing the roles.

- **`Table` gains `density`** — `'default'` (16, unchanged) or `'compact'`: the cells and their text in `body-sm`. The
  inset does not move, so a one-line row is what it was before ADR-0144 (16 + 20 + 16); the header is `label-md`
  (14) in both, the second line `body-sm` in both. A prop, not a global change, because a table of six columns in a
  page and a table of twelve in a panel are not the same reading. `TableDensity` is exported.
- **`OptionList layout="stack"` sets its cards' title to `label-md-strong` (14)**, the size it had before ADR-0144;
  the description is already 14 (`body-sm`, or the reading panel's — ADR-0132). A variant switch,
  `--option-card-title-font`, read by the title and by the line its meta and control are centred on (`1lh`), so they
  stay on one line box. The grid and a lone card keep 16: they are choices read one at a time.
- **Map and chart keys at 14**: `MapLegend`'s chip word, title, bounds and unit go `label-lg` → `label-md`
  (16 → 14). `ChartLegend`, `ChartTooltip` and `MapTooltip` were already at 14 — their entries read `body-sm` /
  `label-md`. The one figure among them, `ChartLegend`'s `columns` value, goes back to 16 (`label-lg-strong`):
  figures did not grow in ADR-0144, and `label-xl` had taken it to 18.

## Measured at 200 % and at 320px

200 % is a 640 × 450 viewport (a 1280 × 900 window zoomed), 320px is WCAG 1.4.10's width. In every case:
horizontal page overflow, elements past the viewport, content clipped without an ellipsis, and a look.

- **`Dialog placement="side"`** — under 40rem it is full screen (ADR-0079's container query): 640 and 320, no
  overflow.
- **`MapPanel lg`** — `max-width: 100%` holds it in both; the reading panel's tiles go 2 × 2 → one column.
- **`Table stickyHeader`** — the header copy stays pinned (56px, under the bar) and follows the body's `scrollLeft`
  at both widths; the table scrolls inside its own frame, which 1.4.10 allows for data tables.
- **`AlertsBlock`** — fine at 200 %. **At 320 a row's title disappears**: the badge and the delay keep their width
  and the title is what gives, down to nothing (« K2 · Projet » is not drawn at all). Not fixed here — the row needs a
  second form (the delay under the title, the row taller), which is a drawing first.
- **`Tabs sm` in a `MapPanel lg`** — whole at 200 % (the panel keeps its 400px); **at 320 the labels ellipsize**
  (« Vue d'ens… »), which ADR-0141 allows but which is a label cut at a supported width. The accessible names stay
  whole.
- **`ToastRegion`** — fine at 200 %. **At 320 a toast ran 136px off the left edge**: its 27.5rem cap did not see the
  region. Fixed: `max-width: min(27.5rem, 100%)`.
- **The GIS screen as a whole** (`Map` « Écran SIG ») — **breaks at 200 %**: at 640px, the 560px legend runs under
  the navigator and over the panel's head, and the navigator covers the panel; at 320 it is worse. A map is exempt
  from reflow (1.4.10 names maps), but its instruments covering the panel is a loss of content. Each instrument is
  sound on its own; what the screen lacks is a narrow arrangement — which instrument folds, which goes under. A
  drawing first.

The stories' own wrappers were fixed where a story was the overflow: `AlertsBlock`'s ground is `max-width: 25rem`.

## Consequences

- `<Table density="compact">` where a table is read in bulk; nothing to change elsewhere.
- Parcel lists in a `MapPanel` are 14 again without the product doing anything.

## Still open

- The GIS screen's narrow arrangement, `AlertsBlock`'s row at 320, `Tabs sm` at 320 — three drawings.
