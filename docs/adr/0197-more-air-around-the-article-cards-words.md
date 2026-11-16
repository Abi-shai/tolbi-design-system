# ADR-0197 — More air around the article card's words

**Status**: accepted (the owner, 16 Nov. 2026 — variant S1). This amends ADR-0195 and ADR-0196.

## Context

On the home page the article card's text was too tight, the bottom most of all: the date sat about 10px from the
card's edge. Variant S1 was compared on the real card against two airier versions, which were judged too tall.

## Decision

| What | Before | After |
|---|---|---|
| Picture → words | `spacing-md` (8) | **`spacing-lg` (12)** |
| Words' inset | `0 spacing-xs spacing-xs` (0 4 4) | **`0 spacing-sm spacing-lg` (0 6 12)** |
| Title → facts | `spacing-xxs` (2) | **`spacing-xs` (4)** |

With the card's own 6px, that puts **18px between the date and the card's foot**.

Unchanged: the card's inset (`spacing-sm`), its width (18rem) and the 16:9 picture. The loading placeholder follows
the same geometry, so it keeps the card's height.

## Measured (`Données/ArticleList`)

| What | Value |
|---|---|
| Card | 288 × 255 (was 241); loading 288 × 255 |
| Picture → title | 12 |
| Title → date | 4 |
| Date → foot | 18 |
| Words from the card's edge | 12 |
