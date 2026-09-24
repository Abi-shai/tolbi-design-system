<script setup lang="ts">
import { computed, onBeforeUnmount, provide, ref, toRef, useSlots, watch, nextTick } from 'vue'
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
 * The rail's width is the row (36px) plus `spacing-lg` each side — 60px — so the
 * pill's height never changes: collapsing moves and narrows it, it does not
 * resize it vertically. Collapsed the column's padding is symmetric, which is
 * the whole derivation: expanded it is 12/16, and a rail is a square control's
 * worth of column.
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

const { containerRef, itemRefs, style, ready, measure, reducedMotion } = useSlidingIndicator(activeIndex)

/** The row that restacks. Its two children are what the collapse has to carry. */
const headerEl = ref<HTMLElement>()

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

/**
 * True while the **column itself** is travelling, and the reason the indicator
 * stops animating for the duration.
 *
 * The composable's `ResizeObserver` re-measures on every frame of the column's
 * width transition. An indicator that also ran its own transition would restart
 * toward a fresh target each of those frames and trail the column's edge by a
 * whole duration — the pill arriving after the rail had finished closing.
 *
 * Dropped, it takes each measured frame straight: **the column owns the easing
 * and the indicator inherits it through the measurement.** One curve, by
 * construction rather than by two lists agreeing.
 */
const travelling = ref(false)
let travelTimer: ReturnType<typeof setTimeout> | undefined

/**
 * The column's travel time, read off the cascade rather than repeated here — a
 * duration written twice is a duration that will disagree once. ADR-0019: the
 * custom property is the source, and the JS export is for what a property
 * cannot serve, which this is not.
 */
function travelMs() {
  const el = containerRef.value
  if (!el) return 0
  const v = getComputedStyle(el).getPropertyValue('--ds-motion-duration-enter').trim()
  const n = parseFloat(v)
  if (Number.isNaN(n)) return 0
  return v.endsWith('ms') ? n : n * 1000
}

/** The curve, off the cascade for the same reason as the length above. */
function travelEasing() {
  const el = containerRef.value
  return el
    ? getComputedStyle(el).getPropertyValue('--ds-motion-easing-in-out').trim()
    : ''
}

/**
 * The header restacks — a row becomes a column — and `flex-direction` is not
 * animatable, so both its children land somewhere new the instant `collapsed`
 * flips. Filmed frame by frame, that cut measured **100px on the toggle
 * collapsing and 9px expanding**, with the remainder of the travel arriving
 * smoothly afterwards because the column's own width carries a centred child.
 * Half a movement, and — ADR-0042's rule again — *it failed asymmetrically*, so
 * watching the gesture expand certified it.
 *
 * FLIP cancels only that discontinuity: measure before the restack, translate
 * back by the difference, release on the next frame. What it does **not** do is
 * drive the whole journey, and that is the point — the second half still comes
 * from the layout following the column's width. Both run `enter` on
 * `easing-in-out`, so the two compose into one eased travel rather than two
 * motions on one gesture (ADR-0037). The column owns the curve; this only stops
 * the element from starting somewhere it never was.
 */
function flipHeader(kids: HTMLElement[], first: DOMRect[]) {
  if (!kids.length || reducedMotion.value) return
  const ms = travelMs()
  const easing = travelEasing()
  const moved: HTMLElement[] = []

  kids.forEach((k, i) => {
    const last = k.getBoundingClientRect()
    const dx = first[i].left - last.left
    const dy = first[i].top - last.top
    if (!dx && !dy) return
    k.style.transition = 'none'
    k.style.transform = `translate(${dx}px, ${dy}px)`
    moved.push(k)
  })
  if (!moved.length) return

  // A single `requestAnimationFrame` fires *before* style recalculation, so the
  // inverse transform would never become a start value and the element would
  // simply appear in place (ADR-0032 found this in the product's reveal).
  requestAnimationFrame(() => requestAnimationFrame(() => {
    for (const k of moved) {
      k.style.transition = `transform ${ms}ms ${easing}`
      k.style.transform = ''
    }
  }))

  // The inline styles are scaffolding, not state — they go once they are spent.
  clearTimeout(flipTimer)
  flipTimer = setTimeout(() => {
    for (const k of moved) { k.style.transition = ''; k.style.transform = '' }
  }, ms + 60)
}
let flipTimer: ReturnType<typeof setTimeout> | undefined

