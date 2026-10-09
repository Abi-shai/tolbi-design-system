# ADR-0076 — The product's confirmation: form B

**Date:** 2026-10-09
**Extends:** ADR-0075 (`Dialog`, `ConfirmDialog`), ADR-0006 (a tone never says it alone), ADR-0009 (brand is
interactive-only), ADR-0008 (`FormField` owns the label)
**Source:** the owner, 9 Oct.: « a proper modal confirmation UI for the actions in the product that would demand
so … a full screen overlay modal ». Benchmark and drawings in Figma section 19 (`2541:16182`).
**Status:** Accepted

## Context

`ConfirmDialog` (ADR-0075) asked one question: a title, a sentence, « Annuler » and the action. Its tone was said by
the red button alone, and it had nothing for an action that takes more with it than one row.

Over sixty confirmation modals on Mobbin (web) say the same thing about the form: it hardly varies — a question, a
sentence, « Cancel » and the action in red on the right. What separates them is **what the modal says about the
action**: a button that names it and its object (« Delete project », Descript's « Delete project permanently »);
**what goes**, listed and counted (GitLab, Asana, Kajabi, Lovable); a **name to type** before the action wakes
(Vercel, Neon, Maze, Clerk, Railway); **another way out** (Confluence's « Archive », Linear's and Adobe's 30 days);
and a **sign** for the danger, a glyph on its tint (Railway, Neon, Plane, Recraft).

Three forms were drawn, each in the product — a Yield page under a scrim over the whole screen — and in four states,
light and dark: **A**, the product's format as coded; **B**, the same format signed by its tone; **C**, centred, two
equal buttons, no close. **The owner chose B.**

## Decisions

### The head is signed

`Dialog` gains **`icon`** and **`tone`** (`danger | neutral`). Given an icon, the head opens on a **36px tile** —
the close's box (`CloseButton sm`), so the head's two ends are one size — at `radius-control`, the glyph at 20 on the
tone's tint and that tint's exact ink (ADR-0009): `bg-error-subtle` / `text-on-error-subtle` for danger,
`bg-neutral-subtle` / `text-subtle` for neutral. The glyph **names the action** — `trash-2`, `user-minus`, `coins` —
and is the tone's own by default (`triangle-alert`, `info`). The tone now has a shape as well as a colour
(ADR-0006): « danger » is read before the title is.

**Brand is not a tone** — it is interactive-only (ADR-0009). A confirmation that is not a danger — spending credits —
is **neutral**: a neutral sign and the primary action. `ConfirmDialog`'s `tone` is `danger | neutral`; `brand`, its
0.58 name, still means neutral.

`ConfirmDialog` is always signed; a plain `Dialog` only when it is given an icon.

### Three levels — the product's call

1. **Confirm** — the sentence.
2. **Show what goes** — **`consequences`**, `{ icon, label }[]`: one line each, with its glyph and its number
   (« 24 parcelles et leurs contours »), on the neutral ground and in the text's own ink — the list informs; the sign
   has already warned. It is part of the description, read with the sentence.
3. **Type it** — **`requireText`**: the action stays off until the exact text (trimmed) is typed. The text is in the
   label — `requireTextLabel`, « Pour confirmer, tapez « {text} » » — and in the placeholder, the benchmark's
   convention: a placeholder alone disappears as one types. A `FormField` with an `InputField` (ADR-0008) in
   `Dialog`'s new **`#form`** slot — after the description, not read as part of it. The focus starts in the field,
   Enter acts only once the text is typed, and each opening starts empty. For what is heavy and has no way back: a
   project.

Which level an action needs is the product's to decide; the component does not guess.

### The action names itself

`confirmLabel` carries the verb and what it acts on — « Supprimer le projet », « Retirer », « Lancer l'analyse » —
never « OK ». « Confirmer » stays the default only as a fallback.

### Tolbi AI's question is signed too

One component (ADR-0001): the history's deletion question carries `trash-2` on the error tint, still asked inside
the panel (ADR-0075, C1).

## Measured

In Storybook, light and dark: levels 1 and 2 open on « Annuler » with the danger sign; level 3 opens in the field
with the action off — « Rendement Arachide », a near miss, leaves it off and Enter does nothing; « Rendement Arachide
Nord » turns it on and Enter confirms; reopened, the field is empty and the action off again. The neutral tone opens
on its action, under a neutral sign. The description reads the sentence and the list, not the field.

## What changes

- `Dialog`: `icon`, `tone`, the `#form` slot; the head's gap is `spacing-lg`.
- `ConfirmDialog`: `icon`, `consequences`, `requireText`, `requireTextLabel`; `tone` is `danger | neutral`
  (`brand` still accepted); always signed.
- New type: `ConfirmDialogConsequence`.
- `TolbiAiPanel`: the deletion question shows `trash-2`.
- Figma: `Confirmation/Forme B` (section 19) is the drawing of record.

## Still open

- **Another way out** — « Archiver » beside « Supprimer » (Confluence) — is not drawn: a product that has one puts it
  in a plain `Dialog`'s actions.
- **Unsaved changes** take three answers (Customer.io: back, discard, save): a plain `Dialog`, not a
  `ConfirmDialog`.
- **No screen reader has heard** the alert dialog.
