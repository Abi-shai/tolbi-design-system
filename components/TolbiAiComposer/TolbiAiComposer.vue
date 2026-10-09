<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { useDelayedTooltip } from '../../composables/useDelayedTooltip'
import { readDuration } from '../../composables/cssTime'
import { Icon, type IconName } from '../Icon'
import { IconButton } from '../IconButton'
import { Button } from '../Button'
import { Tooltip } from '../Tooltip'
import { SurfaceTransition } from '../SurfaceTransition'
import { TolbiAiWaveform } from '../TolbiAiWaveform'
import { hush } from '../TolbiAiVoiceNote/now-playing'
import {
  readVoicePermission,
  useVoiceRecorder,
  voiceSupported,
  type VoiceRecording,
} from './useVoiceRecorder'

/**
 * Where the last question stands — the one fact the composer cannot know.
 *
 * `ready` — nothing is waiting. `pending` — an answer is on its way: the box
 * goes quiet, the placeholder says so, and « Arrêter » takes the action's
 * place. `failed` — the answer did not come: a line above the box says so and
 * offers to send it again, and the question stays in the box.
 */
export type TolbiAiComposerStatus = 'ready' | 'pending' | 'failed'

export type { VoiceRecording as TolbiAiVoiceRecording }

/** The voice half's words, French by default, each one replaceable. */
export interface TolbiAiComposerVoiceLabels {
  /** The microphone's name, and its tooltip. */
  record: string
  recording: string
  remove: string
  pause: string
  resume: string
  listen: string
  stopListening: string
  send: string
  /** The countdown in the last fifteen seconds. */
  remaining: (seconds: number) => string
  askTitle: string
  askBody: string
  askLater: string
  askAllow: string
  deniedTitle: string
  deniedBody: string
  deniedWrite: string
  deniedRetry: string
  silentTitle: string
  silentBody: string
  silentCancel: string
  silentRetry: string
  /** What a screen reader hears while recording — said again every ten seconds. */
  announceRecording: (seconds: number) => string
  announcePaused: string
  announceCapped: string
}

const VOICE_LABELS: TolbiAiComposerVoiceLabels = {
  record: 'Envoyer un vocal',
  recording: 'Enregistrement vocal',
  remove: 'Supprimer le vocal',
  pause: 'Mettre en pause',
  resume: 'Reprendre l’enregistrement',
  listen: 'Réécouter',
  stopListening: 'Arrêter l’écoute',
  send: 'Envoyer le vocal',
  remaining: (s) => `Encore ${s} s`,
  askTitle: 'Tolbi AI a besoin du micro',
  askBody: 'Pour écouter votre vocal. Votre navigateur va vous le demander, une seule fois.',
  askLater: 'Plus tard',
  askAllow: 'Autoriser le micro',
  deniedTitle: 'Le micro est bloqué pour ce site',
  deniedBody: 'Cliquez sur le cadenas à gauche de l’adresse, autorisez le micro, puis réessayez.',
  deniedWrite: 'Écrire plutôt',
  deniedRetry: 'Réessayer',
  silentTitle: 'Je n’ai rien entendu',
  silentBody: 'Vérifiez que le micro est branché et que le son passe, puis réessayez.',
  silentCancel: 'Annuler',
  silentRetry: 'Réessayer',
  announceRecording: (s) => (s ? `Enregistrement en cours, ${s} secondes` : 'Enregistrement en cours'),
  announcePaused: 'Enregistrement en pause',
  announceCapped: 'Limite atteinte : l’enregistrement est en pause',
}

