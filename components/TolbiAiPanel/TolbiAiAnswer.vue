<script setup lang="ts">
import { inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useDelayedTooltip } from '../../composables/useDelayedTooltip'
import { readDuration } from '../../composables/cssTime'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import { MarkTransition } from '../MarkTransition'
import { SurfaceTransition } from '../SurfaceTransition'
import { Tooltip } from '../Tooltip'
import { TOLBI_AI_PANEL, TOLBI_AI_THREAD } from './context'
import { hush, nowPlaying } from '../TolbiAiVoiceNote/now-playing'

/** How the answer was judged, if at all. */
export type TolbiAiFeedback = 'up' | 'down' | null

/**
 * Tolbi AI's answer: the words, and what can be done with them (ADR-0062). The
 * words are the product's to render — markdown, in the default slot — and take
 * the answer's type here. It cites no sources — the data is the product's own,
 * so naming it says nothing — and it does not guess what the user asks next:
 * the next question is theirs, in the composer.
 *
 * The actions step back (ADR-0066): 32px with a 16px glyph, in a receding ink,
 * 8px under the words — each one saying what it does in a tooltip, and the copy
 * confirming itself with a check. Where the browser can speak, the answer can
 * also be read aloud (ADR-0074).
 *
 * Arriving in a thread, the answer passes under a light (ADR-0068): a line in
 * the sign's two inks travels down it and lets it be seen, the way a satellite
 * passes over a field. Once, on arrival — never when a conversation reopens.
 */
interface Props {
  copyLabel?: string
  /** What the copy says for the two seconds after it has copied. */
  copiedLabel?: string
  upLabel?: string
  downLabel?: string
  regenerateLabel?: string
  readLabel?: string
  /** What the read-aloud button says while it reads. */
  stopReadingLabel?: string
  /** The language the answer is read in — the voice is chosen for it. */
  lang?: string
  /**
   * Offer to read the answer aloud, with the browser's own voice. On by
   * default, since it needs nothing of the product; where the browser cannot
   * speak there is no button anyway.
   */
  readAloud?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  copyLabel: 'Copier la réponse',
  copiedLabel: 'Réponse copiée',
  upLabel: 'Réponse utile',
  downLabel: 'Réponse non utile',
  regenerateLabel: 'Générer une autre réponse',
  readLabel: 'Lire la réponse',
  stopReadingLabel: 'Arrêter la lecture',
  lang: 'fr-FR',
  readAloud: true,
})

const emit = defineEmits<{
  /** The answer's text, as copied. */
  copy: [text: string]
  /** The answer's text, as it starts being read aloud. */
  read: [text: string]
  regenerate: []
}>()

/* A second press takes the judgement back. */
const feedback = defineModel<TolbiAiFeedback>('feedback', { default: null })
const judge = (value: 'up' | 'down') => (feedback.value = feedback.value === value ? null : value)

/*
  The copy copies the words as they read — the slot's text — so the check that
  follows is a fact, not a hope. It stays two seconds: a confirmation is a state
  you glance at, not a motion you watch. The button keeps its name; the status
  says « Réponse copiée », or a reader would hear it twice.
*/
const COPIED_FOR = 2000
const words = ref<HTMLElement>()
const copied = ref(false)
const announcement = ref('')
let copiedTimer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  const text = words.value?.innerText.trim() ?? ''
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    announcement.value = props.copiedLabel
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => {
      copied.value = false
      announcement.value = ''
    }, COPIED_FOR)
  } catch {
    /* No clipboard here: the product's own copy, on the event, still runs. */
  }
  emit('copy', text)
}

/*
  Read aloud (ADR-0074): the browser's voice reads the words as they read — the
  slot's text, as the copy takes it — one block at a time, because Chrome cuts
  a long utterance off after about fifteen seconds. One sound at a time in the
  panel: reading stops a voice note or another answer's reading, and opening
  the microphone stops it. While it reads, the button says « Arrêter la
  lecture » and stops it; it also stops when the answer leaves or the panel
  closes. Where the browser cannot speak, there is no button.
*/
const speakable = ref(false)
const reading = ref(false)
let reads = 0

function settleReading() {
  reading.value = false
  if (nowPlaying.stopReading === stopReading) nowPlaying.stopReading = null
}

function stopReading() {
  if (!reading.value) return
  reads++
  settleReading()
  speechSynthesis.cancel()
}

