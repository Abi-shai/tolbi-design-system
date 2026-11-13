# ADR-0167 — A launcher on the home page

**Status**: accepted (etolbi, 13 Nov. 2026). Amends ADR-0164 and ADR-0165 for `ModulesList layout="page"`.

## Context

On etolbi's home page the owner found the modules row too small: low blocks, drawings at 32. The version kept is a
**launcher**: the drawing large, the name under it. The drawer (`layout="panel"`) does not change.

## Decision

**An entry** (`layout="page"`):

| Part | Value |
|---|---|
| Layout | vertical: the drawing above, the name below, centred both ways |
| Drawing | `ModuleIcon` illustration at **48**, the drawer's size, so a module is recognised the same in both places |
| Name | `label-lg-strong`, `text-strong`, centred, one line, cut |
| Drawing → name | `spacing-lg` |
| Block | **7.5rem** (120px) tall; border, radius and ground unchanged |

**The arrow** (ADR-0165) moves to the **top-right corner**: absolutely placed, `spacing-lg` from both edges (13px
measured, the border counted). It no longer sits in the flow, so it never moves the name. It still arrives on hover
and the keyboard's focus, and is absent on a disabled module.

**Six a line at most**, keeping the fold. This is `ProjectList`'s ceiling (ADR-0166), by six: a column's floor is
`max(10rem, (100% − 5 × spacing-lg) / 6)`. Once 10rem is less than a sixth of the line, the gaps counted, the floor
becomes that sixth and a seventh never fits.

Hover, focus, motion and reduced motion are unchanged. So is the API.

## Measured

`Navigation/ModulesList` « Sur une page », the list stretched to the viewport:

| Viewport | Columns | Block |
|---|---|---|
| 1 440px | 6 | 225 × 120 |
| 1 200px | 6 | 185 × 120 |
| 900px | 5 | |
| 600px | 3 | |
| 360px | 1 | 328 × 120 |

The drawing measures 48 and the name 16px / 600, centred. The `play` test passes.
