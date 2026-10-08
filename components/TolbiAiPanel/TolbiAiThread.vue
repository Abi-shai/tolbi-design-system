<script setup lang="ts">
import { onMounted, provide, ref } from 'vue'
import { TOLBI_AI_THREAD } from './context'

/**
 * The conversation: questions, voice notes, the waiting line, answers — keyed
 * children, in order. What arrives comes in 8px from below as it fades, over
 * `enter` (ADR-0062) — except an answer, which arrives under a passing light of
 * its own (ADR-0068). What is already there when the thread mounts does not
 * move, so reopening a conversation does not replay it; the thread says which
 * is which.
 */
const settled = ref(false)
provide(TOLBI_AI_THREAD, { settled })
onMounted(() => (settled.value = true))
</script>

<template>
  <TransitionGroup tag="div" name="ds-tolbi-ai-arrive" class="ds-tolbi-ai-thread">
    <slot />
  </TransitionGroup>
</template>

<style scoped>
.ds-tolbi-ai-thread {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
  min-width: 0;
}

/* Slotted children carry the consumer's scope id, not this one's — the
   transition classes have to reach them through `:deep()` (ADR-0040). An answer
   is left out: it arrives by its own light (ADR-0068). */
.ds-tolbi-ai-thread :deep(.ds-tolbi-ai-arrive-enter-active:not(.ds-tolbi-ai-answer)) {
  transition:
    opacity   var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
}

.ds-tolbi-ai-thread :deep(.ds-tolbi-ai-arrive-enter-from:not(.ds-tolbi-ai-answer)) {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .ds-tolbi-ai-thread :deep(.ds-tolbi-ai-arrive-enter-from:not(.ds-tolbi-ai-answer)) {
    transform: none;
  }
}
</style>