function voiceFor(lang: string) {
  const voices = speechSynthesis.getVoices()
  const want = lang.toLowerCase()
  const base = want.split('-')[0]
  return voices.find((v) => v.lang.toLowerCase() === want) ?? voices.find((v) => v.lang.toLowerCase().startsWith(base))
}

function read() {
  if (reading.value) return stopReading()
  const text = words.value?.innerText.trim() ?? ''
  const blocks = text.split(/\n+/).map((block) => block.trim()).filter(Boolean)
  if (!blocks.length) return
  hush()
  const busy = speechSynthesis.speaking || speechSynthesis.pending
  speechSynthesis.cancel()
  const run = ++reads
  const voice = voiceFor(props.lang)
  reading.value = true
  nowPlaying.stopReading = stopReading
  const queue = () => {
    if (run !== reads) return
    blocks.forEach((block, i) => {
      const utterance = new SpeechSynthesisUtterance(block)
      utterance.lang = props.lang
      if (voice) utterance.voice = voice
      if (i === blocks.length - 1) utterance.onend = () => run === reads && settleReading()
      utterance.onerror = () => run === reads && settleReading()
      speechSynthesis.speak(utterance)
    })
  }
  /* Chrome drops what is spoken in the same task as a cancel that stopped something. */
  if (busy) setTimeout(queue, 50)
  else queue()
  emit('read', text)
}

const panel = inject(TOLBI_AI_PANEL, null)
if (panel) watch(panel.open, (open) => !open && stopReading())

/*
  Each icon says what it does, in a tooltip after 400ms on hover or focus — the
  composer's microphone does the same (ADR-0061). Presentational: the button's
  own name already says it to a screen reader.
*/
const { shown: tip, soon: tipSoon, soonOnFocus: tipOnFocus, away: tipAway } = useDelayedTooltip<string>()

/*
  The pass (ADR-0068) — the exception the awakening opened (ADR-0063): longer
  than the scale's longest step and on its own curve, both declared in the
  stylesheet and read off the cascade, the one place to change them. The mask
  and the line share one duration and one curve, so the line rides the edge it
  draws: the edge goes from 0 to the answer's height plus a soft fall of three
  lines, and the line sits half a fall behind it. The words are all in the DOM
  from the first frame; only their sight is staged.
*/
const thread = inject(TOLBI_AI_THREAD, null)
const root = ref<HTMLElement>()
const light = ref<HTMLElement>()
const passing = ref(false)
let sweep: Animation | undefined

async function pass() {
  const el = root.value
  if (!el || typeof el.animate !== 'function') return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const fall = 3 * (parseFloat(getComputedStyle(words.value ?? el).lineHeight) || 20)
  el.style.setProperty('--tolbi-ai-answer-fall', `${fall}px`)
  passing.value = true
  await nextTick()
  const style = getComputedStyle(el)
  const duration = readDuration(el, '--tolbi-ai-answer-pass')
  const easing = style.getPropertyValue('--tolbi-ai-answer-pass-easing').trim() || 'ease-in-out'
  /*
    The course runs 0 → 1, and the stylesheet turns it into a place on the
    answer's own height — the mask's edge and the light's line both — so an
    answer that grows during the pass (a slot that fills late, an image, a
    font) is still uncovered by the end, rather than measured once at the
    start and left under the mask to pop in when the pass is over.
  */
  sweep = el.animate(
    [{ '--tolbi-ai-answer-course': '0' }, { '--tolbi-ai-answer-course': '1' }] as Keyframe[],
    { duration, easing, fill: 'both' },
  )
  light.value?.animate(
    [{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.82 }, { opacity: 0 }],
    { duration, easing, fill: 'both' },
  )
  sweep.onfinish = () => {
    passing.value = false
    sweep?.cancel()
    sweep = undefined
    el.style.removeProperty('--tolbi-ai-answer-fall')
  }
}

onMounted(() => {
  speakable.value = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance === 'function'
  if (thread?.settled.value) void pass()
})

onBeforeUnmount(() => {
  clearTimeout(copiedTimer)
  stopReading()
  sweep?.cancel()
})
</script>

