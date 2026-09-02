<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

/**
 * ADR-0010: `tone` and `color` are different props because they route
 * differently. A tone expresses a role and resolves through the semantic layer;
 * a colour is categorical — the only sentence you can write about it is "this
 * one is blue" — and resolves straight to the display palette.
 */
export type BadgeTone  = 'neutral' | 'error' | 'warning' | 'success'
export type BadgeColor =
  | 'blue' | 'blue-light' | 'blue-gray'
  | 'indigo' | 'orange' | 'pink' | 'purple'

export type BadgeVariant = 'pill-color' | 'pill-outline'
export type BadgeSize    = 'sm' | 'md' | 'lg'

interface Props {
  label?:       string
  /** Semantic role. Ignored when `color` is set. */
  tone?:        BadgeTone
  /** Categorical identity. Wins over `tone` when both are given. */
  color?:       BadgeColor
  variant?:     BadgeVariant
  size?:        BadgeSize
  dot?:         boolean
  icon?:        IconName
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label:       '',
  tone:        'neutral',
  color:       undefined,
  variant:     'pill-color',
  size:        'sm',
  dot:         false,
  icon:        undefined,
  dismissible: false,
})

const emit = defineEmits<{
  dismiss: []
}>()

/** `color` wins over `tone`; Vue cannot express an exclusive prop union. */
const appearance = computed(() => props.color ?? props.tone)

if (import.meta.env?.DEV) {
  watchEffect(() => {
    if (props.color && props.tone !== 'neutral') {
      console.warn(
        `[Badge] both tone="${props.tone}" and color="${props.color}" were set. ` +
        `color wins; drop one. A tone states a role, a colour states an identity.`,
      )
    }
  })
}

const iconSize = computed(() => {
  if (props.size === 'lg') return 16
  if (props.size === 'md') return 14
  return 12
})

const dotSize = computed(() => {
  if (props.size === 'lg') return 10
  if (props.size === 'md') return 8
  return 6
})
</script>

<template>
  <span
    :class="[
      'ds-badge',
      `ds-badge--${appearance}`,
      `ds-badge--${variant}`,
      `ds-badge--${size}`,
      dot        && 'ds-badge--has-dot',
      icon       && 'ds-badge--has-icon',
      dismissible && 'ds-badge--dismissible',
      !label     && icon && 'ds-badge--icon-only',
    ]"
  >
    <!-- Dot -->
    <span
      v-if="dot"
      class="ds-badge__dot"
      :style="{ width: `${dotSize}px`, height: `${dotSize}px` }"
      aria-hidden="true"
    />

    <!-- Leading icon -->
    <Icon
      v-if="icon"
      :name="icon"
      :size="iconSize"
      class="ds-badge__icon"
      aria-hidden="true"
    />

    <!-- Label -->
    <span v-if="label" class="ds-badge__label">{{ label }}</span>

    <!-- Dismiss button -->
    <button
      v-if="dismissible"
      type="button"
      class="ds-badge__dismiss"
      aria-label="Retirer"
      @click.stop="emit('dismiss')"
    >
      <Icon name="x" :size="iconSize" aria-hidden="true" />
    </button>
  </span>
</template>

<style scoped>
/* ── Tones: variant switches over the semantic layer (ADR-0010) ───── */
.ds-badge,
.ds-badge--neutral {
  --badge-bg:             var(--ds-bg-neutral);
  --badge-border:         var(--ds-border-default);
  --badge-text:           var(--ds-text-default);
  --badge-dot:            var(--ds-bg-neutral-strong);
  --badge-outline-border: var(--ds-border-default);
}
.ds-badge--error   {
  --badge-bg:             var(--ds-bg-error-subtle);
  --badge-border:         var(--ds-border-on-error-subtle);
  --badge-text:           var(--ds-text-on-error-subtle);
  --badge-dot:            var(--ds-bg-error-solid);
  --badge-outline-border: var(--ds-border-error-solid);
}
.ds-badge--warning {
  --badge-bg:             var(--ds-bg-warning-subtle);
  --badge-border:         var(--ds-border-on-warning-subtle);
  --badge-text:           var(--ds-text-on-warning-subtle);
  --badge-dot:            var(--ds-bg-warning-solid);
  --badge-outline-border: var(--ds-border-warning-solid);
}
.ds-badge--success {
  --badge-bg:             var(--ds-bg-success-subtle);
  --badge-border:         var(--ds-border-on-success-subtle);
  --badge-text:           var(--ds-text-on-success-subtle);
  --badge-dot:            var(--ds-bg-success-solid);
  --badge-outline-border: var(--ds-border-success-solid);
}
/* ADR-0009: categorical label palette — component tier, not semantic tones.
   These eight hues have no primitive ramp. Pending a categorical-palette ADR. */

/* ── Colours: categorical, straight off the display palette.
   ADR-0010 lets a component token alias a primitive when the value is
   categorical — there is no role to route through. The outline border
   uses step 700, not 600: in pill-outline the border IS the visual and
   must clear 3:1, and blue-light measured 2.59:1 at 600. ─────────── */
