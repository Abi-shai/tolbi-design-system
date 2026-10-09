# ADR-0068 — The answer arrives under a passing light

**Date:** 2026-10-08
**Departs from:** ADR-0002 (motion principles: length, decoration) and the brand charter (no glow), for
one moment, with the owner's acceptance — the second exception after ADR-0063
**Amends:** ADR-0062 (the thread's arrival no longer applies to an answer)
**Extends:** ADR-0056 (the sign's inks), ADR-0063 (an exception borrows nothing from the scale)
**Source:** Figma, « Tolbi xAI exploration », `13 · La réponse arrive — révélation` (`2459:14722`) —
Mobbin web benchmark, Gemini filmed live, three tracks prototyped and filmed; track B chosen by the
owner on 8 Oct.
**Status:** Accepted

## Context

The owner asked for something special when the model's answer arrives: Tolbi AI carries the product's
strategy, and leaving the system's limits was declared excusable for this moment. Elsewhere the reveal is
a by-product of streaming — Gemini fades fragments in as they are written, Sana AI leaves its last words
pale behind a pulsing dot — and the brands spend their own motion on the wait instead: Mistral's pixel
mosaic, Copilot's shimmer, ClickUp's gradient. Ours arrives whole, because the Yield API does not stream
it, so what others do out of necessity can be staged once, on purpose.

Three tracks were prototyped: A, the sign blooms and the answer unfolds block by block out of a blur;
B, a line of light passes down the answer; C, the words arrive one by one, then the key figures are
highlighted once. The owner chose **B**.

## Decisions

### A light passes, as a satellite passes over a field

A line of light travels down the answer and lets it be seen — what the product does, in motion: it reads
fields from the sky. The line is the sign's: yellow into green, `accent/400` into `brand/500`, bound to the
same primitives as `TolbiAiSpark` (ADR-0010's categorical clause, named suppressions), 2px
(`border-width-strong`) with a yellow glow. Like the awakening's, the glow is outside the charter and was
accepted from the filmed track; in dark the inks do not change, and the light reads on the dark ground.

### What moves is the sight, not the words

The words are in the DOM, laid out at their place and at full opacity from the first frame: nothing
rises, blurs or reflows, and a screen reader has the whole answer at once — snapshotted with the edge at
0.5px, nothing seen, the accessibility tree holds every paragraph and the four actions. What travels is
a **mask** — a
gradient from opaque to transparent over a fall of three lines — whose edge is a registered custom
property (`@property`, `<length>`), animated from 0 to the answer's height plus the fall. The answer's
actions are inside it, so they arrive last, under the same light.

**Amended by ADR-0073 (9 Oct.):** the course is no longer measured once — the height taken at the start left
whatever grew during the pass (a late slot, an image, a font) under the mask, to pop in at the end. A
registered `<number>` runs 0 → 1, and the stylesheet places the edge and the line on the box as it is now
(`100%`), so the growth is uncovered with the rest.

### The line rides the edge it draws

The mask and the line run one duration and one curve, and the line sits half a fall behind the edge, where
the words are half seen — inside the mask, so the light is half seen there too, and cut at the answer's
sides. It fades in over the first 8% and out after 82%, so it never appears or vanishes as a hard bar.
Filmed at a tenth of the speed, three times, over 1,300 frames each: the edge 0 → 360px for a 300px
answer and its 60px fall, the line's centre never more than 1.01px from its place, no reversal on either,
the answer's transform `none` and its opacity 1 throughout. At the end the mask, the light and the inline
fall are removed, and the edge is back at 0.

### Its values are its own

**1.1s**, past `ambient` (600ms), the scale's longest: a pass shorter than that reads as a flash, not as
something travelling over 300px of words. And its own curve, `cubic-bezier(0.45, 0, 0.25, 1)` — close to
`easing-in-out`, but later to start (at 30% of the time the edge has covered 28% of its way, against
in-out's 37%), so the light gathers before it travels, then settles as long. An exception borrows nothing
from the scale it departs from (ADR-0063). Both are declared once, as the component's private values
(`--tolbi-ai-answer-pass`, `--tolbi-ai-answer-pass-easing`), and the script reads them off the cascade.
The text is never late: the last line is seen by 1.1s, inside the 1.2s section 13 set itself.

### Once, on arrival — the thread says which

`TolbiAiThread` provides `settled`, true once it has mounted. An answer that mounts in a settled thread is
an arrival and passes; one that mounts with the thread — a reopened conversation — was already there and
does not. Outside a thread there is nothing to arrive in, so nothing passes. A regenerated answer passes
again when it is a new answer, under a new key.

The thread's own arrival — 8px up and a fade over `enter` (ADR-0062) — **no longer applies to an answer**:
two movements on one arrival would compete, and one movement at a time is the rule (ADR-0058). Questions,
voice notes and the waiting line keep it.

### Nothing passes under reduced motion

The answer is simply there, as every arrival in the thread is: `motion.css` cuts transitions, but a Web
Animation is outside its reach, so the component asks `prefers-reduced-motion` itself — the awakening's
choice (ADR-0063). Nothing is withheld: the motion stages what is seen, never what is there.

## What changes

- `TolbiAiAnswer`: the pass, on arrival. No prop, no event.
- `TolbiAiThread`: provides `settled` (`TOLBI_AI_THREAD`); its arrival leaves answers out.
- Story: `Structure/TolbiAiPanel/La réponse arrive`, with « Rejouer ».

## Still open

- **The charter** now has two glows to admit — the awakening's and the pass's (ADR-0063's open item
  grows).
- **Streaming.** If the answer ever streams, there is no whole answer to pass over at once, and the reveal
  has to be thought again.
- **An answer that grows during the pass** — an image in the product's markdown, loading — is measured at
  the start: what lies past the measured height appears at once when the pass ends.
- **No screen reader has heard it** — the tree is right from the first frame, but that is the DOM, not a
  voice: the same gap as ADR-0052 and ADR-0058.
- **Figma** carries the track as filmed frames in section 13, not as Motion on `TolbiAI/Panneau`.
