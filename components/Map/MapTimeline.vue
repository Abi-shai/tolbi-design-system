<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '../Button'
import { Divider } from '../Divider'
import { Dropdown, DropdownItem, DropdownTrigger } from '../Dropdown'
import { IconButton } from '../IconButton'
import { Tooltip } from '../Tooltip'
import { useSlidingIndicator } from '../../composables/useSlidingIndicator'

/** One step of the timeline — a year, a month, a day. */
export interface MapTimelinePeriod {
  value: string
  label: string
  /** Something was measured in this period: a brand dot under it. */
  data?: boolean
  /** Not reached yet, or out of range: receding, and cannot be chosen. */
  disabled?: boolean
  /**
   * A step drawn as a dot, its label shown only when chosen — the days
   * between the weeks. The label is still what a reader hears.
   */
  minor?: boolean
}

/** One choice of the scale chip — année, mois, jour. */
export interface MapTimelineScale {
  value: string
  label: string
}

/**
 * The timeline that sits on a map (ADR-0100, Figma « Frise du temps »
 * `3042:10961`): which period the map shows — a year, a month, a day — or two
 * of them compared. Monitoring and Dynamic baseline.
 *
 * **Its own drawing, on purpose.** It floats on imagery, so it is a raised
 * pill, its controls are bare glyphs and words, and the chosen period is
 * **the brand's solid pill** — the one thing on the bar that must be found at a
 * glance. A boxed dropdown and a segmented rail (the catalogue's form
 * controls) read as a form laid on the map; the owner's drawing reads as the
 * map's own instrument.
 *
 * Left to right: the **scale** chip (`scales` + `v-model:scale`; the product
 * answers with other `periods`), ‹ the **periods** › and, at the end,
 * **« Comparer »** (`compare`): pressed, the next period chosen is the one
 * compared with (`v-model:comparison`), both wear the pill, and the end of the
 * bar says « 2020 → 2026 » with its ✕.
 *
 * The periods are a radio group — one tab stop, ←/→, Home and End move the
 * choice — and the pill **slides** to it (ADR-0024's `useSlidingIndicator`).
 * The strip shows what fits and scrolls to keep the choice in view; ‹ › step
 * to the previous and next period.
 */
interface Props {
  periods: MapTimelinePeriod[]
  scales?: MapTimelineScale[]
  /** What the periods are — the group's name. */
  label?: string
  scaleLabel?: string
  previousLabel?: string
  nextLabel?: string
  /** Offers « Comparer » at the end of the bar. */
  compare?: boolean
  compareLabel?: string
  /** Why « Comparer » is off: fewer than two periods can be chosen (ADR-0118). */
  compareUnavailableLabel?: string
  /** Said at the end while the second period is awaited. */
  compareHint?: string
  exitCompareLabel?: string
  /** Said after the compared period (the second pill). */
  comparedLabel?: string
  /** Said after a period with a data dot. */
  dataLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  scales: () => [],
  label: 'Période',
  scaleLabel: 'Échelle de temps',
  previousLabel: 'Période précédente',
  nextLabel: 'Période suivante',
  compare: false,
  compareLabel: 'Comparer',
  compareUnavailableLabel: 'Une seule période disponible',
  compareHint: 'Choisir une date',
  exitCompareLabel: 'Quitter la comparaison',
  comparedLabel: 'comparée',
  dataLabel: 'mesure disponible',
})

const value = defineModel<string>({ required: true })
const scale = defineModel<string>('scale')
/** The period compared with the chosen one; `null` when not comparing. */
const comparison = defineModel<string | null>('comparison', { default: null })

const picking = ref(false)
const comparing = computed(() => picking.value || comparison.value !== null)

const index = computed(() => props.periods.findIndex((p) => p.value === value.value))
/* With no scale given, the first is the one shown — and the one the menu marks. */
const currentScale = computed(() => props.scales.find((s) => s.value === scale.value) ?? props.scales[0])
const scaleName = computed(() => currentScale.value?.label)

/* Between dots, the labelled days are landmarks (they recede). */
const dense = computed(() => props.periods.some((p) => p.minor))

const { containerRef: track, itemRefs, style, ready, measure, reducedMotion } = useSlidingIndicator(index)
const viewport = ref<HTMLElement | null>(null)

