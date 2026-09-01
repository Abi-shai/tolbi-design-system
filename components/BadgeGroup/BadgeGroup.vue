<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

/**
 * ADR-0014: aligned with `Badge.tone`. `brand` survives where ADR-0009 removed
 * it from Badge's status tones, because a BadgeGroup is *always* interactive —
 * and brand is interactive affordance. `gray` became `neutral` to match the
 * tone vocabulary.
 */
export type BadgeGroupTone   = 'brand' | 'neutral' | 'error' | 'warning' | 'success'
export type BadgeGroupSize   = 'md' | 'lg'
export type BadgeGroupBadge  = 'leading' | 'trailing'

interface Props {
  label:         string
  message:       string
  tone?:         BadgeGroupTone
  /** Renders an anchor instead of a button. */
  href?:         string
  size?:         BadgeGroupSize
  badge?:        BadgeGroupBadge
  icon?:         IconName
}

const props = withDefaults(defineProps<Props>(), {
  tone:   'brand',
  href:   undefined,
  size:   'md',
  badge:  'leading',
  icon:   undefined,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

/* A div that emits click is unreachable by keyboard. The DS convention is a
   real control — Button, Tag and CloseButton all render <button type="button">. */
const tag = computed(() => (props.href ? 'a' : 'button'))
</script>

<template>
  <component
    :is="tag"
    :class="[
      'ds-badge-group',
      `ds-badge-group--${tone}`,
      `ds-badge-group--${size}`,
      `ds-badge-group--${badge}`,
    ]"
    :type="href ? undefined : 'button'"
    :href="href"
    @click="emit('click', $event)"
  >
    <!-- Leading: pill | message [→] -->
    <template v-if="badge === 'leading'">
      <span class="ds-badge-group__pill">{{ label }}</span>
      <span class="ds-badge-group__content">
        <span class="ds-badge-group__message">{{ message }}</span>
        <Icon
          v-if="icon"
          :name="icon"
          :size="size === 'lg' ? 16 : 14"
          class="ds-badge-group__icon"
          aria-hidden="true"
        />
      </span>
    </template>

    <!-- Trailing: message | pill [→] -->
    <template v-else>
      <span class="ds-badge-group__message">{{ message }}</span>
      <span class="ds-badge-group__pill ds-badge-group__pill--trailing">
        {{ label }}
        <Icon
          v-if="icon"
          :name="icon"
          :size="12"
          class="ds-badge-group__icon"
          aria-hidden="true"
        />
      </span>
    </template>
  </component>
</template>

<style scoped>
/* ── Color tokens ─────────────────────────────────────────────────── */
.ds-badge-group {
  --badge-group-bg:  var(--ds-bg-brand-subtle);
  --badge-group-bg-hover:    var(--ds-bg-brand-subtle-hover);
  --badge-group-border:      var(--ds-border-on-brand-subtle);
  --badge-group-text:        var(--ds-text-on-brand-subtle);
  --badge-group-pill-border: var(--ds-border-on-brand-subtle);
}
.ds-badge-group--error   {
  --badge-group-bg:  var(--ds-bg-error-subtle);
  --badge-group-bg-hover:    var(--ds-bg-error-subtle-hover);
  --badge-group-border:      var(--ds-border-on-error-subtle);
  --badge-group-text:        var(--ds-text-on-error-subtle);
  --badge-group-pill-border: var(--ds-border-on-error-subtle);
}
.ds-badge-group--warning {
  --badge-group-bg:  var(--ds-bg-warning-subtle);
  --badge-group-bg-hover:    var(--ds-bg-warning-subtle-hover);
  --badge-group-border:      var(--ds-border-on-warning-subtle);
  --badge-group-text:        var(--ds-text-on-warning-subtle);
  --badge-group-pill-border: var(--ds-border-on-warning-subtle);
}
.ds-badge-group--success {
  --badge-group-bg:  var(--ds-bg-success-subtle);
  --badge-group-bg-hover:    var(--ds-bg-success-subtle-hover);
  --badge-group-border:      var(--ds-border-on-success-subtle);
  --badge-group-text:        var(--ds-text-on-success-subtle);
  --badge-group-pill-border: var(--ds-border-on-success-subtle);
}
.ds-badge-group--neutral {
  --badge-group-bg:  var(--ds-bg-neutral-subtle);
  --badge-group-bg-hover:    var(--ds-bg-neutral-subtle-hover);
  --badge-group-border:      var(--ds-border-subtle);
  --badge-group-text:        var(--ds-text-default);
  --badge-group-pill-border: var(--ds-border-subtle);
}

/* ── Base ─────────────────────────────────────────────────────────── */
.ds-badge-group {
  display: inline-flex;
  align-items: center;
  border: var(--ds-border-width-default) solid var(--badge-group-border);
  border-radius: var(--ds-radius-pill);
  background-color: var(--badge-group-bg);
  color: var(--badge-group-text);
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-label-lg);
  white-space: nowrap;
  cursor: pointer;
  text-decoration: none;
  /* Reset the UA button styles the element now brings with it. */
  margin: 0;
  text-align: left;
  transition: background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-badge-group:hover {
  background-color: var(--badge-group-bg-hover);
}

/* ADR-0006: one focus treatment, and no component defines its own. */
.ds-badge-group:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

/* ── Sizes ────────────────────────────────────────────────────────── */
.ds-badge-group--md {
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-xs) 10px var(--ds-spacing-xs) var(--ds-spacing-xs);
  font: var(--ds-font-label-md);
}
.ds-badge-group--md.ds-badge-group--trailing {
  padding: var(--ds-spacing-xs) var(--ds-spacing-xs) var(--ds-spacing-xs) var(--ds-spacing-lg);
}

.ds-badge-group--lg {
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-xs) 10px var(--ds-spacing-xs) var(--ds-spacing-xs);
  font: var(--ds-font-label-lg);
}
.ds-badge-group--lg.ds-badge-group--trailing {
  padding: var(--ds-spacing-xs) var(--ds-spacing-xs) var(--ds-spacing-xs) 14px;
}

/* ── Inner pill ───────────────────────────────────────────────────── */
.ds-badge-group__pill {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  border: var(--ds-border-width-default) solid var(--badge-group-pill-border);
  border-radius: var(--ds-radius-pill);
  background-color: var(--ds-bg-default);
  color: var(--badge-group-text);
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md);
  white-space: nowrap;
}

.ds-badge-group--lg .ds-badge-group__pill {
  padding: var(--ds-spacing-xxs) 10px;
}

/* Trailing pill has tighter right padding to accommodate the icon */
.ds-badge-group__pill--trailing {
  padding-right: var(--ds-spacing-sm);
}
.ds-badge-group--lg .ds-badge-group__pill--trailing {
  padding-left: 10px;
  padding-right: var(--ds-spacing-md);
}

/* ── Content (leading mode) ───────────────────────────────────────── */
.ds-badge-group__content {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
}

/* ── Icon ─────────────────────────────────────────────────────────── */
.ds-badge-group__icon {
  flex-shrink: 0;
}
</style>