interface Props {
  /** The question being written. */
  modelValue?: string
  status?: TolbiAiComposerStatus
  placeholder?: string
  /** The placeholder while an answer is on its way. */
  pendingPlaceholder?: string
  /**
   * What every question is asked about — **the project's name**, as the
   * product knows it (« Rendement Arachide Nord »): a statement, not a control,
   * each question going out with the whole project (ADR-0074). « Tout votre
   * projet » is only the fallback for a product that cannot name it. A long
   * name is cut, and given whole in a tooltip. `null` hides it.
   */
  scope?: string | null
  /** Under the project's whole name, in the tooltip a cut name opens. */
  scopeHint?: string
  /** The line under the box. `null` hides it. */
  disclaimer?: string | null
  failedMessage?: string
  retryLabel?: string
  sendLabel?: string
  stopLabel?: string
  /** The field's accessible name — a placeholder is not one. */
  inputLabel?: string
  /**
   * Offer to speak the question: the microphone beside send, where the
   * browser can record at all. **Opt-in** — set it once the product can do
   * something with `send-voice` (upload, transcribe): a microphone whose
   * recording goes nowhere is worse than none.
   */
  voice?: boolean
  /**
   * How long a voice note may run, in seconds. It pauses itself there and can
   * still be sent; the last fifteen seconds count down.
   */
  voiceLimit?: number
  voiceLabels?: Partial<TolbiAiComposerVoiceLabels>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  status: 'ready',
  placeholder: 'Demander à Tolbi AI…',
  pendingPlaceholder: 'Tolbi AI répond…',
  scope: 'Tout votre projet',
  scopeHint: 'Vos questions portent sur ce projet.',
  /* No « Veuillez vérifier les sources citées » — the answer cites none
     since it stopped naming the product's own data (ADR-0062, amended). */
  disclaimer: 'Tolbi AI est une intelligence artificielle, et peut faire des erreurs.',
  failedMessage: 'Tolbi AI n’a pas pu répondre pour le moment.',
  retryLabel: 'Réessayer',
  sendLabel: 'Envoyer',
  stopLabel: 'Arrêter',
  inputLabel: 'Demander à Tolbi AI',
  voice: false,
  voiceLimit: 120,
  voiceLabels: () => ({}),
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  /**
   * The question, trimmed — from Enter or from the send button. The composer
   * does not clear itself: the product moves the question into the thread
   * (and empties the model), and puts it back if the answer fails.
   */
  send: [question: string]
  /** « Arrêter » — the product cancels the answer and sets `ready`. */
  stop: []
  /** « Réessayer » — send the question in the box again, as it is. */
  retry: []
  /**
   * A voice note, sent as it is: the recording, its length and its levels —
   * what `TolbiAiVoiceNote` draws. Never a silent one: the box says it heard
   * nothing instead.
   */
  'send-voice': [recording: VoiceRecording]
  /**
   * The recording was deleted. Show « Vocal supprimé » with « Annuler » — a
   * `Toast` with an action — and call `undoDelete()` on « Annuler ». The
   * recording waits for as long as the toast offers it.
   */
  'delete-voice': []
}>()

const labels = computed<TolbiAiComposerVoiceLabels>(() => ({ ...VOICE_LABELS, ...props.voiceLabels }))

const box = ref<HTMLElement>()
const field = ref<HTMLTextAreaElement>()
const line = ref<HTMLElement>()
const scopeId = `ds-tolbi-ai-composer-scope-${useId()}`

const pending = computed(() => props.status === 'pending')
const canSend = computed(() => !pending.value && props.modelValue.trim() !== '')

/* ── Text ─────────────────────────────────────────────────────────────── */

/*
  Every action hands the focus back to the field. The control that was pressed
  is about to be replaced — send by « Arrêter », « Arrêter » by send, the
  failure line by nothing — and a removed element takes the focus with it.
*/
function focusField() {
  void nextTick(() => field.value?.focus())
}

function send() {
  if (!canSend.value) return
  emit('send', props.modelValue.trim())
  focusField()
}

function stop() {
  emit('stop')
  focusField()
}

function retry() {
  emit('retry')
  focusField()
}

/*
  Enter sends, Shift+Enter breaks the line. A plain Enter never inserts a line,
  even when there is nothing to send. Not while an input method is composing:
  that Enter confirms a character, and sending on it would cut the word.
*/
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return
  event.preventDefault()
  send()
}

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}

