<script setup lang="ts">
import { computed, inject } from 'vue'
import { TolbiAiSpark } from '../TolbiAiSpark'
import TolbiAiSuggestion from './TolbiAiSuggestion.vue'
import { TOLBI_AI_PANEL } from './context'

/**
 * What an empty conversation shows: the sign, the question Tolbi AI asks, and
 * a few to start from. The sign is 64 in the docked panel and 96 once it is
 * expanded — Figma's « accueil agrandi » (ADR-0062).
 */
interface Props {
  title?: string
  /** Questions to start from, one per line. Picking one asks it. */
  suggestions?: string[]
}

withDefaults(defineProps<Props>(), {
  title: 'Que voulez-vous savoir sur votre projet ?',
  suggestions: () => [],
})

const emit = defineEmits<{ select: [suggestion: string] }>()

const panel = inject(TOLBI_AI_PANEL, null)
const sign = computed(() => (panel?.expanded.value ? 96 : 64))
</script>

<template>
  <div class="ds-tolbi-ai-welcome">
    <div class="ds-tolbi-ai-welcome__intro">
      <TolbiAiSpark :size="sign" :aria-label="null" />
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
