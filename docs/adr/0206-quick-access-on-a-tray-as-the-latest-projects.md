# ADR-0206 — Quick access on a tray, as « Derniers projets »

**Status**: accepted (the owner, 17 Nov. 2026). This amends ADR-0167 and ADR-0176 for `ModulesList layout="page"`;
the drawer (`panel`) is unchanged.

## Context

« Accès rapide » (`ModulesList layout="page"`) now sits on a titled `Tray`, as « Derniers projets » and « Quelques
articles à lire » do (ADR-0205); the product already sets it so. On the tray's white surface each logo stacked three
layers: its plate, its bordered tile, and the tray. Looking at the real page, hover included, the owner chose the
logic of `ProjectList`'s rows.

## Decision

### At rest

- **The tile loses its border and its ground** (transparent). The tray groups, as it does for project rows and
  article cards.
- **The plate behind the logo takes a project's picture's grey**, `bg-neutral` (as `.ds-project-list__picture`), in
  place of `bg-brand-subtlest`.
- Sizes, the plate's curve, the name and the grid (6.5rem, `spacing-lg`, wrapping) are unchanged.

### Under the pointer and on keyboard focus

- **The whole tile** takes the tray's hover, `var(--on-tray-hover, var(--ds-bg-neutral-subtle-hover))`, at
  `radius-surface`, with the row's ring (`--ds-focus-ring-brand-shadow-xs`).
- **The plate stays `bg-neutral`.** The tile now answers, not the plate, and the plate no longer turns green.
- The ↗ arrow in the corner stays.

**The plate melts into the hovered tile.** `bg-neutral` and `bg-neutral-subtle-hover` are one grey (gray-light/100),
so the two measure 1.000:1 under the pointer: the drawing appears to sit on one grey block. A `ProjectList` row's
picture does the same, and that is the logic chosen. If the plate must stay visible, ArticleCard's answer exists: the
plate would step to `--on-tray-hover-strong` (ADR-0199).

### The current module

The current module keeps its mark:
- its plate `bg-brand-subtle`, `bg-brand-subtle-hover` under the pointer;
- its name in `text-on-brand-subtle`, strong;
- on its tile, transparent at rest and the tray's hover under the pointer.

### Off a tray

The page layout is used on the home page only, so **the same rule holds everywhere**. Off a tray, the hover falls
back to the same `bg-neutral-subtle-hover`.

## Measured (`Navigation/ModulesList`, « Sur une page », on a titled tray)

| State | Tile | Plate |
|---|---|---|
| Rest | 104 × 104, transparent, no border | `rgb(242, 244, 247)` |
| Hover | `rgb(242, 244, 247)` | `rgb(242, 244, 247)` |
| Current, at rest | transparent | `rgb(230, 240, 235)`, name `rgb(4, 75, 40)` |
| Current, hovered | `rgb(242, 244, 247)` | `rgb(178, 209, 193)` |