// Collapsing changes every row's width, so the indicator has to re-measure. The
// ResizeObserver watches the container, whose width is set by the consumer and
// may not change at all — so this cannot be left to it.
watch(() => props.collapsed, async () => {
  travelling.value = true
  clearTimeout(travelTimer)

  // Read before `nextTick`: a pre-flush watcher still sees the old layout, and
  // that is the only moment the header's *previous* geometry exists.
  const kids = headerEl.value ? (Array.from(headerEl.value.children) as HTMLElement[]) : []
  const first = kids.map((k) => k.getBoundingClientRect())

  await nextTick()
  measure()
  flipHeader(kids, first)

  travelTimer = setTimeout(() => { travelling.value = false }, travelMs())
})

onBeforeUnmount(() => { clearTimeout(travelTimer); clearTimeout(flipTimer) })
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
      <div ref="headerEl" class="ds-side-nav__header">
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
      <div v-if="collapsed" class="ds-side-nav__divider" aria-hidden="true" />
    </div>

    <!-- Sliding selection — behind the items, like Tabs' indicator -->
    <div
      v-if="activeIndex !== -1"
      class="ds-side-nav__indicator"
      :class="{ 'ds-side-nav__indicator--animated': ready && !travelling }"
      :style="style"
      aria-hidden="true"
    />

    <div class="ds-side-nav__items">
      <slot />
    </div>
  </nav>
</template>

<style scoped>
/*
  The collapse is **one movement with two carriers**: the column's own box
  (width, its ceiling, and the padding that tightens with it), and — one step
  later — the labels. `easing-in-out` is not a taste here, its description names
  this case: "a thing that travels, rather than a state that changes. Lateral
  movement (tab indicator, drawer slide)". `easing-default` is a pronounced
  ease-out that leaves flat out, which ADR-0032 measured as a snap on a large
  surface.

  `enter` (200ms) rather than `considered` (400ms), which is the one the scale
  literally names for drawers and which still has no consumer (ADR-0022). The
  indicator inside this column already travels at `enter`, and the two move
  together during a collapse — so the duration was decided by an existing
  consumer, not chosen. Moving both would mean moving `Tabs` and `ButtonGroup`
  with them.
*/
.ds-side-nav {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ds-spacing-3xl);
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
  box-sizing: border-box;
  max-width: 100%;
  /*
    The column runs the full height of whatever it is dropped into, and says so
    itself rather than relying on the shell. Two defences, because there are two
    ways a shell withholds the height:

    `align-self: stretch` is already the default in a flex row — but a shell
    that centres or top-aligns its children (`align-items: center`, `flex-start`)
    takes it away, and the column then shrinks to its five rows with the ground
    stopping under them.

    `min-height: 100%` covers the other case: a block or absolutely-positioned
    shell has no stretch to give at all.

    The ground is not decoration here — the selected pill is `bg-default` ON it
    (ADR-0006), so a column whose ground ends early is a column that stops
    working where it ends.
  */
  align-self: stretch;
  min-height: 100%;
  background-color: var(--ds-bg-neutral);
  transition:
    width     var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    max-width var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    padding   var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/* The rail is *derived*, not asserted: a square row plus `spacing-lg` each
   side. Both halves have to agree or the rows sit off-centre, so the row size
   is a private component token (ADR-0010 — an own-value, not an alias) that
   `SideNavItem` reads off the cascade. 60px lands where every icon-only rail in
   the survey sits.

   **The padding goes symmetric, and that is the whole derivation.** Expanded
   the column is 12/16; collapsed it is 12 all round, which is ADR-0036's rule
   for a square icon-only control — symmetric padding — applied to the column
   instead of to something inside it. It was `spacing-md` here, two ramp steps
   down from the expanded 16 instead of one, and the rail came out 52px: a
   column that squeezed its own edges harder than it squeezed anything else.

   `max-width` as well as `width`, and the second one is what actually holds:
   a shell sets the column's width on the element — `width: 100%` in a grid,
   `flex: 1` in a flex row — and an inline style beats every rule a component
   can write. A ceiling is not in that fight at all, because it clamps whatever
   `width` resolves to rather than competing with it. ADR-0031 reached the same
   shape from the other direction: a width you are handed is a ceiling, not a
   size. Collapsing must narrow the column even when the consumer asked it to
   fill, or the rail is icons floating in the middle of the old width. */
/* The header's row in the expanded form, and the second half of a pair: a
   height that travels needs two lengths, because `height: auto` is not
   animatable (ADR-0025) and the mark's box was snapping 48 → 36 at frame 0
   while everything around it travelled. An own-value, so a component token
   (ADR-0010) — 48 is the control's own height (8 + Avatar sm + 8) and not a
   step of layout rhythm, which is ADR-0013's argument for why control padding
   is its own scale. */
.ds-side-nav {
  --side-nav-header-row: 48px;
}

.ds-side-nav--collapsed {
  --side-nav-rail-row: 36px;

  width: calc(var(--side-nav-rail-row) + 2 * var(--ds-spacing-lg));
  max-width: calc(var(--side-nav-rail-row) + 2 * var(--ds-spacing-lg));
  flex: none;
  padding: var(--ds-spacing-lg);
}

