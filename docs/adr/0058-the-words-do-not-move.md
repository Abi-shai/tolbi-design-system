# ADR-0058 — The words do not move

**Date:** 2026-10-07
**Extends:** ADR-0057 (the thinking loop), ADR-0052 (live roles)
**Source:** Figma Sprint 18, `TolbiAI/Réflexion · ligne` (`2317:4909`), text property « Texte ». The
third of the eight Tolbi AI steps.
**Status:** Accepted

## Context

While Tolbi AI prepares an answer, the product shows three bouncing grey dots in two places of
`tolbi-ai-panel.vue` — the thread's indicator, and an answer whose markdown is still rendering. The
Yield chat API returns the whole answer at once, so there are no steps to show; the line has to say
that work is happening, and what kind, without pretending to more.

## Decisions

### One line, one movement

`TolbiAiThinkingLine` is the thinking sign at 16 (`TolbiAiSpark state="thinking"`) and a few words
in `body-sm`, `text-subtlest`, `spacing-md` apart — Figma's frame exactly: rendered at 3× beside
Figma's export, the ink of the two sits in the same box to the pixel. The leaves turn and **the words
do not**: no shimmer, no animated ellipsis, because one movement at a time is what lets either be
read. The line sits where the answer will appear, and the answer takes its place.

The sign aligns to the line's start, not its centre, so if the words wrap it stays on the first line
— it is exactly one 16px line box tall.

### Two texts, and the second one is a fact about time

`label` (« Je lis les données du projet… ») and `longWaitLabel` (« Encore un instant… ») after
`longWaitAfter` ms, 10 000 by default, counted from the moment the line appears. `null` keeps the
first text for the whole wait. Both defaults are Figma's copy verbatim, and both are props so the
product can localise them. The change is a cut: a text that cross-faded would be a second movement.

### The status is announced, once per text

A live region announces a **change**. One that arrives already filled is announced by some screen
readers and skipped by others — and this line only ever arrives, since it is mounted when the
question is sent. So what the eye reads and what the reader hears are two elements:

- the visible words are `aria-hidden`, or a reader moving through the page would meet them twice;
- a visually hidden `role="status"` (polite, atomic) is mounted **empty** and filled 100 ms later —
  the wait the established announcers use for the same reason (React Aria's, Angular CDK's) — then
  follows every change of words after that.

Traced in Chromium with a mutation observer: empty at mount, the first text at ~100 ms, the second at
the threshold, nothing else. The accessibility tree holds one node, `status`; the sign and the
visible words are not in it.

## What changes

- New `TolbiAiThinkingLine` (`Feedback & chargement/TolbiAiThinkingLine`, `wip`): `label`,
  `longWaitLabel`, `longWaitAfter`.
- In the product: the two sets of bouncing dots give way to it.

## Still open

- **No screen reader has heard it.** The announcement is verified in the DOM and the accessibility
  tree, not by VoiceOver or NVDA — the same gap ADR-0052 recorded for `Toast`, now on two components.
