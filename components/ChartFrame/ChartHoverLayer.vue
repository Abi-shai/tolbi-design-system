<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import { SurfaceTransition } from '../SurfaceTransition'
import { SwapTransition } from '../SwapTransition'
import type { ChartMarker, ChartXScale } from './ChartFrame.vue'

/**
 * `ChartFrame`'s hover (internal, ADR-0180): a layer over the plot that turns
 * the pointer and the keyboard into **one index** — a column of the chart —
 * and draws what the index points at: a guide, a dot per series, and the
 * product's `ChartTooltip` beside the column. The plot below is the product's
 * engine; this layer knows only how many columns there are, where they sit
 * (`xScale`) and, for the dots, the y domain.
 *
 * Motion, on the package's tokens — the hand-written hovers it replaces jumped:
 * - the bubble **arrives** as anything that floats (`SurfaceTransition`: fade +
 *   `scale-enter`, `enter` / `easing-out`; leaves over `exit`);
 * - from one column to the next the bubble, the guide and the dots **glide**
 *   (`transform`, `moderate`, `easing-default`), and the bubble's content
 *   changes through `SwapTransition`, never by a cut;
 * - when the bubble runs out of room it **crosses to the other side by the same
 *   glide**, never a jump from edge to edge, and it never leaves the plot;
 * - the bars the pointer is not on fade to 0.35 over `quick` — the product tags
 *   them `data-chart-column="<index>"`;
 * - on the first frame of a hover nothing glides in from where the last one
 *   left; under reduced motion nothing glides at all.
 */
const props = defineProps<{
  columns: number
  xScale: ChartXScale
  yDomain?: [number, number]
  markers: ChartMarker[]
  guide: boolean
  label: string
  /** The plot's own element, where the product's bars are tagged. */
  plot: HTMLElement | null
}>()

const hover = defineModel<number | null>({ default: null })

defineSlots<{ tooltip?: (props: { index: number }) => unknown }>()

const layer = ref<HTMLElement | null>(null)
const tip = ref<HTMLElement | null>(null)
const width = ref(0)
const height = ref(0)
const tipWidth = ref(0)

let ro: ResizeObserver | null = null
onMounted(() => {
  if (typeof ResizeObserver === 'undefined' || !layer.value) return
  ro = new ResizeObserver(() => {
    width.value = layer.value?.clientWidth ?? 0
    height.value = layer.value?.clientHeight ?? 0
    tipWidth.value = tip.value?.offsetWidth ?? 0
  })
  ro.observe(layer.value)
  width.value = layer.value.clientWidth
  height.value = layer.value.clientHeight
})
onBeforeUnmount(() => ro?.disconnect())
/* The bubble's width changes as its content swaps: the side is measured again. */
watch(tip, (el, was) => {
  if (was) ro?.unobserve(was)
  if (el) {
    ro?.observe(el)
    tipWidth.value = el.offsetWidth
  }
})

/* ── Geometry ───────────────────────────────────────────────────── */
const n = computed(() => Math.max(0, props.columns))
function xOf(i: number) {
  if (!n.value) return 0
  if (props.xScale === 'point') return n.value > 1 ? (i / (n.value - 1)) * width.value : width.value / 2
  return ((i + 0.5) / n.value) * width.value
}
function yOf(v: number) {
  const [lo, hi] = props.yDomain ?? [0, 1]
  const t = hi === lo ? 0.5 : (v - lo) / (hi - lo)
  return height.value - Math.min(1, Math.max(0, t)) * height.value
}
function indexAt(x: number) {
  if (!n.value || !width.value) return null
  const t = Math.min(1, Math.max(0, x / width.value))
  if (props.xScale === 'point') return Math.round(t * (n.value - 1))
  return Math.min(n.value - 1, Math.floor(t * n.value))
}

/* The last column stays the place while the bubble leaves: off the chart, it
   fades where it was, it does not slide back to the start. */
const last = ref(0)
watch(hover, (i) => { if (i !== null) last.value = i }, { immediate: true })
const x = computed(() => xOf(hover.value ?? last.value))
const dots = computed(() =>
  hover.value === null
    ? []
    : props.markers.map((m, k) => {
        const v = m.values[hover.value as number]
        return { k, color: m.color, dashed: !!m.dashed, y: v === null || v === undefined ? null : yOf(v) }
      }),
)

/* The bubble: beside the column, after it while it fits, else before it —
   the same glide either way — and never past the plot. */
const GAP = 12
const fitsAfter = computed(() => x.value + GAP + tipWidth.value <= width.value)
const side = computed<'after' | 'before'>(() => (fitsAfter.value ? 'after' : 'before'))
const tipX = computed(() => {
  const w = tipWidth.value
  const to = side.value === 'after' ? x.value + GAP : x.value - GAP - w
  return Math.min(Math.max(0, to), Math.max(0, width.value - w))
})

/* A hover that starts does not glide in from where the last one ended. */
const settled = ref(false)
watch(hover, (now, was) => {
  if (now !== null && was === null) {
    settled.value = false
    requestAnimationFrame(() => requestAnimationFrame(() => (settled.value = true)))
  }
})

/* ── The product's bars: the others fade (`data-chart-column`) ─────── */
watch(
  () => [hover.value, props.plot] as const,
  ([i, plot]) => {
    if (!plot) return
    for (const el of plot.querySelectorAll<Element>('[data-chart-column]')) {
      const dim = i !== null && el.getAttribute('data-chart-column') !== String(i)
      if (dim) el.setAttribute('data-chart-dimmed', '')
      else el.removeAttribute('data-chart-dimmed')
    }
  },
  { flush: 'post' },
)