/*
  The box grows with the question, line by line, up to its cap; past it the
  field scrolls. Measured rather than left to `field-sizing: content`, which one
  of the three engines still lacks.
*/
function fit() {
  const el = field.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

watch(() => props.modelValue, () => nextTick(fit))
onMounted(fit)

/* ── Voice ────────────────────────────────────────────────────────────── */

/**
 * What the box shows. `text` — the field. `recording` — the one-line recorder,
 * recording or paused. `ask`, `denied`, `silent` — a message in the box, never
 * a modal.
 */
type Mode = 'text' | 'recording' | 'ask' | 'denied' | 'silent'
const mode = ref<Mode>('text')

const recorder = useVoiceRecorder({ maxSeconds: props.voiceLimit })
const supported = ref(false)
onMounted(() => (supported.value = voiceSupported()))

/*
  The microphone and send sit side by side and never trade places (ADR-0067):
  what can be done does not depend on what has been typed. The microphone is
  there whenever the browser can record — with a question written, a note can
  still be recorded, and the question waits in the field for it.
*/
const micShown = computed(() => props.voice && supported.value)

/*
  A deleted recording is kept until something takes its place — a new
  recording, or the composer leaving the page — so its « Annuler » works for as
  long as the toast offers it. The toast owns that time, and it pauses while
  the pointer or the focus is on it (ADR-0052): an 8s clock of the composer's
  own let the button outlive the recording. Restored, it comes back paused: it
  can be heard and sent, not extended, because the microphone was released
  when it was deleted.
*/
let deleted: VoiceRecording | null = null
const held = ref<VoiceRecording | null>(null)

const recordingNow = computed(() => recorder.status.value === 'recording')
const pausedNow = computed(() => recorder.status.value === 'paused' || held.value !== null)
const seconds = computed(() => held.value?.duration ?? recorder.elapsed.value)
const lineLevels = computed(() => held.value?.levels ?? recorder.levels.value)

/* The last fifteen seconds count down, in the warning ink. */
const WARN_AT = 15
const remaining = computed(() => Math.max(0, Math.ceil(recorder.maxSeconds - recorder.elapsed.value)))
const nearLimit = computed(() => recordingNow.value && remaining.value <= WARN_AT)

const clock = (s: number) => {
  const whole = Math.max(0, Math.floor(s))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

async function openMic() {
  const permission = await readVoicePermission()
  if (permission === 'granted') return record()
  if (permission === 'denied') return show('denied')
  show('ask')
}

async function record() {
  held.value = null
  forgetDeleted()
  /* The microphone hears the room: nothing of the panel's may be sounding. */
  hush()
  const ok = await recorder.start()
  if (!ok) return show('denied')
  show('recording')
  announce(labels.value.announceRecording(0))
}

function togglePause() {
  if (held.value) return
  if (recordingNow.value) {
    recorder.pause()
    announce(labels.value.announcePaused)
  } else if (!recorder.capped.value) {
    stopListening()
    recorder.resume()
    announce(labels.value.announceRecording(Math.floor(recorder.elapsed.value)))
  }
  /* Pause and resume are two buttons that trade places: the one pressed is
     gone, so the focus goes back to the line, where Space toggles again. */
  void nextTick(() => line.value?.focus())
}

/* Nothing louder than this in a whole recording is a microphone that heard
   nothing — a level of 0.12 is a background hum, a quiet voice is above 0.2. */
const SILENCE = 0.12

async function finish(): Promise<VoiceRecording | null> {
  stopListening()
  if (held.value) {
    const kept = held.value
    held.value = null
    return kept
  }
  return recorder.stop()
}

async function sendVoice() {
  const recording = await finish()
  if (!recording) return show('text')
  if (Math.max(0, ...recording.levels) < SILENCE) return show('silent')
  show('text')
  emit('send-voice', recording)
}

async function deleteVoice() {
  const recording = await finish()
  show('text')
  if (!recording) return
  deleted = recording
  emit('delete-voice')
}

function forgetDeleted() {
  deleted = null
}

/** « Annuler » on the toast: the recording comes back, paused. */
function undoDelete() {
  if (!deleted) return
  held.value = deleted
  forgetDeleted()
  show('recording')
}

defineExpose({ undoDelete })

/* Watch the cap: the recorder pauses itself, the box says why. */
watch(recorder.capped, (capped) => capped && announce(labels.value.announceCapped))

/* Every ten seconds, a screen reader hears where the recording stands. */
watch(
  () => Math.floor(recorder.elapsed.value / 10),
  (tens) => recordingNow.value && tens > 0 && announce(labels.value.announceRecording(tens * 10)),
)

/* ── Listening back, while paused ─────────────────────────────────────── */
const listening = ref(false)
const listenAt = ref(0)
let player: HTMLAudioElement | null = null
let playerUrl = ''

async function listen() {
  if (listening.value) return stopListening()
  const blob = held.value?.blob ?? (await recorder.snapshot())
  stopListening()
  playerUrl = URL.createObjectURL(blob)
  player = new Audio(playerUrl)
  player.addEventListener('timeupdate', () => (listenAt.value = player?.currentTime ?? 0))
  player.addEventListener('ended', stopListening)
  listening.value = true
  await player.play().catch(stopListening)
}

function stopListening() {
  player?.pause()
  player = null
  if (playerUrl) URL.revokeObjectURL(playerUrl)
  playerUrl = ''
  listening.value = false
  listenAt.value = 0
}

/* Folded for listening back: what has played in the strong ink while it plays,
   one ink otherwise. */
const lineProgress = computed(() =>
  listening.value && seconds.value > 0 ? Math.min(1, listenAt.value / seconds.value) : null,
)

onBeforeUnmount(() => {
  stopListening()
  forgetDeleted()
})

/* ── Moving between modes ─────────────────────────────────────────────── */

function show(next: Mode) {
  mode.value = next
}

/*
  The box keeps its height through a swap and then glides to the new one: the
  leaving content fades inside a box that does not move, the box travels, and
  the arriving content comes in over the travel. Without it the box would cut
  from one height to the other while both contents are invisible — the border
  jumping on its own.
*/
let glide: Animation | undefined

function lockHeight() {
  const el = box.value
  if (!el) return
  /* The height that is seen — mid-glide, if one is running — read before the
     glide is cancelled: once it is, the box reports where it was going, and an
     interrupted travel would jump there (filmed on the slot below: 6px). */
  const seen = el.getBoundingClientRect().height
  /* Detached before it is cancelled: cancelling an animation — even one that
     finished long ago — queues its `cancel` event, which would unlock the box
     in the middle of the swap and cut the travel to nothing (filmed: 30px in
     one frame on the way back to the field). */
  if (glide) {
    glide.onfinish = glide.oncancel = null
    glide.cancel()
    glide = undefined
  }
  el.style.height = `${seen}px`
  /* Clipped only while it travels: at rest the microphone's tooltip has to
     leave the box. */
  el.style.overflow = 'hidden'
}

function unlock() {
  const el = box.value
  if (!el) return
  el.style.height = ''
  el.style.overflow = ''
}

function glideHeight() {
  const el = box.value
  if (!el) return
  const from = el.getBoundingClientRect().height
  el.style.height = ''
  const to = el.getBoundingClientRect().height
  const style = getComputedStyle(el)
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || from === to) return unlock()
  glide = el.animate([{ height: `${from}px` }, { height: `${to}px` }], {
    duration: readDuration(el, '--ds-motion-duration-enter'),
    easing: style.getPropertyValue('--ds-motion-easing-out').trim() || 'ease-out',
  })
  glide.onfinish = glide.oncancel = () => {
    glide = undefined
    unlock()
  }
}

/*
  The trailing control travels the same way the box does (ADR-0061): send
  becoming « Arrêter » is 32px becoming 85, and with the microphone beside it
  (ADR-0067) a cut threw the microphone 53px in one frame. The slot holds its
  width while the leaver fades, then glides to the arriver's, which comes in
  over the glide — and the microphone rides it. Clipped only while it travels.
*/
const go = ref<HTMLElement>()
let goGlide: Animation | undefined

function lockWidth() {
  const el = go.value
  if (!el) return
  /* What is seen, read before the running glide is cancelled — see lockHeight —
     and to the subpixel: `offsetWidth` rounds, and a lock 0.13px short reads as
     a step back. */
  const seen = el.getBoundingClientRect().width
  if (goGlide) {
    goGlide.onfinish = goGlide.oncancel = null
    goGlide.cancel()
    goGlide = undefined
  }
  el.style.width = `${seen}px`
  el.style.overflow = 'hidden'
}

function unlockWidth() {
  const el = go.value
  if (!el) return
  el.style.width = ''
  el.style.overflow = ''
}

function glideWidth() {
  const el = go.value
  if (!el) return
  const from = el.getBoundingClientRect().width
  el.style.width = ''
  const to = el.getBoundingClientRect().width
  const style = getComputedStyle(el)
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced || from === to) return unlockWidth()
  goGlide = el.animate([{ width: `${from}px` }, { width: `${to}px` }], {
    duration: readDuration(el, '--ds-motion-duration-enter'),
    easing: style.getPropertyValue('--ds-motion-easing-out').trim() || 'ease-out',
  })
  goGlide.onfinish = goGlide.oncancel = () => {
    goGlide = undefined
    unlockWidth()
  }
}