.ds-badge--blue {
  --badge-bg:             var(--ds-color-display-blue-50);
  --badge-border:         var(--ds-color-display-blue-200);
  --badge-text:           var(--ds-color-display-blue-700);
  --badge-dot:            var(--ds-color-display-blue-500);
  --badge-outline-border: var(--ds-color-display-blue-700);
}
.ds-badge--blue-light {
  --badge-bg:             var(--ds-color-display-blue-light-50);
  --badge-border:         var(--ds-color-display-blue-light-200);
  --badge-text:           var(--ds-color-display-blue-light-700);
  --badge-dot:            var(--ds-color-display-blue-light-500);
  --badge-outline-border: var(--ds-color-display-blue-light-700);
}
.ds-badge--blue-gray {
  --badge-bg:             var(--ds-color-display-blue-gray-50);
  --badge-border:         var(--ds-color-display-blue-gray-200);
  --badge-text:           var(--ds-color-display-blue-gray-700);
  --badge-dot:            var(--ds-color-display-blue-gray-500);
  --badge-outline-border: var(--ds-color-display-blue-gray-700);
}
.ds-badge--indigo {
  --badge-bg:             var(--ds-color-display-indigo-50);
  --badge-border:         var(--ds-color-display-indigo-200);
  --badge-text:           var(--ds-color-display-indigo-700);
  --badge-dot:            var(--ds-color-display-indigo-500);
  --badge-outline-border: var(--ds-color-display-indigo-700);
}
.ds-badge--orange {
  --badge-bg:             var(--ds-color-display-orange-50);
  --badge-border:         var(--ds-color-display-orange-200);
  --badge-text:           var(--ds-color-display-orange-700);
  --badge-dot:            var(--ds-color-display-orange-500);
  --badge-outline-border: var(--ds-color-display-orange-700);
}
.ds-badge--pink {
  --badge-bg:             var(--ds-color-display-pink-50);
  --badge-border:         var(--ds-color-display-pink-200);
  --badge-text:           var(--ds-color-display-pink-700);
  --badge-dot:            var(--ds-color-display-pink-500);
  --badge-outline-border: var(--ds-color-display-pink-700);
}
.ds-badge--purple {
  --badge-bg:             var(--ds-color-display-purple-50);
  --badge-border:         var(--ds-color-display-purple-200);
  --badge-text:           var(--ds-color-display-purple-700);
  --badge-dot:            var(--ds-color-display-purple-500);
  --badge-outline-border: var(--ds-color-display-purple-700);
}

/* ── Base ─────────────────────────────────────────────────────────── */
.ds-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  border-radius: var(--ds-radius-pill);
  white-space: nowrap;
}

/* ── Sizes ────────────────────────────────────────────────────────── */
.ds-badge--sm {
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md);
  font: var(--ds-font-label-md);
  line-height: 1;
}
.ds-badge--md {
  padding: var(--ds-spacing-xxs) 10px;
  font: var(--ds-font-label-lg);
  line-height: 1;
}
.ds-badge--lg {
  padding: var(--ds-spacing-xs) var(--ds-spacing-lg);
  font: var(--ds-font-label-lg);
  line-height: 1;
}

/* Tabs renders counts through Badge, so digits must not jitter (ADR-0011). */
.ds-badge__label { font-variant-numeric: tabular-nums; }

/* ── Pill color ───────────────────────────────────────────────────── */
.ds-badge--pill-color {
  background-color: var(--badge-bg);
  border: var(--ds-border-width-default) solid var(--badge-border);
  color: var(--badge-text);
}

/* ── Pill outline ─────────────────────────────────────────────────── */
.ds-badge--pill-outline {
  background-color: transparent;
  border: var(--ds-border-width-strong) solid var(--badge-outline-border);
  color: var(--badge-text);
}

/* ── Dot ──────────────────────────────────────────────────────────── */
.ds-badge--has-dot {
  padding-left: var(--ds-spacing-sm);
}

.ds-badge__dot {
  display: inline-block;
  border-radius: 50%;
  background-color: var(--badge-dot);
  flex-shrink: 0;
}

/* ── Icon leading ─────────────────────────────────────────────────── */
.ds-badge--has-icon {
  gap: var(--ds-spacing-xxs);
  padding-left: var(--ds-spacing-sm);
}

.ds-badge__icon {
  flex-shrink: 0;
}

/* ── Icon only ────────────────────────────────────────────────────── */
.ds-badge--icon-only {
  padding-left: var(--ds-spacing-md);
  padding-right: var(--ds-spacing-md);
}

/* ── Dismissible ──────────────────────────────────────────────────── */
.ds-badge--dismissible {
  gap: var(--ds-spacing-xxs);
  padding-right: 3px;
}

.ds-badge__dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-xxs);
  border: none;
  background: transparent;
  border-radius: 50%;
  color: inherit;
  cursor: pointer;
  line-height: 0;
  opacity: 0.7;
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-badge__dismiss:hover {
  opacity: 1;
}
</style>
