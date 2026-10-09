# ADR-0075 — A dialog, and a deletion that asks first

**Date:** 2026-10-09
**Amends:** ADR-0072 (a conversation is deleted at once, with « Annuler ») — it now asks first; ADR-0022
(`considered`, `bg-overlay` and `z-overlay` waited on a modal)
**Extends:** ADR-0021 (anything that floats), ADR-0001 (one component per pattern), ADR-0052 (the time is
the toast's)
**Source:** product decision of 9 Oct.: the product owner wants a confirmation before a conversation is
deleted. ChatGPT, Claude and Gemini all confirm, and none offers an undo after.
**Status:** Accepted

## Context

ADR-0072 deleted a conversation at once and gave « Annuler » in a toast, because the system had no modal to
ask with. The owner now wants the question asked first. The catalogue had prepared for a modal without having
one: `--ds-bg-overlay` (the scrim), `--ds-z-overlay`, and `--ds-motion-duration-considered`, whose own
description names « modals, drawers, destructive confirmations » — ADR-0022 kept all three waiting.

## Decisions

### `Dialog`: the native dialog, opened modal

`Dialog` is the native `<dialog>` opened with `showModal()`. The top layer puts it above everything — the
popover it was opened from, the Tolbi AI panel's clip — with no z-index, and the browser makes the page behind
it inert. So `z-overlay` is not what a modal needs; it stays for overlays that are not in the top layer.

It floats as anything does (ADR-0021): scale from 0.96 and fade, the exit faster than the entrance. The
entrance takes `considered` (400ms), the step minted for heavy surfaces and the first time it is used; the
exit takes `exit` (100ms). The scrim is `bg-overlay` and fades on the same two timings. The surface is
`bg-default` with `elevation-overlay` and the `border-subtle` every elevated surface carries — in dark it is
the border that separates (ADR-0030).

**It has the product's modal format** — amended the same day, from the owner: « that's not how we do the
dialog in the product, a modal format ». The first version was an alert box: a title, a sentence and the
buttons under them, in one block 25rem wide. The product's modals (its own clear-history confirmation, on
Nuxt UI) have three parts: a head with the title and a close, the body, and a foot with the actions on the
right, each part ruled off from the next. So does `Dialog` now: the head carries the title (`heading-md`) and
`CloseButton sm`, then the body, then the foot, separated by `border-subtle`, inside a 32rem ceiling — the
product's modal width. The close is the fourth way to cancel, and it goes with `dismissible`.

Opening moves the focus in — to `[data-autofocus]`, else the first control. Tab and Shift+Tab go round inside
it. The close, Escape and a click on the scrim cancel (`dismissible`), and closing hands the focus back to what opened it
(`restoreFocus`). It is rendered where it is used, not teleported: in the top layer its place in the DOM does
not decide what covers what, and inside a popover a click on it is still a click inside, so the popover stays
open behind it. The Escape it handles stops at the dialog, or the popover behind would close too.

### `ConfirmDialog`: the question before what cannot be undone

A `Dialog` with a title, one sentence, the action and the way out, as an `alertdialog`. With `tone="danger"`
the action is `Button danger`, and the focus starts on « Annuler », so a stray Enter cancels rather than
destroys (WAI-ARIA's alert dialog). Only the confirmation emits `confirm`; « Annuler », the close, Escape
and the scrim emit `cancel`.

### Deleting a conversation asks first

A row's « Supprimer » opens it: « Supprimer la conversation ? », and « La conversation « {title} » sera
supprimée définitivement. », « Supprimer » (danger) and « Annuler ». The four strings are `historyLabels`
(`deleteTitle`, `deleteBody`, `deleteConfirm`, `deleteCancel`). Only the confirmation emits
`delete-conversation`. The row then closes and the focus goes to the next one, as before — the dialog does not
hand it back to a button that is leaving. Cancelling leaves the row, the list and the focus as they were.

Measured: cancelling by Escape, by « Annuler » or by the scrim leaves 12 rows of 12, the list open and the
focus on the row's « Supprimer »; confirming leaves 11, with the focus on the next row. Deleting the current
conversation opens a new one.

### No « Annuler » after a confirmation

With the question asked first, an undo is a second safeguard for the same mistake — none of the three
assistants offers one. The product says « Conversation supprimée » in a toast, without an action.

## What changes

- New: `Dialog` and `ConfirmDialog` (`Superposition/Dialog`).
- `TolbiAiPanel`: `delete-conversation` now fires after a confirmation; `historyLabels` gains `deleteTitle`,
  `deleteBody` (with `{title}`), `deleteConfirm` and `deleteCancel`.
- In the product: remove the conversation on `delete-conversation`, and drop « Annuler » from the toast.

## Still open

- **The page does not stop scrolling** behind the dialog. The top layer covers it and makes it inert, which is
  what matters here.
- **No screen reader has heard** the alert dialog.
