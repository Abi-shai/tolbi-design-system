<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import { MarkTransition } from '../MarkTransition'
import { SurfaceTransition } from '../SurfaceTransition'
import { Tooltip } from '../Tooltip'

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
 * confirming itself with a check.
 */
interface Props {
  copyLabel?: string
  /** What the copy says for the two seconds after it has copied. */
  copiedLabel?: string
  upLabel?: string
  downLabel?: string
  regenerateLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  copyLabel: 'Copier la réponse',
  copiedLabel: 'Réponse copiée',
  upLabel: 'Réponse utile',
  downLabel: 'Réponse non utile',
  regenerateLabel: 'Générer une autre réponse',
})

const emit = defineEmits<{
  /** The answer's text, as copied. */
  copy: [text: string]
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
  Each icon says what it does, in a tooltip after 400ms on hover or focus — the
  composer's microphone does the same (ADR-0061). Presentational: the button's
  own name already says it to a screen reader.
*/
const TIP_DELAY = 400
const tip = ref<string | null>(null)
let tipTimer: ReturnType<typeof setTimeout> | undefined

function tipSoon(action: string) {
  clearTimeout(tipTimer)
  tipTimer = setTimeout(() => (tip.value = action), TIP_DELAY)
}

function tipAway() {
  clearTimeout(tipTimer)
  tip.value = null
}

onBeforeUnmount(() => {
  clearTimeout(copiedTimer)
  clearTimeout(tipTimer)
})
</script>

<template>
  <div class="ds-tolbi-ai-answer">
    <div ref="words" class="ds-tolbi-ai-answer__words"><slot /></div>

    <div class="ds-tolbi-ai-answer__actions">
      <span
        class="ds-tolbi-ai-answer__action"
        @pointerenter="tipSoon('copy')"
        @pointerleave="tipAway"
        @focusin="tipSoon('copy')"
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
        class="ds-tolbi-ai-answer__action"
        @pointerenter="tipSoon('up')"
        @pointerleave="tipAway"
        @focusin="tipSoon('up')"
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
        @focusin="tipSoon('down')"
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
        @focusin="tipSoon('regenerate')"
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
  </div>
</template>

<style scoped>
/* The actions belong to the answer: 8px under its words, not a block away. */
.ds-tolbi-ai-answer {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  min-width: 0;
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

.ds-tolbi-ai-answer__words :deep(:is(p, ul, ol, h2, h3, h4, blockquote, pre, table)) {
  margin: 0;
}

.ds-tolbi-ai-answer__words :deep(:is(p, ul, ol, h2, h3, h4, blockquote, pre, table) + :is(p, ul, ol, h2, h3, h4, blockquote, pre, table)) {
  margin-top: 10px;
}

.ds-tolbi-ai-answer__words :deep(:is(ul, ol)) {
  padding-left: var(--ds-spacing-xl);
}

.ds-tolbi-ai-answer__words :deep(li + li) {
  margin-top: 10px;
}

.ds-tolbi-ai-answer__words :deep(li::marker) {
  color: var(--ds-text-subtlest);
}

.ds-tolbi-ai-answer__words :deep(:is(strong, b)) {
  font-weight: var(--ds-font-weight-label-md-strong);
  color: var(--ds-text-strong);
}

.ds-tolbi-ai-answer__words :deep(:is(h2, h3, h4)) {
  font: var(--ds-font-body-md-emphasis);
  color: var(--ds-text-strong);
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
