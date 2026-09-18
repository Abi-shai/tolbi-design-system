<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import { SIDE_NAVIGATION_KEY } from './context'

/**
 * A row in `SideNavigation`.
 *
 * It renders a real control — `<a>` when given an `href`, `<button>` otherwise
 * (ADR-0014): a `<div>` that emits `click` is unreachable by keyboard, and this
 * is the product's primary navigation.
 *
 * It carries **no background of its own**. The selection is painted by the
 * group's sliding indicator (ADR-0024), so an opaque item would simply cover it.
 *
 * Selected and default share one weight on purpose. The pill's geometry is what
 * slides, so a weight that changed on selection would resize the pill mid-slide.
 * Colour promotes instead: `text-default` to `text-strong`.
 */
interface Props {
  /** Identifies this row to the group's `v-model`. */
  value?: string
  label?: string
  icon?: IconName
  /** Renders an `<a>` instead of a `<button>`. */
  href?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  label: undefined,
  icon: undefined,
  href: undefined,
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const group = inject(SIDE_NAVIGATION_KEY, null)
const el = ref<HTMLElement>()
const key = computed(() => props.value ?? props.label ?? '')

onMounted(() => { if (group && el.value) group.register(key.value, el.value) })
onBeforeUnmount(() => group?.unregister(key.value))

const selected = computed(() => group?.isSelected(key.value) ?? false)

const isLink = computed(() => !!props.href && !props.disabled)
const tag = computed(() => (isLink.value ? 'a' : 'button'))

function handleClick(event: MouseEvent) {
  if (props.disabled) { event.preventDefault(); return }
  group?.select(key.value)
  emit('click', event)
}
</script>

<template>
  <component
    :is="tag"
    ref="el"
    :type="isLink ? undefined : 'button'"
    :href="isLink ? href : undefined"
    :disabled="isLink ? undefined : disabled || undefined"
    :aria-disabled="isLink && disabled ? 'true' : undefined"
    :aria-current="selected ? 'page' : undefined"
    :class="[
      'ds-side-nav-item',
      selected && 'ds-side-nav-item--selected',
      disabled && 'ds-side-nav-item--disabled',
    ]"
    @click="handleClick"
  >
    <Icon
      v-if="icon"
      :name="icon"
      :size="20"
      class="ds-side-nav-item__icon"
      aria-hidden="true"
    />
    <span v-if="label" class="ds-side-nav-item__label">{{ label }}</span>
    <slot />
  </component>
</template>

<style scoped>
.ds-side-nav-item {
  position: relative;
  z-index: var(--ds-z-raised);
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  width: 100%;
  padding: var(--ds-control-padding-sm);
  box-sizing: border-box;
  border: none;
  border-radius: var(--ds-radius-control);
  /* The indicator paints the selection — an opaque row would cover it. */
  background-color: transparent;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-default);
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    color            var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-side-nav-item__icon {
  flex: none;
  color: currentColor;
}

.ds-side-nav-item__label {
  min-width: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── States ───────────────────────────────────────────────────────── */
.ds-side-nav-item:hover:not(.ds-side-nav-item--selected):not(.ds-side-nav-item--disabled) {
  background-color: var(--ds-bg-hover);
  color: var(--ds-text-strong);
}

.ds-side-nav-item:focus-visible {
  box-shadow: var(--ds-focus-ring-gray-shadow-sm);
}

.ds-side-nav-item--selected {
  color: var(--ds-text-strong);
}

.ds-side-nav-item--disabled {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}
</style>
