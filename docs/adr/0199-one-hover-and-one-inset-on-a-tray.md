# ADR-0199 — One hover, and one inset, for what sits on a tray

**Status**: accepted (the owner, 16 Nov. 2026). This amends ADR-0198 and ADR-0197.

## Context

On the home page both lists sit on a `Tray` (0.159). Two things were off:
- **The hover barely showed.** A `ProjectList` row and an `ArticleCard` took `bg-hover` (gray-light/50), which is the
  tray's own grey; on the white surface the step was too small.
- **The insets differed.** A row's inset is `spacing-md` (8) and a card's was `spacing-sm` (6), so the hover's ground
  spread less around a card than around a row.

## Decision

### 1. One hover for the pattern

- What is clickable on a tray takes **`bg-neutral-subtle-hover`** (gray-light/100; `gray-forest/700` in dark), **on
  hover and on keyboard focus alike**. Compared on the real page, it is clear and not heavy.
- The tray's white surface hands it down as **`--on-tray-hover`**, with **`--on-tray-hover-strong`**
  (`bg-neutral-strong`) for a grey inside what is hovered. These are private context variables, as the map's
  `--on-glass-*` are. A future clickable on a tray reads them, so the pattern keeps one hover.
- `ProjectList`'s rows read it, and now on focus as well as on hover.
- `ArticleCard` reads it. Its empty picture frame steps to `--on-tray-hover-strong` (gray-light/300), so it does not
  melt into the card's new ground.
- Off a tray, both fall back to the same values.

### 2. One inset

- `ArticleCard`'s inset goes `spacing-sm` → **`spacing-md`** (8), a row's.
- Its inner gaps stay ADR-0197's: picture → words 12, words 0 6 12, title → date 4.
- It is still 18rem wide, so the picture is now **272 × 153**.

## Measured

| What | Value |
|---|---|
| `ProjectList` row, hover and keyboard focus | `rgb(242, 244, 247)` (was `rgb(249, 250, 251)`, the tray's grey); rows still 530 × 72 |
| `ArticleCard` on hover | `rgb(242, 244, 247)`, the empty frame `rgb(208, 213, 221)` |
| `ArticleCard` | 288 × 257, inset 8, picture 272 × 153 |
| Card spacing | picture → title 12, title → date 4, date → foot 20, words 14 from the edge |
| Loading | 288 × 257, the same |
