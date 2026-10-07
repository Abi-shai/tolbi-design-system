<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import { Button } from '../Button'

/**
 * Where the last question stands — the one fact the composer cannot know.
 *
 * `ready` — nothing is waiting. `pending` — an answer is on its way: the box
 * goes quiet, the placeholder says so, and « Arrêter » takes the action's
 * place. `failed` — the answer did not come: a line above the box says so and
 * offers to send it again, and the question stays in the box.
 */
export type TolbiAiComposerStatus = 'ready' | 'pending' | 'failed'

interface Props {
  /** The question being written. */
  modelValue?: string
  status?: TolbiAiComposerStatus
  placeholder?: string
  /** The placeholder while an answer is on its way. */
  pendingPlaceholder?: string
  /**
   * What every question is asked about — « Tout votre projet ». A statement,
   * not a control: each question goes out with the whole project. `null` hides
   * it.
   */
  scope?: string | null
  /** The line under the box. `null` hides it. */
  disclaimer?: string | null
  failedMessage?: string
  retryLabel?: string
  sendLabel?: string
  stopLabel?: string
  /** The field's accessible name — a placeholder is not one. */
  inputLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  status: 'ready',
  placeholder: 'Demander à Tolbi AI…',
  pendingPlaceholder: 'Tolbi AI répond…',
  scope: 'Tout votre projet',
  disclaimer:
    'Tolbi AI est une intelligence artificielle, et peut faire des erreurs. Veuillez vérifier les sources citées.',
  failedMessage: 'Tolbi AI n’a pas pu répondre pour le moment.',
  retryLabel: 'Réessayer',
  sendLabel: 'Envoyer',
  stopLabel: 'Arrêter',
  inputLabel: 'Demander à Tolbi AI',
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
}>()

const field = ref<HTMLTextAreaElement>()
const scopeId = `ds-tolbi-ai-composer-scope-${useId()}`

const pending = computed(() => props.status === 'pending')
const canSend = computed(() => !pending.value && props.modelValue.trim() !== '')

/*
  Every action hands the focus back to the field. The control that was pressed
  is about to be replaced — send by « Arrêter », « Arrêter » by send, the
  failure line by nothing — and a removed element takes the focus with it.
*/
function focusField() {
  field.value?.focus()
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
</script>

<template>
  <div class="ds-tolbi-ai-composer" :class="`ds-tolbi-ai-composer--${status}`">
    <div v-if="status === 'failed'" class="ds-tolbi-ai-composer__failure">
      <Icon name="circle-alert" :size="16" class="ds-tolbi-ai-composer__failure-icon" />
      <span role="alert">{{ failedMessage }}</span>
      <Button variant="link" size="xs" :label="retryLabel" @click="retry" />
    </div>

    <div class="ds-tolbi-ai-composer__box">
      <!--
        Read as the field's description, so it is heard where the question is
        typed — and hidden as text, or a reader would meet it twice.
      -->
      <span v-if="scope" :id="scopeId" class="ds-tolbi-ai-composer__scope" aria-hidden="true">
        <Icon name="folder-open" :size="16" />
        {{ scope }}
      </span>

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
        <Button
          v-if="pending"
          variant="secondary-gray"
          size="xs"
          icon-leading="x"
          :label="stopLabel"
          @click="stop"
        />
        <IconButton
          v-else
          icon="arrow-up"
          variant="primary"
          size="xs"
          :ariaLabel="sendLabel"
          :disabled="!canSend"
          @click="send"
        />
      </div>
    </div>

    <p v-if="disclaimer" class="ds-tolbi-ai-composer__disclaimer">{{ disclaimer }}</p>
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px 10px 10px var(--ds-spacing-lg);
  background: var(--ds-bg-default);
  border: var(--ds-border-width-default) solid var(--ds-border-default);
  border-radius: var(--ds-radius-surface-sm);
  transition:
    border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow   var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* The field's focus is the box's: the ring goes round everything it holds. */
.ds-tolbi-ai-composer__box:has(.ds-tolbi-ai-composer__field:focus-visible) {
  border-color: var(--ds-border-brand);
  box-shadow: var(--ds-focus-ring-brand);
}

/* Waiting for an answer, the box goes quiet: it takes no question. */
.ds-tolbi-ai-composer--pending .ds-tolbi-ai-composer__box {
  border-color: var(--ds-border-subtle);
}

.ds-tolbi-ai-composer__scope {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md) var(--ds-spacing-xxs) var(--ds-spacing-sm);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-neutral);
  font: var(--ds-font-label-md);
  color: var(--ds-text-default);
  white-space: nowrap;
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

.ds-tolbi-ai-composer__foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.ds-tolbi-ai-composer__disclaimer {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtlest);
  text-align: center;
}
</style>
