# ADR-0101 — A list the size of what opens it, on the side it has room

**Date:** 2026-11-05
**Extends:** ADR-0078 (`useAnchoredSurface`: the top layer, the flip), ADR-0080 (`InputDropdown sm`), ADR-0050
(the current item's mark)
**Source:** the owner's observation — « le panel qui se déploie est trop gros comparé aux autres éléments » —
measured, then benchmarked on 15 systems (`.context/bench-dropdown-sizes.md`), drawn on the board « ↪ Dropdown —
tailles · benchmark et pistes » (`3674:1427`). Track A chosen.
**Status:** Accepted

## What was measured

`InputDropdown sm` — « Lignes par page » — is a 38px field in 14px type; its options were **46px rows in 16px**.
The list had one size, the form field's, so it was larger than the control that opened it. `Dropdown`'s menu had
one size too (40px, 14px), and under a 12px chip — the timeline's scale — it buried what opened it.

## Decisions

**A select's list takes its field's size** — the benchmark's one unanimous rule (Carbon, Spectrum, Radix,
Mantine, Chakra, Untitled UI; none offers a list size apart from its field). The size is set **once**, on
`InputDropdown`, and `DropdownSelectItem` reads it: **a row is the field's height** — `md` 46px in `label-xl`
(unchanged), `sm` **38px** in `label-lg` (8px above and below the 20px line, plus the row's 1px gap), glyphs and
flags 16. Carbon's sentence: « each option in the menu should be the same height as the field ».

**An action menu takes its own `size`** (Atlassian, Primer, Spectrum, Radix, Chakra): a menu has no field to
inherit from, and its trigger may be anything. `Dropdown size`: `md` 40px rows in `label-lg` (unchanged), `sm`
**34px** rows in `label-md` and a **160px** panel — a size, not a ceiling. Declared on the panel, read by its rows
through `provide`/`inject` (`DROPDOWN_SIZE_KEY`), so a menu is never two sizes. The timeline's scale chip opens
an `sm` menu.

Track B — one compact list whatever the field (Fluent 2, Ant Design, shadcn) — was declined: a 46px field
opening a 38px list is the same mismatch the other way round.

**The side is a preference** (`side: 'below' | 'above'`, `DropdownSide`, on both). ADR-0078 already turned a
panel to the other side when its own was short and the other had more; what was missing was **asking for the
top** where the interface puts the room there — a table's foot, a bar at the bottom of a map. `below` stays the
default; `above` is still turned back below when the top is short. `Pagination`'s « Lignes par page » now
prefers `above`. Measured: requested `above` with room → above; the same trigger 30px from the top → below.

## Not done

- `WorkspaceSelector` keeps its menu (its chrome diverges on purpose).
- No `lg`: no control in the catalogue opens a list from a field larger than `md`.
