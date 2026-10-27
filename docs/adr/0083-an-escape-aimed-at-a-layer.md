# ADR-0083 — An Escape aimed at a layer inside a dialog is that layer's

**Date:** 2026-10-27
**Amends:** ADR-0077 (fourth round: the dialog closes on an Escape nobody took)
**Source:** etolbi on 0.69.0, item 34 — « Dialog + Échap prise par une couche qui n'est pas du paquet. Nuxt UI
(reka-ui) ferme sa liste sur un keydown Escape écouté sur window, sans appeler preventDefault. »
**Status:** Accepted

## Context

ADR-0077 stopped the dialog from swallowing Escape, so a list from another library inside it would hear the key,
and made the dialog close only on an Escape **nobody took** — over the page, the browser's `cancel` comes only when
nobody cancelled the keydown; within a region, a deferred check. That assumed a library that closes its list also
cancels the key. reka-ui (Nuxt UI) does not: it listens on `window`, closes, and leaves the key untouched. The
browser saw an Escape nobody took and closed the side panel, list and all. The product worked around it with a
listener added during the event, after reka's.

The product offered two fixes: skip an Escape aimed at an open layer the dialog contains, or apply `within`'s
deferred check to the modal. The second does not help on its own — the deferred check reads `defaultPrevented`,
which reka never sets — so the first is the one taken.

## Decision

An Escape whose target is **inside an open layer the surface holds** — a `listbox`, `menu`, `dialog` or
`alertdialog`, or a `[popover]` — or **on the control that opened one** (`aria-expanded="true"` on a combobox or an
element with `aria-haspopup`) belongs to that layer, **taken or not**. The dialog does not close on it, in both
forms: over the page it holds the browser's `cancel`; within a region the deferred check skips it. The next Escape,
with the layer gone, closes the dialog.

The target is read **in the capture phase on the dialog** — before any handler inside it and before the `window`
listeners, so before reka closes its list and while `aria-expanded` is still `true`. A disclosure's
`aria-expanded` is not a layer: without a popup, an expanded accordion still lets Escape close the dialog. The
reading lasts one event — a later close request (a back gesture) is not this Escape. The package's own lists
already cancel their Escape and are unaffected.

Verified in the browser with a list built as reka builds one (a combobox, a listbox, closing on `window` without
`preventDefault`), centred and at the side: the first Escape closes the list and keeps the dialog, the second closes
the dialog; with the list closed, one Escape closes it; a plain dialog and one `within` a region still close on
the first Escape.

## Still open

- A listbox that is always shown (not a popup) inside a dialog would also keep Escape — the rule cannot tell an
  inline listbox from a popup one by its role alone. None exists in the catalogue or the product today.
