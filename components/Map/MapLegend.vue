<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { ChartLegend, type ChartLegendItem } from '../ChartLegend'
import { Divider } from '../Divider'
import { Dropdown, DropdownItem, DropdownTrigger } from '../Dropdown'
import { Skeleton } from '../Skeleton'
import { SwapTransition } from '../SwapTransition'

/** One indicator the map can show (ADR-0137). */
export interface MapLegendMetric {
  value: string
  label: string
  /** Said in the chip when the ramp would go under 120px — « Couvert ». */
  shortLabel?: string
  /** Shown in the menu beside the name, so the reader knows what they will read. */
  unit?: string
  /** The indicator's ramp, low to high — its preview in the menu. */
  colors?: string[]
  /**
   * Offered but unavailable here (ADR-0119's rule): listed, greyed, reachable,
   * read as unavailable.
   */
  disabled?: boolean
}

/**
 * The legend of a map in full GIS mode — **on one line, in the timeline's
 * grammar** (ADR-0137, track A of `3919:1427`): a chip that chooses, a rule,
 * the values. The same raised pill as `MapTimeline`, the same chip, the same
 * rule, the same height, the same 560px (480 until ADR-0144): on the GIS screen the two are one
 * family, the legend at the top (what the map shows), the timeline at the
 * bottom (when).
 *
 * - **The chip names the indicator** and, with two or more `metrics`, chooses
 *   it — `MapTimeline`'s scale chip, menu and all (`v-model:metric`); each row
 *   shows the indicator's name, unit and a preview of its ramp. The title is
 *   not repeated: with `metrics`, `title` is written after the rule only when
 *   it says something the chip does not (« 2021 → 2024 » while comparing);
 *   without, it is the chip's word.
 * - **The scale on one line**: the low bound, the ramp, the high bound, the
 *   unit. The middle ticks are no longer written — they are said, in
 *   `summary`. **The line is always 560 and the ramp is its only elastic
 *   part**: the legend never changes width from one indicator or one year to
 *   the next. Under 120px of ramp, the chip says the indicator's `shortLabel`.
 * - **By category** (`legend` without `ticks`, ADR-0129): the word, then the
 *   keys, at their size up to 560; past it, the last keys go into a « +N »
 *   chip whose panel lists them.
 * - **A ramp and symbols** (`legend` with `ticks`): after the unit, a rule and
 *   a « Symboles » chip carrying the symbols' marks, their names in its panel.
 *
 * Changing indicator, the ramp cross-fades over `process` and the bounds swap
 * in place; nothing moves. A reader hears the new scale once.
 */
interface Props {
  title: string
  /**
   * The values of the scale, low to high; the first and the last are written,
   * the others said. **Absent, with a `legend`, there is no ramp**: the map is
   * coloured by category, and the legend is its key (ADR-0129).
   */
  ticks?: string[]
  /** After the high bound — `tCO2e/ha`. */
  unit?: string
  /** The ramp, low to high. Any CSS colour — pass tokens. */
  colors?: string[]
  /** The symbols drawn on the map, or the categories' key — `ChartLegend`'s shapes. */
  legend?: ChartLegendItem[]
  /** The indicators the map can show. Two or more make the chip a choice. */
  metrics?: MapLegendMetric[]
  /** The chip's name. */
  metricsLabel?: string
  /** What a reader hears for the scale. Defaults to « title, de first à last unit ». */
  summary?: string
  /**
   * The bounds are on their way (ADR-0122): the chip is readable and the ramp
   * drawn — its colours are the indicator's, known before any data — the
   * bounds and the unit are placeholders. With no `ticks` and not loading, the
   * bounds are « — » (ADR-0105).
   */
  loading?: boolean
  /** Said with the title while there are no bounds. */
  emptyLabel?: string
  /** The symbols' chip. */
  symbolsLabel?: string
  /** The panel of the keys that did not fit. */
  moreLabel?: string
}

const SEQUENTIAL = [1, 2, 3, 4, 5].map((i) => `var(--ds-chart-sequential-${i})`)