/* Where the focus goes once the new content is there. */
function settleFocus() {
  if (mode.value === 'recording') line.value?.focus()
  else if (mode.value === 'text') field.value?.focus()
  else box.value?.querySelector<HTMLElement>('.ds-tolbi-ai-composer__actions button:last-child')?.focus()
}

/*
  The recorder's keys, on the line itself — a button inside it keeps its own
  Enter and Space. Escape deletes from anywhere in the line.
*/
function onLineKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    void deleteVoice()
    return
  }
  if (event.target !== event.currentTarget) return
  if (event.key === 'Enter') {
    event.preventDefault()
    void sendVoice()
  } else if (event.key === ' ') {
    event.preventDefault()
    togglePause()
  }
}

/* ── The microphone's tooltip, after a beat ───────────────────────────── */
const { shown: tip, soon: tipSoon, away: tipAway } = useDelayedTooltip()

/* ── The project's name, whole, when the chip has to cut it ───────────── */
const scopeName = ref<HTMLElement>()
const { shown: scopeTip, soon: scopeTipSoon, away: scopeTipAway } = useDelayedTooltip()
function onScopeEnter() {
  const el = scopeName.value
  if (el && el.scrollWidth > el.clientWidth) scopeTipSoon()
}

watch([micShown, pending], ([shown, busy]) => (!shown || busy) && tipAway())

