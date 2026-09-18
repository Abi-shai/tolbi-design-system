<script setup lang="ts">
import { computed, provide, ref, toRef, useSlots, watch, nextTick } from 'vue'
import { useSlidingIndicator } from '../../composables/useSlidingIndicator'
import { IconButton } from '../IconButton'
import { SIDE_NAVIGATION_KEY, type SideNavigationContext } from './context'

/**
 * The product's left-hand navigation column.
 *
 * Decisions it carries, all of which its items would get wrong on their own:
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
 *
 * **It owns `collapsed` and the control that flips it.** ADR-0034 first said the
 * toggle belonged to the shell, on the evidence of three products that each
 * placed it differently. Ten more said otherwise: four put an icon button at the
 * top of the column on the trailing edge (Suno, Sentry, Charma, Clay), two at
 * the bottom, one in the top bar. Four out of ten agreeing is a convention, not
 * a free choice, so the component ships it and `toggle` turns it off for a shell
 * that places its own.
 *
 * The rail's width is the row (36px) plus `spacing-md` each side, so the pill's
 * height never changes: collapsing moves and narrows it, it does not resize it
 * vertically.
 */
interface Props {
  /** The selected item's value. */
  modelValue?: string
  /** Icon-only rail. Items move their label into a tooltip. */
  collapsed?: boolean
  /** Renders the collapse control. Off for a shell that places its own. */
  toggle?: boolean
  collapseLabel?: string
  expandLabel?: string
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  collapsed: false,
  toggle: true,
  collapseLabel: 'Réduire la navigation',
  expandLabel: 'Déployer la navigation',
  ariaLabel: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:collapsed': [value: boolean]
}>()

const slots = useSlots()
const hasHeader = computed(() => !!slots.header || props.toggle)

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
  collapsed: toRef(props, 'collapsed'),
}
provide(SIDE_NAVIGATION_KEY, context)

watch(values, async () => { await nextTick(); measure() }, { deep: true })

// Collapsing changes every row's width, so the indicator has to re-measure. The
// ResizeObserver watches the container, whose width is set by the consumer and
// may not change at all — so this cannot be left to it.
watch(() => props.collapsed, async () => { await nextTick(); measure() })
</script>

<template>
  <nav
    ref="containerRef"
    class="ds-side-nav"
    :class="{ 'ds-side-nav--collapsed': collapsed }"
    :aria-label="ariaLabel"
  >
    <!-- The workspace mark and the collapse control share a row, and stack
         once the rail is one column wide. -->
    <div v-if="hasHeader" class="ds-side-nav__head">
      <div class="ds-side-nav__header">
        <div v-if="slots.header" class="ds-side-nav__header-slot">
          <slot name="header" />
        </div>
        <IconButton
          v-if="toggle"
          icon="panel-left"
          :ariaLabel="collapsed ? expandLabel : collapseLabel"
          class="ds-side-nav__toggle"
          @click="emit('update:collapsed', !collapsed)"
        />
      </div>
      <div class="ds-side-nav__divider" aria-hidden="true" />
    </div>

    <!-- Sliding selection — behind the items, like Tabs' indicator -->
    <div
      v-if="activeIndex !== -1"
      class="ds-side-nav__indicator"
      :class="{ 'ds-side-nav__indicator--animated': ready }"
      :style="style"
      aria-hidden="true"
    />

    <div class="ds-side-nav__items">
      <slot />
    </div>
  </nav>
</template>

<style scoped>
.ds-side-nav {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ds-spacing-3xl);
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
  box-sizing: border-box;
  background-color: var(--ds-bg-neutral);
}

/* The rail is *derived*, not asserted: a square row plus `spacing-md` each
   side. Both halves have to agree or the rows sit off-centre, so the row size
   is a private component token (ADR-0010 — an own-value, not an alias) that
   `SideNavItem` reads off the cascade. 52px lands where every icon-only rail in
   the survey sits. */
.ds-side-nav--collapsed {
  --side-nav-rail-row: 36px;

  width: calc(var(--side-nav-rail-row) + 2 * var(--ds-spacing-md));
  align-items: center;
  padding: var(--ds-spacing-lg) var(--ds-spacing-md);
}

/* ── Header ───────────────────────────────────────────────────────── */
.ds-side-nav__head {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  width: 100%;
}

/*
  The rule separates *where you are and what you can do to the panel* from
  *where you can go*. In the expanded form the toggle is already distinct — it
  sits beside a boxed selector. In the rail it is not: a bare `panel-left` glyph
  4px above a bare `house` glyph reads as a sixth destination.

  `border-default`, not `border-subtle` — which is what `DropdownDivider` uses
  and is the semantically right one, a divider being decorative rather than
  load-bearing. It does not survive this ground: on `bg-neutral` it measures
  1.073:1, against `border-default`'s 1.338:1. Its own description says 1.18:1,
  which is its figure on `bg-default`. The ramp was solved on white and loses a
  step on a recessed surface — see ADR-0034's open items.
*/
.ds-side-nav__divider {
  height: var(--ds-border-width-default);
  width: 100%;
  background-color: var(--ds-border-default);
}

.ds-side-nav__header {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
}

.ds-side-nav__header-slot {
  flex: 1 1 auto;
  min-width: 1px;
}

/* One column wide: the toggle drops below the mark rather than beside it. */
.ds-side-nav--collapsed .ds-side-nav__header {
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-xs);
}

.ds-side-nav--collapsed .ds-side-nav__header-slot {
  flex: none;
}

/* ── Items ────────────────────────────────────────────────────────── */
.ds-side-nav__items {
  display: flex;
  flex-direction: column;
  align-items: inherit;
  gap: var(--ds-spacing-xs);
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
