# ADR-0113 — A project's actions are a menu, grouped, the destructive one last

**Date:** 2026-11-05
**Source:** the owner, 5 Nov., on etolbi's project card: the product drew its own panel under the « ⋯ » — a divider
after « Voir le détail », then « Modifier l'enregistrement » and a red « Supprimer » in one group, the panel over the
card. « Il faudrait que le design system prenne en compte un vrai système de dropdown pour des options d'action à faire
sur un projet », with groups split by a divider and a destructive action.
**Status:** Accepted

## Context

The package had the pieces — `Dropdown`, `DropdownItem`, `DropdownDivider` — but nothing joined them to an object's
actions: `ProjectCard`'s « ⋯ » only emitted `menu`, so every product drew the rest, and `DropdownItem` had no way to say
an action destroys. The destructive benchmark of ADR-0112 had measured menus too: in 7 of 8 systems the destructive
item is **red at rest**; under the pointer 5 take a **red tint**, 2 a solid red; it is **last, after a divider**
(shadcn live; Carbon, Radix, GitHub, Stripe, Vercel).

## Decisions

- **`DropdownItem` takes `tone: 'neutral' | 'danger'`.** `danger` is **red in the menu** — glyph and word in
  `text-error` (4.83:1 on the panel, 5.97 dark) — and under the pointer or the focus the row takes the error tint with
  its exact ink, `bg-error-subtle` + `text-on-error-subtle` (6.05:1). Red at rest here where a row's trash waits for
  the approach (ADR-0112): a menu has already been asked for, and its word is the action — the colour says which kind.
- **Grouping is the product's content, the order is the rule**: consult, then change, then what destroys — groups
  split by `DropdownDivider`, and the **destructive action last, alone in its group**. It still opens `ConfirmDialog`
  (ADR-0075/0076), never a delete straight from the menu.
- **`ProjectCard` takes `#menu`.** **Presence decides** (ADR-0053): filled, the « ⋯ » is the trigger of the package's
  `Dropdown` **`sm`** (`align="end"`, 160px, 34px rows in `label-md` — a list is the size of what opens it, and the « ⋯ » is
  `xs`, ADR-0101; amended the same day from `md`, the owner's call), in the top layer (ADR-0078), `aria-haspopup="menu"` + `aria-expanded`, and it
  emits nothing; empty, it emits `menu` as before. Choosing a row — click, or Enter / Space — closes the menu and hands
  the focus back to the « ⋯ » (the menu button's rule); Escape does the same (`Dropdown`'s own). While the menu is
  open the « ⋯ » stays shown (`active`), or it would fade under the pointer that left for the panel.
- Stories: `Données/ProjectCard` → « Menu d'actions », `Superposition/Dropdown` → « Actions d'un objet ».

## Not done

- A table row's « ⋯ » menu: the same `Dropdown` with an `IconButton xs subtle` trigger in the actions cell works today;
  no `Table` API for it until a product needs one.