/* ── What a screen reader hears ───────────────────────────────────────── */
const announcement = ref('')

function announce(words: string) {
  announcement.value = ''
  void nextTick(() => (announcement.value = words))
}

watch(mode, (next) => {
  if (next === 'ask') announce(`${labels.value.askTitle}. ${labels.value.askBody}`)
  else if (next === 'denied') announce(`${labels.value.deniedTitle}. ${labels.value.deniedBody}`)
  else if (next === 'silent') announce(`${labels.value.silentTitle}. ${labels.value.silentBody}`)
})

interface Message {
  icon: IconName
  tone: 'brand' | 'error' | 'warning'
  title: string
  body: string
  later: string
  act: string
}

const message = computed<Message>(() => {
  const l = labels.value
  if (mode.value === 'ask')
    return { icon: 'mic', tone: 'brand', title: l.askTitle, body: l.askBody, later: l.askLater, act: l.askAllow }
  if (mode.value === 'denied')
    return { icon: 'circle-alert', tone: 'error', title: l.deniedTitle, body: l.deniedBody, later: l.deniedWrite, act: l.deniedRetry }
  return { icon: 'circle-alert', tone: 'warning', title: l.silentTitle, body: l.silentBody, later: l.silentCancel, act: l.silentRetry }
})

function messageLater() {
  show('text')
}

function messageAct() {
  void record()
}
</script>

