<script setup lang="ts">
import { IconButton } from '../IconButton'
import type { IconName } from '../Icon'
import TolbiAiSource from './TolbiAiSource.vue'
import TolbiAiSuggestion from './TolbiAiSuggestion.vue'

export interface TolbiAiSourceItem {
  label: string
  date?: string
  icon?: IconName
  href?: string
}

export interface TolbiAiFollowUp {
  label: string
  icon?: IconName
}

/** How the answer was judged, if at all. */
export type TolbiAiFeedback = 'up' | 'down' | null

/**
 * Tolbi AI's answer: the words, the dated sources they stand on, what can be
 * done with them, and where to go next (ADR-0062). The words are the product's
 * to render — markdown, in the default slot — and take the answer's type here.
 */
interface Props {
  sources?: TolbiAiSourceItem[]
  followUps?: TolbiAiFollowUp[]
  sourcesLabel?: string
  followUpsLabel?: string
  copyLabel?: string
  upLabel?: string
  downLabel?: string
  regenerateLabel?: string
}

withDefaults(defineProps<Props>(), {
  sources: () => [],
  followUps: () => [],
  sourcesLabel: 'Sources',
  followUpsLabel: 'Pour continuer',
  copyLabel: 'Copier',
  upLabel: 'Réponse utile',
  downLabel: 'Réponse non utile',
  regenerateLabel: 'Régénérer',
})

const emit = defineEmits<{
  copy: []
  regenerate: []
  'follow-up': [followUp: TolbiAiFollowUp]
}>()

/* A second press takes the judgement back. */
const feedback = defineModel<TolbiAiFeedback>('feedback', { default: null })
const judge = (value: 'up' | 'down') => (feedback.value = feedback.value === value ? null : value)
</script>

<template>
  <div class="ds-tolbi-ai-answer">
    <div class="ds-tolbi-ai-answer__words"><slot /></div>

    <section v-if="sources.length" class="ds-tolbi-ai-answer__group">
      <p class="ds-tolbi-ai-answer__heading">{{ sourcesLabel }}</p>
      <div class="ds-tolbi-ai-answer__sources">
        <TolbiAiSource v-for="source in sources" :key="source.label" v-bind="source" />
      </div>
    </section>

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

    <section v-if="followUps.length" class="ds-tolbi-ai-answer__group ds-tolbi-ai-answer__group--follow">
      <p class="ds-tolbi-ai-answer__heading">{{ followUpsLabel }}</p>
      <TolbiAiSuggestion
        v-for="followUp in followUps"
        :key="followUp.label"
        :label="followUp.label"
        :icon="followUp.icon"
        @click="emit('follow-up', followUp)"
      />
    </section>
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

.ds-tolbi-ai-answer__group {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
}

.ds-tolbi-ai-answer__group--follow {
  gap: var(--ds-spacing-md);
}

.ds-tolbi-ai-answer__heading {
  margin: 0;
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-subtlest);
}

.ds-tolbi-ai-answer__sources {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-spacing-sm);
}

.ds-tolbi-ai-answer__actions {
  display: flex;
  align-items: center;
}
</style>