/* No `align-items: center` here any more. Centring the *items* was how the rail
   used to be built, and a centred item cannot travel: it changes width while
   its own box jumps. Every row still fills the column, and the icon reaches the
   middle because the row's padding tightens and its content centres — which is
   a transition rather than a cut. */

/* ── Header ───────────────────────────────────────────────────────── */
/* `spacing-md`, the same gap the destinations use. ADR-0034 set 4px here on the
   argument that a tighter gap *binds* the mark, the toggle and the rule into
   one object — which was true while the gap was the only thing saying so. The
   rule below it says it now, and the 24px to the navigation says it again, so
   the gap was doing a third time what two other things already did. One rhythm
   runs the column instead: 8px between anything adjacent, 24px between the two
   blocks. */
.ds-side-nav__head {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  width: 100%;
}

/*
  The rule separates *where you are and what you can do to the panel* from
  *where you can go*, and it is the **rail's** alone: there, a bare `panel-left`
  glyph 4px above a bare `house` glyph reads as a sixth destination.

  ADR-0034 drew it in both forms, exempting neither, on the reasoning that the
  expanded toggle "sits beside a boxed selector". ADR-0036 deleted that premise —
  the selector is bare at rest now too — but the ambiguity the rule answers is
  *vertical stacking*, which the expanded header does not have: its two controls
  share a row. Figma reaches the same place from the other side, drawing a
  `Filet` in the rail and none in either expanded frame.

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

/* Measured at **32×36** in the expanded form: the slot beside it is
   `flex: 1 1 auto` and this had no `flex` of its own, so the default
   `flex-shrink: 1` let a 36px control be squeezed 4px — and with `radius-pill`
   a 32×36 box is an ellipse, not a round button. ADR-0039's family: a box that
   is derived where it should be declared. It also meant the collapse had 4px of
   *growth* folded into its cut. */
.ds-side-nav__toggle {
  flex: none;
}

/*
  One column wide: the toggle leaves the mark's side and goes **above** it.

  The two forms want opposite orders — expanded is mark-then-toggle across a
  row, collapsed is toggle-then-mark down a column — so one of them is going to
  read against the DOM whatever we do. `column-reverse` rather than a `v-if`
  pair puts that cost where it is cheapest.

  A DOM swap would unmount and remount the `IconButton`, and that button is what
  *causes* the collapse: activated from the keyboard it would destroy the
  element holding focus, dropping the user to `<body>` mid-gesture. Against
  that, the reversed pair here is two controls that neither depend on nor
  explain each other — a switcher and a panel toggle — so the sequence carries
  no meaning to preserve (WCAG 1.3.2), and either order is operable (2.4.3).
  The DOM keeps identity first, which is the better sentence to hear anyway.
*/
.ds-side-nav--collapsed .ds-side-nav__header {
  flex-direction: column-reverse;
  /*
    `stretch`, not `center`, and it is a motion decision rather than a layout
    one. Centred, a child's x is `padding + (header − child) / 2`, so any
    disagreement between the two widths is *amplified* on the way down —
    measured, the mark's x ran 16 → 12.30, reversed to 13.81 and then snapped
    1.8px to 12 on the last frame, because it was resolving its own
    `width: 36px` against a header still following the column. Stretched, every
    child is the header's width and x is just the padding: one curve, and
    nothing left to disagree.
  */
  align-items: stretch;
  gap: var(--ds-spacing-md);
}

.ds-side-nav--collapsed .ds-side-nav__header-slot {
  flex: none;
}

/* ── Items ────────────────────────────────────────────────────────── */
/* `spacing-md`, the same gap the head uses — they are one decision now, not
   two. What keeps five destinations from reading as a single block is that
   each one is a surface; what separates them from the head is the rule and the
   `spacing-3xl` above, neither of which is a gap between siblings. */
.ds-side-nav__items {
  display: flex;
  flex-direction: column;
  align-items: inherit;
  gap: var(--ds-spacing-md);
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
   carries both axes and leaves the choice here. The class is also withheld
   while the column travels (`travelling`), so this list never competes with the
   ResizeObserver's per-frame truth. */
.ds-side-nav__indicator--animated {
  transition:
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    height    var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/* The rail is still the rail when it arrives without travelling, so nothing is
   hidden by removing the trip — the same argument `useSlidingIndicator` makes
   for letting the selection jump (ADR-0033), and the opposite of ADR-0032's
   marquee, where stopping the loop would have hidden content. */
@media (prefers-reduced-motion: reduce) {
  .ds-side-nav {
    transition: none;
  }
}
</style>