<template>
  <div class="ds-tolbi-ai-composer" :class="`ds-tolbi-ai-composer--${status}`">
    <div v-if="status === 'failed'" class="ds-tolbi-ai-composer__failure">
      <Icon name="circle-alert" :size="16" class="ds-tolbi-ai-composer__failure-icon" />
      <span role="alert">{{ failedMessage }}</span>
      <Button variant="link" size="xs" :label="retryLabel" @click="retry" />
    </div>

    <div ref="box" class="ds-tolbi-ai-composer__box">
      <Transition
        name="ds-tolbi-ai-swap"
        mode="out-in"
        @before-leave="lockHeight"
        @enter="glideHeight"
        @after-enter="settleFocus"
      >
        <!-- The field and the recorder share the scope chip, so it stays put
             while they trade places; a message replaces all of it. -->
        <div v-if="mode === 'text' || mode === 'recording'" key="compose" class="ds-tolbi-ai-composer__compose">
          <!--
            Read as the field's description, so it is heard where the question
            is typed — and hidden as text, or a reader would meet it twice.
          -->
          <span
            v-if="scope"
            :id="scopeId"
            class="ds-tolbi-ai-composer__scope"
            aria-hidden="true"
            @pointerenter="onScopeEnter"
            @pointerleave="scopeTipAway"
          >
            <Icon name="folder-open" :size="16" />
            <span ref="scopeName" class="ds-tolbi-ai-composer__scope-name">{{ scope }}</span>
            <SurfaceTransition>
              <Tooltip
                v-if="scopeTip"
                class="ds-tolbi-ai-composer__scope-tip"
                :title="scope"
                :supporting-text="scopeHint"
                arrow="bottom-left"
                role="presentation"
              />
            </SurfaceTransition>
          </span>

          <Transition
            name="ds-tolbi-ai-swap"
            mode="out-in"
            @before-leave="lockHeight"
            @enter="glideHeight"
            @after-enter="settleFocus"
          >
            <div v-if="mode === 'text'" key="text" class="ds-tolbi-ai-composer__text">
              <textarea
                ref="field"
                class="ds-tolbi-ai-composer__field"
                rows="1"
                :value="modelValue"
                :placeholder="pending ? pendingPlaceholder : placeholder"
                :aria-label="inputLabel"
                :aria-describedby="scope ? scopeId : undefined"
                :readonly="pending"
                @input="onInput"
                @keydown="onKeydown"
              />

              <div class="ds-tolbi-ai-composer__foot">
                <!-- The microphone, then send: side by side, always (ADR-0067). The
                     microphone is a tool in a receding ink; the green is send's,
                     and lights up with the text (ADR-0061, amended). While an
                     answer is coming nothing new can start, so it is disabled. -->
                <span
                  v-if="micShown"
                  class="ds-tolbi-ai-composer__mic"
                  @pointerenter="!pending && tipSoon()"
                  @pointerleave="tipAway"
                  @focusin="tipSoon()"
                  @focusout="tipAway"
                >
                  <IconButton
                    icon="mic"
                    variant="subtle"
                    size="xs"
                    :ariaLabel="labels.record"
                    :disabled="pending"
                    @click="openMic"
                  />
                  <SurfaceTransition>
                    <Tooltip
                      v-if="tip"
                      class="ds-tolbi-ai-composer__tip"
                      :title="labels.record"
                      arrow="bottom-right"
                      role="presentation"
                    />
                  </SurfaceTransition>
                </span>
                <!-- Send, or « Arrêter » while an answer comes: the slot holds its
                     width while one leaves, then glides to the other's, so the
                     microphone beside it is carried rather than jumped. -->
                <span ref="go" class="ds-tolbi-ai-composer__go">
                  <Transition name="ds-tolbi-ai-swap" mode="out-in" @before-leave="lockWidth" @enter="glideWidth">
                    <Button
                      v-if="pending"
                      key="stop"
                      variant="secondary-gray"
                      size="xs"
                      icon-leading="x"
                      :label="stopLabel"
                      @click="stop"
                    />
                    <IconButton
                      v-else
                      key="send"
                      icon="arrow-up"
                      variant="primary"
                      size="xs"
                      :ariaLabel="sendLabel"
                      :disabled="!canSend"
                      @click="send"
                    />
                  </Transition>
                </span>
              </div>
            </div>

            <!--
              The recorder: one line, and it holds the focus — Enter sends,
              Escape deletes, Space pauses and resumes.
            -->
            <div
              v-else
              ref="line"
              key="recording"
              class="ds-tolbi-ai-composer__line"
              :class="{ 'ds-tolbi-ai-composer__line--warn': nearLimit }"
              role="group"
              tabindex="-1"
              :aria-label="labels.recording"
              @keydown="onLineKeydown"
            >
              <IconButton icon="trash-2" size="xs" :ariaLabel="labels.remove" @click="deleteVoice" />

              <span v-if="recordingNow" class="ds-tolbi-ai-composer__timer">
                <span class="ds-tolbi-ai-composer__dot" aria-hidden="true" />
                {{ clock(seconds) }}
              </span>
              <IconButton
                v-else
                :icon="listening ? 'pause' : 'play'"
                variant="neutral"
                size="xs"
                :ariaLabel="listening ? labels.stopListening : labels.listen"
                @click="listen"
              />

              <TolbiAiWaveform
                class="ds-tolbi-ai-composer__waveform"
                :class="{ 'ds-tolbi-ai-composer__waveform--live': recordingNow }"
                :levels="lineLevels"
                :fit="recordingNow ? 'tail' : 'whole'"
                :progress="recordingNow ? null : lineProgress"
              />

              <span v-if="nearLimit" class="ds-tolbi-ai-composer__remaining">
                {{ labels.remaining(remaining) }}
              </span>
              <span v-else-if="!recordingNow" class="ds-tolbi-ai-composer__length">
                {{ listening ? `${clock(listenAt)} / ${clock(seconds)}` : clock(seconds) }}
              </span>

              <IconButton
                v-if="recordingNow"
                icon="pause"
                size="xs"
                :ariaLabel="labels.pause"
                @click="togglePause"
              />
              <IconButton
                v-else-if="!held && !recorder.capped.value"
                icon="mic"
                size="xs"
                :ariaLabel="labels.resume"
                @click="togglePause"
              />

              <IconButton
                icon="arrow-up"
                variant="primary"
                size="xs"
                :ariaLabel="labels.send"
                @click="sendVoice"
              />
            </div>
          </Transition>
        </div>

        <!-- Permission, a blocked microphone, silence: said in the box. -->
        <div v-else key="message" class="ds-tolbi-ai-composer__message">
          <div class="ds-tolbi-ai-composer__message-text">
            <Icon
              :name="message.icon"
              :size="20"
              class="ds-tolbi-ai-composer__message-icon"
              :class="`ds-tolbi-ai-composer__message-icon--${message.tone}`"
            />
            <div>
              <p class="ds-tolbi-ai-composer__message-title">{{ message.title }}</p>
              <p class="ds-tolbi-ai-composer__message-body">{{ message.body }}</p>
            </div>
          </div>
          <div class="ds-tolbi-ai-composer__actions">
            <Button variant="tertiary" size="sm" :label="message.later" @click="messageLater" />
            <Button
              :variant="mode === 'ask' ? 'primary' : 'secondary-gray'"
              size="sm"
              :icon-leading="mode === 'silent' ? 'mic' : undefined"
              :label="message.act"
              @click="messageAct"
            />
          </div>
        </div>
      </Transition>
    </div>

    <p v-if="disclaimer" class="ds-tolbi-ai-composer__disclaimer">{{ disclaimer }}</p>

    <span class="ds-tolbi-ai-composer__announce" role="status">{{ announcement }}</span>
  </div>
