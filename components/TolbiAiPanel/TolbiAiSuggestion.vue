<script setup lang="ts">
import { Icon, type IconName } from '../Icon'

/**
 * Something to ask, ready to send: one per line, left-aligned, and it wraps —
 * a long suggestion is a long question, not an overflow (ADR-0062). The welcome
 * lists four; under an answer, « Pour continuer » lists what follows from it,
 * each with the glyph of where it leads.
 */
interface Props {
  label: string
  icon?: IconName
}

defineProps<Props>()
const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button type="button" class="ds-tolbi-ai-suggestion" @click="emit('click', $event)">
    <Icon v-if="icon" :name="icon" :size="20" class="ds-tolbi-ai-suggestion__icon" />
    <span>{{ label }}</span>
  </button>
</template>

<style scoped>
/*
  Figma's row: 10px and 12px in, a `border-subtle` hairline at `radius-control`.
  The 10s are control padding, off the spacing ramp (ADR-0013).
*/
.ds-tolbi-ai-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px var(--ds-spacing-lg);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-default);
  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
  text-align: left;
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    border-color     var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/*
  On white a tint barely says hover (`bg-hover` is 1.045:1, ADR-0044), so the
  contour darkens with it: the mechanism carries it, the tint confirms it.
*/
.ds-tolbi-ai-suggestion:hover {
  background: var(--ds-bg-hover);
  border-color: var(--ds-border-default);
}

.ds-tolbi-ai-suggestion:focus-visible {
  outline: none;
  border-color: var(--ds-border-default);
  box-shadow: var(--ds-focus-ring-gray);
}

.ds-tolbi-ai-suggestion__icon {
  flex-shrink: 0;
}
</style>
