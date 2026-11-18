# ADR-0228 — A row that takes the width

**Status**: accepted (the product's brief, 18 Nov. 2026; applied locally on the home page in `home/articles.vue`).

## Context

With `cover` (ADR-0213/0214), `ArticleList`'s cards keep their 18rem, and the row shows only those that fit whole
(ADR-0201): three at 1 440px. That leaves a hole at the end of the tray (`Tray`), which shows.

ADR-0196 had refused shared columns because the pictures grew without limit on a wide screen. The brand cover has no
picture to grow: it is the brand pattern and the title, set by the component at any width.

## Decision

`ArticleList` gains **`columns`** (a number). Given, the row is shared:

- **Equal columns.** The grid is `repeat(n, minmax(0, 1fr))`; each card takes its column's whole width.
- **Every card is rendered.** There is no cut to what fits (ADR-0201's count does not apply). More cards than columns
  wrap onto further rows.
- **No empty cell.** There are never more columns than cards: two articles in `columns="3"` make two columns.
- **Narrow lists.** Under **60rem** of the list's width there are two columns; under **40rem**, one, as before. These are
  container queries, so the package still has no breakpoint (ADR-0020).
- **Loading.** `loadingCount` now defaults to `columns`, else the row's three. The placeholders take the same geometry.

Without `columns`, nothing changes: 18rem cards from the start, the ones that fit (ADR-0196/0201), and `wrap` as before.

## Measured

Storybook, Chromium, « Colonnes partagées », three articles with the cover:

| Viewport | List width | Cards |
|---|---|---|
| 1 440 | 1 082 (the story's 1 100 frame) | 3 × 347, filling the surface |
| 900 | 850 | 2 × 411; the third on a second row |
| 600 | 550 | 1 × 534 |

Loading has the same boxes at every width.

## Consequences

The product passes `columns="3"` on the home page. It drops `wrap` and the CSS grid from `home/articles.vue`.
