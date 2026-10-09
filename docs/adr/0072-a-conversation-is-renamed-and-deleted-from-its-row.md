# ADR-0072 — A conversation is renamed and deleted from its row

**Date:** 2026-10-08
**Amends:** ADR-0069 (the conversation is the head's title) — its open « delete and rename », and the
list's role
**Extends:** ADR-0066 (each action says what it does), ADR-0052 (the time is the toast's), ADR-0021 (the
exit is faster than the entrance), ADR-0001 (a component gains a role rather than a second drawing)
**Source:** Figma, « Tolbi xAI exploration », `15 · Renommer et supprimer une conversation`
(`2477:14612`) — Mobbin benchmark and the mechanism prototyped on the real components; published on the
owner's word on 8 Oct.
**Status:** Accepted

## Context

The owner asked for two actions on each row of the history, shown under the pointer, to the right of the
title: rename and delete. Most products hide them behind a « ⋯ » that opens a small menu (Grok, Gemini,
Plane, Gumloop, Fireflies) — in our history, which is already a menu, that would be a menu inside a
menu. Two direct icons, as asked (and Shop's cross on hover), do the same in one click. Renaming happens
in the row (Amazon Q) or in a modal (Plane, Gumloop); deleting comes after a confirmation (Shop, Plane)
or at once, with « Undo » (Linear, Jasper).

## Decisions

### Two icons take the time's place

Under the pointer or the focus, a row shows a pencil and a trash — `IconButton xs subtle`, touching
(ADR-0066) — where its time was, and the title stops before them. Each names itself in a tooltip after
the catalogue's delay, beside it: inside the row, since a tooltip above or below would be cut by the
list's own scroll. Their names carry the row's title (« Renommer – Comparer avec la campagne 2024 »), or
eleven pencils would be read as eleven « Renommer ». Without a pointer to hover with, they stay.

### A menu cannot hold them, so the list is a dialog

A `menuitem`'s children are presentational: a button inside a menu item does not exist for assistive
tech. So `Dropdown` gains `role` — `menu` by default, `dialog` for a panel that holds more: a search,
rows with actions of their own, a field — and `label`, and `DropdownItem` gains `as="button"`: a real
button, the current conversation `aria-current` rather than checked, the same row to the eye. The
trigger says `aria-haspopup="dialog"`. It also settles one of ADR-0069's open notes: a search is at home
in a dialog, where in a menu it was not.

### Renaming happens in the row

The title becomes a field, all of it selected, the caret at its start so that the beginning shows; the
two icons become « Enregistrer » and « Annuler » in the same places. Enter keeps the name, Escape gives
the old one back without closing the list (the Escape stops at the field), and leaving the field keeps
it — as the products that rename in place do. An empty or unchanged name changes nothing. The field is
42px and the row 40, so it overhangs by 1px each way rather than growing the row: the rows below do not
move. The panel emits `rename-conversation`; the product keeps the title.

**Amended by ADR-0075 (9 Oct.):** deleting now asks first — a `ConfirmDialog`, « Supprimer la conversation ? »
— and only the confirmation emits `delete-conversation`. The toast says it was done, without « Annuler ». What
follows describes the first version.

### Deleting is at once, and the way back is the toast's

No confirmation: the system has no modal, and « Annuler » catches the mistake without slowing the
gesture. The row closes its height over `exit` and the focus moves to the next row — the one before, when
it was the last — so a keyboard stays in the list. The panel emits `delete-conversation`; the product
removes it and shows « Conversation supprimée », its title, and « Annuler » — and holds the conversation
for as long as the toast offers it, because the time is the toast's and it pauses on hover and focus
(ADR-0052, and ADR-0061's amendment of the same day). Undone, it comes back where it was, opening its
height over `enter`, current again if it was. Deleting the current conversation opens a new one.

Only what the product changes moves: what the search filters comes and goes at once, since a list that
animated every keystroke would lag behind the typing. Nothing moves under reduced motion.

Measured: a row stays 40px while it is renamed; Enter renames and leaves the list open; Escape restores;
a deletion takes the list from 12 rows to 11, the leaving row at 30.6px mid-way; the focus lands on the
next row; « Annuler » brings it back; deleting the current one lands on « Nouvelle conversation ». The tab
order is a row, its rename, its delete, the next row.

## What changes

- `TolbiAiPanel`: `rename-conversation` (id, title) and `delete-conversation` (id); the switcher's list
  is a `dialog` named « Conversations du projet ». `historyLabels` gains `title`, `rename`, `delete`,
  `renameField`, `save`, `cancel`.
- `Dropdown`: `role` (`menu` | `dialog`) and `label`. `DropdownItem`: `as` (`menuitem` | `button`).
- In the product: keep a renamed title; remove a deleted conversation, show the toast with « Annuler »
  and hold the conversation until the toast is gone; when the current one is deleted, open a new one.
- Stories: « Conversation » and « Dans la page » rename and delete, with the product's toasts.

## Still open

- **No screen reader** has heard the dialog, its rows' buttons or the field.
- **Persisting** a rename or a deletion is the product's, and so is letting a deleted conversation go
  once its toast has.