function setItem(el: unknown, i: number) {
  if (el instanceof HTMLElement) itemRefs.value[i] = el
}

/*
  How many periods can be chosen (ADR-0118). With one, there is nowhere to
  step to and nothing to compare: ‹ › leave the bar — they would promise a
  navigation that does not exist — and « Comparer » is off, saying why.
*/
const choosable = computed(() => props.periods.filter((p) => !p.disabled).length)
const canStep = computed(() => choosable.value > 1)
const canCompare = computed(() => choosable.value > 1)

/*
  The gap between periods, capped (ADR-0118). Periods that fit share the strip
  — but three years spread over 480px stood 150px apart and no longer read as
  one row. So the room left is shared out up to `spacing-3xl` between periods
  (the CSS clamps it), and past that the row stays grouped and centred.
*/
const free = ref(0)
function fitGap() {
  const vp = viewport.value
  const items = itemRefs.value.filter(Boolean)
  if (!vp || items.length < 2) return
  /* Sub-pixel widths, and a pixel kept in hand: rounded widths left the strip
     one pixel over, and a fade on a row that fits. */
  const used = items.reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
  free.value = Math.max(0, (vp.clientWidth - used - 1) / (items.length - 1))
}

/* Which edges hide periods — each gets a fade, so a cut period reads as « more
   this way » rather than as a broken one (ADR-0116). */
const moreBefore = ref(false)
const moreAfter = ref(false)
function edges() {
  const vp = viewport.value
  if (!vp) return
  moreBefore.value = vp.scrollLeft > 1
  moreAfter.value = vp.scrollLeft + vp.clientWidth < vp.scrollWidth - 1
}

/* The strip only moves when the choice would leave it. */
function reveal(smooth: boolean) {
  const vp = viewport.value
  const el = itemRefs.value[index.value]
  if (!vp || !el) return
  const left = el.offsetLeft
  const right = left + el.offsetWidth
  let to = vp.scrollLeft
  if (left < vp.scrollLeft) to = left
  else if (right > vp.scrollLeft + vp.clientWidth) to = right - vp.clientWidth
  if (to !== vp.scrollLeft) vp.scrollTo({ left: to, behavior: smooth && !reducedMotion.value ? 'smooth' : 'auto' })
}

/* It opens on the latest periods — the ones read — then on the choice. */
function settle() {
  const vp = viewport.value
  fitGap()
  if (vp) vp.scrollLeft = vp.scrollWidth
  measure()
  reveal(false)
  edges()
  /* Read again once laid out and once the face has loaded: a first read in a
     fallback face left a fade on a strip that did not overflow. */
  requestAnimationFrame(edges)
  document.fonts?.ready.then(() => { fitGap(); reveal(false); requestAnimationFrame(edges) })
}
/* Revealed again whenever the strip changes width — the type loading (a
   fallback face is narrower, and a choice revealed in it ends up cut at the
   edge in the real one), the chosen step turning semibold. */
let ro: ResizeObserver | null = null
onMounted(() => {
  settle()
  ro = new ResizeObserver(() => { fitGap(); reveal(false); edges(); requestAnimationFrame(edges) })
  if (track.value) ro.observe(track.value)
  if (viewport.value) ro.observe(viewport.value)
})
onBeforeUnmount(() => ro?.disconnect())
watch(index, async () => { await nextTick(); measure(); reveal(true) })

watch(() => props.periods, async () => {
  itemRefs.value = []
  await nextTick()
  settle()
})

function enabled(i: number) {
  const p = props.periods[i]
  return !!p && !p.disabled
}

function choose(p: MapTimelinePeriod) {
  if (p.disabled) return
  if (comparing.value) {
    if (p.value === value.value) return
    comparison.value = p.value
    picking.value = false
    return
  }
  value.value = p.value
}

/* ‹ › and the arrows step over what cannot be chosen. */
function step(from: number, by: number): number {
  for (let i = from + by; i >= 0 && i < props.periods.length; i += by) if (enabled(i)) return i
  return -1
}
const previous = computed(() => step(index.value, -1))
const next = computed(() => step(index.value, 1))

