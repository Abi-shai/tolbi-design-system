<script setup lang="ts">
import { Icon, type IconName } from '../Icon'

/**
 * Where an answer comes from: the kind of data (its glyph), what it is, and how
 * recent — « Rendement estimé · 5 nov. 2025 ». A citation, not a status, so not
 * a `Badge`; and with `href` it is a link to the source itself.
 */
interface Props {
  label: string
  /** When the data was taken — the reason a source is worth showing at all. */
  date?: string
  icon?: IconName
  href?: string
}

defineProps<Props>()
</script>

<template>
  <component :is="href ? 'a' : 'span'" class="ds-tolbi-ai-source" :href="href">
    <Icon v-if="icon" :name="icon" :size="16" class="ds-tolbi-ai-source__icon" />
    <span>{{ label }}<template v-if="date"> · {{ date }}</template></span>
  </component>
</template>

<style scoped>
/* Figma's chip: 3px tall-side, 8px and 6px across, on `bg-neutral-subtle`. */
.ds-tolbi-ai-source {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  padding: 3px var(--ds-spacing-md) 3px var(--ds-spacing-sm);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-neutral-subtle);
  font: var(--ds-font-label-md);
  color: var(--ds-text-default);
  text-decoration: none;
  white-space: nowrap;
}

.ds-tolbi-ai-source__icon {
  flex-shrink: 0;
}

a.ds-tolbi-ai-source {
  transition:
    border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow   var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

a.ds-tolbi-ai-source:hover {
  border-color: var(--ds-border-default);
}

a.ds-tolbi-ai-source:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-gray);
}
</style>
