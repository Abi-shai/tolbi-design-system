# ADR-0227 — A key read from a distance

**Status**: accepted (the product's brief on `MapLegendPanel` 0.173.0, 18 Nov. 2026; tried in the product on the
Dynamic baseline). Amends ADR-0226's size and ADR-0224's fold at the end.

## Context

Two findings from the product.

1. **The fold looked pressed at rest.** The legend's `x` (`IconButton md subtle`) showed a grey disc before anyone
   touched it.
   - The cause was not `subtle`, which has no fill at rest. It was ADR-0216's open veil: `IconButton` ghost and subtle
     read `aria-expanded="true"` as an open menu.
   - The fold says `aria-expanded="true"` because it is a disclosure, but it sits **inside** the panel it controls; it
     is not a menu standing open.
   - The reading panel's fold square carried the same disc.
2. **The key was too small to read and to point at.** The product measured:
   - 288px wide;
   - 14px titles and words;
   - 28px rows;
   - 8px fills, a 5px point, a 10px ring.

   Its users read the map from a distance and point at 28px targets.

## Decision

### The fold is bare at rest

- **No veil at rest.** The fold no longer wears the open veil: a fold with `aria-expanded="true"` is transparent at rest
  and takes its veil with the pointer, the press and the keyboard's focus. This applies to both placements.
- **No change for menus.** `IconButton`'s rule for menus (ADR-0216) is untouched.
- **At the end it is `ghost xs`.** That is the size of the blocks' and the rows' actions: one family of sizes in the
  key, where it was 40 in the head and 32 in the blocks.
- **The head's height.** It is now padding + 32 = 48. The md button's lent 2px apply to the md fold only.
- **The capsule keeps its glass** and its 40px button.

### `density="comfortable"`, the key's default

`MapPanel` gains `density: 'comfortable'`: the compact key read from a distance.

| What | Value |
|---|---|
| Width | 22rem |
| Panel title and blocks' titles | `label-lg-strong` (16) |
| Blocks | 12 / 16, 6 between their head and their rows |
| Head and body | the compact rhythm (8 / 12, 0 8 8), so the blocks' 16 stays concentric with the panel's 24 |

`MapLegendPanel` takes **`comfortable` by default**; `density="compact"` is ADR-0226's 18rem key. In `comfortable`:

- **Rows**: 36px (2.25rem). The 32px actions fit without pushing them.
- **Words**: `label-lg` (16), `spacing-md` after the mark.
- **The indicator's chip**: at the titles' 16.
- **The marks**: in a 24px box (1.5rem), a step up. The internal `ChartLegendMark` gains `size="md"`:

  | Mark | Size |
  |---|---|
  | Fill and ring | 14 |
  | Point | 8 |
  | Zone | 18 × 14 |
  | Dot and circle | 12 |
  | Line | 20 |
  | Glyph | 24 |

A variant at 20rem with 2rem rows was tried in the product and set aside.

## Measured

At 1 000 (Storybook, Chromium, « Densités »):

| | Comfortable | Compact |
|---|---|---|
| Panel | 352 wide (534 high on the story's key) | 288 × 428 |
| Head | 48, title 16px | 48, title 14px |
| `x` | 32, transparent at rest | 32 |
| Blocks' inner | 332 wide, padding 12 / 16, titles 16px | 268, titles 14px |
| Rows | 300 × 36, words 16px | 244 × 28, words 14px |
| Marks | fill 14, glyph 24, point 8, zone 18 × 14, ring 14 | as before |

The block's actions and the rows' share one column of glyphs (x 326 for the eyes). In the product, the Dynamic baseline's
key goes from 288 × 488 to 352 × 610.