const props = withDefaults(defineProps<Props>(), {
  ticks: undefined,
  unit: undefined,
  colors: () => [1, 2, 3, 4, 5].map((i) => `var(--ds-chart-sequential-${i})`),
  legend: () => [],
  metrics: () => [],
  metricsLabel: 'Indicateur affiché',
  summary: undefined,
  loading: false,
  emptyLabel: 'pas encore de mesure',
  symbolsLabel: 'Symboles',
  moreLabel: 'Autres catégories',
})

const metric = defineModel<string>('metric')
const choosing = computed(() => props.metrics.length > 1)
const current = computed(() => props.metrics.find((m) => m.value === metric.value) ?? props.metrics[0])

/* A map coloured by category has no ramp: no ticks, a legend (ADR-0129). */
const categorical = computed(() => props.ticks === undefined && props.legend.length > 0)
const symbols = computed(() => !categorical.value && props.legend.length > 0)
const ticks = computed(() => props.ticks ?? [])
const empty = computed(() => !props.loading && ticks.value.length === 0)
const low = computed(() => ticks.value[0])
const high = computed(() => ticks.value[ticks.value.length - 1])

const gradient = computed(() => `linear-gradient(to right, ${props.colors.join(', ')})`)
const preview = (m: MapLegendMetric) => `linear-gradient(to right, ${(m.colors ?? SEQUENTIAL).join(', ')})`

/* The chip's word: the chosen indicator, or the title when there is nothing to choose. */
const name = computed(() => (props.metrics.length ? current.value?.label ?? props.title : props.title))
/* The title after the rule, only when it says what the chip does not. */
const aside = computed(() => {
  if (!props.metrics.length || !current.value) return null
  return props.title !== current.value.label && props.title !== current.value.shortLabel ? props.title : null
})

const said = computed(() => {
  if (props.loading) return name.value
  if (empty.value) return `${name.value}, ${props.emptyLabel}`
  if (props.summary) return props.summary
  const range = `de ${low.value} à ${high.value}`
  return `${aside.value ? `${name.value}, ${aside.value}` : name.value}, ${range}${props.unit ? ` ${props.unit}` : ''}`
})
const keySaid = computed(() =>
  `${props.title} : ${props.legend.map((i) => (i.value ? `${i.label} ${i.value}` : i.label)).join(', ')}`)

/* ── The short name: under 120px of ramp, the chip gives way ─────── */
const root = ref<HTMLElement | null>(null)
const bar = ref<HTMLElement | null>(null)
const short = ref(false)
const RAMP_FLOOR = 120
let canvas: CanvasRenderingContext2D | null = null
function textWidth(text: string, el: Element) {
  canvas ??= document.createElement('canvas').getContext('2d')
  if (!canvas) return 0
  canvas.font = getComputedStyle(el).font
  return canvas.measureText(text).width
}
function fitName() {
  const m = current.value
  const el = bar.value
  const chip = root.value?.querySelector('.ds-map-legend__chip')
  if (!m?.shortLabel || !el || !chip) { short.value = false; return }
  /* What the ramp would have with the long name — from the short one when it
     is shown, so the two never take turns. */
  const extra = short.value ? textWidth(m.label, chip) - textWidth(m.shortLabel, chip) : 0
  short.value = el.getBoundingClientRect().width - extra < RAMP_FLOOR
}
const chipWord = computed(() => (short.value && current.value?.shortLabel ? current.value.shortLabel : name.value))

