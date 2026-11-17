# ADR-0213 — A brand cover for the articles

**Status**: accepted (the owner, 17 Nov. 2026). This amends ADR-0195 and ADR-0201.

## Context

The home page shows a selection of articles that belongs to the app, not the website's. Their pictures were hand-made
banners.

The owner ran two benchmarks (29 products, among them Railway, Plaid, Clerk, Stripe and Attio) and compared about ten
tracks on the real page. He retained **a generated cover, the same for every article**: the brand's deep green, the
brand pattern all but invisible over it, and the article's title on top.

The product had drawn it itself, over the card's picture frame, in its own `article-cover.vue`. That is a workaround,
since `ArticleCard` had room for nothing but an image. The cover now moves into the package.

## Decision

### `ArticleCard cover` + `seed`; `ArticleList cover`

With `cover`, the 16:9 frame holds the cover instead of a picture. The frame's radius (`radius-control`) and its inset
hairline (ADR-0201) are unchanged.

`ArticleList cover` gives every card the cover, framed by its item's `id`.

### The cover

- **Ground**: `brand-700` (#044b28), the whole frame.
- **Pattern**: `BrandPattern scale="lg"`, white ink at **3 %**.
  - It is enlarged ×1.4 around its centre, so 20 % of it overflows each side.
  - It is then offset by at most 14 % on each axis. No corner is ever left empty, and there is no rotation, for the same
    reason.
  - The offset comes from `seed`, hashed (`ProjectGlyph`'s rule, ADR-0107). One article keeps its framing; two
    neighbours rarely share one. Without a seed, the title is the seed.
- **Title**: the article's title, `heading-sm`, white, at the bottom left, `spacing-xl` in from the edges, **three
  lines at most** with an ellipsis.
- **Nothing else**: no text, no logo, no icon.

The cover is a picture, so its inks do not follow the theme. The green and the white are primitives with named
suppressions, as `MapPin`'s are (ADR-0169).

### Under the cover: the date alone

The words under the frame drop the title, because it is already on the cover. The title **stays the link's name**
(`aria-label`, as before), and the cover is `aria-hidden`.

`meta` is unchanged; the product passes the date.

### Hover and focus: the pattern fades, it never lights up

Under the pointer and on keyboard focus, the pattern goes to **45 %** of itself, an opacity fade over `considered`
(400ms). Nothing moves: no zoom, no travel. Under reduced motion the change is immediate.

The card's tray hover and focus ring are unchanged (ADR-0199).

The owner set aside three alternatives:

- a pattern that lights up or comes closer on hover, which was too visible;
- a continuous drift, which was distracting;
- the pattern at 6 % at rest, which was cluttered.

## Measured

| What | Value |
|---|---|
| Card | 288 × 213 (no title under the frame; was 257) |
| Frame | 272 × 153 |
| Title on the cover | 16px from the left and from the foot, 240 wide, 72 high (three lines of 24), white, `600 16px/24px` |
| Ground | `rgb(4, 75, 40)` |
| Pattern ink | `fill-opacity: 0.03` |
| Framing | three different offsets for three articles, ×1.4 each |
| Pattern under the pointer | opacity 1 → 0.45 |
| Link | named by the title; the words under it are the date alone; the cover `aria-hidden` |
| Loading with `cover` | the frame and the date's line, 288 × 213 like the real card |

The title's contrast is computed with the WCAG formula:

| Where the title sits | Contrast |
|---|---|
| On the bare green | 10.28:1 |
| On a single stamp (3 %) | 9.48:1 |
| On two stamps over each other, the lightest zone | **8.76:1** |
| On that zone, faded to 45 % | 9.57:1 |

The requirement was at least 8.5:1.

## Consequences

The product passes `cover` to `ArticleList`, writes the date alone in `meta`, and removes `article-cover.vue` and its
title workaround.
