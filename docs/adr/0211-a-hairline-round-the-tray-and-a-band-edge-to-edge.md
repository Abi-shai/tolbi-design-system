# ADR-0211 — A hairline round the tray, and a band edge to edge

**Status**: accepted (the owner, 17 Nov. 2026). This amends ADR-0198 and ADR-0202.

## Context

The owner made two observations on the home page.

**The trays.** `Tray` is the frame behind `ProjectList`, `ArticleList` and `ActionList`: a `bg-neutral-subtle` ground
around a white surface. It lay on the page's white with no edge, and its very soft grey was lost on the white.

The owner compared five edges on the real page:

- `border-subtlest`;
- a grey between the two (#eef0f4);
- black at 5 %;
- `border-subtle`;
- `border-default`.

He retained **`border-subtlest`**, the most discreet: the edge is guessed, not seen as a frame.

**The module band.** `ModuleBanner` was a rounded surface (`radius-surface`) between the bar and the content, at the
column's edges. It scrolls, but its four corners closed it and it read as one more card.

The retained band **overflows**: on the left it passes under the navigation column, on the right it leaves through the
window's edge. That overflow is what says it scrolls.

## Decision

### The tray's hairline

`.ds-tray` takes `border: border-width-default solid border-subtlest`, inside its `radius-surface-lg`. The tray is
already `border-box`, so its width does not move; its height grows by the 2px of the border. The white surface inside
has no border. The ground, the padding, the title and the hovers (ADR-0199/0207) are unchanged.

In dark, the role takes its dark value, `gray-forest-800`. That is the tray's own dark ground, so there the hairline
merges into it. The tray's edge against the page is then its ground's own step.

### `ModuleBanner bleed`

`bleed` is a boolean that removes the corners (`border-radius: 0`). These do not change: the ground (`gray-light-800`),
the padding (`spacing-sm` / `spacing-lg`), the gap between capsules, the marquee, the pause and the drag.

There is **no fade and no mask** at the edges. The clean cut comes from what passes over the band: the navigation on
the left, the window's edge on the right.

**The cut is at the band's edge.** As first written, the marquee's window sat inside the band's side padding, so the
capsules were cut 12px before the window's edge, against the band's own ground. In `bleed`, the window now reaches
through that padding (`margin-inline: −lg`) and keeps it as its own padding. The run therefore starts where it did, and
the clip falls on the band's edge.

## Measured

| What | Value |
|---|---|
| Tray border, light | 1px `rgb(242, 244, 247)` on a `rgb(249, 250, 251)` ground, radius 16 |
| Tray border, dark | 1px `rgb(38, 49, 43)`, the ground itself |
| Surface inside | no border; 9px from the tray's outer edge (1 + 8) |
| Widths | `ActionList` 344, `ProjectList` 1100: unchanged |
| `bleed` band | radius 0, padding 6 / 12, 72px high |
| `bleed` marquee window | 0 → 1200 at a 1200px window (was 12 → 1188) |
| Marquee without `bleed` | radius 12, unchanged |

## Consequences

The product passes `bleed` to the home page's `ModuleBanner` and lays it across the window. Its navigation column, with
an opaque ground, passes over the band (already coded in the product, d52a57f1). Nothing changes on the product side for
the trays.
