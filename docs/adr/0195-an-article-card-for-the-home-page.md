# ADR-0195 — An article card for the home page

**Status**: accepted (the owner, 16 Nov. 2026 — track B, variant G2). This adds `ArticleCard` and `ArticleList`.

## Context

The home page (banner · quick access · latest projects) gets back a « À lire » section: Tolbi's articles published
for the app (the articles API, `is_for_web = false`, three today). The old section predates the package (Nuxt UI,
Inter, hand-written px), and the package had no article card. The owner chose cards in `ModulesList`'s « Accès
rapide » grammar (track B) on a marked grey (G2).

## Decision

### `ArticleCard`

**Content, from the top:**
- the article's picture, 16:9, `object-fit: cover`, `radius-control`, set inside the card's inset;
- the title, `label-md-strong`, `text-strong`, **two lines at most** (an ellipsis past them);
- one line of facts, `body-sm`, `text-subtle`: « {type} · {date} », written by the product (`meta`).

**Surface.**
- `bg-neutral`, **no edge**, `radius-surface`, a `spacing-sm` inset.
- `spacing-md` between the picture and the words, and the words a further `spacing-xs` in.
- `bg-neutral-subtle` (`Card sunk`) read too faint.
- The frame behind the picture is `bg-neutral-strong`.

**A link.**
- With `href` it is an `<a>`, opening in a new tab by default (`target="_blank"`, `rel="noopener"`; `newTab`).
- The new tab is **said to a reader**: `aria-describedby` points to a hidden « S'ouvre dans un nouvel onglet »
  (`newTabLabel`).
- **The link's name is the title alone** (`aria-label`): from its content it would also have read the facts and
  the hint.

**Hover and focus.**
- The ground **darkens a step**: a veil of `text-strong` at 7 % over `bg-neutral`, ADR-0111's veil. It stacks in
  both modes, where a fixed grey would not.
- Focus also shows `focus-ring-brand-shadow-xs`, as `ProjectList`'s rows do.
- Nothing moves; under reduced motion the colour changes without a transition.

**No picture, or a broken one.**
- The 16:9 frame stays, with `file-text` at its centre, so the card never changes size.
- The card owns its `<img>`'s failure (ADR-0040's rule): `@error` falls back, and a new `image` resets it.
- `imageAlt` is empty by default, because the title is beside the picture.

**Loading** shows the same geometry:
- a 16:9 placeholder and three text lines;
- `Skeleton surface="tinted"`, because the default greys are the card's own ground;
- the words' box holds three line boxes, so the placeholder is **exactly** the real card's height.

### `ArticleList`

`ProjectList`'s counterpart: `items` (`id`, `title`, `href`, `image`, `imageAlt`, `meta`), `loading` and
`loadingCount` (3).

- **Three equal columns**, `spacing-lg` apart.
- **One column under 40rem of its own width.** It is a container query, as `Dialog`'s: the package has no
  breakpoints (ADR-0020).
- Nothing to show and nothing loading renders nothing.
- The section's title (« À lire », `heading-md`) and « Voir tout » are the product's.

## Measured (`Données/ArticleList`, 1 100px)

| What | Value |
|---|---|
| Cards | 359 × 281, the picture's frame 347 × 195 (16:9) |
| Loading | 359 × 281, the same |
| Under 40rem (420px) | one column, frame 408 × 230 |
| Rest / hover ground | `rgb(242, 244, 247)` → `color(srgb 0.887 0.896 0.912)` |
| Link | `target="_blank"`, `rel="noopener"`, name = the title, description « S'ouvre dans un nouvel onglet » |
| A long title | two lines, then cut |
| A broken picture | the frame (328 × 185 at 340px) and `file-text`, the card's height unchanged |

## For the product, once installed

- A « À lire » section on the home page, under « Derniers projets », filled from the existing articles store.
- `section-articles.vue` and `card-article.vue` removed.