/*
  ‹ or › that reaches the end disables itself — and a disabled button drops the
  focus to the page (ADR-0059). So the focus goes to the period just chosen.
*/
function go(i: number, focus = false) {
  if (i < 0 || !enabled(i)) return
  value.value = props.periods[i].value
  nextTick(() => {
    const lost = document.activeElement === document.body || (document.activeElement as HTMLButtonElement | null)?.disabled
    if (focus || lost) itemRefs.value[i]?.focus()
  })
}

/*
  The keyboard moves **the end being chosen**: the period, or — while comparing
  — the compared one, stepping over the period it is compared with. That end
  is also the strip's one tab stop; with neither in the strip (the product just
  swapped the periods), the first that can be chosen is.
*/
const compIndex = computed(() => (comparison.value === null ? -1 : props.periods.findIndex((p) => p.value === comparison.value)))
const activeIndex = computed(() => {
  if (comparing.value) return compIndex.value !== -1 ? compIndex.value : index.value
  return index.value
})
const tabIndex = computed(() => (activeIndex.value !== -1 ? activeIndex.value : step(-1, 1)))

function stepOver(from: number, by: number): number {
  let i = step(from, by)
  if (comparing.value && i === index.value) i = step(i, by)
  return i
}

function onKeydown(event: KeyboardEvent) {
  const last = props.periods.length - 1
  const from = activeIndex.value
  const first = stepOver(-1, 1)
  const end = stepOver(last + 1, -1)
  const to = {
    ArrowLeft: stepOver(from, -1),
    ArrowRight: stepOver(from, 1),
    Home: first,
    End: end,
  }[event.key]
  if (to === undefined) return
  event.preventDefault()
  if (to < 0) return
  if (comparing.value) {
    choose(props.periods[to])
    nextTick(() => itemRefs.value[to]?.focus())
  } else go(to, true)
}

/* Said once a text has changed, never on arrival (ADR-0058): the region is
   there from the start, empty, and filled by what changes. */
const announced = ref('')
watch(comparison, (c) => { announced.value = c === null ? '' : rangeText() })

const scaleOpen = ref(false)
const root = ref<HTMLElement | null>(null)
/* The pressed control is replaced, or its menu closes: the focus goes to
   what now stands in its place, never to the page. */
function focus(selector: string) {
  nextTick(() => root.value?.querySelector<HTMLElement>(selector)?.focus())
}

function pickScale(s: MapTimelineScale) {
  scale.value = s.value
  scaleOpen.value = false
  focus('.ds-map-timeline__scale')
}

function rangeText() {
  const a = compIndex.value
  const [from, to] = a < index.value ? [a, index.value] : [index.value, a]
  return `${props.periods[from]?.label} → ${props.periods[to]?.label}`
}

function startCompare() {
  picking.value = true
  focus('.ds-map-timeline__exit button')
}

const range = computed(() => (comparison.value === null ? null : rangeText()))

function exitCompare() {
  picking.value = false
  comparison.value = null
  focus('.ds-map-timeline__action')
}
</script>

