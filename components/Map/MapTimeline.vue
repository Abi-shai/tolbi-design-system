<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Dropdown, DropdownItem } from '../Dropdown'
import { Icon } from '../Icon'
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
  /** Said at the end while the second period is awaited. */
  compareHint?: string
  exitCompareLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  scales: () => [],
  label: 'Période',
  scaleLabel: 'Échelle de temps',
  previousLabel: 'Période précédente',
  nextLabel: 'Période suivante',
  compare: false,
  compareLabel: 'Comparer',
  compareHint: 'Choisir une date',
  exitCompareLabel: 'Quitter la comparaison',
})

const value = defineModel<string>({ required: true })
const scale = defineModel<string>('scale')
/** The period compared with the chosen one; `null` when not comparing. */
const comparison = defineModel<string | null>('comparison', { default: null })

const picking = ref(false)
const comparing = computed(() => picking.value || comparison.value !== null)

const index = computed(() => props.periods.findIndex((p) => p.value === value.value))
const scaleName = computed(() => props.scales.find((s) => s.value === scale.value)?.label ?? props.scales[0]?.label)

/* A step that carries a mark under it (a data dot) or between which dots
   stand is set one size down: the bar keeps its height. */
const small = computed(() => props.periods.some((p) => p.data !== undefined || p.minor))
const dense = computed(() => props.periods.some((p) => p.minor))

const { containerRef: track, itemRefs, style, ready, measure, reducedMotion } = useSlidingIndicator(index)
const viewport = ref<HTMLElement | null>(null)

function setItem(el: unknown, i: number) {
  if (el instanceof HTMLElement) itemRefs.value[i] = el
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
  if (vp) vp.scrollLeft = vp.scrollWidth
  measure()
  reveal(false)
}
/* Revealed again whenever the strip changes width — the type loading (a
   fallback face is narrower, and a choice revealed in it ends up cut at the
   edge in the real one), the chosen step turning semibold. */
let ro: ResizeObserver | null = null
onMounted(() => {
  settle()
  ro = new ResizeObserver(() => reveal(false))
  if (track.value) ro.observe(track.value)
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

function go(i: number, focus = false) {
  if (i < 0 || !enabled(i)) return
  value.value = props.periods[i].value
  if (focus) nextTick(() => itemRefs.value[i]?.focus())
}

function onKeydown(event: KeyboardEvent) {
  const last = props.periods.length - 1
  const to = {
    ArrowLeft: previous.value,
    ArrowRight: next.value,
    Home: enabled(0) ? 0 : step(0, 1),
    End: enabled(last) ? last : step(last, -1),
  }[event.key]
  if (to === undefined) return
  event.preventDefault()
  go(to, true)
}

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

function startCompare() {
  picking.value = true
  focus('.ds-map-timeline__exit')
}

const range = computed(() => {
  if (comparison.value === null) return null
  const a = props.periods.findIndex((p) => p.value === comparison.value)
  const [from, to] = a < index.value ? [a, index.value] : [index.value, a]
  return `${props.periods[from]?.label} → ${props.periods[to]?.label}`
})

function exitCompare() {
  picking.value = false
  comparison.value = null
  focus('.ds-map-timeline__action')
}
</script>

<template>
  <div ref="root" class="ds-map-timeline" :class="{ 'ds-map-timeline--small': small, 'ds-map-timeline--dense': dense }">
    <template v-if="scales.length > 1">
      <Dropdown v-model:open="scaleOpen" class="ds-map-timeline__scale-menu" :label="scaleLabel">
        <template #trigger="{ open, toggle }">
          <button
            type="button"
            class="ds-map-timeline__scale"
            :aria-label="`${scaleLabel} : ${scaleName}`"
            aria-haspopup="menu"
            :aria-expanded="open"
            @click="toggle"
          >
            <span>{{ scaleName }}</span>
            <Icon name="chevron-down" :size="16" aria-hidden="true" />
          </button>
        </template>
        <DropdownItem
          v-for="s in scales"
          :key="s.value"
          :label="s.label"
          :selected="s.value === scale"
          @click="pickScale(s)"
        />
      </Dropdown>
      <span class="ds-map-timeline__rule" aria-hidden="true" />
    </template>

    <button
      type="button"
      class="ds-map-timeline__step"
      :aria-label="previousLabel"
      :disabled="previous < 0"
      @click="go(previous)"
    >
      <Icon name="chevron-left" :size="16" aria-hidden="true" />
    </button>

    <div ref="viewport" class="ds-map-timeline__viewport">
      <div ref="track" class="ds-map-timeline__track" role="radiogroup" :aria-label="label" @keydown="onKeydown">
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
          :tabindex="p.value === value ? 0 : -1"
          @click="choose(p)"
        >
          <span class="ds-map-timeline__label">{{ p.label }}</span>
          <span
            v-if="p.data || p.minor"
            class="ds-map-timeline__dot"
            :class="{ 'ds-map-timeline__dot--empty': !p.data }"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <button
      type="button"
      class="ds-map-timeline__step"
      :aria-label="nextLabel"
      :disabled="next < 0"
      @click="go(next)"
    >
      <Icon name="chevron-right" :size="16" aria-hidden="true" />
    </button>

    <template v-if="compare">
      <span class="ds-map-timeline__rule" aria-hidden="true" />
      <button
        v-if="!comparing"
        type="button"
        class="ds-map-timeline__action"
        @click="startCompare"
      >{{ compareLabel }}</button>
      <template v-else>
        <span class="ds-map-timeline__range" :class="{ 'ds-map-timeline__range--hint': !range }" aria-live="polite">
          {{ range ?? compareHint }}
        </span>
        <button
          type="button"
          class="ds-map-timeline__exit"
          :aria-label="exitCompareLabel"
          @click="exitCompare"
        >
          <Icon name="x" :size="16" aria-hidden="true" />
        </button>
      </template>
    </template>
  </div>
</template>

<style scoped>
/*
  The drawing: a raised pill 42px tall, 8 in at the start and 12 at the end,
  6 between its parts. 480px is a size — the bar does not breathe with the
  labels of the scale it shows. The border is `border-subtle` (ADR-0030): in
  dark the shadow cannot separate a surface from the map, the edge does.
*/
.ds-map-timeline {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  box-sizing: border-box;
  width: 30rem;
  max-width: 100%;
  height: 42px;
  padding: 0 var(--ds-spacing-lg) 0 var(--ds-spacing-md);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-raised);
}

/* ── The scale chip ───────────────────────────────────────────────── */
.ds-map-timeline__scale-menu {
  flex: none;
}

/* A chip, not a field: the scale is a setting of the instrument, so it is a
   tinted pill with its word and its chevron. 10px at the start is the
   control padding the chevron's own 4px of air balances at the end. */
.ds-map-timeline__scale {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xxs);
  padding: var(--ds-spacing-xs) var(--ds-spacing-sm) var(--ds-spacing-xs) 10px;
  border: none;
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-neutral);
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-map-timeline__scale:hover,
.ds-map-timeline__scale[aria-expanded='true'] {
  background: var(--ds-bg-neutral-strong);
}

