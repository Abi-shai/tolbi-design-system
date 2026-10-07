<script setup lang="ts">
import { computed, inject } from 'vue'
import { TolbiAiSpark } from '../TolbiAiSpark'
import TolbiAiSuggestion from './TolbiAiSuggestion.vue'
import { TOLBI_AI_PANEL } from './context'

/**
 * What an empty conversation shows: the sign, the question Tolbi AI asks, and
 * a few to start from. The sign is 64 in the docked panel and 96 once it is
 * expanded — Figma's « accueil agrandi » (ADR-0062) — and it grows on the
 * panel's own travel rather than jumping at its start (ADR-0064).
 */
interface Props {
  title?: string
  /** Questions to start from, one per line. Picking one asks it. */
  suggestions?: string[]
  /**
   * Play the awakening (ADR-0063) — for the panel's **first** opening only,
   * which is the product's to know. It plays as the panel opens, not while it
   * is closed; on `awake`, stop asking for it, or the next opening plays it
   * again.
   */
  awaken?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Que voulez-vous savoir sur votre projet ?',
  suggestions: () => [],
  awaken: false,
})

const emit = defineEmits<{
  select: [suggestion: string]
  /** The awakening is over. */
  awake: []
}>()

const panel = inject(TOLBI_AI_PANEL, null)
const sign = computed(() => (panel?.expanded.value ? 96 : 64))
const signState = computed(() => (props.awaken && (panel?.open.value ?? true) ? 'awakening' : 'rest'))
</script>

<template>
  <div class="ds-tolbi-ai-welcome">
    <div class="ds-tolbi-ai-welcome__intro">
      <TolbiAiSpark
        class="ds-tolbi-ai-welcome__sign"
        :size="sign"
        :state="signState"
        :aria-label="null"
        @awake="emit('awake')"
      />
      <h2 class="ds-tolbi-ai-welcome__title">{{ title }}</h2>
    </div>
    <div v-if="suggestions.length || $slots.default" class="ds-tolbi-ai-welcome__suggestions">
      <TolbiAiSuggestion
        v-for="suggestion in suggestions"
        :key="suggestion"
        :label="suggestion"
        @click="emit('select', suggestion)"
      />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.ds-tolbi-ai-welcome {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-3xl);
}

.ds-tolbi-ai-welcome__intro {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--ds-spacing-lg);
}

/* The size is the sign's own attribute — a presentation attribute, so the
   cascade sees it change and the transition runs on it. */
.ds-tolbi-ai-welcome__sign {
  flex: none;
  transition:
    width  var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    height var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

.ds-tolbi-ai-welcome__title {
  margin: 0;
  font: var(--ds-font-heading-lg);
  color: var(--ds-text-strong);
}

.ds-tolbi-ai-welcome__suggestions {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
}
</style>
