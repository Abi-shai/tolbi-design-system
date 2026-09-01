<script setup lang="ts">
import { computed } from 'vue'
import { Icon, type IconName } from '../Icon'
import { CloseButton } from '../CloseButton'
import { Spinner } from '../Spinner'

export type ToastTone = 'brand' | 'info' | 'success' | 'warning' | 'error'

interface Props {
  tone?: ToastTone
  title: string
  text?: string
  icon?: IconName
  /** Swaps the icon for a spinner — for an action still in flight. */
  pending?: boolean
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'info',
  pending: false,
  dismissible: true,
})

defineEmits<{ dismiss: [] }>()

const TONE_ICON: Record<ToastTone, IconName> = {
  brand:   'info',
  info:    'info',
  success: 'circle-check',
  warning: 'triangle-alert',
  error:   'circle-alert',
}

const resolvedIcon = computed(() => props.icon ?? TONE_ICON[props.tone])

/*
 * An error has to interrupt a screen reader; a success must not. `alert` is
 * assertive, `status` is polite.
 */
const liveRole = computed(() => (props.tone === 'error' ? 'alert' : 'status'))
</script>

<template>
  <div class="ds-toast" :class="`ds-toast--${tone}`" :role="liveRole">
    <span class="ds-toast__icon">
      <Spinner v-if="pending" :size="20" />
      <Icon v-else :name="resolvedIcon" :size="20" />
    </span>

    <div class="ds-toast__content">
      <p class="ds-toast__title">{{ title }}</p>
      <p v-if="text" class="ds-toast__text">{{ text }}</p>
      <div v-if="$slots.default" class="ds-toast__actions">
        <slot />
      </div>
    </div>

    <CloseButton
      v-if="dismissible"
      size="sm"
      aria-label="Fermer la notification"
      class="ds-toast__close"
      @click="$emit('dismiss')"
    />
  </div>
</template>

<style scoped>
.ds-toast {
  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-xl);
  width: 100%;
  max-width: var(--ds-width-xs);
  border: 1px solid var(--ds-border-subtle);
  border-left: 3px solid var(--tone-fg);
  border-radius: var(--ds-radius-surface);
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-overlay);
  font-family: var(--ds-typography-font-family-poppins);
}

.ds-toast--info    { --tone-fg: var(--ds-text-subtlest);      --tone-bg: var(--ds-bg-neutral-subtle);   --tone-border: var(--ds-border-subtle); }
.ds-toast--success { --tone-fg: var(--ds-text-success); --tone-bg: var(--ds-bg-success-subtle); --tone-border: var(--ds-border-success); }
.ds-toast--warning { --tone-fg: var(--ds-text-warning); --tone-bg: var(--ds-bg-warning-subtle); --tone-border: var(--ds-border-warning); }
.ds-toast--error   { --tone-fg: var(--ds-text-error);   --tone-bg: var(--ds-bg-error-subtle);   --tone-border: var(--ds-border-error); }

.ds-toast__icon { display: flex; flex-shrink: 0; color: var(--tone-fg); }

.ds-toast__content {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
  flex: 1 1 auto;
  min-width: 0;
}

.ds-toast__title {
  margin: 0;
  font: var(--ds-font-heading-sm);
  color: var(--ds-text-strong);
}

.ds-toast__text {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-toast__actions {
  display: flex;
  gap: var(--ds-spacing-md);
  margin-top: var(--ds-spacing-md);
  flex-wrap: wrap;
}

.ds-toast__close { flex-shrink: 0; margin: -2px -4px 0 0; }
</style>
