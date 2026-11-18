# ADR-0224 — One family of curves on a map

**Status**: accepted (the product's brief « carte SIG : une famille d'arrondis, le pli d'un panneau, la légende »,
18 Nov. 2026; applied locally in etolbi first). **Lot 1 of 2**: the curves, the fold's API, a panel's height, rule and
density, `PanelBlock #title`, the icons. The fold's new motion and the legend component are lot 2.

## Context

On a GIS map two families stood side by side.

- **Pills**: the timeline, the « Carte | Analytics » switch and Tolbi xAI's launcher.
- **Squarer shapes**: the tools column, the panels and the tool card at 12px, their buttons at 8px (ADR-0177's return
  to 0.143).

The product decided that everything rounds.

## Decision

### The rule, and three tokens to hold it

**A control on a map is a pill, its buttons round.** This applies to:

- the tools column (`MapNavigator`) and its `IconButton`s, which are no longer `shape="square"`;
- the capsule a folded `MapPanel` becomes;
- `MapTimeline`;
- the top bar's switch, which already was one.

**A surface read on a map is 24px**: `MapPanel` (`sm` and `lg`) and the tools column's card, which holds the search,
the filters and the mini-map.

**Its blocks are 16px**: the `Card`s a panel holds (`PanelBlock`, `SectionCard`, `Card sunk`) and the mini-map.

- **Concentric**: 16 is concentric with 24 at 8px of padding — the compact panel's and the tool card's.
- **The default panel's 16px of padding**: concentric there would be 8. The product chose 16 everywhere: one curve per
  level, rather than one per padding.

**The tokens**: the family is set in one place, so it can be turned in one place:

| Token | Value | Holds |
|---|---|---|
| `--ds-radius-map-control` | `radius-full` | the controls |
| `--ds-radius-map-surface` | `radius-4xl` (24) | the surfaces read on a map |
| `--ds-radius-map-block` | `radius-2xl` (16) | the blocks inside them |

The 24px primitive had no role until now.

**How a block gets its radius.** `Card` still owns its radius (ADR-0006): it is not a prop. A map surface hands its
blocks the family through `--on-glass-block-radius`, as it hands them its glass. ADR-0177 had deleted the `--on-glass-*`
radii because nested blocks were to keep their own; the product now asks for one family on the map, so the context
returns, for blocks only.

### The fold of a `lg` panel: `foldIcon` and `foldPlacement`

- **`foldIcon`** (default `panel-left`) is the glyph of the control the panel folds into: `sliders-horizontal` for a
  legend.
- **`foldPlacement: 'start' | 'end'`**:
  - `start` is ADR-0189's fold, unchanged. The head's button is the folded control's own, carried between its two places
    with the stretch.
  - `end` closes the title's line with a `x`, before a close if there is one. It is a different button from the
    control, so it leaves with the content and is **not** carried (`data-map-panel-rides` marks the one that is).
- **Unchanged**: the capsule, its place (the panel's corner) and the focus.

### A `lg` panel's height, rule and density

**`fit`**:

- `fill` (default) takes the place's height (ADR-0103);
- `content` hugs its content and scrolls once the place runs out — a key is as tall as what it lists.

**`divided`** (default `true`): `false` drops the rule under the head. On the legend it cut « Légende » from its blocks.

**`density="compact"`** is a key read at a glance, not a screen read through:

- the panel is 18rem wide;
- the head is 8 / 12;
- the body is 0 8 8, with 8 between its blocks.

It also reaches the blocks through three variant switches `SectionCard` reads (ADR-0010):

| Switch | Value |
|---|---|
| `--section-card-compact-padding` | 8 / 12 |
| `--section-card-compact-gap` | 4 |
| `--section-card-title-font` | `label-md-strong` |

### `PanelBlock #title`

The indicator's block carries the indicator's menu in place of its title (Felt).

- **`PanelBlock` / `SectionCard` `#title`**: the slot is what the line shows. The heading keeps `title`, visually hidden,
  so the block is still named by it.
- **Shrinking**: what the slot puts on the line gives before the actions do.
- **`#aside`** already held several `IconButton`s (`info`, `eye`).
- **The menu**: it is the legend's and the timeline's chip (`DropdownTrigger chrome="chip"`, `label-md-strong`). The
  `ghost` trigger at 16px ran into the actions in an 18rem panel.

### Icons

`focus` (« Afficher seulement » a row) and `sliders-horizontal` (a legend's folded control) join the manifest, which now
has 199 icons. `crosshair` stays the control points' glyph.

## Measured

At 1 440 (Storybook, Chromium).

**The GIS screen**:

| What | Value |
|---|---|
| Column | 52 × 386, radius 9999 |
| Column's buttons | 40 round |
| Panel | 400 × 796, radius 24 |
| Timeline | radius 9999 |

**The compact key**:

| What | Value |
|---|---|
| Panel | 288 wide, radius 24, its content's height (284) |
| Head | 52 high, padding 8 / 12, no rule |
| Fold | 40 round at the line's end |
| Body | 0 8 8 |
| Blocks | radius 16, inner 8 / 12, titles 14 / 600 |
| Folded | capsule 52 round, the button 40 round at 6 in, focus on « Afficher Légende » |

## Still open (lot 2)

- **The fold's motion**: the panel born from the capsule's disc and closing into it, a `clip-path: inset(...) round`
  travelling from the capsule to the whole panel. In over `considered`, the content after 160ms; out over `process`,
  the content first. It is to be filmed before it ships.
- **The legend component** (Felt): one block per family; the indicator's menu, `i` and the eye; rows with a mark and a
  label; « Afficher seulement » (`focus`) and the eye revealed on hover and on keyboard focus.
