# ADR-0066 — The answer's actions step back

**Date:** 2026-10-08
**Amends:** ADR-0062 (the panel is a column) — the actions under an answer
**Extends:** ADR-0023 (a mark that confirms uses `MarkTransition`), ADR-0039 (`IconButton xs`), ADR-0061
(the microphone's tooltip)
**Source:** Figma, « Tolbi xAI exploration », `11 · La réponse — texte et actions, mesurés` (`2450:14477`),
track B; `TolbiAI/Panneau` (Conversation) follows
**Status:** Accepted

## Context

The owner found the actions under an answer too big. They were measured against nine products and two
code libraries: the icon's ink at the pixel, the pitch from one action to the next, the ink's contrast,
and what each action does when pressed. Track B was chosen, with one addition asked for: a tooltip on
hover that says what each action does.

## Decisions

### Measured

- Elsewhere the icon draws **14–15px in a 28–32px button — one action every 30 to 34px** — in a receding
  ink: 4.5:1 to 8:1 for Claude, Perplexity and ChatGPT. Ours drew 17–19px (`IconButton sm`, a 20px glyph)
  every 36px, in the text's own ink (10.5:1).
- Two gestures were missing: **a tooltip naming each icon** (ChatGPT, Vercel AI Elements) and **a check
  after a copy** (ChatGPT, assistant-ui). Ours confirmed nothing.
- The answer's text was not the problem: 14/20, an x-height of 7.65px, level with Intercom, Linear and
  Copilot (7.3–7.7px).

### The actions step back

`IconButton xs` — 32px, the glyph at 16 — touching, one action every 32px, **8px under the words**, not 16:
the actions belong to the answer. The ink recedes through a new `IconButton` variant, **`subtle`**: a ghost
in `text-subtle` (7.69:1) that comes forward to `text-default` on hover and once a judgement is set. The
size existed (ADR-0039); the ink did not. It is a variant rather than a local override, because colouring
a child component from outside is one scoped rule fighting another.

### Each action says what it does

A tooltip after 400ms on hover or focus — the microphone's timing (ADR-0061) — and presentational, since
the button's name already says it: « Copier la réponse », « Réponse utile », « Réponse non utile »,
« Générer une autre réponse ». The names explain rather than label: « Régénérer » said what, not what for.

**Amended (8 Oct.):** the 400ms is written once — `useDelayedTooltip` (internal, `composables/`), which
the answer, the panel's head, the microphone and the launcher share. It had been copied into all four.

It opens **above** the action and **starts at its left**. The panel's edge is close on that side, and a
centred tooltip over the first icon was cut by it; the arrow's tip lands on the icon's centre to the pixel.
Above, not below: under the last answer, the scroll area would clip it.

### The copy confirms itself

The answer copies its own words — the slot's text, as it reads — so the check is a fact, not a hope. The
glyph turns into a check through `MarkTransition` (ADR-0023: a mark that confirms an action), the tooltip
says « Réponse copiée », a status region announces it, and two seconds later the copy is back. The button
keeps its name; renaming it would have a screen reader hear the copy twice. `copy` now carries the text,
so a product that copied on the event still can. `IconButton` gains a slot for its glyph — the `Icon` by
default, given the size — which is what lets the check stamp in.

### What does not change

The text (14/20) and the four actions. Track C — without « Régénérer », the bar on the last answer only —
was drawn and not chosen.

## What changes

- `TolbiAiAnswer`: `IconButton xs subtle`, 8px under the words, a tooltip per action, the copy with its
  check; `copiedLabel`; `copy` emits the text; `copyLabel` defaults to « Copier la réponse »,
  `regenerateLabel` to « Générer une autre réponse ».
- `IconButton`: `variant="subtle"`; a default slot for the glyph, given `size`.
- Figma: `TolbiAI/Panneau` (Conversation) draws the actions at 32/16 in `gray-light/600`, 8px under the
  answer; section 11's track B documents the tooltip.

## Still open

- **Figma has no `IconButton` xs or `subtle`**: the panel draws its actions as frames around `Icon`.
- **No screen reader has heard the status** (ADR-0058, ADR-0060).