<template>
  <div ref="root" class="ds-tolbi-ai-answer" :class="{ 'ds-tolbi-ai-answer--passing': passing }">
    <div ref="words" class="ds-tolbi-ai-answer__words"><slot /></div>

    <div class="ds-tolbi-ai-answer__actions">
      <span
        class="ds-tolbi-ai-answer__action"
        @pointerenter="tipSoon('copy')"
        @pointerleave="tipAway"
        @focusin="tipOnFocus($event, 'copy')"
        @focusout="tipAway"
      >
        <IconButton
          icon="copy"
          size="xs"
          variant="subtle"
          :ariaLabel="copyLabel"
          @click="copy"
        >
          <template #default="{ size }">
            <MarkTransition>
              <Icon :key="copied ? 'check' : 'copy'" :name="copied ? 'check' : 'copy'" :size="size" />
            </MarkTransition>
          </template>
        </IconButton>
        <SurfaceTransition>
          <Tooltip
            v-if="tip === 'copy'"
            class="ds-tolbi-ai-answer__tip"
            :title="copied ? copiedLabel : copyLabel"
            arrow="bottom-left"
            role="presentation"
          />
        </SurfaceTransition>
      </span>
      <span
        v-if="readAloud && speakable"
        class="ds-tolbi-ai-answer__action"
        @pointerenter="tipSoon('read')"
        @pointerleave="tipAway"
        @focusin="tipOnFocus($event, 'read')"
        @focusout="tipAway"
      >
        <IconButton
          icon="volume-2"
          size="xs"
          variant="subtle"
          :ariaLabel="reading ? stopReadingLabel : readLabel"
          :active="reading"
          @click="read"
        >
          <template #default="{ size }">
            <MarkTransition>
              <Icon :key="reading ? 'square' : 'volume-2'" :name="reading ? 'square' : 'volume-2'" :size="size" />
            </MarkTransition>
          </template>
        </IconButton>
        <SurfaceTransition>
          <Tooltip
            v-if="tip === 'read'"
            class="ds-tolbi-ai-answer__tip"
            :title="reading ? stopReadingLabel : readLabel"
            arrow="bottom-left"
            role="presentation"
          />
        </SurfaceTransition>
      </span>

      <span
        class="ds-tolbi-ai-answer__action"
        @pointerenter="tipSoon('up')"
        @pointerleave="tipAway"
        @focusin="tipOnFocus($event, 'up')"
        @focusout="tipAway"
      >
        <IconButton
          icon="thumbs-up"
          size="xs"
          variant="subtle"
          :ariaLabel="upLabel"
          :active="feedback === 'up'"
          :aria-pressed="feedback === 'up'"
          @click="judge('up')"
        />
        <SurfaceTransition>
          <Tooltip
            v-if="tip === 'up'"
            class="ds-tolbi-ai-answer__tip"
            :title="upLabel"
            arrow="bottom-left"
            role="presentation"
          />
        </SurfaceTransition>
      </span>

      <span
        class="ds-tolbi-ai-answer__action"
        @pointerenter="tipSoon('down')"
        @pointerleave="tipAway"
        @focusin="tipOnFocus($event, 'down')"
        @focusout="tipAway"
      >
        <IconButton
          icon="thumbs-down"
          size="xs"
          variant="subtle"
          :ariaLabel="downLabel"
          :active="feedback === 'down'"
          :aria-pressed="feedback === 'down'"
          @click="judge('down')"
        />
        <SurfaceTransition>
          <Tooltip
            v-if="tip === 'down'"
            class="ds-tolbi-ai-answer__tip"
            :title="downLabel"
            arrow="bottom-left"
            role="presentation"
          />
        </SurfaceTransition>
      </span>

      <span
        class="ds-tolbi-ai-answer__action"
        @pointerenter="tipSoon('regenerate')"
        @pointerleave="tipAway"
        @focusin="tipOnFocus($event, 'regenerate')"
        @focusout="tipAway"
      >
        <IconButton
          icon="refresh-cw"
          size="xs"
          variant="subtle"
          :ariaLabel="regenerateLabel"
          @click="emit('regenerate')"
        />
        <SurfaceTransition>
          <Tooltip
            v-if="tip === 'regenerate'"
            class="ds-tolbi-ai-answer__tip"
            :title="regenerateLabel"
            arrow="bottom-left"
            role="presentation"
          />
        </SurfaceTransition>
      </span>
    </div>

    <span class="ds-tolbi-ai-answer__status" role="status">{{ announcement }}</span>
    <span v-if="passing" ref="light" class="ds-tolbi-ai-answer__light" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* The actions belong to the answer: 8px under its words, not a block away. */
