<script setup lang="ts">
/**
 * A question as it was typed, on the user's side of the thread — the text
 * counterpart of `TolbiAiVoiceNote`, on the same `bg-neutral`.
 */
interface Props {
  text?: string
}

defineProps<Props>()
</script>

<template>
  <p class="ds-tolbi-ai-question"><slot>{{ text }}</slot></p>
</template>

<style scoped>
/* Figma's bubble: 10px by 14px, `radius-surface-sm`, hugging its words. Control
   padding, off the spacing ramp (ADR-0013). Line breaks typed with Shift+Enter
   are kept. */
.ds-tolbi-ai-question {
  align-self: flex-end;
  max-width: 80%;
  box-sizing: border-box;
  margin: 0;
  padding: 10px 14px;
  border-radius: var(--ds-radius-surface-sm);
  background: var(--ds-bg-neutral);
  font: var(--ds-font-body-md);
  color: var(--ds-text-strong);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