/* ── The keys that fit, by category ─────────────────────────────── */
const sizer = ref<HTMLElement | null>(null)
const shown = ref(Number.POSITIVE_INFINITY)
const KEY_GAP = 12 // token-lint-disable no-literal-dimension-js — spacing-lg, ChartLegend's own gap between entries
function fitKeys() {
  if (!categorical.value || !root.value || !sizer.value) return
  const items = [...sizer.value.querySelectorAll<HTMLElement>('.ds-chart-legend__item')]
  const more = sizer.value.querySelector<HTMLElement>('.ds-map-legend__more-sizer')
  const line = root.value.querySelector<HTMLElement>('.ds-map-legend__line')
  if (!line) return
  const style = getComputedStyle(line)
  /* At its size, `--ds-width-sm` at most — and never past its container. */
  const cap = sizer.value.querySelector<HTMLElement>('.ds-map-legend__cap')?.getBoundingClientRect().width || Number.POSITIVE_INFINITY
  const max = Math.min(cap, root.value.parentElement?.clientWidth ?? cap)
  const fixed = [...line.querySelectorAll<HTMLElement>(':scope > .ds-map-legend__word, :scope > .ds-map-legend__rule')]
    .reduce((sum, el) => sum + el.getBoundingClientRect().width, 0)
  const gap = parseFloat(style.columnGap) || 0
  const frame = getComputedStyle(root.value)
  const room = max - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
    - parseFloat(frame.borderLeftWidth) - parseFloat(frame.borderRightWidth) - fixed - 2 * gap
  const widths = items.map((el) => el.getBoundingClientRect().width)
  const all = widths.reduce((s, w, i) => s + w + (i ? KEY_GAP : 0), 0)
  if (all <= room) { shown.value = items.length; return }
  const moreW = (more?.getBoundingClientRect().width ?? 40) + gap
  let used = 0
  let n = 0
  for (const w of widths) {
    const next = used + (n ? KEY_GAP : 0) + w
    if (next + moreW > room) break
    used = next
    n += 1
  }
  shown.value = Math.max(1, n)
}
const keys = computed(() => props.legend.slice(0, shown.value))
const rest = computed(() => props.legend.slice(shown.value))

function fit() {
  fitName()
  fitKeys()
}
let ro: ResizeObserver | null = null
onMounted(() => {
  fit()
  ro = new ResizeObserver(() => fit())
  if (root.value) ro.observe(root.value)
  if (bar.value) ro.observe(bar.value)
  document.fonts?.ready.then(fit)
})
onBeforeUnmount(() => ro?.disconnect())
watch(() => [props.legend, props.title, current.value, props.ticks, props.unit], async () => {
  short.value = false
  await nextTick()
  fit()
})

/* ── Unfolding in place (ADR-0138) ──────────────────────────────── */
/*
  What does not fit on the line — the symbols, the categories past 560 — is not
  a menu: a menu closes at the first click on the map, and a legend is read
  while looking at the map. The legend grows downward instead, the line not
  moving a pixel, and stays open until its chip is pressed again or Escape.
  `v-model:expanded` lets the product keep it for the session; unbound, the
  state is the legend's own.
*/
const expanded = defineModel<boolean>('expanded', { default: false })
const foldable = computed(() => symbols.value || (categorical.value && rest.value.length > 0))
const open = computed(() => foldable.value && expanded.value)
const foldId = `ds-map-legend-fold-${useId()}`
const foldItems = computed(() => (symbols.value ? props.legend : rest.value))
const foldLabel = computed(() => (symbols.value ? props.symbolsLabel : props.moreLabel))

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !open.value) return
  e.preventDefault()
  e.stopPropagation()
  expanded.value = false
}

/* ── The indicators' menu ───────────────────────────────────────── */
/* Choosing is not reading: it stays a menu, and opening it leaves the block as it is. */
const menuOpen = ref(false)

/* ── Choosing ───────────────────────────────────────────────────── */
function pick(m: MapLegendMetric) {
  if (m.disabled) return
  menuOpen.value = false
  if (m.value !== current.value?.value) {
    metric.value = m.value
    pending = true
  }
  nextTick(() => root.value?.querySelector<HTMLElement>('.ds-map-legend__chip')?.focus())
}

/* Said once a scale has changed, never on arrival (ADR-0058): the region is
   there from the start, empty, and filled when the chosen indicator's scale
   has landed — not while it is still loading. */