.ds-tolbi-ai-answer {
  /*
    The pass's own values (ADR-0068): 1.1s, past the scale's 600ms ceiling, on
    a curve that starts later than `easing-in-out` — the light gathers before
    it travels — and settles as long. An exception borrows nothing from the
    scale it departs from (ADR-0063).
  */
  --tolbi-ai-answer-pass: 1100ms;
  --tolbi-ai-answer-pass-easing: cubic-bezier(0.45, 0, 0.25, 1);
  /*
    The light is the sign's: its two inks, bound to the same primitives — the
    categorical clause of ADR-0010, as in TolbiAiSpark.
  */
  /* token-lint-disable-next-line no-raw-primitive — artwork ink: the sign's spark, the light the pass casts (ADR-0068) */
  --tolbi-ai-answer-light-accent: var(--ds-color-accent-400);
  /* token-lint-disable-next-line no-raw-primitive — artwork ink: the sign's leaves, the light the pass casts (ADR-0068) */
  --tolbi-ai-answer-light-brand: var(--ds-color-brand-500);

  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

/*
  How far the pass has come, 0 to 1. Registered, so it can be animated, and
  inherited, so the light reads it too. The edge of what can be seen is that
  share of the answer's height plus a fall — `100%` is the box as it is now,
  so the course follows an answer that grows during the pass.
*/
@property --tolbi-ai-answer-course {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}

.ds-tolbi-ai-answer--passing {
  --tolbi-ai-answer-edge: calc(var(--tolbi-ai-answer-course) * (100% + var(--tolbi-ai-answer-fall)));

  -webkit-mask-image: linear-gradient(to bottom, currentColor calc(var(--tolbi-ai-answer-edge) - var(--tolbi-ai-answer-fall)), transparent var(--tolbi-ai-answer-edge));
  mask-image: linear-gradient(to bottom, currentColor calc(var(--tolbi-ai-answer-edge) - var(--tolbi-ai-answer-fall)), transparent var(--tolbi-ai-answer-edge));
}

/*
  The line of light: yellow into green across the answer, glowing. It is inside
  the mask it draws, half a fall behind the edge — where the words are half
  seen, so is the light, and the mask cuts it at the answer's sides.
*/
.ds-tolbi-ai-answer__light {
  position: absolute;
  top: calc(var(--tolbi-ai-answer-course) * (100% + var(--tolbi-ai-answer-fall)) - var(--tolbi-ai-answer-fall) / 2);
  left: 0;
  right: 0;
  height: var(--ds-border-width-strong);
  border-radius: var(--ds-radius-pill);
  background: linear-gradient(90deg, transparent, var(--tolbi-ai-answer-light-accent) 25%, var(--tolbi-ai-answer-light-brand) 75%, transparent);
  box-shadow: 0 0 14px 2px color-mix(in srgb, var(--tolbi-ai-answer-light-accent) 55%, transparent);
  pointer-events: none;
}

/*
  The product's markdown takes the answer's type: body text in the default
  ink, figures in the strong one, bullets in the faintest — Figma's « • ».
  `:deep()`, because rendered markdown carries the product's scope id.
*/
.ds-tolbi-ai-answer__words {
  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
  overflow-wrap: anywhere;
}

.ds-tolbi-ai-answer__words :deep(:is(p, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, pre, table, hr)) {
  margin: 0;
}

.ds-tolbi-ai-answer__words :deep(:is(p, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, pre, table, hr) + :is(p, ul, ol, h1, h2, h3, h4, h5, h6, blockquote, pre, table, hr)) {
  margin-top: 10px;
}

/*
  The bullets are said here, not left to the browser: a reset (Tailwind's
  preflight sets `list-style: none`) would otherwise take them away.
*/
.ds-tolbi-ai-answer__words :deep(:is(ul, ol)) {
  padding-left: var(--ds-spacing-xl);
}

.ds-tolbi-ai-answer__words :deep(ul) {
  list-style: disc outside;
}

.ds-tolbi-ai-answer__words :deep(ol) {
  list-style: decimal outside;
}

.ds-tolbi-ai-answer__words :deep(:is(ul, ol) ul) {
  list-style-type: circle;
}

.ds-tolbi-ai-answer__words :deep(:is(li + li, li > ul, li > ol)) {
  margin-top: 10px;
}

.ds-tolbi-ai-answer__words :deep(li::marker) {
  color: var(--ds-text-subtlest);
}

.ds-tolbi-ai-answer__words :deep(:is(strong, b)) {
  font-weight: var(--ds-font-weight-label-md-strong);
  color: var(--ds-text-strong);
}

/*
  Every level of heading is the answer's emphasis, not a page's title: the
  page has its one heading (ADR-0051), and a browser's own `h1` is twice the
  size in a Bold the catalogue does not have (ADR-0003).
*/
.ds-tolbi-ai-answer__words :deep(:is(h1, h2, h3, h4, h5, h6)) {
  font: var(--ds-font-body-md-emphasis);
  color: var(--ds-text-strong);
}

/*
  The rest of what markdown writes, on the same type and rhythm, so nothing in
  an answer falls back to the browser's defaults. A link is the brand's ink
  and always underlined — colour alone cannot say « link » (WCAG 1.4.1) — with
  the catalogue's ring, instant (ADR-0022).
*/
.ds-tolbi-ai-answer__words :deep(a) {
  border-radius: var(--ds-radius-inner-sm);
  color: var(--ds-text-brand);
  text-decoration: underline;
  text-decoration-thickness: var(--ds-border-width-default);
  text-underline-offset: 0.2em;
  outline: none;
  transition:
    color      var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-tolbi-ai-answer__words :deep(a:hover) {
  color: var(--ds-text-brand-hover);
}

.ds-tolbi-ai-answer__words :deep(a:focus-visible) {
  box-shadow: var(--ds-focus-ring-brand);
}

/* Code is `code-md`, the one role in JetBrains Mono (ADR-0003): 13px on the
   answer's 20px line box, so a word of code never moves the line. */
.ds-tolbi-ai-answer__words :deep(code) {
  font: var(--ds-font-code-md);
  padding: 0 var(--ds-spacing-xs);
  border-radius: var(--ds-radius-inner-sm);
  background: var(--ds-bg-neutral);
  color: var(--ds-text-strong);
}

/* A block of code keeps its lines: it scrolls sideways rather than wrapping. */
.ds-tolbi-ai-answer__words :deep(pre) {
  font: var(--ds-font-code-md);
  padding: var(--ds-spacing-md) var(--ds-spacing-lg);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface-sm);
  background: var(--ds-bg-neutral-subtle);
  overflow-x: auto;
  overflow-wrap: normal;
  white-space: pre;
}

.ds-tolbi-ai-answer__words :deep(pre code) {
  padding: 0;
  background: none;
  color: var(--ds-text-default);
}

.ds-tolbi-ai-answer__words :deep(blockquote) {
  padding-left: var(--ds-spacing-lg);
  border-left: var(--ds-border-width-strong) solid var(--ds-border-default);
  color: var(--ds-text-subtle);
}

/* A table reads in the smaller body, figures aligned, rows ruled. */
.ds-tolbi-ai-answer__words :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font: var(--ds-font-body-sm);
}

