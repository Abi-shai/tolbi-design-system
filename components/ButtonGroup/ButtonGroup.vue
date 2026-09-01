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
    const i = values.value.length
    values.value.push(value)
    itemRefs.value[i] = el
    return i
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
.ds-button-group {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  border: var(--ds-border-width-default) solid var(--ds-border-default);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-control);
  overflow: hidden;
  isolation: isolate;
}

/* Component token (ADR-0009): a segmented control's selection is a neutral
   raised surface. It must not use bg-selected, which is brand-tinted. */
.ds-button-group__indicator {
  --segment-selected-bg: var(--ds-bg-neutral-subtle);

  position: absolute;
  left: 0;
  top: 0;
  background-color: var(--segment-selected-bg);
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
