# ADR-0073 — What the first integration found

**Date:** 2026-10-08
**Amends:** ADR-0061 and ADR-0067 (the voice is opt-in), ADR-0062 (the opening focus; the answer's
markdown), ADR-0068 and ADR-0071 (how a duration is read)
**Extends:** ADR-0039 (a defect that passes every check we own), ADR-0018 (a test that is shown to bite)
**Source:** the product's first integration of 0.55.1 — four findings, measured in etolbi.
**Status:** Accepted

## Context

The product put the Tolbi AI experience in a real page, built for production, and sent back four
findings. Two were defects that every check here had passed, one was a default that contradicted the
integration guide, and one was a gap in what the answer styles.

## Decisions

### A duration read from CSS survives a minifier

`TolbiAiSpark.turn()` and the answer's passing light read their length off the cascade with a bare
`parseFloat`. The source says `1650ms`; the published `dist/index.css` says `1.65s`, because the minifier
shortens the unit — and `parseFloat('1.65s')` is 1.65, so the turn ran in 1.65ms and the light in 1.1ms:
invisible, and only in the built package (Storybook's dev server serves the source). It was wider than
reported: a product's own production build minifies the tokens the same way (`200ms` → `.2s`), which
would have stopped the composer's glides and the history's rows too. Only `SideNavigation` read the
unit.

Every duration read from JavaScript now goes through one parser, `readDuration()` (`composables/cssTime.ts`),
which takes `ms` and `s`, and treats an unreadable value as 0 — no motion rather than the wrong one.
`scripts/css-time.test.mjs` holds it there: the parser on both units; **every time the catalogue
declares, minified by esbuild — the minifier Vite uses — reads back the same**; and no component may
`parseFloat` a `getPropertyValue`. Both directions are proven: put the bare `parseFloat` back and the guard
fails, read seconds as milliseconds and the other two do. Measured in a minified Storybook build, where
the tokens read `.2s`: the turn 1650ms, the light 1100ms, the composer's glide 200ms, a history row 100ms.

### The opened panel focuses the field once it can hold it

Under reduced motion the global `transition-duration: 0.01ms` turns the panel's instant `visibility`
flip into a transition, and the panel stays hidden for two frames after it opens. The field was focused
on the next tick, while still hidden, and focusing a hidden field does nothing: the focus stayed on the
page. The panel now focuses the field once it is visible — a frame at a time, ten at most, and not at all
if the panel closed meanwhile. Measured with reduced motion: ⌘J puts the focus in the field within 45ms,
on the first opening and the next; without reduced motion, as before. The global rule is left alone: it is
right for everything else.

### The voice is opt-in

`voice` defaulted to `true`, so a product that had not wired `send-voice` shipped a working microphone
whose recording went nowhere — what the integration guide warned against, and what the default did
anyway. A microphone that leads nowhere is worse than none, and only the product knows whether it can
transcribe, so **`voice` now defaults to `false`**. Every story that records sets it.

### The answer styles everything markdown writes

The answer styled paragraphs, lists, three heading levels and bold; links, code, code blocks, quotes,
tables, rules, images and `h1` fell back to the browser — a link in its default blue, a Bold 700 `h1`
twice the size of the answer. Now all of it takes the answer's type and rhythm, on tokens:

- **Every heading level** is the answer's emphasis (`body-md-emphasis`), never a page title: the page has
  its one heading (ADR-0051).
- **A link** is `text-brand`, always underlined (colour alone cannot say « link »), with the catalogue's
  ring, instant.
- **Code** is `code-md` (13px on the answer's 20px line, so a word of code never moves the line). A code
  block keeps its lines and scrolls sideways.
- **A quote** has a `border-default` rule. **A table** is set in `body-sm`, with rules and aligned
  figures. **Images** stay within the column.

Story: « Réponse — tout le markdown ».

### Second round (9 Oct.)

Two more, after 0.57.0. **The pass measured the answer once**, at mount: an answer that grew during it — a
slot filling late, an image, a font — kept its new lines under the mask until the end, and they popped in
as the pass finished. The course is now a registered `<number>` running 0 → 1, and the stylesheet turns it
into a place on the answer's height as it is now (`100%` in the mask's gradient, `top` in % for the line),
so whatever grows is uncovered with the rest — no observer, nothing to re-measure. Measured: an answer
growing 300 → 450px 400ms in was whole at 760ms, before the pass ended at 1085ms; the line stayed within
0.5px of the edge it draws.

**The bullets were the browser's**: the answer coloured `li::marker` and left `list-style-type` alone,
so a reset — Tailwind's preflight, `list-style: none` — took them away. The answer now says `disc`,
`decimal`, and `circle` for a nested list. Checked under Tailwind v3's unlayered preflight and v4's
`@layer base`: bullets, padding, links, headings and code all hold.

### Third round (9 Oct.)

**The voice note did not align itself.** In a thread it is the user's side, like the question, but only
`TolbiAiQuestion` set `align-self: flex-end`: the product had to write it on the note itself, as the story
did. The note now aligns itself — the rule belongs to the piece, not to the thread, which would otherwise
have to know its children's classes. Measured in the page: the note and the question both end flush with
the thread's right edge, the note at its 296px ceiling, with no style from the product.

### Fourth round (9 Oct.)

**The launcher's tooltip opened after every close.** Closing from inside the panel hands the focus back to
the launcher, and its focus handler showed the tooltip unconditionally — only the sign's turn was gated —
so « Interroger Tolbi xAI » appeared 400ms later, with the pointer on « Fermer » or nowhere near. A focus
is now an approach only from the keyboard (`:focus-visible`) and never when handed back; hover still says
it. Checked: closed by « Fermer » with the mouse or by ⌘J from the field, the launcher has the focus and
no tooltip; Tab onto it, the tooltip and the turn; hover, the tooltip.

## What changes

- New: `composables/cssTime.ts` (`cssTime`, `readDuration`), internal; `scripts/css-time.test.mjs`.
- `TolbiAiSpark`, `TolbiAiAnswer`, `TolbiAiComposer`, `TolbiAiHistory`, `SideNavigation` read their
  durations through it.
- `TolbiAiPanel` focuses the field once it is visible.
- `TolbiAiComposer`: **`voice` defaults to `false`** — a product that wants the microphone passes `voice`.
- `TolbiAiAnswer` styles the whole markdown vocabulary.

## Still open

- **Nothing reads the built CSS in CI**: the test minifies the declared values itself, with the same
  minifier. A change of minifier in Vite would need the test to follow.
