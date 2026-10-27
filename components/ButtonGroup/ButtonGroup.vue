<script setup lang="ts">
import { computed, provide, ref, watch, nextTick } from 'vue'
import { useSlidingIndicator } from '../../composables/useSlidingIndicator'
import { BUTTON_GROUP_KEY, type ButtonGroupContext } from './context'

/**
 * ADR-0024: the parent owns the selection.
 *
 * Each item used to carry its own `active` prop, which let a segmented control
 * have zero or two selected segments — an invalid state the component itself
 * permitted. It also meant nothing knew *where* the selection was, so the
 * highlight could only cross-fade.
 *
 * Now the group holds `v-model`, items register themselves in order, and the
 * selection is a single indicator that slides between them.
 */
interface Props {
  /** The selected item's value. */
  modelValue?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  ariaLabel: undefined,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const values = ref<string[]>([])
const activeIndex = computed(() => values.value.indexOf(props.modelValue ?? ''))

const { containerRef, itemRefs, style, ready, measure } = useSlidingIndicator(activeIndex)

const context: ButtonGroupContext = {
  register(value, el) {
    const existing = values.value.indexOf(value)
    const i = existing === -1 ? values.value.length : existing
    if (existing === -1) values.value.push(value)
    itemRefs.value[i] = el
    return i
  },
  unregister(value) {
    const i = values.value.indexOf(value)
    if (i === -1) return
    values.value.splice(i, 1)
    itemRefs.value.splice(i, 1)
  },
  select(value) { emit('update:modelValue', value) },
  isSelected: (value) => value === props.modelValue,
}
provide(BUTTON_GROUP_KEY, context)

watch(values, async () => { await nextTick(); measure() }, { deep: true })
</script>

<template>
  <div ref="containerRef" class="ds-button-group" role="group" :aria-label="ariaLabel">
    <!-- Sliding selection — behind the items, like Tabs' indicator -->
    <div
      v-if="activeIndex !== -1"
      class="ds-button-group__indicator"
      :class="{ 'ds-button-group__indicator--animated': ready }"
      :style="style"
      aria-hidden="true"
    />
    <slot />
  </div>
</template>

<style scoped>
/*
  ADR-0084 (item 18, track A): the selection is Tabs' pill on a recessed rail.
  A tint on bg-default never reads — every neutral bg-* stays under 1.2:1 on
  white (ADR-0044), and the old indicator was bg-hover's own primitive, so
  chosen and hovered were the same grey. A surface that rises off a rail is a
  mechanism, not an intensity: it reads in both modes, as Tabs and
  SideNavigation already measured (ADR-0033). The rail is 42px tall, the
  height of a bordered control beside it in a toolbar (ADR-0033's 2px).
*/
.ds-button-group {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  gap: var(--ds-spacing-xs);
  padding: var(--ds-spacing-xs);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface-sm);
  background-color: var(--ds-bg-neutral-subtle);
  isolation: isolate;
}

/* Component token (ADR-0010): the chosen segment is a neutral surface that
   rises — never bg-selected, which is a list's current item. */
.ds-button-group__indicator {
  --segment-selected-bg: var(--ds-bg-default);

  position: absolute;
  left: 0;
  top: 0;
  border-radius: var(--ds-radius-inner);
  background-color: var(--segment-selected-bg);
  box-shadow: var(--ds-elevation-surface);
  pointer-events: none;
  z-index: 0;
  /* No transition until after the first paint, or it flies in from 0 */
}

.ds-button-group__indicator--animated {
  transition:
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    width     var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}
</style>
