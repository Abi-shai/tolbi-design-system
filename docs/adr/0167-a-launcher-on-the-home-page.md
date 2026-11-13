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

## Amended — more compact (etolbi, 13 Nov.)

The owner found 0.140's blocks a little large: 120px tall with a drawing at 48. The block is now **6rem (96px)** and
the drawing **40**. The idea that a module should share the drawer's size is dropped in favour of a compact row; the
drawer keeps its 48. The name, the 12px between them, the corner arrow, the six-a-line ceiling and the motion do not
change.

What is left is 96 − (40 + 12 + 24) = 20px: 10 above and 10 below, measured. The arrow (16px, 12px from the top, 13
with the border) never meets the drawing, which is centred: at the narrowest block, 10rem = 160px, 31px separate
them. At 1 440px there are 6 blocks of 225 × 96, and 63px between arrow and drawing.

## Amended again — a fixed square of 104 (etolbi, 13 Nov., « B » for a trial in the app)

Stretched to fill their line, the blocks were out of proportion: 176 × 96 at 1 440px, and wider still on a large
screen. The block now **keeps its size**: a **6.5rem square** (104 × 104).

| Part | Value |
|---|---|
| Drawing | 40, unchanged |
| Name | `label-md-strong` (14/20), was `label-lg-strong`; centred, one line, cut |
| Drawing → name | `spacing-lg`, unchanged |
| Arrow | `spacing-md` from the corner's edges, since the block is smaller (9px measured, with the border) |
| Grid | `repeat(auto-fill, 6.5rem)`, `spacing-lg` apart, aligned to the start |

The six-a-line ceiling goes: a line takes as many squares as fit.

Measured, eleven modules: 11 a line at 1 920px and 1 440px with the list at the viewport's width (etolbi's narrower home
column gives 9 + 2), 10 at 1 200px, 5 at 600px, 2 at 360px. 16px above the drawing and below the name. 7px between
the arrow and the drawing. No name of the catalogue is cut.

**Kept in reserve** if B does not suit in the app: a square of 88 (5.5rem, drawing 32, `label-md-strong`,
`spacing-md` between), with which the eleven modules hold on one line at 1 440px.
