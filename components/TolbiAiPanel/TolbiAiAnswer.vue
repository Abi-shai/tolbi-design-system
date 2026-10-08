<script setup lang="ts">
import { IconButton } from '../IconButton'

/** How the answer was judged, if at all. */
export type TolbiAiFeedback = 'up' | 'down' | null

/**
 * Tolbi AI's answer: the words, and what can be done with them (ADR-0062). The
 * words are the product's to render — markdown, in the default slot — and take
 * the answer's type here. It cites no sources — the data is the product's own,
 * so naming it says nothing — and it does not guess what the user asks next:
 * the next question is theirs, in the composer.
 */
interface Props {
  copyLabel?: string
  upLabel?: string
  downLabel?: string
  regenerateLabel?: string
}

withDefaults(defineProps<Props>(), {
  copyLabel: 'Copier',
  upLabel: 'Réponse utile',
  downLabel: 'Réponse non utile',
  regenerateLabel: 'Régénérer',
})

const emit = defineEmits<{
  copy: []
  regenerate: []
}>()

/* A second press takes the judgement back. */
const feedback = defineModel<TolbiAiFeedback>('feedback', { default: null })
const judge = (value: 'up' | 'down') => (feedback.value = feedback.value === value ? null : value)
</script>

<template>
  <div class="ds-tolbi-ai-answer">
    <div class="ds-tolbi-ai-answer__words"><slot /></div>

    <div class="ds-tolbi-ai-answer__actions">
      <IconButton icon="copy" :ariaLabel="copyLabel" @click="emit('copy')" />
      <IconButton
        icon="thumbs-up"
        :ariaLabel="upLabel"
        :active="feedback === 'up'"
        :aria-pressed="feedback === 'up'"
        @click="judge('up')"
      />
      <IconButton
        icon="thumbs-down"
        :ariaLabel="downLabel"
        :active="feedback === 'down'"
        :aria-pressed="feedback === 'down'"
        @click="judge('down')"
      />
      <IconButton icon="refresh-cw" :ariaLabel="regenerateLabel" @click="emit('regenerate')" />
    </div>
  </div>
</template>

<style scoped>
.ds-tolbi-ai-answer {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
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

.ds-tolbi-ai-answer__actions {
  display: flex;
  align-items: center;
}
</style>
