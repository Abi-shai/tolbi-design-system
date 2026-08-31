<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

export type BadgeColor =
  | 'brand' | 'error' | 'warning' | 'success' | 'gray'
  | 'blue' | 'blue-light' | 'blue-gray' | 'gray-blue'
  | 'indigo' | 'orange' | 'pink' | 'purple'

export type BadgeVariant = 'pill-color' | 'pill-outline'
export type BadgeSize    = 'sm' | 'md' | 'lg'

interface Props {
  label?:       string
  color?:       BadgeColor
  variant?:     BadgeVariant
  size?:        BadgeSize
  dot?:         boolean
  icon?:        IconName
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label:       '',
  color:       'brand',
  variant:     'pill-color',
  size:        'sm',
  dot:         false,
  icon:        undefined,
  dismissible: false,
})

const emit = defineEmits<{
  dismiss: []
}>()

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
      `ds-badge--${color}`,
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
/* ── Color tokens (set per color modifier) ────────────────────────── */
.ds-badge {
  --badge-bg:             var(--ds-bg-brand-subtle);
  --badge-border:         var(--ds-border-on-brand-subtle);
  --badge-text:           var(--ds-text-on-brand-subtle);
  --badge-dot:            var(--ds-bg-brand-solid);
  --badge-outline-border: var(--ds-border-brand-solid);
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
.ds-badge--gray {
  --badge-bg:             var(--ds-bg-neutral);
  --badge-border:         var(--ds-border-default);
  --badge-text:           var(--ds-text-default);
  --badge-dot:            var(--ds-bg-neutral-strong);
  --badge-outline-border: var(--ds-border-default);
}
/* ADR-0009: categorical label palette — component tier, not semantic tones.
   These eight hues have no primitive ramp. Pending a categorical-palette ADR. */
.ds-badge--blue       { --badge-bg:#EFF8FF; --badge-border:#B2DDFF; --badge-text:#175CD3; --badge-dot:#2E90FA; --badge-outline-border:#1570EF; }
.ds-badge--blue-light { --badge-bg:#F0F9FF; --badge-border:#B9E6FE; --badge-text:#026AA2; --badge-dot:#36BFFA; --badge-outline-border:#0BA5EC; }
.ds-badge--blue-gray  { --badge-bg:#F8F9FC; --badge-border:#D5D9EB; --badge-text:#363F72; --badge-dot:#717BBC; --badge-outline-border:#4E5BA6; }
.ds-badge--gray-blue  { --badge-bg:#F8F9FC; --badge-border:#D5D9EB; --badge-text:#363F72; --badge-dot:#717BBC; --badge-outline-border:#4E5BA6; }
.ds-badge--indigo     { --badge-bg:#EEF4FF; --badge-border:#C7D7FE; --badge-text:#3538CD; --badge-dot:#6172F3; --badge-outline-border:#444CE7; }
.ds-badge--orange     { --badge-bg:#FFF6ED; --badge-border:#FDDCAB; --badge-text:#C4320A; --badge-dot:#FB6514; --badge-outline-border:#EC4A0A; }
.ds-badge--pink       { --badge-bg:#FFF1F3; --badge-border:#FECDD6; --badge-text:#C01048; --badge-dot:#F63D68; --badge-outline-border:#E31B54; }
.ds-badge--purple     { --badge-bg:#F9F5FF; --badge-border:#E9D7FE; --badge-text:#6941C6; --badge-dot:#9E77ED; --badge-outline-border:#7F56D9; }

/* ── Base ─────────────────────────────────────────────────────────── */
.ds-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--ds-radius-pill);
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 500;
  white-space: nowrap;
  line-height: 1;
}

/* ── Sizes ────────────────────────────────────────────────────────── */
.ds-badge--sm {
  padding: 2px 8px;
  font-size: 0.75rem;
  line-height: 1.125rem;
}
.ds-badge--md {
  padding: 2px 10px;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.ds-badge--lg {
  padding: 4px 12px;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

/* ── Pill color ───────────────────────────────────────────────────── */
.ds-badge--pill-color {
  background-color: var(--badge-bg);
  border: 1px solid var(--badge-border);
  color: var(--badge-text);
}

/* ── Pill outline ─────────────────────────────────────────────────── */
.ds-badge--pill-outline {
  background-color: transparent;
  border: 1.5px solid var(--badge-outline-border);
  color: var(--badge-text);
}

/* ── Dot ──────────────────────────────────────────────────────────── */
.ds-badge--has-dot {
  padding-left: 6px;
}

.ds-badge__dot {
  display: inline-block;
  border-radius: 50%;
  background-color: var(--badge-dot);
  flex-shrink: 0;
}

/* ── Icon leading ─────────────────────────────────────────────────── */
.ds-badge--has-icon {
  gap: 2px;
  padding-left: 6px;
}

.ds-badge__icon {
  flex-shrink: 0;
}

/* ── Icon only ────────────────────────────────────────────────────── */
.ds-badge--icon-only {
  padding-left: 8px;
  padding-right: 8px;
}

/* ── Dismissible ──────────────────────────────────────────────────── */
.ds-badge--dismissible {
  gap: 2px;
  padding-right: 3px;
}

.ds-badge__dismiss {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
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