.ds-map-timeline__scale:focus-visible {
  box-shadow: var(--ds-focus-ring-gray);
}

.ds-map-timeline__rule {
  flex: none;
  width: var(--ds-border-width-default);
  height: 20px;
  background: var(--ds-border-subtle);
}

/* ── Bare glyphs and words ────────────────────────────────────────── */
/*
  The arrows and the exit are 16px glyphs, as drawn — the target is not: an
  invisible 28px disc around each (`::before`), so the bar keeps its rhythm and
  a finger still finds them.
*/
.ds-map-timeline__step,
.ds-map-timeline__exit {
  position: relative;
  flex: none;
  display: inline-flex;
  padding: 0;
  border: none;
  border-radius: var(--ds-radius-pill);
  background: none;
  color: var(--ds-text-subtle);
  cursor: pointer;
  outline: none;
  transition:
    color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-map-timeline__step::before,
.ds-map-timeline__exit::before {
  content: '';
  position: absolute;
  inset: calc(-1 * var(--ds-spacing-sm));
}

.ds-map-timeline__step:hover:not(:disabled) {
  color: var(--ds-text-strong);
}

.ds-map-timeline__step:disabled {
  color: var(--ds-text-disabled);
  cursor: default;
}

.ds-map-timeline__step:focus-visible,
.ds-map-timeline__exit:focus-visible,
.ds-map-timeline__action:focus-visible {
  box-shadow: var(--ds-focus-ring-brand);
}

.ds-map-timeline__exit {
  color: var(--ds-text-brand);
}

.ds-map-timeline__exit:hover {
  color: var(--ds-text-brand-hover);
}

/* The end of the bar speaks in the brand's ink: it is the one action there. */
.ds-map-timeline__action,
.ds-map-timeline__range {
  flex: none;
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-brand);
  white-space: nowrap;
}

.ds-map-timeline__action {
  padding: 0;
  border: none;
  border-radius: var(--ds-radius-inner-sm);
  background: none;
  cursor: pointer;
  outline: none;
  transition:
    color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-map-timeline__action:hover {
  color: var(--ds-text-brand-hover);
}

.ds-map-timeline__range--hint {
  color: var(--ds-text-subtle);
}

/* ── The strip ────────────────────────────────────────────────────── */
/*
  What fits is shown, the rest is cut at the strip's edges as drawn; the strip
  scrolls (by the component, never a scrollbar) to keep the choice in view.
  The track hugs its periods and sits at the end while they fit — the latest
  are the ones read.
*/
.ds-map-timeline__viewport {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.ds-map-timeline__track {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  width: max-content;
  min-height: 30px;
  margin-inline-start: auto;
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
  padding: var(--ds-spacing-xxs) var(--ds-spacing-xs);
  border: none;
  border-radius: var(--ds-radius-pill);
  background: transparent;
  font: var(--ds-font-label-md);
  color: var(--ds-text-strong);
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition:
    color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    background-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-map-timeline--small .ds-map-timeline__tick {
  font: var(--ds-font-label-xs);
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

/* Chosen: the pill's ink, a step stronger, and 4px of air above and below. */
.ds-map-timeline__tick--current,
.ds-map-timeline__tick--chosen {
  padding-block: var(--ds-spacing-xs);
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-on-brand-solid);
}

.ds-map-timeline--small .ds-map-timeline__tick--current,
.ds-map-timeline--small .ds-map-timeline__tick--chosen,
.ds-map-timeline--dense .ds-map-timeline__tick--current,
.ds-map-timeline--dense .ds-map-timeline__tick--chosen {
  font: var(--ds-font-label-md-strong);
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

.ds-map-timeline__tick--minor::before {
  content: '';
  position: absolute;
  inset: calc(-1 * var(--ds-spacing-xs));
}

.ds-map-timeline--dense .ds-map-timeline__tick--current,
.ds-map-timeline--dense .ds-map-timeline__tick--chosen {
  padding-inline: 10px;
}

.ds-map-timeline__dot {
  flex: none;
  width: 4px;
  height: 4px;
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-brand-solid);
}

.ds-map-timeline__dot--empty {
  background: var(--ds-border-subtle);
}

.ds-map-timeline__tick--current .ds-map-timeline__dot,
.ds-map-timeline__tick--chosen .ds-map-timeline__dot {
  display: none;
}
</style>
