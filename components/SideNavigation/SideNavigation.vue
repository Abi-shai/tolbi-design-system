<script setup lang="ts">
import { computed, provide, ref, watch, nextTick } from 'vue'
import { useSlidingIndicator } from '../../composables/useSlidingIndicator'
import { SIDE_NAVIGATION_KEY, type SideNavigationContext } from './context'

/**
 * The product's left-hand navigation column.
 *
 * Two decisions it carries, both of which its items would get wrong on their own:
 *
 * **It owns the selection** (ADR-0024). Items register in order and the group
 * holds `v-model`, so exactly one is selected and the group knows *where* — the
 * precondition for a selection that moves rather than cross-fades.
 *
 * **It owns the ground** (ADR-0006). The selected item is `bg-default` on a
 * recessed column, which is the Tabs idiom: the pill rises off its ground
 * rather than tinting. That only reads if the ground is actually there, so the
 * column paints it — an item shipped without it would be white on white.
 *
 * The ground is `bg-neutral`, one step deeper than Tabs' `bg-neutral-subtle`,
 * and not by taste: `bg-hover` and `bg-neutral-subtle` alias the same primitive
 * (gray-light/50), so on Tabs' value the hover state would be invisible.
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

const context: SideNavigationContext = {
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
provide(SIDE_NAVIGATION_KEY, context)

watch(values, async () => { await nextTick(); measure() }, { deep: true })
</script>

<template>
  <nav ref="containerRef" class="ds-side-nav" :aria-label="ariaLabel">
    <!-- Sliding selection — behind the items, like Tabs' indicator -->
    <div
      v-if="activeIndex !== -1"
      class="ds-side-nav__indicator"
      :class="{ 'ds-side-nav__indicator--animated': ready }"
      :style="style"
      aria-hidden="true"
    />
    <slot />
  </nav>
</template>

<style scoped>
.ds-side-nav {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ds-spacing-xs);
  padding: var(--ds-spacing-xl);
  box-sizing: border-box;
  background-color: var(--ds-bg-neutral);
}

/* ── Sliding indicator ─────────────────────────────────────────────── */
.ds-side-nav__indicator {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: var(--ds-radius-control);
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-surface);
  pointer-events: none;
  z-index: 0;
  /* No transition until after the first paint, or it flies in from 0 */
}

/* A column animates `height`, where a row animates `width` — the composable
   carries both axes and leaves the choice here. */
.ds-side-nav__indicator--animated {
  transition:
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    height    var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}
</style>
