# ADR-0232 — Larger module marks, in the same cells

**Status**: accepted (the PM's feedback relayed by the product, 19 Nov. 2026: « On a l'impression que c'est trop
petit »; track S4). Amends ADR-0167's drawing size and ADR-0231's cell.

## Context

On the home page the module marks read too small. The product kept track S4: **the marks grow, the cells do not**.

## Decision

### `ModulesList layout="page"` (« Accès rapide »)

The illustration goes from 40 to **52** (3.25rem) in the same 104 square. It sits on its plate, which is 92 × 66. There
are still six modules a line. The product's CSS forcing of `.ds-module-icon` goes.

52 is off `ArtworkSize`'s ladder (ADR-0043). `ModuleIcon` keeps its number hatch for exactly this: a module mark sized
by the box it fills, as `ModuleCapsule`'s 44 is.

### `TrayCell`

The mark the cell is shown with is a `ModuleIcon logo` at **40**, where it was 32. The padding gives, from `spacing-md`
to `spacing-sm` above and below, so the cell grows by 4 only: 48 → **52**. Keeping 48 exactly would take `spacing-xs`;
the brief named `sm`.

### Checked, and left

- **The modules drawer** (`ModulesList` in the menu) already draws its modules at **48**, larger than the page's old
  40. It is unchanged.
- **`ProjectList`'s module** is a 16px mark set **beside its name**, as a word is: it is a label, not a mark to be read
  on its own.
- **`ProjectCard`'s module** is 32 on the title's line (ADR-0041).

Neither of these is a launcher; growing them would change their rows' height. If the PM's « trop petit » reaches them, it
is a separate brief, measured on the page.

## Measured

Storybook, Chromium:

| What | Value |
|---|---|
| « Accès rapide » | tile 104 × 104, plate 92 × 66, mark 52 × 52 |
| The credits door | cells 298 × 52, mark 40 |
