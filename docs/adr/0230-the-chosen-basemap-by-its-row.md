# ADR-0230 — The chosen basemap is seen by its row

**Status**: accepted (the product's brief on `MapBasemapPicker` 0.174.1, 18 Nov. 2026; four states tried in the product).
Amends ADR-0229's mark for the current basemap.

## Context

ADR-0229 marked the chosen basemap on its picture: a brand ring around the thumbnail and the name in `text-brand`. With
two basemaps, the reader still had to look for which one was taken.

The product tried four states:

- a pale green row;
- a bordered row;
- a solid green row;
- a checked dot.

It kept the pale green row, with no ring.

## Decision

The current basemap (`__choice--current`):

- **The row** is on `bg-brand-subtle`, and on `bg-brand-subtle-hover` under the pointer.
- **The name** is `label-lg-strong` in `text-on-brand-subtle`, the tint's exact partner (ADR-0009).
- **The picture** keeps its drawing at rest: the brand ring is gone.

That is ADR-0050's mark for the current item of a list (a ground, its ink, the strong weight) on the brand tint.

**Not the solid brand.** It would read as the project's action, which stands just beside the trigger in the bar.

**Unchanged**: the other basemaps (hover `bg-neutral-subtle`), the keyboard's ring, the list's geometry (ADR-0229) and the
radio group.

## Measured

Storybook, Chromium, the bar's « Actions » story:

| What | Value |
|---|---|
| Current row | `rgb(230, 240, 235)` (`bg-brand-subtle`) |
| Current picture | no shadow |
| Current name | 600 16px, `rgb(4, 75, 40)` (`text-on-brand-subtle`) |
| Other row | transparent; name 500 in `text-strong` |
| Geometry | unchanged: rows 145 × 68, pictures 56 |

## Consequences

The product removes its local rules from `app.vue` (`.app-gis-bar`).
