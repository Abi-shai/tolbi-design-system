# ADR-0176 — Modules on a plate

**Status**: accepted (the owner, 14 Nov. 2026, on captures of the home page; etolbi
`.context/accueil-paper/modules-plaque-teintes.png`, row T4).

## Decision

On `ModulesList layout="page"`, each module's drawing sits on **a plate**, a new element `ds-modules-list__plate`.

**What does not move**
- The tile stays a 6.5rem square, bordered (`border-subtle`, `radius-surface`, `bg-default`).
- The drawing stays at 40px and the label is unchanged.
- The drawer (`layout="panel"`) is unchanged: there the plate is `display: contents`, a box of no box.

**Inside the tile**
- The tile is padded 6px (`spacing-sm`) on all four sides, with `spacing-sm` between plate and label. The content
  is aligned from the top.
- The plate takes the tile's whole inner width (`align-self: stretch`) and the height the label leaves
  (`flex: 1`): **90 × 64**. The drawing is centred in it.
- **Its ground is `--ds-bg-brand-subtlest`, minted**: `brand/25` in light; in dark, `brand/dark-subtle` at 50 %,
  half of `bg-brand-subtle`. It holds no text, so it has no on-colour partner.
- **Its curve is `--ds-radius-surface-sm` (10px).** No new radius role was minted, though the request suggested
  `radius-inner-lg`: 10px is the `radius-lg` step, which already has its role, and a step takes one role
  (ADR-0013). `surface-sm` is « the step between a control and a surface — nested rows », which a plate in a tile is.
  It is softer than the concentric 12 − 6.

**States**
- **The plate answers the pointer, not the tile.** The tile stays `bg-default` on hover; the plate goes to
  `bg-brand-subtle` (`brand-50`) over `quick`, with no transition under reduced motion. The ↗ arrow in the top-right
  corner stays.
- **Current module**: the tile stays `bg-default` (it was `bg-selected`). The plate is `bg-brand-subtle` at rest and
  `bg-brand-subtle-hover` (`brand-100`) under the pointer. The label keeps ADR-0050's ink.
- **Disabled**: unchanged (opacity 0.35).

## Measured (`Navigation/ModulesList` « Sur une page »)

| What | Value |
|---|---|
| Tile | 104 × 104, `bg-default` at rest and on hover |
| Plate | 90 × 64, `rgb(246, 249, 248)`, 10px |
| Plate, hovered | `rgb(230, 240, 235)`, brand-50 |
| Current module's plate | brand-50 |
| Drawer, current entry | 66 × 90, `bg-selected`, the plate `display: contents` |
| The story's play test | passes |
