# ADR-0198 — A tray that groups a block; the articles on it

**Status**: accepted (the owner, 16 Nov. 2026 — track R3). This amends ADR-0195, ADR-0196 and ADR-0197, and
extracts ADR-0166's frame.

## Context

On the home page, « Derniers projets » (`ProjectList`) reads as one group: a light grey tray holding a single white
surface, the projects laid on it. The owner wants « Quelques articles à lire » grouped the same way. **The tray groups
now, so the cards no longer need a ground of their own.**

On the real page this was compared with grey cards laid on the tray, light or marked. The cards **without a ground**
were retained.

The owner also reads the tray as a **grouping pattern**, kept for some blocks to tell one block from another. It
existed only inside `ProjectList`.

## Decision

### 1. `Tray`

`ProjectList`'s frame, extracted as a component (`Structure/Tray`), with a single slot:
- the tray: `bg-neutral-subtle`, `spacing-md` around, `radius-surface-lg`;
- inside it, one white surface: `bg-default`, `spacing-md` around, `radius-surface`;
- no title and no state. The block's heading is the page's; its wait and its absence are the content's.

`ProjectList` now renders `Tray` (ADR-0001). Measured, it is **identical to the pixel**: the root at 1 100 × 256 and
six rows at the same coordinates, before and after.

### 2. `ArticleList` on the tray

`ArticleList` lays its cards on the same `Tray`:
- 18rem each, from the start, `spacing-lg` apart;
- wrapping rather than shrinking;
- one full-width column under 40rem.

While loading, the tray and its surface are there and the cards are placeholders. With nothing to show and nothing
loading, nothing renders, tray included.

### 3. `ArticleCard` without a ground

- **No ground and no edge**: the card is its picture and its words, on the tray's white surface.
- The picture's frame (loading, or no picture with `file-text`) is `bg-neutral-subtle`.
- **Under the pointer and on focus** the card **takes a ground**, as a `ProjectList` row does: `bg-hover`,
  `radius-surface`. The focus ring shows too, and nothing moves.
- `bg-hover` and `bg-neutral-subtle` alias one grey, so the empty frame would melt into that ground. On hover it steps
  to `bg-neutral`.
- The insets are ADR-0197's (S1): 6 / 12 / 0 6 12 / 4.
- Unchanged: the link (new tab, the name the title alone), the two-line title, the `meta` line.

## Measured (`Données/ArticleList`, 1 100px)

| What | Value |
|---|---|
| Tray | 1 100 × 287, `rgb(249, 250, 251)` |
| White surface | 1 084 × 271 |
| Cards | 288 × 255 at x 32 / 332 / 632; ground transparent |
| Empty frame | `rgb(249, 250, 251)` at rest |
| Card on hover | `rgb(249, 250, 251)`, the frame `rgb(242, 244, 247)` |
| Loading | the tray, three placeholders at 288 × 255 |
| 420px | one column, cards 388 wide in a 404px surface |
| `ProjectList` before and after | identical (1 100 × 256, six rows at the same place) |
