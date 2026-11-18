# ADR-0226 — The map's key

**Status**: accepted (the product's brief, 18 Nov. 2026, points 4 and 5; the product's local `legend-panel.vue` taken
into the package). Lot 2 of ADR-0224, its second half. It is to replace `MapLegend` at the top of the map.

## Context

The product drew the map's legend after Felt, in a `MapPanel` it had to bend from the outside:

- `PanelBlock`'s title hidden in CSS and redrawn as a menu;
- the actions placed by hand;
- the motion its own.

ADR-0224 and ADR-0225 gave the panel what a key needs: `compact`, `fit="content"`, no rule, the fold at the end and the
cut. What was left was the key itself.

## Decision

### `MapLegendPanel`

`MapLegendPanel` is `MapPanel` as a key, rendered rather than redrawn (ADR-0001):

- `lg`, `density="compact"`, `fit="content"`, `:divided="false"`;
- titled « Légende »;
- folding from the end of its line into a `sliders-horizontal` control (`v-model:collapsed`).

**One block per family** (`groups`, each a `PanelBlock`).

**The first block carries the indicator** when there is one (`metrics`):

- its title is the indicator's menu (`v-model:metric`): the legend's and the timeline's chip, in `PanelBlock #title`,
  its word pulled onto the other titles' edge (measured: 38 = 38);
- with a single indicator, its name is the title;
- its actions are « À propos » (`metricHelp`, an `info` button whose tooltip says what the indicator means) and the eye,
  which hides the indicator's layer (`v-model:metric-hidden`). While the layer is hidden, its rows are greyed.

**A row is a mark and a word.** There is no count.

- **The mark is the map's own**: a glyph, a fill (`square`), a point, a zone or a ring. A ring is the one shape
  `ChartLegend` did not have; it is now `ring`, an outline with no fill (a perimeter, a buffer).
- **The marks are `ChartLegend`'s.** Its mark rendering moved into an internal `ChartLegendMark` that both draw.
  Measured unchanged: the same sizes and the same margins in `columns`.

### The row's actions

**« Afficher seulement »** (`focus`):

- the row alone in its family — pressed (`aria-pressed`) while it is;
- pressed again, the family back whole;
- other families are left as they are;
- a family of one row has none.

**The eye** hides the row. Its glyph and its name turn (`eye` → `eye-off`, « Masquer » → « Afficher »), with no
`aria-pressed`: a changing name or a pressed state, never both (ADR-0151). A hidden row is greyed: the mark at 0.4, the
word `text-disabled`.

**One model holds what is hidden**: `v-model:hidden`, the rows' values. « Afficher seulement » writes into it too.

Every action has its tooltip.

### The actions show on approach

Point 4 of the brief:

- **When**: a row's actions show with the pointer over the row or the keyboard's focus in it; the block's show with the
  pointer over the block or the focus in its actions.
- **How**: opacity alone, over `quick` (ADR-0111's motion). There is **no ground on the row**; each button has its own
  hover.
- **What stays**: an action that carries a state — a row alone, a row hidden, the indicator hidden.
- **The keyboard**: the actions are still in the tab order.
- **Without hover** (a touch screen), they are always there.

### `PanelBlock #aside` holds actions

From the owner, mid-brief. `#aside`'s `IconButton xs` (a 32px box) on a 20px title line:

- were hung from the line's top;
- were `spacing-md` apart;
- stood inside the padding.

In an 18rem key, two of them cut « Indice de stock · 2026 ». Now they are:

- **centred on the line** — they lend 6px above and below, so the head keeps the title's height;
- **`spacing-xxs` apart**;
- **pulled `spacing-md` into the block's padding** — the glyph's own inset — so their glyphs stand in the column of the
  rows' actions. Measured: x 232 and 266, on both lines.

A `Badge` or a count in `#aside` is untouched.

### Rows

- **Height**: 28px.
- **The mark**: in a 20px box (a glyph's), so the words make one column.
- **The word**: `label-md`, one line, cut.
- **The actions**: `IconButton xs`, pulled in like the block's.

## Measured

At 900 (Storybook, Chromium, « Sur la carte »):

| What | Value |
|---|---|
| Panel | 288 wide, its content's height (432) |
| Rows | 244 × 28 |
| Actions' glyphs | x 232 and 266 on the block's line and on every row; right edge 282 = the content's edge |

The story's play guards:

- « Afficher seulement » pressed, the family's other rows hidden (« Afficher Point du projet »), then released;
- a row's eye turning its name;
- the indicator's eye.

## Consequences

The product:

- replaces its `legend-panel.vue` with `MapLegendPanel`;
- passes `groups`, `metrics` and the three models;
- draws the map from `hidden` and `metric-hidden`.

`MapLegend` stays until the product has moved: the key is to replace it at the top of the map.
