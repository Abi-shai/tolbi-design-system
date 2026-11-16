# ADR-0196 — A lighter article card, at a fixed width

**Status**: accepted (the owner, 16 Nov. 2026). This amends ADR-0195.

## Context

Seen on the home page, the article card of 0.158 was wrong in two ways:
- **`bg-neutral` weighed too much** on the page;
- **the three cards shared the row's width**, so on a wide screen each card and its 16:9 picture grew without
  limit.

## Decision

### 1. A lighter ground

- The card is **`bg-neutral-subtle`**, `Card sunk`'s ground, still with no edge.
- Under the pointer and on focus it darkens a step, to **`bg-neutral-subtle-hover`**.
- The picture's frame (loading, no picture) is **`bg-neutral`**.
- **The frame steps too on hover.** `bg-neutral-subtle-hover` and `bg-neutral` alias one grey (gray-light/100), so on
  a darkened card an empty frame would melt into the ground (1.000:1). On hover and focus the frame takes a veil of
  `text-strong` at 7 % over its own grey, staying one step above the card.

### 2. A fixed width

- **A card is 18rem wide (288px).** At 16rem the pictures' text could not be read; at 20rem the card stood too large
  beside `ModulesList`'s tiles.
- `ArticleList` lays the cards **from the start**, `spacing-lg` apart, without stretching them
  (`repeat(auto-fill, 18rem)`, `justify-content: start`). The row no longer fills the width.
- Short of room, the cards **wrap**; they never go under 18rem.
- **Under 40rem of its own width, there is one column at full width**, as before.
- A lone card is 18rem too (`max-width: 100%`).

**One number differs from the brief.** The picture is **276 × 155**, not 288 × 162. It sits inside the card's 6px
inset (ADR-0195), and it is the **card** that is 18rem. A 288px picture would make a 300px card.

## Measured (`Données/ArticleList`)

| What | Value |
|---|---|
| 1 100px | three cards at x 16 / 316 / 616, each 288 × 241, picture 276 × 155 |
| 700px | two on the first line, the third wraps under the first |
| 600px (< 40rem) | one column at 600, picture 588 × 331 |
| Loading | 288 × 241, the same |
| Ground / hover / frame | `rgb(249, 250, 251)` / `rgb(242, 244, 247)` / `rgb(242, 244, 247)`, the frame a veil darker on hover |