const announced = ref('')
let pending = false
let timer: ReturnType<typeof setTimeout> | undefined
watch([said, () => props.loading], ([s, loading]) => {
  if (!pending || loading) return
  pending = false
  announced.value = ''
  clearTimeout(timer)
  timer = setTimeout(() => { announced.value = s }, 100)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div
    ref="root"
    class="ds-map-legend"
    :class="{ 'ds-map-legend--categorical': categorical, 'ds-map-legend--open': open }"
    :aria-busy="loading || undefined"
    @keydown="onKeydown"
  >
    <span class="ds-map-legend__said" role="status">{{ announced }}</span>

    <div class="ds-map-legend__line">
      <!-- The chip: MapTimeline's scale chip, menu and all. -->
      <Dropdown
        v-if="choosing"
        v-model:open="menuOpen"
        class="ds-map-legend__menu"
        :label="metricsLabel"
        align="start"
        size="sm"
        width="max-content"
      >
        <template #trigger="{ open: opened, toggle }">
          <DropdownTrigger
            class="ds-map-legend__chip"
            chrome="chip"
            chevron
            :open="opened"
            :ariaLabel="`${metricsLabel} : ${name}`"
            @click="toggle"
          >{{ chipWord }}</DropdownTrigger>
        </template>
        <DropdownItem
          v-for="m in metrics"
          :key="m.value"
          :label="m.label"
          :meta="m.unit"
          :selected="m.value === current?.value"
          :disabled="m.disabled"
          @click="pick(m)"
        >
          <template #trailing><span class="ds-map-legend__preview" :style="{ backgroundImage: preview(m) }" /></template>
        </DropdownItem>
      </Dropdown>
      <!-- Nothing to choose (ADR-0114): the word the chip would carry, no chip. -->
      <span v-else class="ds-map-legend__word ds-map-legend__chip-word">{{ chipWord }}</span>
      <Divider class="ds-map-legend__rule" orientation="vertical" />

      <!-- By category: the keys after the rule, what does not fit unfolds under « +N ». -->
      <template v-if="categorical">
        <div v-if="loading" class="ds-map-legend__keys" aria-hidden="true">
          <Skeleton v-for="i in legend.length" :key="i" width="5.5em" height="0.5rem" />
        </div>
        <template v-else>
          <ChartLegend :items="keys" shape="zone" class="ds-map-legend__keys" role="img" :aria-label="keySaid" />
          <DropdownTrigger
            v-if="rest.length"
            class="ds-map-legend__chip ds-map-legend__unfold"
            chrome="chip"
            chevron
            :popup="false"
            :open="open"
            :ariaLabel="moreLabel"
            :aria-controls="foldId"
            @click="expanded = !expanded"
          >+{{ rest.length }}</DropdownTrigger>
        </template>
        <!-- Every key at its width, out of sight: what is measured to know what fits. -->
        <div class="ds-map-legend__sizer" aria-hidden="true">
          <div ref="sizer" class="ds-map-legend__sizer-row">
            <ChartLegend :items="legend" shape="zone" />
            <DropdownTrigger class="ds-map-legend__more-sizer" chrome="chip" chevron tabindex="-1">+{{ legend.length }}</DropdownTrigger>
            <!-- The token's length, resolved: `--ds-width-md` is written in rem. -->
            <span class="ds-map-legend__cap" />
          </div>
        </div>
      </template>

      <!-- The scale: the low bound, the ramp, the high bound, the unit. -->
      <template v-else>
        <span v-if="aside" class="ds-map-legend__aside">{{ aside }}</span>
        <span class="ds-map-legend__bound" aria-hidden="true">
          <SwapTransition>
            <Skeleton v-if="loading" key="loading" width="1.5em" height="0.625rem" />
            <span v-else-if="empty" key="empty" class="ds-map-legend__none">—</span>
            <span v-else :key="`low-${low}`">{{ low }}</span>
          </SwapTransition>
        </span>
        <div ref="bar" class="ds-map-legend__bar" role="img" :aria-label="said">
          <!-- One indicator's ramp fades in over the last's, which stays under it
               until the fade has played. -->
          <Transition name="ds-map-legend-ramp">
            <span :key="gradient" class="ds-map-legend__ramp" :style="{ backgroundImage: gradient }" />
          </Transition>
        </div>
        <span class="ds-map-legend__bound" aria-hidden="true">
          <SwapTransition>
            <Skeleton v-if="loading" key="loading" width="1.5em" height="0.625rem" />
            <span v-else-if="empty" key="empty" class="ds-map-legend__none">—</span>
            <span v-else :key="`high-${high}`">{{ high }}</span>
          </SwapTransition>
        </span>
        <span v-if="loading || (unit && !empty)" class="ds-map-legend__unit" aria-hidden="true">
          <SwapTransition>
            <Skeleton v-if="loading" key="loading" width="3.5em" height="0.625rem" />
            <span v-else :key="`unit-${unit}`">{{ unit }}</span>
          </SwapTransition>
        </span>

        <!-- The symbols: their marks in the chip; pressed, they unfold below. -->
        <template v-if="symbols">
          <Divider class="ds-map-legend__rule" orientation="vertical" />
          <DropdownTrigger
            class="ds-map-legend__chip ds-map-legend__unfold"
            chrome="chip"
            chevron
            :popup="false"
            :open="open"
            :ariaLabel="symbolsLabel"
            :aria-controls="foldId"
            @click="expanded = !expanded"
          >
            <span class="ds-map-legend__dots" aria-hidden="true">
              <span v-for="s in legend" :key="s.key" class="ds-map-legend__dot" :style="{ background: s.color }" />
            </span>
            {{ symbolsLabel }}
          </DropdownTrigger>
        </template>
      </template>
    </div>

    <!-- What did not fit, unfolded under the line (ADR-0138): a rule, then the
         key in columns — its mark, its figure, its name. -->
    <div v-if="foldable" class="ds-map-legend__fold">
      <div :id="foldId" class="ds-map-legend__region" role="region" :aria-label="foldLabel">
        <ChartLegend :items="foldItems" :shape="symbols ? 'dot' : 'zone'" orientation="columns" class="ds-map-legend__columns" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  `MapTimeline`'s pill, to the pixel (ADR-0137): a 48px line, 8 in at the start
  and 12 at the end, 6 between its parts, `bg-default` + `border-subtle` +
  `elevation-raised`. **`--ds-width-md` (560px — 480 until ADR-0144), declared** for a scale
  (ADR-0116); a key by category hugs, up to the same 560.

  The surface is the legend, not the line (ADR-0138): unfolded, it grows
  downward under the line, which does not move. So the radius is the line's —
  half its height — and not a pill's, which on a taller surface would round
  the whole side.
*/
.ds-map-legend {
  --map-legend-row: 48px;

  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: var(--ds-width-md);
  max-width: 100%;
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: calc(var(--map-legend-row) / 2);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-raised);
  font-family: var(--ds-typography-font-family-poppins);
}

.ds-map-legend--categorical {
  width: fit-content;
  max-width: min(100%, var(--ds-width-md));
}

.ds-map-legend__line {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  box-sizing: border-box;
  height: calc(var(--map-legend-row) - 2 * var(--ds-border-width-default));
  padding: 0 var(--ds-spacing-lg) 0 var(--ds-spacing-md);
}

/* ── Unfolded (ADR-0138) ──────────────────────────────────────────── */
/*
  ADR-0025's `0fr → 1fr`, on the element that transitions. It takes the
  legend's width and asks for none (`contain: inline-size`), so a key by
  category is as wide as its line, folded or not.

  In: the height over `enter` on `easing-out` — the block makes room — and its
  content fades in over the second half. Out, faster, the other way round: the
  content first (`instant`), then the height over `exit`; the block is hidden
  from a reader once closed.
*/
.ds-map-legend__fold {
  display: grid;
  grid-template-rows: 0fr;
  contain: inline-size;
  visibility: hidden;
  transition:
    grid-template-rows var(--ds-motion-duration-exit) var(--ds-motion-easing-in) var(--ds-motion-duration-instant),
    visibility 0s linear calc(var(--ds-motion-duration-instant) + var(--ds-motion-duration-exit));
}

.ds-map-legend--open .ds-map-legend__fold {
  grid-template-rows: 1fr;
  visibility: visible;
  transition:
    grid-template-rows var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    visibility 0s;
}

.ds-map-legend__region {
  min-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity var(--ds-motion-duration-instant) var(--ds-motion-easing-in);
}

.ds-map-legend--open .ds-map-legend__region {
  opacity: 1;
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-out) var(--ds-motion-duration-quick);
}

