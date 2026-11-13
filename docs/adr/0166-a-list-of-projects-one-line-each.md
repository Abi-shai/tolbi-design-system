# ADR-0166 — A list of projects, one line each: `ProjectList`

**Status**: accepted (etolbi, 13 Nov. 2026)

## Context

etolbi's home page shows its six latest projects, every module together. `ProjectCard` stays what a module's list
needs — status, crop, two figures, stages, date — and is too dense for a home page, which gives news rather than
taking stock. The owner kept, from three tracks, Google's **Drive widget** as the model: a picture, a name, one line,
no figures. etolbi recomposed it by hand (`app/components/home/project-grid.vue`, commits 0a632006 → 690c4872).

## Decision

**`ProjectList`**, the recomposition taken as drawn, as `ModulesList layout="page"` was (ADR-0164). The name says what
it is, not why the home page uses it: recency is the product's sort, not the component's.

**The frame** is a recessed ground with the list laid on it as a surface:

- The ground is `bg-neutral-subtle` with an 8px inset. The list on it is `bg-default`, with `radius-surface` and an
  8px inset.
- The grid is `repeat(auto-fill, minmax(24rem, 1fr))`, 4px between rows and 8px between columns: two columns on a
  desktop, one when the room runs out.
- There is no foot and no « Voir tout »: a project that is not among the six is found in its module.

The ground's corner is 16px, a step the radius roles did not have. ADR-0013 makes a raw step drift, so a role is
**minted: `radius-surface-lg`** (`radius.2xl`), « a frame that holds a surface ».

**A row**:

| Part | Value |
|---|---|
| Row | 8px inset, 16px gap, `radius-surface` |
| Picture | a 3.5rem tile on `bg-neutral`, `ProjectGlyph` at 40 (`kind` `zone` by default, `status` done / running / failed; none for a planned project), `seed` = the id. The drawing carries the status: no badge says it again |
| Line one | the **name** (`label-lg-strong`, one line, cut), an optional `Badge` neutral `sm` against it (« Projet démo »), then the **date** at the line's end (`body-sm`, `text-subtle`, never wrapped; already written by the product) |
| Line two | the **module**: `ModuleIcon` illustration at 16, then its name (`body-md`, `text-subtle`); no place |

The name gives first: neither the badge nor the date ever leaves the line.

**A link with ADR-0164's contract.**

- With `href`, a row is an `<a>`, otherwise a `<button>`.
- A plain click emits `select(item, event)`, so a router can take it over.
- On a link, a click with ⌘/Ctrl/Shift/Alt or a non-main button emits nothing: it is the browser's (ADR-0165).
- Hover is `bg-hover` on `quick` / `easing-default`, cut under reduced motion. The keyboard's focus takes
  `focus-ring-brand-shadow-xs`.

**Loading** shows `loadingRows` placeholder rows (6 by default, the page size the product asks for): the tile, then two
lines of text at 60 % and 35 %.

**Empty** renders nothing. The empty state is the product's, with its own words.

## Measured

`Données/ProjectList`:

| Width | Rows | Columns | Row height |
|---|---|---|---|
| 1 200px | 6 | 2 | 72px |
| 480px | 6 | 1 | 72px |

- **The long name** (« Mil et sorgho — coopérative de Kolda… ») is cut. Its badge stays whole at 103px, and the date
  ends 8px from the row's edge.
- **Loading**: six rows at the same 72px height, so nothing moves on arrival.
- **`play`**: six links; four modified clicks emit nothing; a plain click emits once.

## Amended — three columns at most (etolbi, 13 Nov.)

On a wide screen `auto-fill, minmax(24rem, 1fr)` put four projects or more on a line. The owner: three at most, four is
too many. A column's floor is now `max(24rem, (100% − 2 × spacing-md) / 3)`. Once 24rem is less than a third of the
line, the gaps counted, the floor becomes that third and a fourth column never fits. The fold to two columns, then
one, is kept.

Measured with the list stretched to the viewport:

| Viewport | Columns | Column width |
|---|---|---|
| 2 560px | 3 | 827px |
| 1 920px | 3 | 613px |
| 1 440px | 3 | 453px |
| 1 200px | 2 | 564px |
| 800px | 1 | 736px |
| 480px | 1 | 416px |
