<script lang="ts">
/**
 * Exported, though the list is internal, because `SideNavigation` holds a
 * template ref to it: a ref's type ends up in the parent's published
 * declaration, and a props interface nobody can name broke its emit.
 */
export interface SideNavListProps {
  /** The selected item's value. */
  modelValue?: string
  /** Icon-only rows. */
  collapsed?: boolean
  /** What `aria-current` says on the selected row. */
  current?: 'page' | 'true'
  /**
   * Lets the pill travel. Withheld while the column itself is in flight: the
   * composable's `ResizeObserver` re-measures every frame of a width
   * transition, and a pill that also ran its own transition would restart
   * toward a fresh target each frame and trail the edge by a whole duration
   * (ADR-0037).
   */
  animate?: boolean
  /**
   * Whether pointing at an item floats its section's pages. Passed down by the
   * rail of a collapsed two-level column; a query, so a prop rather than an
   * event (ADR-0047).
   */
  flyoutFor?: (value: string) => boolean
  /** The item whose section's pages are floating beside it. */
  peek?: string | null
}
</script>

<script setup lang="ts">
import { computed, nextTick, provide, ref, toRef, watch } from 'vue'
import { useSlidingIndicator } from '../../composables/useSlidingIndicator'
import { SIDE_NAVIGATION_KEY, type SideNavigationContext } from './context'

/**
 * One list of `SideNavItem`s, one selection, one sliding pill. Internal — it
 * is how `SideNavigation` builds each of its levels, not a component a shell
 * reaches for.
 *
 * It exists because a column with two levels has **two selections**, and a
 * selection is scoped by `provide`: an item registers with the nearest list
 * above it. The rail's items and the panel's items sit inside the same
 * `SideNavigation`, so one `provide` in that component would have put the
 * pages and the sections in a single list — one pill for both, and a page
 * could deselect its own section. A component boundary per level is the only
 * way to scope two contexts inside one parent (ADR-0046).
 *
 * The rail used to keep this machinery inline. It moved here rather than being
 * written a second time for the panel, because two copies of the pill are two
 * owners of it (ADR-0036): the day one of them changed its elevation, the two
 * levels would have disagreed on what "selected" looks like.
 *
 * The pill is Tabs' idiom and the reasoning is ADR-0033's: a surface that rises
 * off a recessed ground, which is why it only reads on the ground the column
 * paints.
 */

const props = withDefaults(defineProps<SideNavListProps>(), {
  modelValue: undefined,
  collapsed: false,
  current: 'page',
  animate: true,
  flyoutFor: undefined,
  peek: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  /** The pointer entered (`el`) or left (`null`) an item. */
  hover: [value: string, el: HTMLElement | null]
}>()

const values = ref<string[]>([])
const labels = ref<(() => string | undefined)[]>([])
const activeIndex = computed(() => values.value.indexOf(props.modelValue ?? ''))

const { containerRef, itemRefs, style, ready, measure, reducedMotion } = useSlidingIndicator(activeIndex)

const context: SideNavigationContext = {
  register(value, el, label) {
    const existing = values.value.indexOf(value)
    const i = existing === -1 ? values.value.length : existing
    if (existing === -1) values.value.push(value)
    itemRefs.value[i] = el
    labels.value[i] = label ?? (() => undefined)
    return i
  },
  unregister(value) {
    const i = values.value.indexOf(value)
    if (i === -1) return
    values.value.splice(i, 1)
    itemRefs.value.splice(i, 1)
    labels.value.splice(i, 1)
  },
  select(value) { emit('update:modelValue', value) },
  isSelected: (value) => value === props.modelValue,
  collapsed: toRef(props, 'collapsed'),
  current: toRef(props, 'current'),
  hover: (value, el) => emit('hover', value, el),
  flyoutFor: (value) => props.flyoutFor?.(value) ?? false,
  peek: toRef(props, 'peek'),
}
provide(SIDE_NAVIGATION_KEY, context)

watch(values, async () => { await nextTick(); measure() }, { deep: true })

/** The selected item's label — what titles the panel beside the rail. */
const activeLabel = computed(() => labels.value[activeIndex.value]?.())

/** Any item's label — what titles the pages floated beside it. */
const labelOf = (value: string) => labels.value[values.value.indexOf(value)]?.()

defineExpose({ measure, reducedMotion, activeLabel, labelOf })
</script>

<template>
  <div ref="containerRef" class="ds-side-nav-list">
    <!-- Sliding selection — behind the items, like Tabs' indicator -->
    <div
      v-if="activeIndex !== -1"
      class="ds-side-nav-list__indicator"
      :class="{ 'ds-side-nav-list__indicator--animated': ready && animate }"
      :style="style"
      aria-hidden="true"
    />

    <div class="ds-side-nav-list__items">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* The containing block for the pill, and the `offsetParent` of every row it
   measures — which is why a group inside it must never be positioned. */
.ds-side-nav-list {
  position: relative;
}

/* `spacing-md` between rows, the column's one rhythm. What keeps five
   destinations from reading as a single block is that each one is a surface. */
.ds-side-nav-list__items {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ds-spacing-md);
}

.ds-side-nav-list__indicator {
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
.ds-side-nav-list__indicator--animated {
  transition:
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    height    var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}
</style>
