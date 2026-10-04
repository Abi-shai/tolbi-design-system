# ADR-0053 — The avatar opens the account menu

**Date:** 2026-10-04
**Extends:** ADR-0001 (the catalogue's piece, not a second drawing), ADR-0028 (presence decides the
form), ADR-0049 (`#actions` with `close`), ADR-0021 (a surface scales from its anchor), ADR-0041 (an
artwork's name is decided by what else is on the surface)
**Source:** the product's report on 0.29.0. Since etolbi adopted the bar (22 September), its account
menu is gone: the avatar leads to Paramètres, and signing out means changing page.
**Status:** Accepted

## Context

The bar's avatar was a plain button that emitted `user`, and nothing could hang off it. The
catalogue already had the piece: `Dropdown`, with a user header (`userName`, `userEmail`),
`DropdownItem` rows, a `#footer`, and an avatar trigger of its own.

## Decisions

### The slot's presence decides

`HorizontalNavigation` gains a `#user-menu` slot. Filled, the avatar becomes the account menu's
trigger. Empty, it stays the button it was and emits `user`.

With a menu, the click opens it and **emits nothing**: one click, one meaning. Otherwise a product
that listens to `user` to reach Paramètres and also fills the slot would navigate and open the menu
with the same click. `userName` and `userEmail` fill the header, and they are read only when there
is a menu.

The rows belong to the product (`DropdownItem`, `DropdownDivider`), and so does where they lead.
The product closes the menu through `close`, the shape `WorkspaceSelector`'s `#actions` already has
(ADR-0049).

### `Dropdown`'s trigger and panel, not a second drawing

The menu form renders `Dropdown trigger="avatar"` (ADR-0001). That brings `Dropdown`'s header, its
240px panel 8px under the trigger and pinned to its right edge, and its Escape and outside-click
handling.

Measured:

- the two forms are the same 40 × 40 box in the same place;
- the panel's right edge is the avatar's (1428 = 1428), 8px below it;
- the modules list and the account menu close each other;
- the tooltips are held while the menu is open, because its 240px hang over the four controls before
  the avatar.

The avatar's accessible name is `Profil` followed by `userName` when the product gives one; before,
`Profil TD` gave only initials. On the menu form that name is the trigger's `aria-label`, alongside
`aria-expanded`. It comes from `buttonLabel`, which is now documented as the trigger's name in every
form.

### What `Dropdown` gained

- **`avatarInitials`.** Without a picture, the avatar trigger and the header showed a silhouette.
- **Escape hands the focus back to the trigger.** Before, focus on a row fell to `<body>` when the
  panel unmounted. Measured: Enter opens the menu, Tab lands on the first row, and Escape closes it
  with the focus back on the avatar.
- **A `:focus-visible` ring on the avatar trigger.** It had none; it now uses the ring it already
  showed while open.
- **The panel grows from its anchor.** It is pinned right but was scaled from `top left`, so its
  right edge, the one under the trigger, travelled 9.6px on every entrance (ADR-0021). It now
  scales from `top right`. `WorkspaceSelector`, which pins its panel left, sets `top left` itself.
- **The header's avatar is decorative** (`alt=""`): the name beside it names the person (ADR-0041).
  It also lost `status="online"`, a presence the component cannot know, about the one user who is
  certainly there.

### The header keeps its avatar, and the email truncates

The header gives the email 156px, and six realistic addresses measure 157–234px, so every one
truncates. What disappears is the domain, the part that tells two accounts apart. Removing the
header's avatar, which repeats the trigger 8px above it, would give the line 208px, and five of the
six would fit. That option was drawn and **declined**: the header keeps the person's mark, and the
cut domain is the accepted cost.

## Still open

- Figma's `HorizontalNavigation` has no open menu.
- `Dropdown` has no arrow-key navigation: Tab moves between rows.
