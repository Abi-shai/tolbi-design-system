/**
 * One voice note plays at a time: starting one pauses whichever was playing.
 * Shared by every `TolbiAiVoiceNote` on the page — a module, because a second
 * `<script>` block beside `<script setup>` makes its props private and the
 * component's declaration file silently stops being emitted.
 */
export const nowPlaying: { audio: HTMLAudioElement | null } = { audio: null }
