<script setup lang="ts">
import { Icon } from '../Icon'
import type { IconName } from '../Icon'

export type BadgeGroupColor  = 'brand' | 'error' | 'warning' | 'success' | 'gray'
export type BadgeGroupSize   = 'md' | 'lg'
export type BadgeGroupBadge  = 'leading' | 'trailing'

interface Props {
  label:         string
  message:       string
  color?:        BadgeGroupColor
  size?:         BadgeGroupSize
  badge?:        BadgeGroupBadge
  icon?:         IconName
}

const props = withDefaults(defineProps<Props>(), {
  color:  'brand',
  size:   'md',
  badge:  'leading',
  icon:   undefined,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <div
    :class="[
      'ds-badge-group',
      `ds-badge-group--${color}`,
      `ds-badge-group--${size}`,
      `ds-badge-group--${badge}`,
    ]"
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
  </div>
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
.ds-badge-group--gray {
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
  border: 1px solid var(--badge-group-border);
  border-radius: var(--ds-radius-pill);
  background-color: var(--badge-group-bg);
  color: var(--badge-group-text);
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-label-lg);
  white-space: nowrap;
  cursor: default;
  transition: background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-badge-group:hover {
  background-color: var(--badge-group-bg-hover);
}

/* ── Sizes ────────────────────────────────────────────────────────── */
.ds-badge-group--md {
  gap: 8px;
  padding: 4px 10px 4px 4px;
  font: var(--ds-font-label-md);
}
.ds-badge-group--md.ds-badge-group--trailing {
  padding: 4px 4px 4px 12px;
}

.ds-badge-group--lg {
  gap: 12px;
  padding: 4px 10px 4px 4px;
  font: var(--ds-font-label-lg);
}
.ds-badge-group--lg.ds-badge-group--trailing {
  padding: 4px 4px 4px 14px;
}

/* ── Inner pill ───────────────────────────────────────────────────── */
.ds-badge-group__pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--badge-group-pill-border);
  border-radius: var(--ds-radius-pill);
  background-color: var(--ds-bg-default);
  color: var(--badge-group-text);
  padding: 2px 8px;
  white-space: nowrap;
}

.ds-badge-group--lg .ds-badge-group__pill {
  padding: 2px 10px;
}

/* Trailing pill has tighter right padding to accommodate the icon */
.ds-badge-group__pill--trailing {
  padding-right: 6px;
}
.ds-badge-group--lg .ds-badge-group__pill--trailing {
  padding-left: 10px;
  padding-right: 8px;
}

/* ── Content (leading mode) ───────────────────────────────────────── */
.ds-badge-group__content {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ── Icon ─────────────────────────────────────────────────────────── */
.ds-badge-group__icon {
  flex-shrink: 0;
}
</style>
