<script setup lang="ts">
import { computed, provide, ref, toRef, watch, nextTick } from 'vue'
import { useSlidingIndicator } from '../../composables/useSlidingIndicator'
import { BUTTON_GROUP_KEY, type ButtonGroupContext, type ButtonGroupShape, type ButtonGroupSize } from './context'

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
 *
 * `size` follows the fields it sits beside in a toolbar: `md` (42px) next to
 * `md` controls, `sm` (38px) next to `InputField` / `InputDropdown` `sm` — the
 * rail's 4px inset and border stay, the segments go 32 → 28.
 *
 * `shape="pill"` (ADR-0216) rounds the rail, the indicator and the segments: a
 * switch laid on a map (« Carte | Analytics » in `MapTopBar`), in the legend's
 * and the timeline's shape. On map glass the group takes the glass's levels
 * (ADR-0173) from the surface it sits on — the rail recessed (`--on-glass-sunk`,
 * its edge `--on-glass-sunk-border`), the chosen pill raised (`--on-glass-raised`
 * + `--on-glass-raised-shadow`) — in either shape.
 */
interface Props {
  /** The selected item's value. */
  modelValue?: string
  ariaLabel?: string
  /** `md` 42px, `sm` 38px — the height of the fields beside it. */
  size?: ButtonGroupSize
  /** `rail` (default) or `pill` — every corner round, for a switch on a map (ADR-0216). */
  shape?: ButtonGroupShape
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  ariaLabel: undefined,
  size: 'md',
  shape: 'rail',
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
  size: toRef(props, 'size'),
  shape: toRef(props, 'shape'),
}
provide(BUTTON_GROUP_KEY, context)

watch(values, async () => { await nextTick(); measure() }, { deep: true })
</script>

<template>
  <div ref="containerRef" class="ds-button-group" :class="[`ds-button-group--${size}`, `ds-button-group--${shape}`]" role="group" :aria-label="ariaLabel">
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
  /* On map glass the rail is the glass recessed (ADR-0173): the surface hands its levels down. */
  border: var(--ds-border-width-default) solid var(--on-glass-sunk-border, var(--ds-border-subtle));
  border-radius: var(--ds-radius-surface-sm);
  background-color: var(--on-glass-sunk, var(--ds-bg-neutral-subtle));
  box-shadow: var(--on-glass-sunk-edge, none);
  isolation: isolate;
}

/* Component token (ADR-0010): the chosen segment is a neutral surface that
   rises — never bg-selected, which is a list's current item. */
.ds-button-group__indicator {
  --segment-selected-bg: var(--on-glass-raised, var(--ds-bg-default));

  position: absolute;
  left: 0;
  top: 0;
  border-radius: var(--ds-radius-inner);
  background-color: var(--segment-selected-bg);
  box-shadow: var(--on-glass-raised-shadow, var(--ds-elevation-surface));
  pointer-events: none;
  z-index: 0;
  /* No transition until after the first paint, or it flies in from 0 */
}

/* sm (38px): Tabs xs' geometry — the rail takes the control radius, the pill
   and the segments the smaller inner one, as the element shrinks (ADR-0013). */
.ds-button-group--sm {
  border-radius: var(--ds-radius-control);
}

.ds-button-group--sm .ds-button-group__indicator {
  border-radius: var(--ds-radius-inner-sm);
}

/* Pill (ADR-0216): every corner round — the rail, the pill, and (in the item) the segments. */
.ds-button-group--pill,
.ds-button-group--pill .ds-button-group__indicator {
  border-radius: var(--ds-radius-pill);
}

.ds-button-group__indicator--animated {
  transition:
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    width     var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}
</style>
