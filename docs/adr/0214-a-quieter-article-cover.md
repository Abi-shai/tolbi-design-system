# ADR-0214 — A quieter article cover

**Status**: accepted (the owner, 18 Nov. 2026 — track B2). This amends ADR-0213.

## Context

ADR-0213's cover drew too much attention on the home page: a full deep green, white type at 16px semibold, three
times in a row. The articles are far from the most important block on the page.

The owner explored on a board in the session, with the real `Tray` and the real articles:

| Track | What it does |
|---|---|
| A | a light green tint |
| B | the tray's grey |
| C | white under the hairline |
| D | the green tint in 2:1 |
| E | a pattern band with the title moved below |
| F | a thumbnail row |

He kept **B**. At 3.5 % its pattern still competed with the title, so it was refined into four steps:

| Step | Pattern |
|---|---|
| B | 3.5 % |
| B1 | 2 % |
| B2 | **1.2 %** |
| B3 | 2.5 %, faded out before the title |

He retained **B2**: the pattern is barely guessed.

## Decision

The geometry of ADR-0213 is unchanged:

- the 16:9 frame and its hairline;
- the pattern at `lg`, ×1.4, offset by `seed`;
- the title on the cover in `heading-sm`, three lines, `spacing-xl` from the edges;
- the date alone under the frame;
- the title as the link's name, the cover `aria-hidden`.

The inks change:

- **Ground**: `bg-neutral-subtle`, the tray's softest grey (was `brand-700`).
- **Pattern**: `text-strong` at **1.2 %** (was white at 3 %).
- **Title**: `text-strong` (was white).
- **Hover and focus**: the ground steps to `bg-neutral` with the card, as a project's picture does (ADR-0207), and the
  pattern still fades to 45 % over `considered`. Nothing moves; under reduced motion both changes are immediate.

These are **semantic roles now, not primitives**, so the cover follows the theme. ADR-0213 had made the cover a
picture with fixed inks.

## Measured

| What | Light | Dark |
|---|---|---|
| Ground at rest | `rgb(249, 250, 251)` | `rgb(38, 49, 43)` |
| Ground on hover | `rgb(242, 244, 247)` | `rgb(54, 69, 61)` |
| Pattern ink | `rgb(16, 24, 40)`, `fill-opacity` 0.012 | `rgb(217, 226, 222)`, 0.012 |
| Title on the bare ground | 16.98:1 | 10.2:1 |
| Title where two stamps overlap | 16.2:1 | 9.6:1 |
| Title on hover, two stamps | 15.37:1 | 7.21:1 |

The card stays 288 × 213. The `ArticleList` and `ArticleCard` stories render and pass their `play`.

## Consequences

Nothing changes on the product side: `cover` keeps its meaning and only its look is quieter.

The exploration board was a temporary story and has been deleted.
