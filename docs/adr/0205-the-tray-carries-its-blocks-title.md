# ADR-0205 — The tray carries its block's title

**Status**: accepted (the owner, 17 Nov. 2026 — track T1). This amends ADR-0198.

## Context

On the home page, « Derniers projets » (`ProjectList`) and « Quelques articles à lire » (`ArticleList`) each sit on a
`Tray`. Their title (`heading-md`) and « Voir tout » were set by the product **above** the tray, outside it.

The owner compared two placements on the real page:
- **T1**: the title in the grey tray, above the white surface;
- **T2**: the title in the white surface, with a rule under it.

He retained **T1**: the grey carries the title and the white the content, so the block reads as one group.

## Decision

### `Tray` takes a title and an action

- **API**: `title?: string`, `headingLevel?: 2 | 3 | 4` (2 by default, as the home page wants an `h2`), and an
  `#action` slot (« Voir tout », a `Button variant="link" size="sm" icon-trailing="arrow-right"`).
- **The line**: in the tray's `bg-neutral-subtle`, above the white surface. The title is at the start and the action
  at the end, centred on each other.
- **Typography**: `heading-sm` (16), `text-strong`. That is one step under the old `heading-md` set outside the block,
  because the title is now inside it.
- **Insets**: the line is `spacing-xs` above and `spacing-md` at the sides and below, inside the tray's own
  `spacing-md`. So the title stands on the white surface's **inner edge** (16px from the tray's edge).
- **Accessibility**: with a title, the tray is a `<section>` named by it (`aria-labelledby`), a region. A screen
  reader hears « Derniers projets, région ».
- **Without `title`**, the tray is unchanged: a `div`, the surface 8px from its top.

### `ProjectList` and `ArticleList` pass it on

- They take `title`, `headingLevel` and `#action`, and hand them to the tray they compose.
- **While loading**, the tray and its title are there, with the placeholders in the surface.
- **With nothing to show**, nothing renders: the title is never left alone.

## Measured (`Données/ProjectList` and `Données/ArticleList`, « Avec titre »)

| What | Value |
|---|---|
| Element and name | `<section>` named « Derniers projets » / « Quelques articles à lire »; the title an `h2` at 16px / 600 |
| Title's x | 16 from the tray's edge, the surface's inner edge (16) |
| Title's top | 13 from the tray's edge (8 + 4, and 1px from centring on the link's taller box) |
| Title → surface | 9 |
| « Voir tout » | 16 from the right edge, centred on the title (0px off) |
| Loading, articles | the titled tray and 12 placeholders |
| Untitled `Tray` | unchanged: a `div`, the surface 8 from its top |

## For the product

`home/project-grid.vue` and `home/articles.vue` stop setting their `h2` and « Voir tout » above the list, and pass
them to the list: `title` and `#action`.
