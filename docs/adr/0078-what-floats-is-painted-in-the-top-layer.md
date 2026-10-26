# ADR-0078 — What floats is painted in the top layer

**Date:** 2026-10-26
**Amends:** ADR-0075 (a dialog within a region leaves `z-overlay` for the top layer), ADR-0050 and
ADR-0044 (the switcher's floor reads `--anchor-width`, not `100%`)
**Extends:** ADR-0021 (the surface sets its origin from where it opens), ADR-0077 (what the EUDR
adoption found — item 21)
**Source:** etolbi, EUDR module: the tables' filter bar, forms in side panels and dialogs.
**Status:** Accepted

## Context

`Dropdown` and `InputDropdown` opened their panel `position: absolute` under the trigger, in the flow
of every ancestor. Inside anything that scrolls — a side panel's body, a dialog, a filter bar with
`overflow` — the panel at the bottom **grew the scroll** instead of passing over it: the user had to
scroll the box to see the options of the field they had just opened. The product worked around it in
the filter bar by removing the bar's overflow; in a form it has no way round. The criterion it set:
*opening a list at the bottom of a panel that scrolls changes neither its height nor its scroll.*

## Decisions

### The panel goes to the top layer, and stays where it is in the DOM

`popover="manual"`, shown as it mounts — the layer a modal `<dialog>` already lives in, above every
overflow, transform and z-index, with no z-index of its own. Teleporting to `<body>` was the other way
and the worse one: under a modal dialog, `<body>` is inert and painted beneath it, and the click
outside, the focus order, Escape and every consumer's `:deep()` rule would have had to be rebuilt. A
popover keeps all of it — only where the panel is *painted* changes.

So its place is **computed** — `useAnchoredSurface` (`composables/`, internal like
`useSlidingIndicator`), from the anchor's rectangle, again on every scroll (captured, so any box's),
resize and size change, once per frame:

- **Below**, and **above** when the room below is short and the room above is larger; where neither
  holds it, the larger side, **capped**: `--anchor-room` is the panel's `max-height`, so its list
  scrolls and the screen does not. The cap counts the border in a content box — 2px past the edge
  until it did.
- The gap is the panel's own `margin-block: spacing-md`, placed by its margin box (`top` below,
  `bottom` above), so the 8px stays a token in CSS.
- `align` — `end` (the default: the account menu) or `start` (the workspace switcher, a conversation's
  title) — kept 8px inside the viewport. `DropdownAlign` is declared in `Dropdown`: a public type may
  only point at what ships (ADR-0061), and the build said so.
- `transform-origin` follows the side it opened on, so the entrance scales from the corner at the
  trigger (ADR-0021) whichever way it flipped.
- `InputDropdown`'s list takes the field's width (`matchWidth`), as `left: 0; right: 0` gave it.
- `--anchor-width` carries the anchor's width to the consumer's CSS: `WorkspaceSelector`'s floor
  (*240, never narrower than the trigger*) said `min-width: 100%`, which meant the anchor while the
  panel sat inside it and would mean the screen in the top layer.

Measured on the ten panels the catalogue opens — the four `Dropdown` triggers, the switcher in its
three forms, the account menu, the conversation switcher, `InputDropdown` — every rectangle is
**identical to the pixel**, except three story panels that ran 16px past the bottom of the screen and
now stop 8px above it. In a 278px box scrolled to its last field, opening the list leaves
`scrollHeight` 296 and `scrollTop` 18 as they were; in a filter bar with `overflow-x`, the bar stays 54px
and the last option is under the pointer. On a 330px screen the list opens above, 8px from the top,
and scrolls in itself.

### A question within a region joins it there

ADR-0075's question *within a region* — Tolbi AI's « Supprimer la conversation ? » — is opened from a
row of the history list, which stays open behind it. That list is in the top layer now, and only
something opened after it *there* can cover it: the `z-overlay` the dialog took could not. So a dialog
`within` is shown and then shown as a popover too — a non-modal `<dialog>` may be both — on the
region's **rectangle**, followed while it is open. Teleported to the region as before, so the region is
held inert as before; the scrim still takes the region's corners, which it inherits. Measured: the
scrim covers the list where it did, the surface is 376px where it was; confirmed, the row goes, the
dialog leaves the top layer, the list stays open and the focus is on the next row.

### An Escape from inside the dropdown stops at the dropdown

Found while measuring a list inside a dialog, and older than this change: the dropdown heard Escape on
the document, and the dialog heard it first — on its way up — and closed, list and all. Both dropdowns
now take the Escape on their own root while they are open, stop it and cancel it, so the browser does
not turn it into the dialog's `cancel` either. The list closes, the focus goes back to the trigger,
the dialog stays; a second Escape is the dialog's.

## Still open

- **The other surfaces that float in place**: `HorizontalNavigation`'s module list, `Breadcrumbs`'
  collapsed crumbs, and the tooltips. The mechanism is shared now; `Tooltip` anchoring (ADR-0077) is
  its next consumer.
- A panel follows its trigger when the box under it scrolls, even out of the box's sight. Closing it
  instead, or hiding it, is a question for the first consumer that minds.
