# ADR-0244 — The modules panel stands off the page

**Status**: accepted (the product's feedback of 20 Nov. 2026, track D of three). Amends ADR-0212 (the drawer on the tray)
and ADR-0234 (the tray's ground).

## Context

The panel the app bar's « Modules » button opens (`ModulesList` panel) is a `Tray`: a `bg-neutral` ground under a white
surface. But `bg-neutral` is also the page's grey. Open, the panel melted into it. The owner wants it to stand off, like
the home page's trays (« Accès rapide »).

The product tried three tracks in etolbi with injected CSS:

- **B**: grey plates under the icons;
- **C**: plates, a greyer tray and a title;
- **D**: a greyer tray and a title, no plates. **Retained.**

## Decision (D)

- **The panel's tray is one step greyer than the page**: `bg-neutral-hover` (gray-light 200; gray-forest 600 in dark,
  rising as every dark layer does) in place of `bg-neutral`. Rejected: the plates of B and C.
- **A title in the tray**, above the white surface: « Modules ». It is a **`Tray` title** — the home page's « Accès
  rapide » — not a second drawing.
  - `heading-sm` renders exactly as the brief's `label-lg-strong` (16/24, semibold, `text-strong`).
  - The tray's own head geometry is kept (`spacing-xs` above, `spacing-md` beside and below), so the panel's title and
    the home page's trays' titles are one.
  - It is an `h2`, and the tray becomes a region named by it.
- **The title is the product's**: `HorizontalNavigation modulesTitle` (« Modules » by default), passed to the new
  `ModulesList title` (panel only), as `homeLabel` is.
- **Unchanged**: the white surface, the icons without plates, hover and the active state.

**How the ground is set.** The tray reads a private context variable, now named **`--tray-ground`** and set by whoever
holds the tray. Under ADR-0234 it was `--on-door-tray-ground`, set by `Door` alone. Now two containers set it:

- `Door` keeps its lighter grey;
- the modules' panel takes `bg-neutral-hover`.

The white surface resets it, so a tray inside a tray does not inherit it.

## Measured

In Storybook at 1 280 (« Accueil »), with the panel open:

| What | Value |
|---|---|
| Panel | 276 × 330 |
| Tray ground | `rgb(234, 236, 240)` (gray-light 200) |
| Title | « Modules », `h2`, `600 16px / 24px` |
| White surface and rows | unchanged |

Plays: every `HorizontalNavigation`, `ModulesList`, `Door` and `Tray` story passes.

## Consequences

In etolbi there is nothing to change. Passing `modules-title` is optional; it defaults to « Modules ».