.ds-tolbi-ai-answer__words :deep(:is(th, td)) {
  padding: var(--ds-spacing-sm) var(--ds-spacing-md);
  border-bottom: var(--ds-border-width-default) solid var(--ds-border-subtle);
  text-align: left;
  vertical-align: top;
}

.ds-tolbi-ai-answer__words :deep(th) {
  font: var(--ds-font-body-sm-emphasis);
  color: var(--ds-text-strong);
}

.ds-tolbi-ai-answer__words :deep(td) {
  font-variant-numeric: tabular-nums;
}

.ds-tolbi-ai-answer__words :deep(hr) {
  height: 0;
  border: 0;
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-tolbi-ai-answer__words :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--ds-radius-surface-sm);
}

/*
  One action every 32px — IconButton `xs`, the glyph at 16 — where the products
  measured put one every 30 to 34 (ADR-0066). They touch: the box is the gap.
*/
.ds-tolbi-ai-answer__actions {
  display: flex;
  align-items: center;
}

.ds-tolbi-ai-answer__action {
  position: relative;
  display: inline-flex;
}

/*
  Above the action, starting at its left: the panel's edge is close on that
  side, and a centred tooltip over the first icon would be cut by it. The
  arrow's tip sits 20px into the tooltip (`spacing-lg` plus its 8px half-width)
  and the action's centre 16px into the action, so the tooltip starts 4px early
  and the tip lands on the centre.
*/
.ds-tolbi-ai-answer__tip {
  position: absolute;
  left: calc(-1 * var(--ds-spacing-xs));
  bottom: 100%;
  margin-bottom: var(--ds-spacing-xs);
  z-index: var(--ds-z-popover);
  white-space: nowrap;
  pointer-events: none;
  transform-origin: bottom left;
}

/* Visually hidden, still announced — never display:none. */
.ds-tolbi-ai-answer__status {
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
