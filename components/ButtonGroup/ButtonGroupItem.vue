<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, useSlots } from 'vue'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import { BUTTON_GROUP_KEY } from './context'

/**
 * ADR-0024: selection comes from the group, not from a prop. `active` is gone —
 * it allowed a segmented control with zero or two selected segments, and it
 * meant nothing knew where the selection sat, so it could only cross-fade.
 *
 * The item still works outside a group (`useSlidingIndicator` is the group's
 * business); it simply never reports as selected.
 */
interface Props {
  /** Identifies this segment to the group's `v-model`. */
  value?: string
  label?: string
  icon?: IconName
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  label: undefined,
  icon: undefined,
  disabled: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

defineSlots<{
  /** A glyph of the product's in place of `icon` — `ViewGlyph` in `MapTopBar` (ADR-0236). Decorative. */
  icon?: (props: { selected: boolean; size: 16 | 20 | 24 | 28 }) => unknown
}>()
const slots = useSlots()

const group = inject(BUTTON_GROUP_KEY, null)
const el = ref<HTMLButtonElement>()
const key = computed(() => props.value ?? props.label ?? '')

onMounted(() => { if (group && el.value) group.register(key.value, el.value) })
onBeforeUnmount(() => group?.unregister(key.value))

const selected = computed(() => group?.isSelected(key.value) ?? false)
const hasIcon = computed(() => !!props.icon || !!slots.icon)
const iconOnly = computed(() => hasIcon.value && !props.label)
const size = computed(() => group?.size.value ?? 'md')
const bar = computed(() => ['lg-compact', 'lg', 'xl'].includes(size.value))
const iconSize = computed<16 | 20 | 24 | 28>(() =>
  size.value === 'sm' ? 16 : size.value === 'xl' ? 28 : bar.value ? 24 : 20,
)
const shape = computed(() => group?.shape.value ?? 'rail')

function handleClick(event: MouseEvent) {
  if (props.disabled) return
  group?.select(key.value)
  emit('click', event)
}
</script>

<template>
  <button
    ref="el"
    :type="type"
    :disabled="disabled"
    :aria-pressed="selected || undefined"
    :class="[
      'ds-button-group-item',
      `ds-button-group-item--${size}`,
      bar && 'ds-button-group-item--bar',
      iconOnly && 'ds-button-group-item--icon-only',
      hasIcon && label && 'ds-button-group-item--leading-icon',
      selected && 'ds-button-group-item--active',
      shape === 'pill' && 'ds-button-group-item--pill',
    ]"
    @click="handleClick"
  >
    <span v-if="$slots.icon" class="ds-button-group-item__glyph" aria-hidden="true">
      <slot name="icon" :selected="selected" :size="iconSize" />
    </span>
    <Icon
      v-else-if="icon"
      :name="icon"
      :size="iconSize === 28 ? 24 : iconSize"
      class="ds-button-group-item__icon"
      aria-hidden="true"
    />
    <span v-if="label" class="ds-button-group-item__label">{{ label }}</span>
  </button>
</template>

<style scoped>
/* ── Base ─────────────────────────────────────────────────────────── */
/* A segment on the rail (ADR-0084): no border of its own, no ground — the
   group paints the rail and the pill under it. 32px, so the rail is 42. */
.ds-button-group-item {
  position: relative;
  z-index: var(--ds-z-raised);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-height: 32px;
  /* 4 + the 24px line of `label-lg-strong` = 32: the type grew, the inset gave
     (ADR-0144). */
  padding: var(--ds-spacing-xs) var(--ds-spacing-lg);
  border: none;
  border-radius: var(--ds-radius-inner);
  background-color: transparent;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-subtle);
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    color            var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* ── Icon modes ───────────────────────────────────────────────────── */
.ds-button-group-item--icon-only {
  padding: var(--ds-spacing-sm);
}

.ds-button-group-item--leading-icon {
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-xs) var(--ds-spacing-lg) var(--ds-spacing-xs) var(--ds-spacing-md);
}

/* ── sm ────────────────────────────────────────────────────────────── */
/* 28px, so the rail is 38 — an sm field's height. The type does not shrink
   (it is the field's 16px since ADR-0144); the inset does, and the glyph goes
   20 → 16. */
