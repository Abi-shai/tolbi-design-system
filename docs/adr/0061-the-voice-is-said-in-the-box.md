# ADR-0061 — The voice is said in the box

**Date:** 2026-10-07
**Extends:** ADR-0059 (one composer, one action), ADR-0060 (the voice note and its waveform)
**Source:** Figma Sprint 18, `TolbiAI/Saisie` (`2354:12487`) — states Enregistrement, Limite proche,
Pause, Autorisation, Micro refusé, Rien entendu — and `TolbiAI/Onde · direct` (`2354:12023`). The
sixth of the eight Tolbi AI steps.
**Status:** Accepted

## Context

The composer takes the voice too, and the decisions of 7 October fix its shape: one composer; the
microphone replaces send while the box is empty; a recording is one line; the permission, a blocked
microphone and silence are said in the box, never in a modal; a note is sent as it is. The handoff left
one call to the package: whether the recording lives here or in the product.

## Decisions

### The recording is the package's

`TolbiAiComposer` records, and the product receives a recording — `send-voice` carries the blob, its
length and its levels, which is exactly what `TolbiAiVoiceNote` draws. Behind it, `useVoiceRecorder`
lives beside the composer rather than in `composables/`: its `VoiceRecording` is part of the
composer's public types, and a declaration may only point at what the package ships. What it carries:

- **the permission is read before it is asked** — `navigator.permissions` is authoritative, and a
  grant seen once in the page stands in only where the browser cannot be asked;
- **levels are sampled**: one every 100ms, the RMS of the analyser's time-domain window, ×3.5 then
  square-rooted to lift the quiet end, where most of a voice is;
- **time is measured**, not counted, so a throttled interval cannot slow the timer;
- **the cap pauses, it does not stop** — at two minutes (`voiceLimit`), what was said can still be
  sent;
- **the microphone is released the moment it is not needed** — on send, on delete, on unmount. A
  browser shows its recording indicator while a track is live; holding one open behind a deleted note
  would be a lie;
- the audio context is resumed after it is created: it is created after an `await`, and a suspended
  one feeds the analyser silence — which this composer would then call « Je n'ai rien entendu ».

### The microphone holds send's place

While the box is empty and the browser can record, the action is the microphone (`IconButton`
`primary`); typing brings send back. Its tooltip, « Envoyer un vocal », arrives after 400ms through
`Tooltip` and `SurfaceTransition`, and is presentational: the button's own name already says it.

**Amended (8 Oct.):** the microphone loses the brand fill — it is `IconButton xs subtle`, no ground, in
`text-subtle`. The brand disc gave recording a weight it does not have on an empty box. Compared in
Figma (« Tolbi xAI exploration », `12 · La saisie — le micro sans la marque`, `2455:14524`): Claude,
Perplexity, Copilot, Notion and Langdock draw the microphone as a grey glyph; the filled disc is send,
arriving with the text, or ChatGPT's voice mode, in black. One action still holds the right of the box
(ADR-0059), and the green now arrives with send: the hierarchy rises when there is something to send.

**Amended again by ADR-0067:** the microphone no longer holds send's place — the two sit side by side,
always, and a question written waits in the field while a note is recorded.

### One line, and it holds the focus

Recording, the box is one line: delete, the red dot and the timer, the live waveform (`tail`, in the
default ink), pause, send. The dot breathes — 100 % to 40 % and back, a one-second period on
`easing-in-out` — the one sign that sound is being taken, and it stops under reduced motion while the
waveform does not: the waveform is information.

Paused, the line becomes the recording so far: listen back (`IconButton` gains **`neutral`**, the
voice note's disc the other way round — a disc stands off its ground, so the variant depends on the
ground), the whole waveform, its length, resume, send. In the last fifteen seconds the timer and
« Encore 13 s » take the warning ink — the words carry it too, so the colour is never alone. At the
cap the recording pauses itself and resume goes.

The line takes the focus when recording starts, and its keys are its own: **Enter** sends, **Escape**
deletes from anywhere in it, **Space** pauses and resumes — on the line itself only, so a button inside
keeps its own Enter and Space. Pause and resume are two buttons that trade places, so the focus goes
back to the line rather than with the button that left. A screen reader hears « Enregistrement en
cours » at the start and every ten seconds with the time, the pause, and the cap.

