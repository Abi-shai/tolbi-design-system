# ADR-0088 — Open in place, separate, present: Accordion, Divider, Carousel

**Date:** 2026-10-27
**Extends:** ADR-0025 (a space that opens), ADR-0075 (`Dialog`), ADR-0081 (`Dialog`'s `#summary`)
**Source:** etolbi, EUDR items 7 (« Accordion (ou Disclosure) »), 8 (« Divider — filet, libellé facultatif ») and 6
(« Carousel — diapositives image/vidéo + titre + texte, StepDots, Passer/Suivant, dans un Dialog »). Figma « ↪ EUDR —
Accordéon, séparateur, carrousel » (`3217:1427`), 51 entries; validated « on va aller avec tes recommandations ».
**Status:** Accepted

## Decisions

### `Accordion` and `AccordionItem` — track A

A title, a **chevron on the right** that turns over (11 / 19, and the side of every chevron the package already
has), a **rule between** sections (9 / 19). **One open at a time** by default (9 / 19): `v-model` is the open
section or `null`; `multiple` + `v-model:values` for several — the split `InputDropdown` and `OptionList` already
make. The whole title row is a `<button>` in a heading (`headingLevel`, 3) with `aria-expanded` and
`aria-controls`; the panel is a region named by it. No arrow keys between titles — the APG withdrew them on
29 April 2026.

The content opens the space it needs — ADR-0025's `0fr → 1fr` — over `enter` / `easing-out`, and closes faster,
over `exit` / `easing-in` (ADR-0021's rule). Closed, it is **`hidden="until-found"`**: the browser's find reaches its
words and opens the section that holds them (GOV.UK, React Aria) — set only once the close has played, or the text
would vanish before the space closed over it. Alone, an `AccordionItem` is a disclosure, `v-model:open`.

### `Divider` — track A

A `border-subtle` hairline with **no margin of its own** (11 / 13): the space is the layout's. Alone it is a
separator — `<hr>`, or `role="separator"` upright in a bar. With a `label` it stops being one: the lines are
decoration and the label is text read where it stands (MUI's `presentation`), because a label inside a separator is
not sure to be read. `align="start"` keeps 8px of line before the label (Fluent); `center` is for « ou ».

### `Carousel` — track A

A walkthrough in the package's **`Dialog`**, in our windows' format: the close alone in the head — `Dialog` gains
**`hideTitle`**, the title naming the window without being shown, since each slide carries its own; the 16:9 picture
inset 20px at `radius-surface-sm`; the title (`heading-md`) and its sentence on the window's left edge; **`StepDots`
at the foot's start**, in the `#summary` slot ADR-0081 opened; « Passer » on the first slide, « Précédent » after,
« Suivant », and on the last the action the walkthrough leads to (`doneLabel`). **Nothing moves by itself** (0 / 4
autoplay). A slide changes by a **fade** over `enter` (Fluent), picture and words in place; every slide sits in one
grid cell, so the window keeps the tallest one's height — measured 510px on all three. The change is announced
through the foot's status: « Étape 2 sur 3 · Liez les champs aux produits ». A video is never autoplayed and stops
when its slide leaves; the close, Escape and « Passer » emit `skip`, the last action `done`.

Verified in the browser: headings level 3 with buttons and regions; one click opens one and closes the other; a
`beforematch` on a closed section opens it; two open in `multiple`; the disclosure by keyboard. The divider's
three forms read as a separator, text, a separator. The carousel named by its hidden title, the status and the
buttons following each step, the focus kept on the primary button, the window 510px at every step.