.ds-button-group-item--sm {
  min-height: 28px;
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md);
  border-radius: var(--ds-radius-inner-sm);
}

.ds-button-group-item--sm.ds-button-group-item--icon-only {
  padding: var(--ds-spacing-sm);
}

.ds-button-group-item--sm.ds-button-group-item--leading-icon {
  gap: var(--ds-spacing-sm);
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md) var(--ds-spacing-xxs) var(--ds-spacing-sm);
}

/* ── A bar's centre (ADR-0236): lg-compact 44, lg 48, xl 52 ─────────── */
/* lg — 40px, so the rail is 48: the 24px line of `label-xl` and the 24px glyph,
   `spacing-md` above and below; the chosen view in `label-xl-strong`. */
.ds-button-group-item--bar {
  min-height: 40px;
  padding: var(--ds-spacing-md) var(--ds-spacing-2xl);
  font: var(--ds-font-label-xl);
}

.ds-button-group-item--bar.ds-button-group-item--leading-icon {
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-md) var(--ds-spacing-2xl) var(--ds-spacing-md) var(--ds-spacing-xl);
}

.ds-button-group-item--bar.ds-button-group-item--active {
  font: var(--ds-font-label-xl-strong);
}

/* lg-compact — 36px, so the rail is 44: less air, the same type and glyph. */
.ds-button-group-item--lg-compact {
  min-height: 36px;
}

.ds-button-group-item--lg-compact,
.ds-button-group-item--lg-compact.ds-button-group-item--leading-icon {
  padding: var(--ds-spacing-sm) var(--ds-spacing-xl) var(--ds-spacing-sm) var(--ds-spacing-lg);
}

/* xl — 44px, so the rail is 52: `label-2xl` (heading-lg's size at a label's
   weight) on its 28px line, a 28px glyph. */
.ds-button-group-item--xl {
  min-height: 44px;
  font: var(--ds-font-label-2xl);
}

.ds-button-group-item--xl.ds-button-group-item--active {
  font: var(--ds-font-label-2xl-strong);
}

/* A view at rest under the pointer takes the glass's veil, and its glyph
   lifts; pressed, the view sinks a little. */
.ds-button-group-item--bar:not(.ds-button-group-item--active):hover:not(:disabled) {
  background-color: var(--on-glass-hover, color-mix(in srgb, var(--ds-bg-default) 50%, transparent));
}

.ds-button-group-item__glyph {
  display: flex;
  flex: none;
  transition: transform var(--ds-motion-duration-quick) var(--ds-motion-easing-out);
}

.ds-button-group-item--bar:not(.ds-button-group-item--active):hover:not(:disabled) .ds-button-group-item__glyph {
  transform: translateY(-0.0625rem) scale(1.08);
}

.ds-button-group-item--bar {
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-out),
    color            var(--ds-motion-duration-moderate) var(--ds-motion-easing-in-out),
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default),
    transform        var(--ds-motion-duration-instant) var(--ds-motion-easing-out);
}

.ds-button-group-item--bar:active:not(:disabled) {
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .ds-button-group-item--bar:active:not(:disabled),
  .ds-button-group-item--bar:not(.ds-button-group-item--active):hover:not(:disabled) .ds-button-group-item__glyph {
    transform: none;
  }
}

/* Pill (ADR-0216): the segment takes the group's round corners, so its hover
   and its focus ring follow the pill's shape. */
.ds-button-group-item--pill {
  border-radius: var(--ds-radius-pill);
}

/* ── States ───────────────────────────────────────────────────────── */
/* Hover is half a surface and the ink steps forward — Tabs' own, clearly
   lighter than the pill. */
.ds-button-group-item:not(.ds-button-group-item--active):hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--ds-bg-default) 50%, transparent);
  color: var(--ds-text-default);
}

.ds-button-group-item:focus-visible:not(:disabled) {
  box-shadow: var(--on-glass-focus, var(--ds-focus-ring-gray));
}

/* The pill is the group's sliding indicator (ADR-0024); the item carries the
   ink — the strong one, so the choice is also said by the text. */
.ds-button-group-item--active {
  color: var(--ds-text-strong);
}

/* ── Disabled ─────────────────────────────────────────────────────── */
.ds-button-group-item:disabled {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}
</style>
