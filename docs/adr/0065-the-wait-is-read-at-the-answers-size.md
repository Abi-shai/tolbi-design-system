# ADR-0065 — The wait is read at the answer's size

**Date:** 2026-10-08
**Amends:** ADR-0058 (the words do not move) — the line's type and ink
**Source:** Figma, Big design dump, « Tolbi xAI exploration », `10 · L'attente, mesurée — taille,
encre, mouvement` (`2441:14556`), track B; the component `TolbiAI/Réflexion · ligne` (`2317:4909`)
**Status:** Accepted

## Context

ADR-0058 set the waiting line in `body-sm` / `text-subtlest` — 12px under a 14px answer — on section
9's reading of fifteen screens: « petit et gris », the line stands back and the answer is what
matters. Seen in the panel, the owner found it too small to read. Section 9 had described the products;
it had not measured them.

## Decisions

### Measured, not described

Twelve products, one measure: the x-height of the waiting text over the x-height of the answer (or of
the question) **in the same capture** — same capture, same font, so the ratio holds across typefaces
and capture scales. Gemini was measured live in a browser (computed style, and filmed); the others on
Mobbin's web captures of 2026 (1920px for 1440 CSS), at the pixel. ChatGPT, Perplexity and Grok could
not be measured live: a bot check or a sign-up wall, which we do not get around.

- Of the nine that write something while they wait, **six write it at the answer's size** — ChatGPT
  16 on 16, Gemini 17 on 17, Claude, ClickUp, Notion, Shopify — and **three one step down**, 0.87 to
  0.92 (Perplexity, Linear, Rovo).
- **This line was at 0.86 — the smallest of the lot — and 4.97:1, among the palest.** Most use a
  secondary ink, 7 to 10:1. Only Rovo resembled it (0.87, 5.5:1).
- Eight of eleven animate a sign — their mark, dots, a spinner — rather than the words. ChatGPT is the
  one whose word shimmers.

### The answer's size, a receding ink

The line is the first line of the answer, so it is read like one: `body-md` (14/20), the answer's own
role. What says « not yet » is the ink — `text-subtle`, 7.69:1 — not the size. Three tracks were drawn
with the real component and B was chosen; C, the answer's size in `text-subtlest`, kept the pale ink
that most products do not use.

### The sign sits in a line box

The sign stays 16 and sits in a box one line tall (`1lh`), centred in it, so it rides the first line
whether the words fit on one or wrap — the box follows the role rather than a number, as `Toast`'s glyph
does. Measured: centred on the first line to the pixel, in one line and in three.

### What does not move

The motion is unchanged: the leaves turn, the words do not (ADR-0058) — which is what the benchmark
found most products doing. The shimmer stays declined.

## What changes

- `TolbiAiThinkingLine`: `body-md` / `text-subtle`; the sign in a `1lh` box. No API change.
- Figma: `TolbiAI/Réflexion · ligne` follows (body-md, text/subtle, the sign centred). Section 10's
  track A is frozen as the old line, and section 9's conclusion carries the revision.

## Still open

- **Motion is measured for Tolbi AI and Gemini only** — a still does not show a speed.
- **No screen reader has heard the line** (ADR-0058).