/* Reduced motion: the package's rule cuts every transition (`motion.css`); the
   delays stay unless removed, and the block would stand empty for 100ms. */
@media (prefers-reduced-motion: reduce) {
  .ds-map-legend__fold,
  .ds-map-legend--open .ds-map-legend__fold,
  .ds-map-legend--open .ds-map-legend__region {
    transition-delay: 0s;
  }
}

/* A rule inset 16 under the line, then the key: 12 above it, 16 below and at the sides. */
.ds-map-legend__columns {
  margin: 0 var(--ds-spacing-xl);
  padding: var(--ds-spacing-lg) 0 var(--ds-spacing-xl);
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

/* ── The chip ─────────────────────────────────────────────────────── */
.ds-map-legend__menu,
.ds-map-legend__unfold {
  flex: none;
}

/* Nothing to choose: the chip's type and ink without its ground or chevron —
   the timeline's lone scale word (ADR-0114). */
.ds-map-legend__word {
  flex: none;
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-subtle);
  white-space: nowrap;
}

/* `Divider`, vertical — 20px tall, as the timeline's. */
.ds-map-legend__rule {
  flex: none;
  align-self: center;
  height: 20px;
}

/* ── The scale ────────────────────────────────────────────────────── */
.ds-map-legend__aside {
  flex: none;
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-default);
  white-space: nowrap;
}

