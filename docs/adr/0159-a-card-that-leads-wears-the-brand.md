# ADR-0159 — A card that leads wears the brand

**Status**: accepted (etolbi, 12 Nov. 2026; Figma « Design Week 19-05-25 », node `3:5143`)

## Context

The product asked for the owner's earlier card, « Sélectionner une liste de producteurs », on every `OptionCard` that
leads somewhere: one with `href`, or with a click and no `value`. The drawing has:

- a 48px tile in `#e6f0eb` (brand/50);
- the icon and the title in `#056033` (brand/600);
- the title at 18/28 and the description at 14/20;
- the chevron centred on the card.

On a **choosing** card (radio, checkbox) the brand already says « this one is chosen » (ADR-0086). It must keep
meaning that alone, so choosing cards do not change.

## Decision

A class, `ds-option-card--link`, set when the card leads and is **not** one of these:

- **a choice**, which keeps its own language;
- **a card that holds an action** (ADR-0126), which is not a control;
- **a 40px row** (ADR-0143): a 48px tile and an 18px title do not fit its line;
- **disabled**, which shows no green, as before;
- **muted** (ADR-0151), whose pale look must stay unmistakable.

**At rest**:

| Part | Value |
|---|---|
| Tile | 48px (`spacing-6xl`), `bg-brand-subtle` |
| Tile glyph | `text-on-brand-subtle` |
| Title | `label-xl-strong`, `text-brand` |
| Chevron | centred on the card (`align-self: center`), no longer on the title's line |
| Meta | keeps the title's line box |
| Description, border, radius, padding | unchanged |

The glyph on the tile takes **the tint's exact partner**, not the drawing's brand/600. ADR-0009 pairs every tint with
its on-colour: in light that is one step darker (brand/700, 8.83:1), in dark the same value (brand/200). The title at
rest stands on `bg-default`, so it takes `text-brand` as drawn (7.70:1).

**Hover, and the keyboard's focus with its ring added**: the whole card becomes the tile.

- **Ground**: the card takes `bg-brand-subtle`, and its border melts into it. The tile dissolves into it and the
  glyph stands alone, as the product intended.
- **Inks**: on the tint, the title and the chevron take `text-on-brand-subtle`. That is also `text-brand-hover`, so
  the ink darkens one step in light and stays put in dark. The description keeps `text-subtle`, 6.60:1 on the tint.
- **Chevron**: it moves `translateX(2px)`.
- **Pressed** (`:active`): ground and border take `bg-brand-subtle-hover`.

**Motion**: background, border, colour and transform over `duration-moderate` and `easing-default`. The focus ring
stays `instant` (ADR-0022). Under reduced motion the colours still turn and the chevron does not move.

The rule « hover is the contour alone » (ADR-0086) stays for every other card. It was written so a ground would not
swallow a tile; here swallowing the tile is the drawing's point.

## Measured

`Saisie/OptionList/Card` « Une rangée qui mène »:

| State | Light | Dark |
|---|---|---|
| Rest | card white with border `border-subtle`; tile 48 on rgb(230, 240, 235), glyph rgb(4, 75, 40); title 18px / 600 in rgb(5, 96, 51); chevron centred (0px from the card's middle) | |
| Hover | ground and border rgb(230, 240, 235); title and chevron rgb(4, 75, 40); chevron shifted 2px | ground rgb(20, 46, 34), title brand/200 |
| Focus (Tab) | as hover, plus the brand ring | as hover, plus the brand ring |

Untouched: the choosing cards of `OptionList` « Type de projet » (title `text-strong`, no tile), the 40px rows (28px
tile, `text-strong`), and the disabled card (`text-disabled`, 40px tile).
