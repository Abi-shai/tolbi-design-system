# ADR-0050 — One mark for the current item

**Date:** 2026-10-01
**Extends:** ADR-0009 (selection is brand-tinted; every tint has its on-colour partner), ADR-0049
(the switcher's footer), ADR-0028 (presence decides the form), ADR-0031 (a drawn width is a ceiling)
**Source:** the product's report on 0.26.0 — the switcher's panel cut at 184px, the current
organisation unmarked; exploration board Sprint 18 `2092:4229`, direction C chosen the same day
**Status:** Accepted
**Breaking:** visually. `DropdownSelectItem` loses its check; `Pagination`'s current page takes the
brand ink.

## Context

The catalogue's lists marked their current item four ways. `DropdownSelectItem` drew a tint and a
check; `ModulesList` and `Table` the tint alone; `Pagination` the tint, `text-strong` and the strong
weight. `WorkspaceSelector`'s list marked nothing at all, and the product asked whether that was
meant. It was not.

## Decisions

### One mark, three parts, no check

The current item of a list takes **its own ground, that ground's ink and the role's strong
weight**: `bg-selected` + `text-on-brand-subtle` + `label-*-strong`. No check.

Three tracks were drawn on three lists, in both modes — A the tint alone, B the tint with
`text-strong` and the weight (`Pagination`'s recipe), C the tint with its partner ink and the
weight — and C was chosen. What ruled out A is measured: in dark, `bg-selected` is **1.145:1** on the
panel and `bg-hover` **1.233:1**, so the tint alone loses to a passing pointer. The weight is the cue
that does not travel by colour. The ink is ADR-0009's pairing taken literally: `text-on-brand-subtle`
is the partner `bg-selected`'s own description names (8.83:1 light, 6.69:1 dark).

Hovering the current item keeps its family — `bg-selected-hover`, never `bg-hover`, which would
leave brand ink on grey.

It applies to `DropdownItem` (new), `DropdownSelectItem` (the check goes), `ModulesList` (the ink and
the weight arrive) and `Pagination` (the ink). Not to `Table`, whose selected rows are a bulk
selection carried by checkboxes. Not to `SideNavigation`, `Breadcrumbs` or `Tabs` either: on a
recessed ground "where you are" is a raised neutral surface (ADR-0033, ADR-0047), and a pill that
slides keeps one weight so it never resizes mid-flight.

### A menu row can be a choice

`DropdownItem.selected` — absent, an action (`menuitem`); present, a choice (`menuitemradio` +
`aria-checked`). There is no `false` default: absent and `false` are different rows, and Vue casts
an absent boolean to `false` unless the default is `undefined`. `ModulesList` puts
`aria-current="true"` on the current module — navigation, not a toggle (ADR-0033).

### One kind of row per panel

The switcher's rows went back to `DropdownItem`, the menu's own row, so its choices and its footer's
action share one geometry. `DropdownSelectItem` is the option of a field (`InputDropdown`, a
listbox). The first fix of this round had put `DropdownSelectItem` in the menu — `DropdownItem`'s
docs sent selection there — which needed its role read off the container and still disagreed with
the footer's row: 16px against 14px, and a 2px offset of their left edges. A choice in a menu is now a
state of the menu's row, and that machinery is gone.

### The avatar leads the row

Each workspace carries its avatar before its name: `Avatar xs`, the catalogue's row avatar
(`DropdownSelectItem` already used it) — the trigger's mark, a size down. `DropdownItem` gains
`avatarSrc` / `avatarInitials`, whose presence wins over `icon` (ADR-0028); decorative, because the
label names the row (ADR-0041). `DropdownSelectItem` gains `avatarInitials` to match.

The footer's `+` is a 16px glyph, which would start its label 8px left of the names. So the panel
declares the width of the leading column — `--dropdown-item-leading: 24px`, a variant switch the row
reads (ADR-0010) — and the glyph centres in it. Measured: every label in the panel starts at 49px.

### The panel is `Dropdown`'s width

240px, never narrower than the trigger (`min-width: 100%`). The first fix hugged its content up to a
`20rem` cap that nothing had drawn, where ADR-0031 wants the drawn width; 240 is the catalogue's own
panel width, and both forms now open it. At 184px beside the toggle the footer is whole; a name
longer than its row truncates.

### Two defects found on the way

`DropdownSelectItem`'s label was `flex-shrink: 0`, so its ellipsis could never fire and a long label
was clipped mid-letter. Both texts now give way, the supporting one first. And `ModulesList` padded
its labels to 50px, which the strong weight overran on « Carbone »; its padding is vertical only now,
and the 48px drawing centres itself exactly as before. Measured: all eleven labels fit when current.

## Still open

- `Avatar xs` initials are 10px, off the type ramp — known since the switcher's mark went to `sm`.
- `Table`'s selected rows keep the tint alone, by the bulk-selection argument above.
- Figma has no `Dropdown`, `DropdownItem` or `ModulesList` component; board `2092:4229` is the
  drawing.
