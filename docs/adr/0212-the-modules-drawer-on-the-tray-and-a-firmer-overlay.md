# ADR-0212 — The modules drawer on the tray, and a firmer overlay shadow

**Status**: accepted (the owner, 17 Nov. 2026). This amends ADR-0163 and ADR-0211, and changes `elevation-overlay`.

## Context

The bar's « Modules » menu (`ModulesList` in `HorizontalNavigation`) already had the tray's look: a `bg-neutral-subtle`
ground with a white surface inside. But its frame was a copy of `Tray`'s, and the copy had drifted:

- it had no hairline (ADR-0211);
- its padding was `spacing-sm`;
- its corner was `radius-surface`.

Its shadow, `elevation-overlay` (`shadow-lg`), was too soft: the menu did not feel above the page.

On the real page the owner compared `shadow-lg` (the current one), `shadow-xl`, `shadow-2xl` alone, and `shadow-2xl` +
`shadow-md`:

- `lg` and `xl` do not stand out from the page enough.
- `2xl` alone has a soft edge.

He retained **the tray as it is** and **`shadow-2xl` + `shadow-md`**.

## Decision

### The drawer renders `Tray`

The drawer's frame is not copied: in the `panel` layout, `ModulesList`'s root **is a `Tray`**. The ground, the padding
(`spacing-md`), the `border-subtlest` hairline and the corner (`radius-surface-lg`) are therefore the tray's, and the two
can no longer drift apart (ADR-0001).

**`Tray` gains `surface`** (default `true`). With `false`, the tray is its ground and frame alone, and what it holds
draws its own white surface. The drawer needs this because its white surface is the scroller: it is clipped, it scrolls,
and it carries the end fade and the thumb (ADR-0163).

The drawer keeps:

- its own elevation (ADR-0006);
- `inline-flex`;
- `width: auto`, because it hugs its columns where a tray takes its column's width.

`layout="page"` is unchanged: it sits in the product's tray and draws nothing (no frame, no shadow).

### `elevation-overlay` = `shadow-2xl` + `shadow-md`

The role changes, not this one menu. The wide halo says « above »; the short shadow draws the edge.

Everything that floats takes it, on purpose: the same height for everything that opens over the page. That includes
`Dropdown`, `InputDropdown`, `Toast`, `ChartTooltip` and this drawer.

In dark, the two shadows take their dark values (×5 on `gray-forest/950`, ADR-0030). The elevation is still re-emitted in
`elevation-dark.css`.

## Measured

| What | Before | After |
|---|---|---|
| Drawer (more than six modules) | 270 wide | 276 × 294 |
| Drawer padding | `spacing-sm` | 8 |
| Drawer hairline | none | 1px `rgb(242, 244, 247)` |
| Drawer corner | `radius-surface` | 16 |
| Drawer white surface from the outer edge | — | 9px |
| Drawer visible height | 276 | **276**, unchanged (two rows and the third's drawing) |
| Drawer, six modules or fewer | — | 276 × 230, hugging two rows (212) |
| `layout="page"` | — | no padding, border, ground or shadow, unchanged |
| `elevation-overlay` resolved | `shadow-lg` | `rgba(16, 24, 40, .18) 0 24px 48px −12px`, then `shadow-md`'s two layers |

44 stories of `ModulesList`, `HorizontalNavigation`, `Dropdown`, `InputDropdown`, `Toast` and `Tray` render and pass
their `play`.

## Consequences

Nothing changes on the product side. Every floating surface reads a step higher; nothing moves.