<template>
  <div ref="root" class="ds-map-timeline" :class="{ 'ds-map-timeline--dense': dense }">
    <span class="ds-map-timeline__said" role="status">{{ announced }}</span>
    <template v-if="scales.length > 1">
      <Dropdown v-model:open="scaleOpen" class="ds-map-timeline__scale-menu" :label="scaleLabel" align="start" size="sm">
        <template #trigger="{ open, toggle }">
          <DropdownTrigger
            class="ds-map-timeline__scale"
            chrome="chip"
            chevron
            :open="open"
            :ariaLabel="`${scaleLabel} : ${scaleName}`"
            @click="toggle"
          >{{ scaleName }}</DropdownTrigger>
        </template>
        <DropdownItem
          v-for="s in scales"
          :key="s.value"
          :label="s.label"
          :selected="s.value === currentScale?.value"
          @click="pickScale(s)"
        />
      </Dropdown>
      <Divider class="ds-map-timeline__rule" orientation="vertical" />
    </template>
    <!-- One scale (ADR-0114): said, not offered — the word the chip would carry,
         without a chip or a chevron, since there is nothing to choose. -->
    <template v-else-if="scales.length === 1">
      <span class="ds-map-timeline__scale-word">{{ scaleName }}</span>
      <Divider class="ds-map-timeline__rule" orientation="vertical" />
    </template>

    <Tooltip v-if="canStep" :title="previousLabel" placement="top" class="ds-map-timeline__step">
      <IconButton
        icon="chevron-left"
        size="xs"
        variant="subtle"
        :ariaLabel="previousLabel"
        :disabled="previous < 0"
        @click="go(previous)"
      />
    </Tooltip>

    <div
      ref="viewport"
      class="ds-map-timeline__viewport"
      :class="{ 'ds-map-timeline__viewport--before': moreBefore, 'ds-map-timeline__viewport--after': moreAfter }"
      @scroll.passive="edges"
    >
      <!-- The pill counts in the strip's scroll width while it slides: the edges
           are read again when it lands (a stale read faded a strip that fit). -->
      <div ref="track" class="ds-map-timeline__track" :style="{ '--tick-free': `${free}px` }" role="radiogroup" :aria-label="label" @keydown="onKeydown" @transitionend="edges">
        <span
          v-if="index !== -1"
          class="ds-map-timeline__pill"
          :class="{ 'ds-map-timeline__pill--animated': ready }"
          :style="style"
          aria-hidden="true"
        />
        <button
          v-for="(p, i) in periods"
          :key="p.value"
          :ref="(el) => setItem(el, i)"
          type="button"
          role="radio"
          class="ds-map-timeline__tick"
          :class="{
            'ds-map-timeline__tick--current': p.value === value,
            'ds-map-timeline__tick--chosen': p.value === comparison,
            'ds-map-timeline__tick--minor': p.minor && p.value !== value && p.value !== comparison,
            'ds-map-timeline__tick--data': p.data,
          }"
          :aria-checked="p.value === value"
          :aria-disabled="p.disabled || undefined"
          :tabindex="i === tabIndex ? 0 : -1"
          @click="choose(p)"
        >
          <span class="ds-map-timeline__label">{{ p.label }}</span>
          <!-- Said, not seen: the second pill, and a measure behind a dot. -->
          <span v-if="p.value === comparison" class="ds-map-timeline__said">, {{ comparedLabel }}</span>
          <span v-else-if="p.data" class="ds-map-timeline__said">, {{ dataLabel }}</span>
          <span
            v-if="p.data || p.minor"
            class="ds-map-timeline__dot"
            :class="{ 'ds-map-timeline__dot--empty': !p.data }"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <Tooltip v-if="canStep" :title="nextLabel" placement="top" class="ds-map-timeline__step">
      <IconButton
        icon="chevron-right"
        size="xs"
        variant="subtle"
        :ariaLabel="nextLabel"
        :disabled="next < 0"
        @click="go(next)"
      />
    </Tooltip>

    <template v-if="compare">
      <Divider class="ds-map-timeline__rule" orientation="vertical" />
      <Button
        v-if="!comparing && canCompare"
        class="ds-map-timeline__action"
        variant="link"
        size="sm"
        :label="compareLabel"
        @click="startCompare"
      />
      <!-- Off, and saying why (ADR-0118). `aria-disabled`, not `disabled`: a
           disabled button takes no focus, so the reason in its tooltip reached
           the pointer only. It stays in the tab order, is read as unavailable
           with the reason as its description, and does nothing when pressed. -->
      <Tooltip v-else-if="!comparing" :title="compareUnavailableLabel" placement="top" class="ds-map-timeline__compare-off">
        <Button
          class="ds-map-timeline__action ds-map-timeline__action--off"
          variant="link"
          size="sm"
          :label="compareLabel"
          aria-disabled="true"
        />
      </Tooltip>
      <template v-else>
        <span class="ds-map-timeline__range" :class="{ 'ds-map-timeline__range--hint': !range }" aria-hidden="true">
          {{ range ?? compareHint }}
        </span>
        <Tooltip :title="exitCompareLabel" placement="top" class="ds-map-timeline__exit">
          <IconButton
            icon="x"
            size="xs"
            variant="subtle"
            :ariaLabel="exitCompareLabel"
            @click="exitCompare"
          />
        </Tooltip>
      </template>
    </template>
  </div>
</template>

