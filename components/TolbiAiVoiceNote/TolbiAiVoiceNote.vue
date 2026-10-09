<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { nowPlaying } from './now-playing'
import { Badge } from '../Badge'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import { Spinner } from '../Spinner'
import { TolbiAiWaveform } from '../TolbiAiWaveform'

/**
 * Where the transcript stands. The audio is there from the start; the words
 * come after.
 *
 * `transcribing` — « Transcription… », and no language yet: it is not known.
 * `transcribed` — the recognised language, and the transcript behind
 * « Voir la transcription ». `failed` — said in the bubble, with a retry.
 */
export type TolbiAiVoiceNoteState = 'transcribing' | 'transcribed' | 'failed'

interface Props {
  state?: TolbiAiVoiceNoteState
  /** The recording. Without it there is nothing to play, and play is off. */
  src?: string
  /**
   * Its length in seconds. Given, not read off the audio: a MediaRecorder
   * blob reports `Infinity` until it has been played through once.
   */
  duration: number
  /** The recording's sound levels, 0 to 1, one every 100 ms. */
  levels?: number[]
  /**
   * The language Tolbi AI recognised — « Français », « Anglais »,
   * « Wolof · Bêta ». Recognised, never chosen: the badge only says it.
   */
  language?: string
  /**
   * The words, as transcribed — sent as they are, never corrected. Empty
   * where the language has no transcription yet: the bubble says so instead.
   */
  transcript?: string | null
  /** What the open transcript says when there are no words to show. */
  unavailableMessage?: string
  showLabel?: string
  hideLabel?: string
  transcribingLabel?: string
  failedMessage?: string
  retryLabel?: string
  playLabel?: string
  pauseLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  state: 'transcribed',
  src: undefined,
  levels: () => [],
  language: undefined,
  transcript: null,
  unavailableMessage: 'La transcription n’est pas encore disponible dans cette langue.',
  showLabel: 'Voir la transcription',
  hideLabel: 'Masquer la transcription',
  transcribingLabel: 'Transcription…',
  failedMessage: 'Une erreur est survenue sur la transcription.',
  retryLabel: 'Réessayer',
  playLabel: 'Écouter le vocal',
  pauseLabel: 'Mettre en pause',
})

const emit = defineEmits<{
  /** « Réessayer » — transcribe the recording again. */
  retry: []
}>()

/** Collapsed by default: the note goes into the thread as it is. */
const expanded = defineModel<boolean>('expanded', { default: false })

const transcriptId = `ds-tolbi-ai-voice-note-${useId()}`

/* ── Playback ─────────────────────────────────────────────────────────── */
const audio = ref<HTMLAudioElement>()
const playing = ref(false)
const position = ref(0)

function toggle() {
  const el = audio.value
  if (!el) return
  if (!el.paused) {
    el.pause()
    return
  }
  if (nowPlaying.audio && nowPlaying.audio !== el) nowPlaying.audio.pause()
  nowPlaying.stopReading?.()
  nowPlaying.audio = el
  el.play().catch(() => (playing.value = false))
}

function onEnded() {
  playing.value = false
  position.value = 0
  if (audio.value) audio.value.currentTime = 0
}

/* The waveform shows how far it has gone while there is somewhere it has got
   to — playing, or paused part-way. At the start or the end, one ink. */
const started = computed(() => playing.value || position.value > 0)
const progress = computed(() =>
  started.value && props.duration > 0 ? Math.min(1, position.value / props.duration) : null,
)

