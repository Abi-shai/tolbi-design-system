# ADR-0085 — A flag before a country, and several choices in one field

**Date:** 2026-10-27
**Extends:** ADR-0004 (a generated set), ADR-0078 (lists in the top layer), ADR-0080 (`DropdownItem checked`)
**Source:** etolbi, EUDR items 14 (« InputDropdown : drapeau en tête ») and 15 (« InputDropdown : multiple »). Figma
« ↪ EUDR — Listes · drapeau et choix multiple » (`3215:1427`), validated « on va aller avec tes recommandations ».
**Status:** Accepted

## Context

No system benchmarked ships flags; 7 country pickers do — 4 with a rectangle, 3 with emoji, which Windows renders
as two letters. For several choices, 17 systems split: comma text 6, tags in the field 5 (11 counting variants),
a count 3; the list stays open after a pick in 11 of 13.

## Decisions

### `Flag`, generated

A new primitive, **`Flag`**: a 4:3 box (the rectangle most pickers use, the board's track A), drawn from
**country-flag-icons** (MIT), 3:2 drawings simplified for small sizes, centred and cropped to fit. Chosen over
flag-icons, the board's other candidate: the same 100 countries weigh **54 KB** there against **524 KB** (Bolivia
alone is 103 KB in flag-icons' detailed coat of arms, 0.4 KB here). The set is **generated** from
`scripts/flags.manifest.txt` (`npm run flags`) — West and Central Africa, the EUDR producer countries, the 27 EU
members and the EU itself, the main markets; a code the manifest lacks is a type error (`FlagCode`). The drawings
carry no `id` and the generator fails if one ever does, because inlined twice they would reach into each other's
definitions. No emoji, no CDN.

**Its size is its width** (16, 20, 24, 32), where the artwork ladder measures heights (ADR-0043): a flag takes an
icon's place on a line, and that place is a width. A hairline (`border-inset`, the avatar's) keeps a white band on
the page. Decorative by default; `label` names it when nothing beside it does.

`InputDropdown type="flag-leading"` puts `option.flag` before each row and before the value; `DropdownSelectItem`
gains `type="flag"`.

### Several choices: `multiple` and `v-model:values`

The chosen values are **tags on one line**, and what does not fit is **« +N »** — the field never grows (a field
that grows reflows the form under it; ADR-0038's « nothing wraps »). The tags are measured in a hidden row and
re-measured when the field resizes. Each tag's close is named for its value (`Tag` gains `closeLabel`: « Retirer
Cacao »), and Backspace on the field takes the last choice back. The list leads each row with a box (`Checkbox
visualOnly`, as `DropdownItem checked` does — the row keeps its ground), **stays open** while they are ticked, is
`aria-multiselectable`, and has a foot outside the scroll: « 5 sélectionnés » and « Effacer ». The field's name
is its label and the count (« Produits 4 sélectionnés »).

The box cannot be one button, as the single field is: the tags' closes are buttons, and a button cannot hold
another. So the box holds the tags and an opener at its end; a click anywhere else on the box opens the list.

The values are **their own model**, `v-model:values`: widening `modelValue` to an array would have broken the
type of every `v-model` the product binds to a single value.

Verified in the browser: the flag 20 × 15, hidden from the reader, the field named « Pays d'origine Sénégal »;
four choices show three tags and « +1 » at 320px, 46px like the single field; a pick keeps the list open, the
foot counts, « Effacer » empties it; a tag's close and Backspace each remove one.

## Still open

- A multiple list with a search (`type="search"` + `multiple`) — the long country list would want it.
- `PhoneField` could show the flag before the dial code; it stays a native list (ADR-0081), which cannot draw one.