<style scoped>
/*
  The drawing — a raised pill, 8 in at the start and 12 at the end, 6 between
  its parts — at **one size, the large one** (ADR-0115): the timeline is the
  screen's instrument, so it is read at 14px and touched on 32px targets. The
  drawing's 42px and 12px type gave 20px targets, under WCAG 2.5.8's 24.

  **48px tall, `--ds-width-sm` (480px) wide** (ADR-0116) — the legend's width
  and the same token, so the two are one width on the map's axis, edge over
  edge. Past it, the periods scroll; a fade at the edge says there are more. The border is `border-subtle` (ADR-0030): in dark
  the shadow cannot separate a surface from the map, the edge does.
*/
.ds-map-timeline {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  box-sizing: border-box;
  width: var(--ds-width-sm);
  max-width: 100%;
  height: 48px;
  padding: 0 var(--ds-spacing-lg) 0 var(--ds-spacing-md);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-raised);
}

/* ── The scale chip ───────────────────────────────────────────────── */
/* `DropdownTrigger`'s `chip` chrome: the trigger owns its chrome (ADR-0033). */
.ds-map-timeline__scale-menu {
  flex: none;
}

/*
  One scale: the word alone (ADR-0114). The chip's type and ink, without its
  ground or its chevron — a chip says « choose », and there is nothing to
  choose. It fills the start of the bar the drawing gives to the scale, where
  a few years left a void between the edge and ‹.
*/
.ds-map-timeline__scale-word {
  flex: none;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-subtle);
  white-space: nowrap;
}

/* `Divider`, vertical — 20px tall, as drawn, not the bar's height. */
.ds-map-timeline__rule {
  flex: none;
  align-self: center;
  height: 20px;
}

/* ── The arrows and the exit ─────────────────────────────────────── */
/*
  The catalogue's round button (`IconButton xs subtle`, 32px — a 16px glyph in
  its own disc, hover and focus included), not bare glyphs: a control that steps
  through the periods is a button and looks like one (the owner, 5 Nov.), named
  by a tooltip like every icon-only control on a map (ADR-0087). The bar is
  42px, so 5px of it above and below. Ending on the exit, the bar's end padding
  gives back the disc's own 8px of air, so the glyph keeps its place.
*/
.ds-map-timeline__step,
.ds-map-timeline__exit,
.ds-map-timeline__compare-off {
  flex: none;
}

.ds-map-timeline:has(> .ds-map-timeline__exit:last-child) {
  padding-inline-end: var(--ds-spacing-xs);
}

/* « Comparer » is `Button link xs`; the range it becomes speaks in the same
   brand ink — the one action at the end of the bar. */
.ds-map-timeline__action,
.ds-map-timeline__range {
  flex: none;
}

/* « Comparer » is a link — no box of its own — so its target is given, the
   periods' 32px (it measured 18). */
.ds-map-timeline__action {
  min-height: 32px;
}

/* Off but focusable (`aria-disabled`): the disabled ink, no underline, the
   not-allowed hand — what `Button`'s own `:disabled` rule would give. */
.ds-map-timeline__action--off,
.ds-map-timeline__action--off:hover {
  color: var(--ds-text-disabled);
  text-decoration: none;
  cursor: not-allowed;
}

.ds-map-timeline__range {
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-brand);
  white-space: nowrap;
}

.ds-map-timeline__range--hint {
  color: var(--ds-text-subtle);
}

/* What a reader hears and nobody sees. */
.ds-map-timeline__said {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ── The strip ────────────────────────────────────────────────────── */
/*
  What fits is shown, the rest is cut at the strip's edges as drawn; the strip
  scrolls (by the component, never a scrollbar) to keep the choice in view.
  The track hugs its periods and sits at the end while they fit — the latest
  are the ones read.
*/
.ds-map-timeline__viewport {
  --fade-before: 0px;
  --fade-after: 0px;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  /* A fade on each edge that hides periods (ADR-0116). A mask reads alpha
     only: any opaque colour draws « shown » — the ground's, a token. */
  mask-image: linear-gradient(to right, transparent, var(--ds-bg-default) var(--fade-before), var(--ds-bg-default) calc(100% - var(--fade-after)), transparent);
}

.ds-map-timeline__viewport--before { --fade-before: var(--ds-spacing-3xl); }
.ds-map-timeline__viewport--after  { --fade-after: var(--ds-spacing-3xl); }

/* While the periods fit, they **share the strip** (ADR-0116) — up to
   `spacing-3xl` between two, then grouped and centred (ADR-0118); once they do
   not fit, they keep `spacing-xxs` and the strip scrolls. `--tick-free` is the
   room left per gap, measured; the clamp is the rule. */
.ds-map-timeline__track {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(var(--ds-spacing-xxs), var(--tick-free, 0px), var(--ds-spacing-3xl));
  box-sizing: border-box;
  width: max-content;
  min-width: 100%;
  min-height: 32px;
}

/* The chosen period: the brand's solid pill, which slides (ADR-0024). */
.ds-map-timeline__pill {
  position: absolute;
  left: 0;
  top: 0;
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-brand-solid);
  pointer-events: none;
}

