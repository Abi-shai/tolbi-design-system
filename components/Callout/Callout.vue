<script setup lang="ts">
import { computed } from 'vue'
import { Icon, type IconName } from '../Icon'
import { CloseButton } from '../CloseButton'

export type CalloutTone = 'brand' | 'info' | 'success' | 'warning' | 'error'

interface Props {
  tone?: CalloutTone
  title?: string
  /** Body text. Use the default slot for anything richer than a sentence. */
  text?: string
  /** Overrides the icon the tone would pick. */
  icon?: IconName
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'info',
  dismissible: false,
})

defineEmits<{ dismiss: [] }>()

/*
 * Tone picks the icon, so meaning is never carried by colour alone — a warning
 * still reads as a warning in greyscale.
 */
const TONE_ICON: Record<CalloutTone, IconName> = {
  brand:   'info',
  info:    'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  error:   'circle-alert',
}

const resolvedIcon = computed(() => props.icon ?? TONE_ICON[props.tone])
</script>

<template>
  <div class="ds-callout" :class="`ds-callout--${tone}`" role="note">
    <span class="ds-callout__icon">
      <Icon :name="resolvedIcon" :size="20" />
    </span>

    <div class="ds-callout__content">
      <p v-if="title" class="ds-callout__title">{{ title }}</p>
      <div v-if="text || $slots.default" class="ds-callout__text">
        <slot>{{ text }}</slot>
      </div>
      <div v-if="$slots.actions" class="ds-callout__actions">
        <slot name="actions" />
      </div>
    </div>

    <CloseButton
      v-if="dismissible"
      size="sm"
      aria-label="Fermer"
      class="ds-callout__close"
      @click="$emit('dismiss')"
    />
  </div>
</template>

<style scoped>
.ds-callout {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-xl);
  border: var(--ds-border-width-default) solid var(--tone-border);
  border-radius: var(--ds-radius-surface);
  background-color: var(--tone-bg);
  font-family: var(--ds-typography-font-family-poppins);
  min-width: 0;
}

.ds-callout--info    { --tone-fg: var(--ds-text-subtlest);      --tone-bg: var(--ds-bg-neutral-subtle);   --tone-border: var(--ds-border-subtle); }
.ds-callout--success { --tone-fg: var(--ds-text-success); --tone-bg: var(--ds-bg-success-subtle); --tone-border: var(--ds-border-success); }
.ds-callout--warning { --tone-fg: var(--ds-text-warning); --tone-bg: var(--ds-bg-warning-subtle); --tone-border: var(--ds-border-warning); }
.ds-callout--error   { --tone-fg: var(--ds-text-error);   --tone-bg: var(--ds-bg-error-subtle);   --tone-border: var(--ds-border-error); }

.ds-callout__icon {
  display: flex;
  flex-shrink: 0;
  color: var(--tone-fg);
}

.ds-callout__content {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  flex: 1 1 auto;
  min-width: 0;
}

.ds-callout__title {
  margin: 0;
  font: var(--ds-font-heading-sm);
  color: var(--ds-text-strong);
}

.ds-callout__text {
  font: var(--ds-font-body-md);
  color: var(--ds-text-default);
}

.ds-callout__actions {
  display: flex;
  gap: var(--ds-spacing-md);
  margin-top: var(--ds-spacing-xs);
  flex-wrap: wrap;
}

.ds-callout__close { flex-shrink: 0; margin: -2px -4px 0 0; }
</style>
