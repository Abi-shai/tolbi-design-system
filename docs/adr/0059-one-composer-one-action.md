# ADR-0059 — One composer, one action

**Date:** 2026-10-07
**Extends:** ADR-0001 (compose, never redraw), ADR-0013 (control padding is its own scale), ADR-0039
(`IconButton`'s 32px `xs`)
**Source:** Figma Sprint 18, `TolbiAI/Saisie` (`2354:12487`) — states Vide, Rempli, Réponse en cours,
Réponse impossible. The fourth of the eight Tolbi AI steps; the voice states are the sixth.
**Status:** Accepted

## Context

The product asks Tolbi AI through Nuxt UI's `UChatPrompt` and `UChatPromptSubmit`. Figma settled one
composer for everything, voice included: a scope chip on top, a field that grows, and a single
action on the right. This step ships its text half.

**Amended by ADR-0067 (8 Oct.):** the right of the box now holds two controls — the microphone and send,
side by side, always; send greyed until there is text, « Arrêter » in its place while an answer comes.

## Decisions

### One action, and it is decided, not chosen

The right of the box holds exactly one control. Send (`arrow-up`) when there is a question; « Arrêter »
while an answer is on its way. Until the voice states land, an empty box shows send disabled — it
will be the microphone's place.

`status` is the one fact the composer cannot know: `ready`, `pending` or `failed`. Everything else —
which action, which placeholder, whether the box takes a question — follows from it and from the
text.

### The composer does not clear itself

`send` emits the trimmed question and leaves the model alone. The product moves the question into
the thread and empties the field; if the answer fails it puts the question back, so « the question
stays in the box » is the product's sentence to keep, not something the composer guesses at.
`retry` sends the box's question again as it is; `stop` cancels.

### Enter sends

Enter sends, Shift+Enter breaks the line, and a plain Enter never inserts a line, even when there is
nothing to send. Not while an input method is composing: that Enter confirms a character.

### Pending is read-only, not disabled

A disabled field drops the focus — and the field being disabled is the one the user just pressed
Enter in. So the box goes quiet instead (`border-subtle`, the placeholder « Tolbi AI répond… »,
`readonly`) and the focus stays where it was. Every action hands the focus back to the field, for the
same reason: the control that was pressed is about to be replaced — send by « Arrêter », « Arrêter »
by send, the failure line by nothing.

### The failure is said above the box

« Tolbi AI n'a pas pu répondre pour le moment. » sits above the box, so the question it is about stays
where it was typed. The words are `role="alert"`; « Réessayer » is a control beside them, not part of
what is announced.

### Two existing controls, each one size or variant wider

ADR-0001 rules out drawing a button inside the composer, and two of Figma's controls had no exact
counterpart:

- **send** is a 32px brand disc with a 16px glyph — `IconButton`'s `xs`, which had no fill. It gains
  `variant="primary"`, `Button`'s primary on a disc: green is the action.
- **« Arrêter »** is 26px tall with 12px semibold type. `Button` gains **`xs`**: `control-padding-xs`
  (4px 10px — a 24px control, 26 rendered with its border, ADR-0033) and `label-md-strong`, glyph 16.
  That is Figma's box exactly. Its shape is not: Figma drew a pill, and `xs` keeps `Button`'s
  `radius-control` and its shadow — a button's shape is the component's, not the slot's.
- **« Réessayer »** is `Button variant="link" size="xs"`, underlined on hover, as every link button is.

### The scope chip is a statement

« Tout votre projet » with `folder-open`: each question goes out with the whole project. It is not a
`Badge` — a badge is a status in a pill, behind a hairline — and not a control, so it is the
composer's own, flat on `bg-neutral` at `radius-control`, Figma's metrics. It is read as the field's
description (`aria-describedby`), so it is heard where the question is typed, and hidden as text so a
reader does not meet it twice.

### The field grows, then scrolls

Measured on every change (`field-sizing: content` still lacks one engine), up to eight lines, then
the field scrolls. The box's focus is the field's: a `:has()` ring round everything the box holds,
`focus-ring-brand` without the shadow step, because the box carries no elevation.

### Measured

Beside Figma's exports at 2×: Vide, Rempli and Réponse en cours are **154, 174 and 148px**, Figma's
heights exactly. Réponse impossible is 200 against 194 — the link button's 2px of transparent border,
and Figma's 28px send in that one state, where every other state draws 32.

## What changes

- New `TolbiAiComposer` (`Saisie/TolbiAiComposer`, `wip`): `v-model`, `status`, `scope`,
  `disclaimer`, and the copy as props (placeholders, failure, labels) with Figma's French as defaults.
  Events `send`, `stop`, `retry`.
- `Button` gains `size="xs"`; `--ds-control-padding-xs` joins the padding scale.
- `IconButton` gains `variant` (`ghost` — what it was — and `primary`); type `IconButtonVariant`.
- In the product: `UChatPrompt` and `UChatPromptSubmit` give way to it.

## Still open

- **Figma follows.** The failed box draws `border-subtle` (code keeps `border-default`: that box still
  takes a question) and a 28px send; « Arrêter » is a pill. `Button`'s set has no `xs` and
  `IconButton`'s no `primary`.
- **No disabled composer.** The product disables its prompt while the history loads; nothing here
  does yet.

**Amended by ADR-0074 (9 Oct.):** the scope chip names the project — `scope` takes the project's name as the
product knows it, « Tout votre projet » is only the fallback; a long name is cut and given whole in a tooltip.
