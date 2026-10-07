<script setup lang="ts">
/**
 * The conversation: questions, voice notes, the waiting line, answers — keyed
 * children, in order. What arrives comes in 8px from below as it fades, over
 * `enter` (ADR-0062); what is already there when the thread mounts does not
 * move, so reopening a conversation does not replay it.
 */
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
   transition classes have to reach them through `:deep()` (ADR-0040). */
.ds-tolbi-ai-thread :deep(.ds-tolbi-ai-arrive-enter-active) {
  transition:
    opacity   var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
}

.ds-tolbi-ai-thread :deep(.ds-tolbi-ai-arrive-enter-from) {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .ds-tolbi-ai-thread :deep(.ds-tolbi-ai-arrive-enter-from) {
    transform: none;
  }
}
</style>