</template>

<style scoped>
.ds-tolbi-ai-composer {
  /* How many lines the box grows to before the field scrolls. */
  --tolbi-ai-composer-lines: 8;

  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

/*
  The failure sits above the box, so the question it is about stays where it
  was typed. The words are the alert; the retry is a control beside them, not
  part of what is announced.
*/
.ds-tolbi-ai-composer__failure {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-error);
}

.ds-tolbi-ai-composer__failure-icon {
  flex-shrink: 0;
}

/*
  Figma's box: 10px round the content, 12px on the text's side. The 10s are
  control padding — the round action sits 10px from the edge — not rhythm, so
  they stay off the spacing ramp (ADR-0013).
*/
.ds-tolbi-ai-composer__box {
  box-sizing: border-box;
  padding: 10px 10px 10px var(--ds-spacing-lg);
  background: var(--ds-bg-default);
  border: var(--ds-border-width-default) solid var(--ds-border-default);
  border-radius: var(--ds-radius-surface-sm);
  transition:
    border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow   var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* The field's focus is the box's: the ring goes round everything it holds. */
.ds-tolbi-ai-composer__box:has(.ds-tolbi-ai-composer__field:focus-visible),
.ds-tolbi-ai-composer__box:has(.ds-tolbi-ai-composer__line:focus-visible) {
  border-color: var(--ds-border-brand);
  box-shadow: var(--ds-focus-ring-brand);
}

/* Waiting for an answer, the box goes quiet: it takes no question. */
.ds-tolbi-ai-composer--pending .ds-tolbi-ai-composer__box {
  border-color: var(--ds-border-subtle);
}

.ds-tolbi-ai-composer__compose,
.ds-tolbi-ai-composer__text {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ds-tolbi-ai-composer__scope {
  position: relative;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  box-sizing: border-box;
  max-width: 100%;
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md) var(--ds-spacing-xxs) var(--ds-spacing-sm);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-neutral);
  font: var(--ds-font-label-md);
  color: var(--ds-text-default);
  white-space: nowrap;
}

/* The project's name is cut rather than the chip let past the box (ADR-0074). */
.ds-tolbi-ai-composer__scope-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Above the chip and from its left, as the answer's tooltips open. */
.ds-tolbi-ai-composer__scope-tip {
  position: absolute;
  bottom: calc(100% + var(--ds-spacing-xs));
  left: 0;
  z-index: var(--ds-z-popover);
  white-space: normal;
  pointer-events: none;
  transform-origin: bottom left;
}

.ds-tolbi-ai-composer__field {
  display: block;
  width: 100%;
  box-sizing: border-box;
  max-height: calc(var(--tolbi-ai-composer-lines) * 1lh);
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  resize: none;
  overflow-y: auto;
  background: transparent;
  font: var(--ds-font-body-md);
  color: var(--ds-text-strong);
}

.ds-tolbi-ai-composer__field::placeholder {
  color: var(--ds-text-placeholder);
}

/* Two 32px controls 4px apart — one every 36px, where Notion, Perplexity and
   Langdock put their microphone and send 30 to 39px apart. */
.ds-tolbi-ai-composer__foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ds-spacing-xs);
}

/* Anchored right, where the box's edge is: a slot that widens grows leftwards. */
.ds-tolbi-ai-composer__go {
  display: inline-flex;
  justify-content: flex-end;
}

/* ── The microphone and its tooltip ───────────────────────────────── */
.ds-tolbi-ai-composer__mic {
  position: relative;
  display: inline-flex;
}

