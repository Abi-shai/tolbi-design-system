# ADR-0004 — Lucide is the icon set

**Date:** 2026-08-25
**Status:** Accepted
**Source of truth:** Figma `Foundational Visual Identity` (`xEymBbUrCcA2mOtnoiLndT`) — frame
`Icons/Lucide` (node 31:2) for the set, `Stroke effectif` (node 34:12) for the size scale

## Context

The system shipped 828 hand-copied Untitled UI icon components. The product has moved to
[Lucide](https://lucide.dev), and Figma now publishes the exact subset the product uses across its
experiences and flows — 189 icons, not all ~2000 of Lucide.

## Decisions

### The set is generated, never hand-authored

`scripts/icons.manifest.txt` lists the 189 Lucide names from the Figma frame. `npm run icons`
reads it, pulls the real SVGs from the `lucide-static` package, and writes
`components/Icon/icons/*.vue` plus `components/Icon/registry.ts`.

Hand-copying icons is what produced 828 files nobody could audit against a source. The generator
rebuilds the directory from scratch, so removing a name from the manifest removes its file, and it
throws on a name Lucide does not have rather than silently emitting a broken icon.

`lucide-static` is a **devDependency** — the generated `.vue` files are committed, so consumers
never pull it.

### The set is a subset, deliberately

189 icons, matching Figma. Not all of Lucide. Adding an icon is a design decision that happens in
Figma first, then in the manifest — not an import statement someone reaches for.

### Sizes: four values, stroke uncompensated

`IconSize = 16 | 20 | 24 | 32`. Icons are drawn on a 24px grid at `stroke-width: 2` and the stroke
scales with the box, so the effective stroke is `2 × size / 24`:

| Size | Effective stroke |
|---|---|
| 16px | 1.33 |
| 20px | 1.67 |
| 24px | 2.00 |
| 32px | 2.67 |

The weight is **not** compensated at small sizes — thinner at 16, heavier at 32. This is what the
Figma frame specifies, and matching it means plain uniform SVG scaling with no `vector-effect` or
per-size stroke override.

### Control ornaments are exempt from the scale

`Icon`'s `size` accepts an arbitrary number, not just an `IconSize`. Glyphs *inside* a control —
a `Checkbox` tick, a `Tag` close affordance, a `Badge` icon — track the control's own size variant
and drop to 10–14px. They are ornaments, not icons.

Forcing the 16px floor on them would overflow `Checkbox` sm's 16px box and `Tag` sm's close slot,
i.e. it would be a component-layer redesign disguised as a token change. The scale binds standalone
icons; the type carries `IconSize | (number & {})` so the four values still autocomplete.

Tightening the ornament sizes onto a documented sub-tier is a component-layer task, not a
foundations one.

## Name migration

Untitled UI names did not survive. Every usage was repointed — 80 replacements across 24 files.
The non-obvious ones:

| Old | New | Note |
|---|---|---|
| `x-close` | `x` | |
| `dots-vertical` | `ellipsis-vertical` | |
| `edit-01` | `square-pen` | Lucide's conventional edit affordance |
| `trash-01` | `trash-2` | the lidded can with lines; `trash` is the plain one |
| `help-circle` | `circle-question-mark` | |
| `alert-circle` | `circle-alert` | Lucide puts the shape first |
| `home-01` / `home-05` / `home-line` | `house` | three variants collapsed to one |
| `dots-grid` / `grid-01` | `layout-grid` | module launcher and grid toggle |
| `search-md` | `search` | |
| `message-smile-circle` | `message-circle-more` | |
| `layers-two-01` | `layers` | |

Two names had no equivalent in the set, both in stories rather than shipped components:
`briefcase-01` → `building-2` (a company-details step) and `heart` → `leaf` (a colour demo). **No
shipped component lost an icon.**

## Consequence

The bundle roughly halved — `dist/index.js` 1,473 kB → 740 kB, 985 modules → 346 — because the set
went from 828 icons to 189.
