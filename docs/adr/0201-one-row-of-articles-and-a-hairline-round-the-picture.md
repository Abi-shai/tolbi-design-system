# ADR-0201 — One row of articles, and a hairline round the picture

**Status**: accepted (the owner, 17 Nov. 2026). This amends ADR-0196 and ADR-0198.

## Context

The home page now shows the site's latest articles (tolbi.ai), four at most, with their real banners: photographs, and
partners' logos. On a 1 440px screen, two defects:
- **A fourth card wrapped alone.** Four 18rem cards need about 1 190px (4 × 288 + 3 × 12, plus the tray's insets); the
  surface has about 1 090. The fourth card went to a second line under the other three, and the section doubled in
  height for one article.
- **A logo on white melted.** Several banners are logos on a white ground (Mars, IITA). On the tray's white surface,
  with no card ground (ADR-0198), nothing showed where the picture stopped.

## Decision

### 1. One row

- **`ArticleList` keeps to one row.** It shows the cards that fit whole: three at 1 440px, four wider.
- **The others are not rendered.** They are not hidden: hidden cards would stay in the tab order and the
  accessibility tree. The product's « Voir tout » leads to them.
- **How it is counted.** The room is read off the grid as it is laid out, the gap as rendered and the card's 18rem at
  the page's rem. It is counted once mounted, before the first paint, and again on every resize (`ResizeObserver`).
- **Loading follows the same rule**: the placeholders that fit.
- **`wrap`** lets the cards wrap onto more rows instead, never narrower than 18rem.
- **Under 40rem of the list's width, nothing changes**: one full-width column, every card.
- The card's 18rem, its insets and the 16:9 picture are unchanged.

### 2. A hairline round the picture

- The picture's frame carries a **hairline drawn over the image**: `--ds-border-width-default`, `border-subtle`, at
  `radius-control`. It is inset, so the 272 × 153 box does not move.
- It stays on hover, and on the frame of a missing picture.
- It is a `::after` over the image: an inset `box-shadow` on the frame itself would be painted **under** the image,
  which covers the whole frame.

## Measured (`Données/ArticleList`, four articles)

| Width | One row (default) | `wrap` |
|---|---|---|
| 1 100 | 3 cards, 1 row (tray 289) | 4 cards, 2 rows (tray 558) |
| 1 300 | 4 cards, 1 row | 4 cards, 1 row |
| 900 | 2 cards, 1 row | 4 cards, 2 rows |
| 600 (< 40rem) | 4 cards in one column, 568 wide | the same |

- **Loading** follows the same rule: 3 / 3 / 2 placeholders; `loadingCount` is 3.
- **Frame**: 272 × 153, hairline `rgb(234, 236, 240)` 1px inset.
