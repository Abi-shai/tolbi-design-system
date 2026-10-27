# ADR-0086 — An option, as a card or a row

**Date:** 2026-10-27
**Extends:** ADR-0001 (`Checkbox visualOnly`, `Avatar`, `Flag`), ADR-0044 (`border-brand`), ADR-0050 (`bg-selected`),
ADR-0085 (`v-model:values` for several choices)
**Source:** etolbi, EUDR item 2 — « OptionCard + OptionList — option à choisir en carte ou en ligne : icône | avatar |
drapeau, titre, description, méta à droite, contrôle chevron | radio | checkbox, état choisi ; la liste tient le
v-model. 5 versions faites main dans l'EUDR. » Figma « ↪ EUDR — OptionCard · Benchmark et pistes » (`3194:1427`),
13 systems; validated « on va aller avec tes recommandations » on 27 Oct.
**Status:** Accepted

## Decisions

**`OptionCard`**: a media at the start — an icon on a 40px tile (`bg-neutral-subtle`), an `Avatar`, a `Flag` (24),
or the `#media` slot — then the title (`label-lg-strong`) and its sentence (`body-sm`, `text-subtle`), a meta just
before the end (« 128 parcelles »), and **the control at the end** (track B, 4 / 8): where a chevron can only be,
so one rule holds for the radio, the box and the chevron. The meta and the control each sit in a box one title
line tall (`1lh`), so they ride the title's line whatever the description does.

**Chosen, three signs** — the `border-brand` contour at 2px (a ring inside the 1px border, so nothing moves; over
3:1 in both modes, ADR-0044), the `bg-selected` tint (ADR-0050) and the control checked — never the colour alone
(ADR-0006). **Hover is the contour only** (`border-default`): a hover ground is the icon tile's own primitive and
would swallow it (ADR-0033). Focus is a ring on the whole card (5 / 8), added to the contour, not put in its place.
Disabled: `bg-disabled`, `border-disabled`, `text-disabled`.

**`OptionList`** holds the choice: `v-model` and radios for one, `multiple` + `v-model:values` and boxes for several
— ADR-0085's split, so a single value never changes type. Two forms: `layout="grid"`, side by side at equal height
on a row, 2 to 4 `columns` (3 by default, Cloudscape's ceiling), dropping a column rather than squeezing one under
14rem, down to a pile — for 2 to 7 options that compare; and `stack`, full width. It is a `fieldset` with a
`legend`. Each card holds a **real radio or checkbox**, hidden, the card being its label: the keyboard is the
browser's — one Tab stop and arrows that move *and* choose for the radios (Cloudscape, Chakra, shadcn, Untitled;
the product's Nuxt UI moved without choosing), one stop per box.

**A row that leads**: outside a list, with `href` or a click, the same drawing is a link or a button with a
chevron and **no chosen state** — no system mixes a chevron with a selection. It is named by its title and
described by its sentence, not read as one long name.

Verified in the browser: the group named by its legend, radios named by their titles; Tab then ↓ moves and
chooses; a disabled card cannot be chosen; the grid's four cards at equal height on two columns, one column at
420px; three boxes, three stops; the leading rows a link and two buttons, named by their titles.

## Still open

- Past seven options a grid is not the answer (Cloudscape, Polaris): an `InputDropdown`. Nothing enforces it.
- `ModuleIcon` as a media goes in `#media`; whether module choices want their own preset is open.
