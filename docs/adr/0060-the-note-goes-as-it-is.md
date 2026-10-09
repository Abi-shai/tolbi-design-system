# ADR-0060 — The note goes as it is

**Date:** 2026-10-07
**Extends:** ADR-0025 (a message opens its own space), ADR-0004 (the icon set is generated),
ADR-0059 (`IconButton`'s variants)
**Source:** Figma Sprint 18, `TolbiAI/Vocal` (`2354:12700`, nine variants: state × transcript ×
language), `TolbiAI/Onde · lecture` (`2354:12064`) and `TolbiAI/Onde · direct` (`2354:12023`). The
fifth of the eight Tolbi AI steps.
**Status:** Accepted

## Context

A question can be spoken. Decided on 7 October: the voice note is sent as it is and goes into the
thread collapsed; its transcript is there on demand; neither the words nor the language can be
corrected; the language is recognised, never chosen, and a badge says which.

## Decisions

### The bubble plays its own recording

`TolbiAiVoiceNote` takes the recording (`src`) and plays it with its own `<audio>`: play and pause,
the waveform split into what has played and what is left, and the time — « 0:23 » at rest, « 0:09 /
0:23 » once started. Starting one note pauses whichever was playing. The length is **given**, not
read off the audio: a MediaRecorder blob reports `Infinity` until it has been played through once.
Without `src` the waveform stays and play is off.

The time holds the width of its playing form from the start. Without it, pressing play widened the
time by 38px, the waveform lost seven bars and folded again — the drawing changed shape the moment it
started to play (measured: 26 bars at rest, 19 playing). Reserved and right-aligned, the count is the
same in both, and durations line up down the thread.

### The waveform is a component of its own

`TolbiAiWaveform` is Figma's `TolbiAI/Onde`: bars 3px wide, 2px apart, 4px at silence and 24px at
full. Two fits, because the composer's recording line needs the other one:

- `tail` — one bar per level, the newest on the right, the oldest leaving on the left;
- `whole` — the recording folded into as many bars as the row holds, each bar the **mean** of its
  share, then scaled to the loudest. Not the peak: folded six to one, peaks flattened every word into
  the same tall bar and the drawing stopped looking like speech. The scaling makes a quiet microphone
  draw a waveform that reads; live levels are not scaled, or a running maximum would make every bar
  jump.

At rest every bar is `text-subtle`; playing, what has played is `text-strong` and what is left
`text-subtlest`. It is decorative — the time beside it says the same in words.

### One button for the transcript, and the focus never moves

« Voir la transcription » and « Masquer la transcription » are the same `Button` (`link`, `xs`), its
words and its chevron following the state, with `aria-expanded` and `aria-controls`. Pressing it
changes what it says, not where the focus is.

### The transcript opens its own space

ADR-0025's one-row grid going 0fr → 1fr, on the element that enters and leaves — 200ms in on
`easing-out`, 100ms out on `easing-in` (ADR-0021: out is faster). The space between the player and the
words lives **inside** the row, so it closes with it; as a flex gap it would have stayed until the
element left and then snapped shut. Filmed at a tenth of the speed: 78 → 106px, at most 0.55px a frame,
no reversal; closing ends on a 0.73px step.

### What is not a transcript is said in the bubble

`transcribing` — « Transcription… » beside a spinner, and no language yet: it is not known.
`failed` — « Une erreur est survenue sur la transcription. » as `role="alert"`, and « Réessayer ».
And a recognised language with no transcription yet — Wolof, in beta — opens on a sentence instead of
words, in italic and the softer ink: the product passes it, since it names the language.

### Two additions to what exists

- `IconButton` gains **`variant="surface"`**: a white disc, for a control standing on a tinted ground
  — the play button on its `bg-neutral` bubble. On white no tint can say hover (`bg-hover` is 1.045:1,
  ADR-0044), so the hover is a contour, drawn as an outline: the focus ring owns `box-shadow`, and a
  hovered button that has the focus shows both.
- **`pause`** joins the icon manifest. Figma drew its own; the code takes Lucide's.

**Amended by ADR-0073 (9 Oct.):** the note aligns itself to the user's side — `align-self: flex-end`, as
`TolbiAiQuestion` does — so a product puts it in a thread without placing it.

## What changes

- New `TolbiAiVoiceNote` (`Identité & média/TolbiAiVoiceNote`, `wip`): `state`, `src`, `duration`,
  `levels`, `language`, `transcript`, `v-model:expanded`, the copy as props; event `retry`.
- New `TolbiAiWaveform` (`Identité & média/TolbiAiWaveform`, `wip`, `primitive`): `levels`, `fit`,
  `progress`.
- `IconButton` `variant="surface"`; `pause` in the icon set.

## Still open

- **Figma follows**: its play disc is 28px (code: `IconButton xs`, 32 — the bubble stands 4px taller),
  « Réessayer » is underlined at rest, and while playing its waveform clips the recording's start
  where code folds it whole.
- **No screen reader has heard it**, as for the waiting line (ADR-0058).
