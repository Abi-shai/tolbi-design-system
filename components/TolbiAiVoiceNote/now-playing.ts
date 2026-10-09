/**
 * One sound at a time: a voice note playing, or an answer read aloud
 * (ADR-0074). Starting one stops whichever was sounding — and so does the
 * microphone, or a recording would pick up the panel's own voice. Shared by
 * every `TolbiAiVoiceNote`, `TolbiAiAnswer` and `TolbiAiComposer` on the page —
 * a module, because a second `<script>` block beside `<script setup>` makes
 * its props private and the component's declaration file silently stops being
 * emitted.
 */
export const nowPlaying: { audio: HTMLAudioElement | null; stopReading: (() => void) | null } = {
  audio: null,
  stopReading: null,
}

/** Silence whatever is sounding: a voice note, an answer being read. */
export function hush() {
  nowPlaying.audio?.pause()
  nowPlaying.stopReading?.()
}