.ds-map-timeline__pill--animated {
  transition:
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    width     var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    height    var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

.ds-map-timeline__tick {
  position: relative;
  z-index: 1;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-xxs);
  /* A 32px target: `label-lg`'s 20px line + 6 above and below, and at least
     32px wide, so a one-digit day is still a square. 6px aside: the pill is
     the target, and five years with « Comparer » fit the 480 (ADR-0116). */
  box-sizing: border-box;
  min-width: 32px;
  padding: var(--ds-spacing-sm);
  border: none;
  border-radius: var(--ds-radius-pill);
  background: transparent;
  font: var(--ds-font-label-lg);
  color: var(--ds-text-strong);
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition:
    color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* Between dots, the labelled days are landmarks: they recede. */
.ds-map-timeline--dense .ds-map-timeline__tick {
  color: var(--ds-text-subtle);
}

.ds-map-timeline__tick:hover:not(.ds-map-timeline__tick--current):not(.ds-map-timeline__tick--chosen):not([aria-disabled]) {
  background: var(--ds-bg-hover);
}

.ds-map-timeline__tick:focus-visible {
  box-shadow: var(--ds-focus-ring-brand);
}

.ds-map-timeline__tick[aria-disabled] {
  color: var(--ds-text-disabled);
  cursor: default;
}

/* Chosen: the pill's ink, a step stronger — the same box: the pill is the
   target, it does not grow. */
.ds-map-timeline__tick--current,
.ds-map-timeline__tick--chosen,
.ds-map-timeline--dense .ds-map-timeline__tick--current,
.ds-map-timeline--dense .ds-map-timeline__tick--chosen {
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-on-brand-solid);
}

/* The compared period wears the pill too; it does not slide — it is placed. */
.ds-map-timeline__tick--chosen {
  background: var(--ds-bg-brand-solid);
}

/* A day between the labelled ones is its dot; chosen, it is a pill again. */
.ds-map-timeline__tick--minor {
  padding: 0;
}

.ds-map-timeline__tick--minor .ds-map-timeline__label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/*
  A day between the labelled ones is its dot: its target is the whole pitch
  (the gap split between neighbours) and 32px tall. Under 24px across, by the
  drawing — met by WCAG 2.5.8's exception: ‹ › and the arrow keys reach every
  day one press at a time (ADR-0100).
*/
.ds-map-timeline__tick--minor {
  min-width: 0;
}

.ds-map-timeline__tick--minor::before {
  content: '';
  position: absolute;
  inset: -13px calc(-1 * var(--ds-spacing-xxs));
}

.ds-map-timeline__dot {
  flex: none;
  /* Under its label, out of the flow (ADR-0114) — in it, a dot made its year
     taller and lifted its label off the chosen one's line — and inside the
     period's own 32px target, in its bottom padding (ADR-0115): 6px, so it
     reads on imagery, and never outside the box it marks. */
  position: absolute;
  bottom: 1px;
  left: 50%;
  translate: -50% 0;
  width: 6px;
  height: 6px;
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-brand-solid);
}

/* A day between the labelled ones *is* its dot: there it stays in the flow. */
.ds-map-timeline__tick--minor .ds-map-timeline__dot {
  position: static;
  translate: none;
}

/* No measure: a **ring**, not a paler dot — the shape says it, not the colour
   alone (ADR-0006), and its ink holds 3:1 on white where `border-subtle`'s
   1.18:1 drew nothing (WCAG 1.4.11). */
.ds-map-timeline__dot--empty {
  background: transparent;
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-text-subtlest);
}

.ds-map-timeline__tick--current .ds-map-timeline__dot,
.ds-map-timeline__tick--chosen .ds-map-timeline__dot {
  display: none;
}

</style>