.ds-tolbi-ai-composer__tip {
  position: absolute;
  right: 0;
  bottom: 100%;
  margin-bottom: var(--ds-spacing-md);
  z-index: var(--ds-z-popover);
  white-space: nowrap;
  pointer-events: none;
  transform-origin: bottom right;
}

/* ── The recorder ─────────────────────────────────────────────────── */
.ds-tolbi-ai-composer__line {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-width: 0;
  border-radius: var(--ds-radius-control);
  outline: none;
}

.ds-tolbi-ai-composer__timer {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  font: var(--ds-font-label-md-strong);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-default);
}

/*
  The red dot breathes, 100 % ↔ 40 % over a second, for as long as the
  microphone is open — the one sign that sound is being taken. A period, not
  a duration (ADR-0039); still under reduced motion, where the waveform still
  moves because it is information, not ornament.
*/
.ds-tolbi-ai-composer__dot {
  --tolbi-ai-composer-breath: 1s;

  width: 8px;
  height: 8px;
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-error-solid);
  animation: ds-tolbi-ai-breathe var(--tolbi-ai-composer-breath) var(--ds-motion-easing-in-out) infinite alternate;
}

@keyframes ds-tolbi-ai-breathe {
  to { opacity: 0.4; }
}

@media (prefers-reduced-motion: reduce) {
  .ds-tolbi-ai-composer__dot {
    animation: none;
  }
}

.ds-tolbi-ai-composer__waveform {
  flex: 1;
}

/* Live, the bars take the default ink; folded for listening, the playback
   pair (TolbiAiWaveform's own). */
.ds-tolbi-ai-composer__waveform--live {
  --tolbi-ai-waveform-ink: var(--ds-text-default);
}

/*
  Holds the width of « 0:00 / 0:00 » so listening back does not refold the
  waveform (the voice note's reason, ADR-0060) — but left-aligned here: the
  time belongs to the waveform it follows, and the room it keeps sits before
  the buttons instead of opening a gap after the bars.
*/
.ds-tolbi-ai-composer__length {
  min-width: 8.5ch;
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-subtle);
  white-space: nowrap;
}

/* The last fifteen seconds: the timer and the countdown in the warning ink.
   The words carry it too, so the colour is never alone (ADR-0006). */
.ds-tolbi-ai-composer__line--warn .ds-tolbi-ai-composer__timer,
.ds-tolbi-ai-composer__remaining {
  color: var(--ds-text-warning);
}

.ds-tolbi-ai-composer__remaining {
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* ── A message in the box ─────────────────────────────────────────── */
.ds-tolbi-ai-composer__message {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ds-tolbi-ai-composer__message-text {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.ds-tolbi-ai-composer__message-icon {
  flex-shrink: 0;
}

.ds-tolbi-ai-composer__message-icon--brand { color: var(--ds-text-brand); }
.ds-tolbi-ai-composer__message-icon--error { color: var(--ds-text-error); }
.ds-tolbi-ai-composer__message-icon--warning { color: var(--ds-text-warning); }

.ds-tolbi-ai-composer__message-title {
  margin: 0 0 var(--ds-spacing-xxs);
  font: var(--ds-font-body-md-emphasis);
  color: var(--ds-text-strong);
}

.ds-tolbi-ai-composer__message-body {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-tolbi-ai-composer__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--ds-spacing-md);
}

/* ── Swaps: out at `exit`, in at `enter` ──────────────────────────── */
/*
  The old content leaves first and fast (100ms, `easing-in`); the new arrives
  over the box's travel (200ms, `easing-out`) and slides the last 8px in from
  the side the action sits on. Under reduced motion, no slide.
*/
.ds-tolbi-ai-swap-leave-active {
  transition: opacity var(--ds-motion-duration-exit) var(--ds-motion-easing-in);
}

.ds-tolbi-ai-swap-enter-active {
  transition:
    opacity   var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
}

.ds-tolbi-ai-swap-leave-to,
.ds-tolbi-ai-swap-enter-from {
  opacity: 0;
}

.ds-tolbi-ai-swap-enter-from {
  transform: translateX(8px);
}

@media (prefers-reduced-motion: reduce) {
  .ds-tolbi-ai-swap-enter-from {
    transform: none;
  }
}

/* Two balanced lines in the docked panel, never one word left alone. */
.ds-tolbi-ai-composer__disclaimer {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtlest);
  text-align: center;
  text-wrap: balance;
}

/* Visually hidden, still announced — never display:none. */
.ds-tolbi-ai-composer__announce {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
