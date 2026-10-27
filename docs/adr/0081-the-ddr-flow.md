# ADR-0081 — The DDR flow: a list in a field, an action on the label, a summary in the foot, steps across, a tree

**Date:** 2026-10-27
**Amends:** ADR-0008 (`FormField` gains a label action and a group), ADR-0075 / ADR-0079 (`Dialog`'s foot
gains a start), `ProgressSteps` (a horizontal form, and a list for both)
**Extends:** ADR-0001 (`InputField`'s list is `InputDropdown`; the tree's rows are `Tag` and `Checkbox`),
ADR-0050 (the tree's chosen row), ADR-0036 (hover on a recessed ground)
**Source:** etolbi, DDR flow, items 27–33 (maquette « Design Week 19-05-25 », node `14:6516`). Figma « ↪ EUDR —
Parcours DDR · ce qui manque au paquet » (`3198:1427`): 18 systems for 27–29 (49 entries), 21 sources for 30,
31 and 33 including four real customs products (TRACES, TARIC, UK Tariff, US HTS); drafts in two or three
tracks each; validated « recommandation » on 27 Oct.
**Status:** Accepted

## Context

The product's « Créer une déclaration » panel and « Ajouter un produit » window asked for five things the
package did not have and two it did. Item 31 (a red bin beside a bordered button) is `Button` icon-only
`danger-secondary`; item 32's five icons were already in the set. The other five went benchmark → canvas →
validation → code.

## Decisions

### 27 — a list at the end of a field, in its box

Ten of sixteen systems do it, five refuse it (« display-only »). Track A: the list rides **inside the field's
border** as a word and a chevron — no rule between them (3 / 6 have none), **one ring** for the box (Untitled
UI, shadcn), the error and the disabled state the box's. `InputField` takes `options`, `v-model:option` and
`optionLabel`, and renders **`InputDropdown chrome="none"`** — the package's list, not a second drawing
(ADR-0001), in the top layer (ADR-0078), hung from the **box** (`anchor`), not from its word: from the word
it overlapped the box by 3px. Under the focus the word underlines, as `PhoneField`'s prefix does.

What rides in the box is the box's: `InputField` provides a **null `FormField` context** to its children, or
the list would take the field's id and two controls would share it.

Naming the list exposed a defect of `InputDropdown`'s `ariaLabel`: an `aria-label` replaces the content it
names, so the trigger said « Type d'identifiant » and never which one — and `Pagination`'s size said
« Lignes par page » without the number. The name is now **the label and the value** (`aria-labelledby` on a
hidden name and the value): « Type d'identifiant TVA », « Lignes par page 10 ».

Found on the way: `PhoneField`'s native list sat in `#leading-text`, which is `aria-hidden` — it took the
focus and a screen reader could not see it. `InputField` gains **`#leading`**, not hidden, for a control at
the start; `PhoneField` moved there and its list is read (« Indicatif pays »). It stays native — 245
countries in two groups want the phone's own picker. And a `type="search"` field drew the browser's clear
button in the browser's blue (the Tolbi AI history had it too): hidden; Escape still clears.

### 28 — an action on the label's row, and a group

Seven of seventeen put it at the right of the label, five through a prop (Polaris' `labelAction` — whose
example is a customs code and « Look up codes »). `FormField`'s **`#label-action`** sits at the end of the
label's row, **outside the `<label>`** (a button in a label is clicked twice), centred on it, and wraps
under it when the row is short (EUI). Five of five are links: `Button link sm`.

Several controls under one label cannot share `for` or one id, so `FormField` gains **`group`**: the root
is `role="group"`, named by the label (a `<span>` now) and described by the message; no control takes the
field's id or message, and each is named by the product (« Identifiant TVA »).

### 29 — a summary at the start of the foot

Three components have a start in the foot (Spectrum, Fluent, the old Polaris); none put figures there —
Untitled UI puts its total in the body. The foot is chosen anyway because it **stays while the body
scrolls**: the figures stay in sight while the fields are ticked. `Dialog`'s **`summary`** (`{ label,
value }[]`, the `#summary` slot in its place) draws label over value — `body-sm` `text-subtle` over
`label-lg-strong`, tabular — **with no ground**: the foot is a level already, the maquette's tiles made a
third (ADR-0048). It is a `role="status"`, so each change is said once. The actions moved into a wrapper
that keeps them on the right, and under the summary when the width runs out (Spectrum, Polaris); at the
side under 40rem, they still stack, the action on top. The foot's start became the body's text edge
(20px), so a summary lines up with what it sums; its right keeps the owner's 24.

### 30 — steps across

`ProgressSteps orientation="horizontal"`: one segment per step, the title and its sentence under it (Untitled
UI « Text with line », USWDS). Done and current share `border-brand-solid`, what is left `border-subtle`; the
current title takes the strong weight and `text-on-brand-subtle` — a colour never says it alone (ADR-0006).
Not clickable (Untitled UI, USWDS, PatternFly). Under **40rem of its own width** — a container, like the side
panel — the segments stay, the titles leave the eye (not the reader) and « Étape 2 sur 3 » writes the
current step once (USWDS); `stepLabel` / `ofLabel` localise it. **Both forms are now an `<ol>`** with
`aria-current="step"`: the vertical one was divs with nothing to say which step was current.

### 33 — a tree with a choice

No system puts a radio in a tree: a radio group's arrows **choose**, a tree's **move** (APG). So
**`OptionTree`** is a tree — `role="tree"`, `aria-selected`, one row in the tab order — and the round mark at
the end is only the sign (`Checkbox visualOnly`). ↑ ↓, → opens then goes in, ← closes then goes out, Home /
End, a letter jumps, Enter or Space chooses; only the chevron opens, the row chooses (Carbon, Primer, Ant). A
parent can be chosen (TRACES stops at Annex I's level). The treeitem holds its group, so its name is **said**
(`aria-labelledby` = code + label), or it would be every row under it.

Each chapter is a block on `bg-neutral-subtle`; a row rises to `bg-default` under the pointer (`bg-hover`
is the ground's own primitive, ADR-0036); the chosen row takes ADR-0050's mark. The search keeps **a hit with
its ancestors**, opened, and its own rows; accents and case do not count (« feves » finds « fèves »); the
words found are underlined in the strong ink, not painted, so the chosen row's tint stays the only ground
that means something. The chosen path stays written above the tree (TRACES, Cascader), so the choice is
said with its chapter closed. A choice made elsewhere opens its chapter.

It is a component of its own, not « OptionList's third form » as the board put it: a tree and a fieldset of
radios share a row's look and nothing of their semantics or keyboard.

Verified in the browser: the list at 8px under the box and ending with it, 46px with or without it, grey
when disabled; the group named « Identifiants », two inputs with their own ids and no description, the
action centred on the label then under it at 240px; the summary on the body's text edge (20px), announced,
« 2 champs · 6,7 ha » after a tick, the actions under it at 520px; segments 4px, compact at 432px;
the tree walked by keyboard end to end, « poudre » → 4 rows and 2 underlines, « feves » → 6 rows, « zzz »
→ « Aucun résultat », the window's summary following the choice.

## Still open

- ~~Inside a `FormField`, `InputDropdown`'s trigger is named by the `<label for>` and still loses its value
  (« Pays », not « Pays Sénégal »).~~ Closed by ADR-0082.
- The tree has no lazy loading: the HS nomenclature (~5 000 subheadings) renders only what is open, but
  the product passes the whole hierarchy.
- 27's list is single-choice; a field with several units would want something else.
