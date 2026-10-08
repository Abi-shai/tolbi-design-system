# ADR-0067 — The voice and the text sit side by side

**Date:** 2026-10-08
**Amends:** ADR-0059 (one composer, one action) and ADR-0061 (the microphone held send's place)
**Source:** Figma, « Tolbi xAI exploration », `12 · La saisie — le micro sans la marque` (`2455:14524`) —
the Notion composer (`2455:14558`), pointed at by the owner; `TolbiAI/Saisie` follows
**Status:** Accepted

## Context

ADR-0059 gave the right of the box one control, and ADR-0061 had the microphone hold send's place while
the box was empty: the two traded places on the first keystroke. Section 12's comparison showed the other
arrangement — Notion, Perplexity and Langdock put the microphone and send side by side, send greyed until
there is text. The owner chose it: it is clearer and easier to understand, and it lets someone who has
written a question record a note too, or record and then write.

## Decisions

### Two controls, always

The microphone (`IconButton xs subtle`, ADR-0061 amended) then send (`IconButton xs primary`), 4px apart —
one every 36px, where Notion, Perplexity and Langdock put theirs 30 to 39px apart. What can be done no
longer depends on what has been typed, so nothing moves under the pointer as the user writes.

### Send lights up with the text

On an empty box, send is **disabled** — the grey disc (`bg-disabled`), as Perplexity and Notion grey
theirs. With text it turns green. The hierarchy rises when there is something to send, which is what
removing the brand from the microphone (ADR-0061, amended) set up.

### While an answer comes

« Arrêter » takes send's place and the microphone is **disabled**, its tooltip silenced: no new question
starts while one is being answered, the same reason the field is read-only (ADR-0059).

### Send and « Arrêter » travel

Side by side, a cut between send (32px) and « Arrêter » (85px) threw the microphone 53px in one frame. The
trailing slot now travels the way the box does (ADR-0061): it holds its width while the leaver fades out
in `exit`, then glides to the arriver's width over `enter` on `easing-out` while the arriver comes in — and
the microphone rides the glide. Filmed at a tenth of the speed: 305 → 258px and back, under 1px a frame,
no reversal; an answer landing mid-glide holds the slot where it is and glides it home.

Send's disc and glyph now move together: `IconButton` transitions its ink with its ground, where it
turned the disc and cut the glyph — a white arrow on a grey disc for most of the fade.

### A written question waits for a note

Recording replaces the box's content and leaves the text alone — it is the product's `v-model`, and
nothing in the recording touches it. Deleting or sending the note brings the field back with the question
and the focus. Measured: typed « Comparer avec 2024 », recorded, pressed Escape — the field came back
holding it, focused.

### What does not change

The recording line, its messages (permission, blocked, silence), the undo. Without voice — `voice: false`
or a browser that cannot record — send stands alone. **Amended by ADR-0073:** `voice` is opt-in — it
defaults to `false`, since a microphone whose recording goes nowhere is worse than none.

## What changes

- `TolbiAiComposer`: the microphone shows whenever voice is available, beside send; disabled while an
  answer comes; send disabled on an empty box.
- Figma: `TolbiAI/Saisie` — Vide (the microphone, send greyed), Rempli (the microphone, send green),
  Réponse en cours (the microphone disabled, « Arrêter »), Réponse impossible (the microphone, send at 32px
  like everywhere else; it was 28).

## Still open

- **Recording, then wanting to write** still means leaving the line — sending or deleting the note. A note
  and a text sent together is not something the answer service takes.
