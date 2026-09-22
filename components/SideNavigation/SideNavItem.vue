<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { Icon } from '../Icon'
import { Tooltip } from '../Tooltip'
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
 *
 * **Collapsed, the label does not disappear — it moves.** An icon-only rail with
 * no tooltip is a rail whose items have no name, in the accessibility tree as
 * well as on screen, so the `Tooltip` is part of the collapsed form rather than
 * a nicety, and `aria-label` carries the same string.
 *
 * The outer element exists for that tooltip. It anchors it, which makes it
 * `position: relative` — and it is therefore also what the group registers,
 * because a button inside a positioned wrapper reports `offsetTop: 0`.
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

const selected  = computed(() => group?.isSelected(key.value) ?? false)
const collapsed = computed(() => group?.collapsed.value ?? false)

const isLink = computed(() => !!props.href && !props.disabled)
const tag = computed(() => (isLink.value ? 'a' : 'button'))

const hovered = ref(false)
const showTip = computed(() => collapsed.value && hovered.value && !!props.label)

function handleClick(event: MouseEvent) {
  if (props.disabled) { event.preventDefault(); return }
  group?.select(key.value)
  emit('click', event)
}
</script>

<template>
  <div
    ref="el"
    class="ds-side-nav-item"
    :class="{ 'ds-side-nav-item--collapsed': collapsed }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <component
      :is="tag"
      :type="isLink ? undefined : 'button'"
      :href="isLink ? href : undefined"
      :disabled="isLink ? undefined : disabled || undefined"
      :aria-disabled="isLink && disabled ? 'true' : undefined"
      :aria-current="selected ? 'page' : undefined"
      :aria-label="collapsed ? label : undefined"
      :class="[
        'ds-side-nav-item__control',
        selected && 'ds-side-nav-item__control--selected',
        disabled && 'ds-side-nav-item__control--disabled',
      ]"
      @click="handleClick"
      @focus="hovered = true"
      @blur="hovered = false"
    >
      <Icon
        v-if="icon"
        :name="icon"
        :size="20"
        class="ds-side-nav-item__icon"
        aria-hidden="true"
      />
      <!-- The label stays in the DOM and loses its column instead: a `v-if` has
           nothing to animate, and the collapse is where this row's motion is. -->
      <span v-if="label" class="ds-side-nav-item__label-track">
        <span class="ds-side-nav-item__label">{{ label }}</span>
      </span>
      <slot />
    </component>

    <Tooltip
      v-if="showTip"
      class="ds-side-nav-item__tip"
      :title="label!"
      arrow="left"
      role="presentation"
    />
  </div>
</template>

<style scoped>
.ds-side-nav-item {
  position: relative;
  z-index: var(--ds-z-raised);
  display: flex;
  width: 100%;
}


.ds-side-nav-item__control {
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
    box-shadow       var(--ds-motion-duration-instant) var(--ds-motion-easing-default),
    padding          var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    gap              var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/* The row keeps filling the column and lets the column's own width carry it
   down — a row pinned to `--side-nav-rail-row` would have jumped to 36px while
   the column was still closing. It ends up square anyway: the rail's inner
   width *is* that row, which is how the token derives the rail in the first
   place. What changes here is what a transition can follow — the padding
   tightening to `spacing-md` and the gap closing, which is what walks the glyph
   to the middle. Height never moves: 8 + 20 + 8 in both forms. */
.ds-side-nav-item--collapsed .ds-side-nav-item__control {
  justify-content: center;
  gap: 0;
  padding: var(--ds-spacing-md);
}

.ds-side-nav-item__icon {
  flex: none;
  color: currentColor;
}

/*
  The label is the collapse's **second** movement, not the same one.
  `RevealTransition` found the rule (ADR-0032): the offset between the surface
  opening and the content arriving is the whole difference between "it opens"
  and "it appears". Rotated onto this axis — the column widens, then the labels
  land into it.

  The track is ADR-0025's `0fr -> 1fr` grid, because `width: auto` is not
  animatable and the grid collapses the column without the text reflowing on
  the way. The asymmetry is read off the *target* state, so each direction
  takes its own list: arriving, the fade waits a `quick` and lands just after
  the column settles; leaving, it goes at `exit` with no delay and the labels
  are gone before the rail closes on them. ADR-0021's rule, met from a third
  direction: the exit is faster than the entrance.
*/
.ds-side-nav-item__label-track {
  display: grid;
  grid-template-columns: 1fr;
  min-width: 1px;
  opacity: 1;
  transition:
    grid-template-columns var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-out)
      var(--ds-motion-duration-quick);
}

.ds-side-nav-item--collapsed .ds-side-nav-item__label-track {
  grid-template-columns: 0fr;
  opacity: 0;
  transition:
    grid-template-columns var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    opacity var(--ds-motion-duration-exit) var(--ds-motion-easing-in);
}

.ds-side-nav-item__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .ds-side-nav-item__control,
  .ds-side-nav-item__label-track {
    transition: none;
  }
}

/* ── States ───────────────────────────────────────────────────────── */
.ds-side-nav-item__control:hover:not(.ds-side-nav-item__control--selected):not(.ds-side-nav-item__control--disabled) {
  background-color: var(--ds-bg-hover);
  color: var(--ds-text-strong);
}

.ds-side-nav-item__control:focus-visible {
  box-shadow: var(--ds-focus-ring-gray-shadow-sm);
}

.ds-side-nav-item__control--selected {
  color: var(--ds-text-strong);
}

.ds-side-nav-item__control--disabled {
  color: var(--ds-text-disabled);
  cursor: not-allowed;
}

/* ── Collapsed tooltip ────────────────────────────────────────────── */
.ds-side-nav-item__tip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: var(--ds-spacing-md);
  z-index: var(--ds-z-popover);
  pointer-events: none;
  white-space: nowrap;
}
</style>