.ds-map-legend__bound,
.ds-map-legend__unit {
  display: inline-grid;
  flex: none;
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-default);
  white-space: nowrap;
}

.ds-map-legend__unit {
  color: var(--ds-text-subtle);
}

.ds-map-legend__none {
  color: var(--ds-text-subtlest);
}

/* The one elastic part of the line. */
.ds-map-legend__bar {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  height: 8px;
  overflow: hidden;
  border-radius: var(--ds-radius-pill);
}

.ds-map-legend__ramp {
  position: absolute;
  inset: 0;
}

/* The incoming ramp fades in over the outgoing one, which stays put until the
   fade has played: a cross-fade with no frame of bare ground. */
.ds-map-legend-ramp-enter-active {
  z-index: 1;
  transition: opacity var(--ds-motion-duration-process) var(--ds-motion-easing-default);
}

.ds-map-legend-ramp-enter-from {
  opacity: 0;
}

.ds-map-legend-ramp-leave-active {
  transition: opacity 0s linear var(--ds-motion-duration-process);
}

.ds-map-legend-ramp-leave-to {
  opacity: 0;
}

/* ── The keys, by category ────────────────────────────────────────── */
.ds-map-legend__keys {
  display: flex;
  flex: none;
  flex-wrap: nowrap;
  align-items: center;
  gap: var(--ds-spacing-lg);
  white-space: nowrap;
}

/* Out of sight and out of the scroll: a box of nothing that clips what it holds. */
.ds-map-legend__sizer {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
}

.ds-map-legend__sizer-row {
  display: flex;
  width: max-content;
  gap: var(--ds-spacing-lg);
  white-space: nowrap;
}

.ds-map-legend__cap {
  position: absolute;
  width: var(--ds-width-md);
}

.ds-map-legend__sizer :deep(.ds-chart-legend) {
  flex-wrap: nowrap;
}

.ds-map-legend__chip-word {
  font: var(--ds-font-label-md-strong);
}

/* ── The symbols' marks, overlapping ──────────────────────────────── */
.ds-map-legend__dots {
  display: inline-flex;
  margin-inline-end: var(--ds-spacing-xs);
}

.ds-map-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--ds-radius-pill);
  box-shadow: 0 0 0 var(--ds-border-width-default) var(--ds-bg-default);
}

.ds-map-legend__dot + .ds-map-legend__dot {
  margin-inline-start: calc(-1 * var(--ds-spacing-xxs));
}

/* ── The menu's ramp preview, 40 × 6 ──────────────────────────────── */
.ds-map-legend__preview {
  display: block;
  width: 40px;
  height: 6px;
  border-radius: var(--ds-radius-pill);
}

/* What a reader hears and nobody sees. */
.ds-map-legend__said {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