const clock = (seconds: number) => {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
const time = computed(() =>
  started.value ? `${clock(position.value)} / ${clock(props.duration)}` : clock(props.duration),
)
</script>

<template>
  <div class="ds-tolbi-ai-voice-note">
    <div>
      <div class="ds-tolbi-ai-voice-note__player">
        <IconButton
          :icon="playing ? 'pause' : 'play'"
          variant="surface"
          size="xs"
          :ariaLabel="playing ? pauseLabel : playLabel"
          :disabled="!src"
          @click="toggle"
        />
        <TolbiAiWaveform
          class="ds-tolbi-ai-voice-note__waveform"
          :levels="levels"
          fit="whole"
          :progress="progress"
        />
        <Badge v-if="state === 'transcribed' && language" :label="language" tone="neutral" size="sm" />
        <span class="ds-tolbi-ai-voice-note__time">{{ time }}</span>
      </div>

      <!--
        The transcript opens the space it needs (ADR-0025): a one-row grid going
        0fr → 1fr on the element that enters and leaves. Its top spacing lives
        inside the row, so it closes with it instead of jumping at the end.
      -->
      <Transition name="ds-tolbi-ai-transcript">
        <div
          v-if="state === 'transcribed' && expanded"
          :id="transcriptId"
          class="ds-tolbi-ai-voice-note__transcript"
        >
          <div class="ds-tolbi-ai-voice-note__transcript-inner">
            <p v-if="transcript" class="ds-tolbi-ai-voice-note__words">{{ transcript }}</p>
            <p v-else class="ds-tolbi-ai-voice-note__words ds-tolbi-ai-voice-note__words--unavailable">
              {{ unavailableMessage }}
            </p>
          </div>
        </div>
      </Transition>
    </div>

    <div v-if="state === 'transcribing'" class="ds-tolbi-ai-voice-note__status">
      <Spinner :size="16" />
      {{ transcribingLabel }}
    </div>

    <template v-else-if="state === 'failed'">
      <div class="ds-tolbi-ai-voice-note__failure">
        <Icon name="circle-alert" :size="16" class="ds-tolbi-ai-voice-note__failure-icon" />
        <span role="alert">{{ failedMessage }}</span>
      </div>
      <Button
        class="ds-tolbi-ai-voice-note__link"
        variant="link"
        size="xs"
        :label="retryLabel"
        @click="emit('retry')"
      />
    </template>

    <!-- One button, its words and its chevron following the state: the focus
         never has to move. -->
    <Button
      v-else
      class="ds-tolbi-ai-voice-note__link"
      variant="link"
      size="xs"
      :label="expanded ? hideLabel : showLabel"
      :icon-trailing="expanded ? 'chevron-up' : 'chevron-down'"
      :aria-expanded="expanded"
      :aria-controls="transcriptId"
      @click="expanded = !expanded"
    />

    <audio
      v-if="src"
      ref="audio"
      :src="src"
      preload="metadata"
      @play="playing = true"
      @pause="playing = false"
      @timeupdate="position = ($event.target as HTMLAudioElement).currentTime"
      @ended="onEnded"
    />
  </div>
</template>

<style scoped>
/*
  The user's side of the thread: `bg-neutral`, Figma's 10px / 12px inset. The
  296px Figma draws is a ceiling, not a size (ADR-0031): in a narrower thread
  the bubble narrows and the waveform folds into fewer bars.
*/
.ds-tolbi-ai-voice-note {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  box-sizing: border-box;
  width: 100%;
  max-width: 18.5rem;
  padding: 10px var(--ds-spacing-lg);
  border-radius: var(--ds-radius-surface-sm);
  background: var(--ds-bg-neutral);
}

.ds-tolbi-ai-voice-note__player {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

.ds-tolbi-ai-voice-note__waveform {
  flex: 1;
}

/*
  The time holds the width of its playing form, « 0:00 / 0:00 », from the
  start. Otherwise pressing play widens it by 38px, the waveform loses seven
  bars and folds again — the drawing changes shape the moment it starts to
  play (measured: 26 bars at rest, 19 playing). Right-aligned, so durations
  line up down the thread.
*/
.ds-tolbi-ai-voice-note__time {
  min-width: 8.5ch;
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
  text-align: right;
  white-space: nowrap;
}

.ds-tolbi-ai-voice-note__transcript {
  display: grid;
  grid-template-rows: 1fr;
}

.ds-tolbi-ai-voice-note__transcript-inner {
  min-height: 0;
  overflow: hidden;
}

.ds-tolbi-ai-voice-note__words {
  margin: 0;
  padding-top: var(--ds-spacing-md);
  font: var(--ds-font-body-md);
  color: var(--ds-text-strong);
}

/* No words to show is not a transcript: the slant and the softer ink say so.
   `font-style` after the shorthand, which resets it (ADR-0011's trap). */
.ds-tolbi-ai-voice-note__words--unavailable {
  font-style: italic;
  color: var(--ds-text-subtle);
}

/* 200ms in, 100ms out: it makes room when asked, and gets out of the way
   faster than it came (ADR-0021). */
.ds-tolbi-ai-transcript-enter-active {
  transition:
    grid-template-rows var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    opacity            var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
}

.ds-tolbi-ai-transcript-leave-active {
  transition:
    grid-template-rows var(--ds-motion-duration-exit) var(--ds-motion-easing-in),
    opacity            var(--ds-motion-duration-exit) var(--ds-motion-easing-in);
}

.ds-tolbi-ai-transcript-enter-from,
.ds-tolbi-ai-transcript-leave-to {
  grid-template-rows: 0fr;
  opacity: 0;
}

.ds-tolbi-ai-voice-note__status {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-tolbi-ai-voice-note__failure {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-sm);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-error);
}

.ds-tolbi-ai-voice-note__failure-icon {
  flex-shrink: 0;
}

/* A link is as wide as its words — never the bubble's width. */
.ds-tolbi-ai-voice-note__link {
  align-self: flex-start;
}
</style>
