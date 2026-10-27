# ADR-0080 — The table of the product's lists

**Date:** 2026-10-27
**Amends:** ADR-0050 (`Pagination`'s layout), ADR-0001 (`Checkbox visualOnly` gains a consumer)
**Extends:** ADR-0014 and ADR-0038 (a row opens through a real control), ADR-0030 (a rule separates in
dark, a shadow does not), ADR-0078 (lists in the top layer)
**Source:** etolbi, EUDR inventory items 9 (Table), 10 (Pagination), 12 (a checkbox row in a menu that
stays open) — « bloque le tableau des projets de tous les modules ». Figma « ↪ EUDR — Tableau · Benchmark
et pistes » (`3182:1427`), validated « comme recommandé » on 27 Oct.
**Status:** Accepted

## Context

The projects table of every module was Nuxt UI's, because the package's `Table` had no sorting, no row
that opens, no fixed column, no column choice, and a foot that said neither where you were nor how many
there were. This time the work went **benchmark first, drafts on the canvas, then code** — the owner's
process from 26 Oct. Thirteen design systems were read (docs, source, live demos checked by hand;
Mobbin now needs a paid plan), five questions drawn as two or three tracks each, one recommendation per
question, all five taken.

## Decisions

### Sorting shows on the sorted column only

The sorted column carries its arrow and its label goes strong; another sortable header shows the arrow
of the sort a click would apply — on **hover and focus**, in a place **kept for it**, so the label never
moves (Gestalt's detail). Seven of thirteen do this (Carbon, Atlassian, Primer, Polaris, MUI, Pajamas,
Gestalt); the header now says one thing, how the list is sorted. The price, named on the board: no
preview under a finger. A sortable header is a `<button>`; its `<th>` carries `aria-sort` (`none` on the
sortable ones, as Carbon and MUI do). The cycle is ascending, then descending, in turn (10 / 13) — no
« unsorted » step, the product declares a default. `v-model:sort` is `{ key, direction }` with
`'ascending' | 'descending'`, the words `aria-sort` already uses. **The table sorts nothing**: the product
pages on its server, so it sorts there; the story sorts in place for the demonstration.

### A row opens through its name

What the product asked for — the whole row — without a `div` that listens for a click (ADR-0014): the
primary cell (`primary`, else the first column shown) holds a **real `<a href>`** when `rowLink` gives a
URL, a real `<button>` when `@row-click` is listened to, so the keyboard reaches it and Cmd+click opens a
tab. A click anywhere else on the row is **handed to it** (Polaris IndexTable's mechanism) — not when it
lands on another control (an action keeps its own click, as MUI and Nuxt UI guarantee), nor when it ends a
text selection; Cmd/Ctrl+click and a middle click open the link in a new tab. Hover: `bg-hover`, the hand,
the name underlined. The board drew the link's area *covering* the row, ProjectCard's way (ADR-0038);
code hands the click over instead, because a fixed first column is `position: sticky` and would trap a
stretched link inside its own cell.

### Fixed columns, and a rule only while something passes under them

`fixed: 'start' | 'end'` per column; the offsets are **measured** from the header cells (a width can be a
minimum, a percentage or nothing), the selection column follows a fixed start. The edge is a
`border-subtle` rule, on the start side once the table has scrolled, on the end side until it has scrolled
to the end — `Scrollbar` already says where the scroll is (`--at-start`, `--at-end`). A rule and not a
shadow: in dark, a shadow separates nothing (ADR-0030), and a rule that is there only while it has
something to say is the side panel's fade again (ADR-0079). The row's ground moved from the row to its
cells, so a fixed cell carries hover and selection; the table is `border-collapse: separate` so a sticky
cell keeps its own border. A cell's type is now the body's, so text a slot puts in it reads as the
default cell does.

### The columns shown: a menu of checkboxes that stays open

`visibleColumns` (the keys shown) on `Table`; `TableColumnMenu` edits it — a « Colonnes » button for the
right end of the product's toolbar (4 / 5 of those that have one), opening `Dropdown`'s menu of checkbox
rows. **Point 12 landed on `DropdownItem`, not `DropdownSelectItem`**: the latter is a listbox option for
a field (`InputDropdown`), the former is a menu row, and a column chooser is a menu. `DropdownItem` gains
`checked` → `menuitemcheckbox` with `Checkbox`'s own box (`visualOnly`, ADR-0001) in the leading column;
the menu stays open because `Dropdown` never closes on a row. `hideable: false` is ticked and dim (the
project's name); a column without a label (the actions) is not offered; « Réinitialiser » brings back
`defaultValue` and shows only when there is something to bring back (MUI).

### The foot says where you are and how much at a time

`Pagination`: the range on the left — « 1–10 sur 42 projets », `total` + `itemLabel`, numbers through
`Intl` — and on the right « Lignes par page » (`v-model:pageSize`, `pageSizes` 10 · 20 · 50 · 100, the
commonest set) then the numbered pages between two **arrows**: the pages are kept, the words « Précédent /
Suivant » became the arrows' names. Changing the size goes back to page 1. Without `total`, the pages alone
sit on the right — every existing use keeps working. `Table` passes `total`, `pageSize`, `pageSizes` and
`itemLabel` through, and keeps the foot while there is more than the smallest page, or a user who picked
50 for 42 rows could not go back. The size selector needed `InputDropdown size="sm"` — `control-padding-
sm`, `label-lg`, a field that hugs its value and a list at least as wide — and an `ariaLabel` for use
outside a `FormField`.

Verified in the browser: aria-sort none → ascending → descending, the preview hidden at rest and shown on
hover; a click on a cell opens the row, a click on the bin does not; the menu stays open across two ticks,
« Réinitialiser » appears and restores; page 3 reads « 21–30 sur 42 », size 20 goes back to « 1–20 » with
20 rows; scrolled at rest / 160px / end, the rules show end / both / start and the fixed columns do not
move.

## Still open

- No sort on several columns (3 / 13 have it, none for a list of projects).
- Under 40rem a seven-column table scrolls, fixed columns included; cards are a product question.
- The « Colonnes » glyph is `sliders-vertical`; `columns-3` (shadcn, MUI) would need the manifest.
