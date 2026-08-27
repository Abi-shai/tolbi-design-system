<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import { Checkbox } from '../Checkbox'

export type TagSize   = 'sm' | 'md' | 'lg'
export type TagAction = 'close' | 'count'

interface Props {
  label?:     string
  size?:      TagSize
  action?:    TagAction
  count?:     number
  dot?:       boolean
  icon?:      IconName
  avatarSrc?: string
  avatarAlt?: string
  checkbox?:  boolean
  checked?:   boolean
}

const props = withDefaults(defineProps<Props>(), {
  label:    '',
  size:     'sm',
  dot:      false,
  checkbox: false,
  checked:  false,
})

const emit = defineEmits<{
  close:            []
  'update:checked': [value: boolean]
}>()

const slots = useSlots()

const hasLeading = computed(() =>
  !!props.avatarSrc || !!props.icon || !!slots.leading
)

const dotSizePx        = computed(() => props.size === 'lg' ? 8 : 6)
const avatarSizePx     = computed(() => props.size === 'lg' ? 20 : 16)
const iconSizePx       = computed(() => props.size === 'lg' ? 20 : 16)
const closeIconSizePx  = computed(() => props.size === 'lg' ? 12 : 10)

function onTagClick() {
  if (props.checkbox) emit('update:checked', !props.checked)
}
</script>

<template>
  <span
    :class="[
      'ds-tag',
      `ds-tag--${size}`,
      action    && `ds-tag--action-${action}`,
      hasLeading && 'ds-tag--has-leading',
      checkbox  && 'ds-tag--has-checkbox',
      checkbox  && 'ds-tag--selectable',
    ]"
    v-bind="checkbox ? { role: 'button', tabindex: '0' } : {}"
    @click="onTagClick"
    @keydown.enter.prevent="onTagClick"
    @keydown.space.prevent="onTagClick"
  >
    <!-- Checkbox indicator -->
    <Checkbox
      v-if="checkbox"
      visual-only
      type="checkbox"
      size="sm"
      :model-value="checked"
      class="ds-tag__checkbox-control"
    />

    <!-- Leading: dot -->
    <span
      v-if="dot"
      class="ds-tag__dot"
      :style="{ width: `${dotSizePx}px`, height: `${dotSizePx}px` }"
      aria-hidden="true"
    />

    <!-- Leading: avatar -->
    <span
      v-else-if="avatarSrc"
      class="ds-tag__avatar"
      :style="{ width: `${avatarSizePx}px`, height: `${avatarSizePx}px` }"
      aria-hidden="true"
    >
      <img :src="avatarSrc" :alt="avatarAlt || ''" />
    </span>

    <!-- Leading: icon -->
    <Icon
      v-else-if="icon"
      :name="icon"
      :size="iconSizePx"
      class="ds-tag__icon"
      aria-hidden="true"
    />

    <!-- Leading: slot (country flag, custom image, etc.) -->
    <span v-else-if="$slots.leading" class="ds-tag__leading" aria-hidden="true">
      <slot name="leading" />
    </span>

    <!-- Label -->
    <span class="ds-tag__label">{{ label }}</span>

    <!-- Trailing: count badge -->
    <span v-if="action === 'count'" class="ds-tag__count">{{ count }}</span>

    <!-- Trailing: close button -->
    <button
      v-if="action === 'close'"
      type="button"
      class="ds-tag__close"
      aria-label="Retirer"
      @click.stop="emit('close')"
    >
      <Icon name="x" :size="closeIconSizePx" aria-hidden="true" />
    </button>
  </span>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────── */
.ds-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background-color: var(--ds-semantic-bg-primary);
  border: 1px solid var(--ds-semantic-border-primary);
  border-radius: var(--ds-radius-sm);
  color: var(--ds-semantic-text-secondary);
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1.125rem;
  white-space: nowrap;
  cursor: default;
  user-select: none;
}

/* ── Sizes ────────────────────────────────────────────────────────── */
.ds-tag--md {
  padding: 3px 10px;
}
.ds-tag--lg {
  padding: 4px 10px;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

/* ── Leading icon — avatar / icon / slot: tighter left padding ───── */
.ds-tag--has-leading { padding-left: 4px; }

/* ── Checkbox — slightly tighter left padding ────────────────────── */
.ds-tag--has-checkbox { padding-left: 5px; }

/* ── Trailing action — tighter right padding ─────────────────────── */
.ds-tag--action-close,
.ds-tag--action-count { padding-right: 4px; }

/* ── Close action uses 3px gap (vs 4px default) ──────────────────── */
.ds-tag--action-close { gap: 3px; }

/* ── Selectable (checkbox mode) ──────────────────────────────────── */
.ds-tag--selectable { cursor: pointer; }
.ds-tag--selectable:hover {
  background-color: var(--ds-semantic-bg-primary-hover);
}
.ds-tag--selectable:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-gray);
}

/* ── Dot ──────────────────────────────────────────────────────────── */
.ds-tag__dot {
  flex-shrink: 0;
  border-radius: 50%;
  background-color: var(--ds-color-gray-light-400);
}

/* ── Avatar ───────────────────────────────────────────────────────── */
.ds-tag__avatar {
  flex-shrink: 0;
  border-radius: var(--ds-radius-full);
  overflow: hidden;
}
.ds-tag__avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

/* ── Icon ─────────────────────────────────────────────────────────── */
.ds-tag__icon { flex-shrink: 0; }

/* ── Leading slot ─────────────────────────────────────────────────── */
.ds-tag__leading {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
}

/* ── Label ────────────────────────────────────────────────────────── */
.ds-tag__label { flex-shrink: 0; }

/* ── Count badge ──────────────────────────────────────────────────── */
.ds-tag__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 16px;
  min-width: 16px;
  padding: 0 4px;
  background-color: var(--ds-semantic-bg-tertiary);
  border-radius: var(--ds-radius-xs);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  flex-shrink: 0;
}

/* ── Close button ─────────────────────────────────────────────────── */
.ds-tag__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border: none;
  background: transparent;
  border-radius: 3px;
  color: inherit;
  cursor: pointer;
  line-height: 0;
  opacity: 0.7;
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-default), background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
  flex-shrink: 0;
}
.ds-tag__close:hover {
  opacity: 1;
  background-color: var(--ds-semantic-bg-tertiary);
}

/* ── Checkbox indicator ───────────────────────────────────────────── */
.ds-tag__checkbox-control {
  flex-shrink: 0;
}
</style>