/* ── Pointer and keyboard ───────────────────────────────────────── */
function onMove(e: PointerEvent) {
  if (e.pointerType === 'touch' && e.type === 'pointermove' && !e.isPrimary) return
  const r = layer.value?.getBoundingClientRect()
  if (!r) return
  hover.value = indexAt(e.clientX - r.left)
}
function onLeave() {
  if (document.activeElement !== layer.value) hover.value = null
}

const live = ref('')
const tipId = `${useId()}-tip`
async function say() {
  await nextTick()
  // The swap is out-in: the new words are in the bubble one `quick` later.
  setTimeout(() => (live.value = tip.value?.innerText.replace(/\s+/g, ' ').trim() ?? ''), 250)
}
function onKey(e: KeyboardEvent) {
  if (!n.value) return
  const last = n.value - 1
  const at = hover.value ?? last
  const to: Record<string, number> = { ArrowRight: Math.min(last, at + 1), ArrowLeft: Math.max(0, at - 1), Home: 0, End: last }
  if (e.key === 'Escape') {
    if (hover.value === null) return
    hover.value = null
  } else if (e.key in to) {
    hover.value = hover.value === null ? at : to[e.key]
  } else return
  e.preventDefault()
  void say()
}
/* Reached by the keyboard, the chart shows its latest column. */
function onFocus() {
  if (hover.value === null && n.value && layer.value?.matches(':focus-visible')) {
    hover.value = n.value - 1
    void say()
  }
}
function onBlur() {
  hover.value = null
}
</script>

<template>
  <div
    ref="layer"
    class="ds-chart-hover"
    :class="{ 'ds-chart-hover--settled': settled }"
    tabindex="0"
    role="group"
    :aria-label="label"
    :aria-describedby="hover !== null ? tipId : undefined"
    @pointermove="onMove"
    @pointerdown="onMove"
    @pointerleave="onLeave"
    @keydown="onKey"
    @focus="onFocus"
    @blur="onBlur"
  >
    <template v-if="hover !== null">
      <span v-if="guide" class="ds-chart-hover__guide" :style="{ transform: `translateX(${x}px)` }" aria-hidden="true" />
      <template v-for="d in dots" :key="d.k">
        <span
          v-if="d.y !== null"
          class="ds-chart-hover__dot"
          :class="{ 'ds-chart-hover__dot--dashed': d.dashed }"
          :style="{ transform: `translate(${x}px, ${d.y}px)`, '--dot': d.color }"
          aria-hidden="true"
        />
      </template>
    </template>

    <!-- Where the bubble goes: the outer box moves, the inner one arrives. -->
    <div class="ds-chart-hover__place" :style="{ transform: `translateX(${tipX}px)` }">
      <SurfaceTransition>
        <div v-if="hover !== null && $slots.tooltip" :id="tipId" ref="tip" class="ds-chart-hover__tip" :class="`ds-chart-hover__tip--${side}`">
          <SwapTransition>
            <div :key="hover">
              <slot name="tooltip" :index="hover" />
            </div>
          </SwapTransition>
        </div>
      </SurfaceTransition>
    </div>

    <span class="ds-chart-hover__live" role="status">{{ live }}</span>
  </div>
</template>

<style scoped>
.ds-chart-hover {
  position: absolute;
  inset: 0;
  z-index: 1;
  outline: none;
  touch-action: pan-y;
}

.ds-chart-hover:focus-visible {
  border-radius: var(--ds-radius-control);
  box-shadow: var(--on-glass-focus, var(--ds-focus-ring-brand));
}

/* The guide: a hairline through the whole plot, on the column. */
.ds-chart-hover__guide {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: var(--ds-border-width-default);
  margin-left: calc(var(--ds-border-width-default) / -2);
  background: var(--ds-border-default);
  pointer-events: none;
}

/* A dot per series: full for a measured line, a ring for a reference (`dashed`). */
.ds-chart-hover__dot {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border: var(--ds-border-width-strong) solid var(--ds-bg-default);
  border-radius: var(--ds-radius-pill);
  background: var(--dot);
  box-shadow: var(--ds-elevation-control);
  pointer-events: none;
}

.ds-chart-hover__dot--dashed {
  border-color: var(--dot);
  background: var(--ds-bg-default);
}

.ds-chart-hover__place {
  position: absolute;
  top: var(--ds-spacing-md);
  left: 0;
  pointer-events: none;
}

/* Once a hover has started, the column's things glide to the next. */
.ds-chart-hover--settled :is(.ds-chart-hover__guide, .ds-chart-hover__dot, .ds-chart-hover__place) {
  transition: transform var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

@media (prefers-reduced-motion: reduce) {
  .ds-chart-hover--settled :is(.ds-chart-hover__guide, .ds-chart-hover__dot, .ds-chart-hover__place) {
    transition: none;
  }
}

.ds-chart-hover__tip {
  width: max-content;
  max-width: 17.5rem;
}

/* It grows from the side that faces the column. */
.ds-chart-hover__tip--after { transform-origin: top left; }
.ds-chart-hover__tip--before { transform-origin: top right; }

.ds-chart-hover__live {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
</style>