### Messages in the box

Before the browser's own prompt, the box explains: « Tolbi AI a besoin du micro », *Plus tard* /
*Autoriser le micro*. Blocked: « Le micro est bloqué pour ce site », *Écrire plutôt* / *Réessayer*.
Silence: « Je n'ai rien entendu », *Annuler* / *Réessayer*. Each replaces the box's content — scope
chip included, as Figma draws it — with two `Button`s at `sm`, is announced, and takes the focus on its
main action. A recording whose loudest level stays under **0.12** is silence and is not sent: a
background hum sits below that, a quiet voice above 0.2.

### Deleted, and undone

Delete emits `delete-voice`; the product shows « Vocal supprimé » with « Annuler » — a `Toast` with an
action stays 8s — and calls `undoDelete()` on it. The composer keeps the recording exactly that long.

**Amended (8 Oct.):** it no longer counts. The toast's time pauses while the pointer or the focus is on
it (ADR-0052), so an 8s clock of the composer's own let « Annuler » outlive the recording — the button
that a keyboard user takes longest to reach did nothing. The recording is now kept until a new one starts
or the composer leaves the page; measured, a toast held for 9s still brings it back.
Restored, it comes back paused: it can be heard and sent, not extended, because the microphone was
released when it was deleted. Privacy over completeness.

### The box travels between its contents

Text to recording, recording to text, either to a message: the leaving content fades out in place in
`exit` (100ms, `easing-in`) inside a box that keeps its height; then the box glides to the new height
while the arriving content comes in over `enter` (200ms, `easing-out`), sliding its last 8px from the
action's side — no slide under reduced motion. The glide is a Web Animation whose duration and curve
are read off the cascade, so a slowed token slows it too.

It shipped broken once. Cancelling the previous glide — even one that had finished — queues its
`cancel` event, which unlocked the box in the middle of the next swap: on the way back to the field the
box cut 30px in one frame. The old animation is detached before it is cancelled. Filmed at a tenth of
the speed: 114 ↔ 84px and 114 ↔ 124px, at most 0.61px a frame, no reversal.

**Amended (8 Oct.):** an interrupted glide jumped to where it was going. The lock read the box's size after
cancelling the running glide, which reports the destination once cancelled; it now reads what is seen
first, to the subpixel (`offsetHeight` rounds, and a lock 0.13px short reads as a step back). Found on the
trailing slot's glide (ADR-0067): 6px in one frame when an answer landed mid-travel.

### Two guards in the build

Both found here, both silent until now: a declaration error drops a component's `.d.ts` while the build
stays green (0.37.0 shipped `TolbiAiVoiceNote` untyped), and a declaration that imports from outside
`dist/` ships a dangling path — the recorder's first home, `composables/`, would have done that. The
build now fails on either; each was proven by reintroducing the fault.

**Amended the same day:** Storybook builds with the project's `vite.config.ts`, plugins included, so the
declaration plugin ran inside `build-storybook` too, wrote into `storybook-static/` — and the second
guard rejected every declaration there, since none of them is inside `dist/`. The Vercel deployment
failed from 0.38.0 until the fix: Storybook now drops the plugin (`viteFinal`), and the guard checks
against the build's real output directory. A guard is part of every build that loads it.

## What changes

- `TolbiAiComposer`: `voice` (default on), `voiceLimit` (120s), `voiceLabels`; events `send-voice` and
  `delete-voice`; `undoDelete()` exposed. Types `TolbiAiVoiceRecording`, `TolbiAiComposerVoiceLabels`.
- `IconButton` gains `variant="neutral"`.
- Stories drive the voice states against a microphone the story controls (granted, still to ask,
  blocked, silent, a 20s limit), and one against the real microphone.
- In the product: the recording, the permission and the undo toast's wiring.

## Still open

- **The voice note's entrance into the thread** — 200ms, 8px up, a fade — belongs to the thread, which
  is the panel's: the next step.
- **0.12 is measured on a simulated microphone.** It is the right order of magnitude; real devices in
  the field may move it.
- **No screen reader has heard it** (ADR-0058, ADR-0060).
