# ADR-0229 — The basemaps as a list

**Status**: accepted (the product's brief, 18 Nov. 2026; Felt's form, shown by the owner). Amends ADR-0222's tiles; the
tray, the trigger, `basemaps` and `v-model:basemap` are unchanged.

## Context

In 0.170.1 the basemaps were two large tiles side by side: the picture in 4:3, the name under it, and the active one on a
pale green ground (ADR-0222). The product kept **Felt's form** instead, a list. A list is easier to run through, and in it
the picture reads as the basemap itself.

## Decision

`MapBasemapPicker`'s body is a **vertical list**, `spacing-xxs` between rows. A row is:

- **the picture**: a 3.5rem square, `radius-surface`, an inset `border-subtle` hairline (drawn over the picture,
  ADR-0201), the image in `cover`;
- **the name**: to its right, `spacing-lg` after the picture, `label-lg`, aligned to the start, on one line;
- **the row itself**: `spacing-sm` padding, `radius-surface`.

**Hover** takes `bg-neutral-subtle`. **Keyboard focus** takes the package's ring on the row.

**The current basemap is marked on its picture, not on its row.** There is no ground:

- the picture is ringed in `border-brand-solid` at `border-width-strong`;
- the name is `label-lg-strong` in `text-brand`.

That is ADR-0050's mark moved from the row to the picture: the row grounds stay for the pointer. As before there is no
check, and there is **no description** under the name (decided: the name is enough).

**The title** stays the product's label (`basemap-label`); the product passes « Basemap » in every language.

**Unchanged**: the keyboard. It is a radio group; the arrows (↑ ↓ as well as ← →) move the choice and keep the tray
open, and a press chooses and closes.

## Measured

Storybook, Chromium, the bar's « Actions » story:

| What | Value |
|---|---|
| Panel | 179 × 208; the tray hugs its list |
| Rows | 145 × 68, 2 apart |
| Pictures | 56 × 56; the current one ringed brand-700 at 2px |
| Names | 16px; the current one 600 in brand-700, the other 500 in `text-strong` |

## Consequences

The product removes its local rules from `app.vue` (`.app-gis-bar`).
