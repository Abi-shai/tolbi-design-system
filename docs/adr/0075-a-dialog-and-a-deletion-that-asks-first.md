# ADR-0075 — A dialog, and a deletion that asks first

**Date:** 2026-10-09
**Amends:** ADR-0072 (a conversation is deleted at once, with « Annuler ») — it now asks first; ADR-0022
(`considered`, `bg-overlay` and `z-overlay` waited on a modal)
**Extends:** ADR-0021 (anything that floats), ADR-0001 (one component per pattern), ADR-0052 (the time is
the toast's)
**Source:** product decision of 9 Oct.: the product owner wants a confirmation before a conversation is
deleted. ChatGPT, Claude and Gemini all confirm, and none offers an undo after.
**Status:** Accepted
**Amended:** 9 Oct., twice — the product's modal format; then the question asked in the panel (Figma section 18,
track C1)

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
(`restoreFocus`). Over the page it is rendered where it is used, not teleported: in the top layer its place in
the DOM does not decide what covers what, and inside a popover a click on it is still a click inside, so the
popover stays open behind it. The Escape it handles stops at the dialog, or the popover behind would close too.
(Within a region it is teleported — see the second amendment below.)

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

### Amended (9 Oct.): the question is asked in the panel — Figma section 18, track C1

Shown the modal over the page (section 17), the owner asked for other ways, benchmarked on Mobbin (section 18,
`2521:14778`). Of 22 AI assistants that delete a conversation, the box hardly varies — a question for a title, the
conversation named, « Annuler » / « Supprimer » — but the place does: 18 ask at the page's centre (15 alerts, 3
three-part modals), 3 never ask, and 1 — Google Ads' Advisor, the only one docked in a panel like ours — asks
inside its panel. Nearly all have the assistant full-page, where the page's centre *is* the assistant; ours is a
column beside the map, and the centre of the page is the map. Three tracks were drawn in the panel with the
history open, light and dark — A in the row, B against the trash, C in the panel. **The owner chose C**, and for
the expanded panel **C1**, the question rising at the bottom of the reading column, over C2, centred in the panel.

So `Dialog` gains **`within`**, the region the question belongs to. Given, the dialog is **teleported to the
region's end** and drawn inside it: the scrim covers the region only and takes its corners; the surface rises
from the region's bottom, 12px in from its edges, centred — `100%` of the padded region under the 32rem ceiling,
which gives **376px docked and 512 expanded**, centred on the 720 reading column (measured: 0.0px off). One rule
for both widths, as the column is (ADR-0064). It is not modal to the page — `show()`, not `showModal()`: the
region's other children are made **inert** while it is open, and handed back before the focus is; the page beside
stays usable (measured: a page button is hit and is not inert). Outside the top layer the browser sends no
`cancel`, so the dialog answers Escape itself. It sits above whatever the region floats of its own — the popover it
was opened from — at **`z-overlay`**: the overlay that is not in the top layer, which this ADR had kept the token
for. The surface grows from the edge it rises from (`transform-origin: bottom center`, ADR-0021): sampled every
frame, its bottom edge holds 12px above the panel's on every frame, with no reversal.

`TolbiAiPanel` hands its surface — positioned, and clipped by the panel — to what it holds
(`TOLBI_AI_PANEL.layer`); the history asks there. Outside a panel, the history would ask over the page.

A teleported dialog is outside the popover it was opened from, so a click in it had become a click outside:
**`Dropdown` now ignores a click in a dialog that does not hold it** — the list stays open behind the question —
while a dropdown inside a dialog still closes on a click elsewhere in that dialog.

Measured in the panel: Escape, « Annuler » and the scrim leave 12 rows of 12, the list open and the focus on the
row's « Supprimer »; confirming leaves 11, the list open, the focus on the next row and nothing inert. Closing the
panel (⌘J) while the question is open takes it away and leaves nothing inert.

**The foot has no rule**: the owner took it out of the Figma component (the `Pied`'s top stroke hidden). The head
is ruled off from the body; the body's 24px parts it from the actions.

## What changes

- New: `Dialog` and `ConfirmDialog` (`Superposition/Dialog`).
- `Dialog` / `ConfirmDialog`: `within` — the region the question belongs to; the foot loses its rule.
- `Dropdown`: a click in a dialog that does not hold it is not a click outside.
- `TolbiAiPanel`: `delete-conversation` now fires after a confirmation, asked **in the panel**; `historyLabels`
  gains `deleteTitle`, `deleteBody` (with `{title}`), `deleteConfirm` and `deleteCancel`; `TOLBI_AI_PANEL`
  carries `layer`.
- In the product: remove the conversation on `delete-conversation`, and drop « Annuler » from the toast. Nothing
  else — the panel places the question.

## Still open

- **The page does not stop scrolling** behind the dialog. The top layer covers it and makes it inert, which is
  what matters here.
- **Within a region, the page is not held**, by design: a click on the map leaves the question open in the panel.
- **No screen reader has heard** the alert dialog.
