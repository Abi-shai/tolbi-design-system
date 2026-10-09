# ADR-0074 — The answer is read aloud, and the chip names the project

**Date:** 2026-10-09
**Amends:** ADR-0066 (the answer's actions) — a fifth action; ADR-0059 (the scope chip) — it names the
project; ADR-0060 (one note at a time) — one sound at a time
**Extends:** ADR-0069 (a cut title is given whole in a tooltip), ADR-0073 (presence of a capability
decides)
**Source:** two comments from the IT department on the product's preview, 8–9 Oct.: « Ajouter la
possibilité de lire sa réponse » on the answer's actions, and « Préciser le nom du projet » on the
composer's chip.
**Status:** Accepted

## Context

The answer could be copied, judged and regenerated, but not heard — while the question beside it could
be asked by voice. And the composer's chip said « Tout votre projet », which tells the user that every
question goes out with the project, but not which project.

## Decisions

### The answer can be read aloud

A fifth action, after the copy — both use the words as they are: « Lire la réponse », `volume-2`, on
`IconButton xs subtle` like the others, with the catalogue's tooltip delay. Pressed, the browser's own
voice reads the slot's text — what the copy takes — in the answer's language (`lang`, default `fr-FR`,
the voice chosen for it), one block at a time, because Chrome cuts a long utterance off after about
fifteen seconds. While it reads, the glyph turns into a square through `MarkTransition`, the button is
`active` and its name and tooltip become « Arrêter la lecture »: the same button stops it. At the last
block it is back at rest.

It needs nothing of the product, so it is on by default (`readAloud`). Where the browser cannot speak there
is no button: the capability's presence decides. `read` is emitted as it starts, for the product to
count it.

### One sound at a time

The panel now has two voices, a voice note and an answer read aloud, and only one of them speaks: starting
one stops the other — and another answer's reading. The microphone stops whatever is sounding before it
opens, or a recording would pick up the panel's own voice. A reading also stops when its answer leaves and
when the panel closes. `now-playing.ts`, which kept one voice note playing, keeps one sound now.

Verified with a simulated voice (a headless browser has none): fourteen blocks read in French on a French
voice, back at rest after the last; a second press stops it; a second answer stops the first; a voice
note and the microphone stop a reading; closing the panel stops it; no speech synthesis, no button.

### The chip names the project

`scope` takes the project's name as the product knows it — « Rendement Arachide Nord » — and « Tout votre
projet » stays only as the fallback for a product that cannot name it. The folder glyph already says it is
a project. A name too long for the box is cut rather than let past it, and given whole in a tooltip
when it is cut — ADR-0069's rule for the conversation's title — with a line saying what the chip means
(« Vos questions portent sur ce projet. », `scopeHint`), in `Tooltip`'s two-line form, which wraps at
320px where a one-line tooltip would run past the panel. The field's description reads the whole name.
Measured: a short name 195px, not cut, no tooltip; a 79-character name cut at 344px in a 368px box.

## What changes

- `TolbiAiAnswer`: read aloud — `readLabel`, `stopReadingLabel`, `lang`, `readAloud`, event `read`.
- `TolbiAiComposer`: `scope` documented as the project's name; the chip cuts a long name, with
  `scopeHint` under the whole name in its tooltip. The microphone silences the panel before recording.
- `TolbiAiVoiceNote`: playing stops a reading.
- Icons: `volume-2`, `square`.
- In the product: pass the project's name to `scope`; pass `lang` if an answer is not in French.

## Still open

- **The browser's voice** is what it is: its quality varies by system, and no browser speaks Wolof. A
  product that wants another voice will need a way to bring its own audio.
- **No screen reader has heard** the reading's state change.
