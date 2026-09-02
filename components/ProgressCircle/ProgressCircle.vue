<script setup lang="ts">
/* token-lint-disable no-literal-dimension-js — the value scales with the ring
   diameter; 30px, 36px and 48px are off the type ramp. Component tokens per
   ADR-0010, recorded in ADR-0011. */
import { computed } from 'vue'

export type ProgressCircleSize  = 'xxs' | 'xs' | 'sm' | 'md' | 'lg'
export type ProgressCircleShape = 'circle' | 'half-circle'

interface Props {
  value?:  number
  size?:   ProgressCircleSize
  shape?:  ProgressCircleShape
  label?:  string
}

const props = withDefaults(defineProps<Props>(), {
  value: 0,
  size:  'md',
  shape: 'circle',
})

/* ── Size map ────────────────────────────────────────────────────── */
const SIZE_MAP: Record<ProgressCircleSize, { diameter: number; strokeWidth: number }> = {
  xxs: { diameter: 64,  strokeWidth: 6  },
  xs:  { diameter: 160, strokeWidth: 16 },
  sm:  { diameter: 200, strokeWidth: 20 },
  md:  { diameter: 240, strokeWidth: 24 },
  lg:  { diameter: 280, strokeWidth: 28 },
}

/* ── Text offsets (half-circle): px to add to containerHeight/2 ─── */
// These position the TEXT CENTER inside the lower inner arc area.
const HALF_OFFSET_NO_LABEL:   Record<ProgressCircleSize, number> = { xxs: 5, xs: 22, sm: 28, md: 36, lg: 35 }
const HALF_OFFSET_WITH_LABEL: Record<ProgressCircleSize, number> = { xxs: 5, xs: 16, sm: 21, md: 26, lg: 27 }

/* ── Value text styles ───────────────────────────────────────────────
   Component tokens (ADR-0010): the value scales with the ring diameter, so
   these are geometry, not typographic roles — 30px, 36px and 48px are off the
   type ramp entirely. Kept as a table rather than dissolved into roles. */
const VALUE_FONT: Record<ProgressCircleSize, { size: string; line: string; tracking?: string }> = {
  xxs: { size: '0.875rem', line: '1.25rem'  },
  xs:  { size: '1.5rem',   line: '2rem'     },
  sm:  { size: '1.875rem', line: '2.375rem' },
  md:  { size: '2.25rem',  line: '2.75rem', tracking: '-0.72px' },
  lg:  { size: '3rem',     line: '3.75rem', tracking: '-0.96px' },
}

const LABEL_FONT: Record<ProgressCircleSize, { size: string; line: string }> = {
  xxs: { size: '0.75rem',  line: '1.125rem' },
  xs:  { size: '0.75rem',  line: '1.125rem' },
  sm:  { size: '0.75rem',  line: '1.125rem' },
  md:  { size: '0.875rem', line: '1.25rem'  },
  lg:  { size: '0.875rem', line: '1.25rem'  },
}

/* ── Derived values ──────────────────────────────────────────────── */
const config      = computed(() => SIZE_MAP[props.size])
const isHalf      = computed(() => props.shape === 'half-circle')
const isXxs       = computed(() => props.size === 'xxs')
const hasLabel    = computed(() => Boolean(props.label))
const clamped     = computed(() => Math.min(100, Math.max(0, props.value)))
const pct         = computed(() => `${clamped.value}%`)

/* ── SVG geometry ────────────────────────────────────────────────── */
const diameter    = computed(() => config.value.diameter)
const strokeWidth = computed(() => config.value.strokeWidth)
const cx          = computed(() => diameter.value / 2)
const cy          = computed(() => diameter.value / 2)
const radius      = computed(() => (diameter.value - strokeWidth.value) / 2)
const fullArc     = computed(() => 2 * Math.PI * radius.value)
const halfArc     = computed(() => Math.PI * radius.value)
const arcLength   = computed(() => isHalf.value ? halfArc.value : fullArc.value)
const dashOffset  = computed(() => arcLength.value * (1 - clamped.value / 100))
const rotation    = computed(() => isHalf.value ? 180 : -90)
const transform   = computed(() => `rotate(${rotation.value}, ${cx.value}, ${cy.value})`)

/* ── Container dimensions ────────────────────────────────────────── */
// Half-circle: only the top half is visible (+ half stroke at baseline).
const halfHeight     = computed(() => Math.round(diameter.value / 2 + strokeWidth.value / 2))
const containerH     = computed(() => isHalf.value ? halfHeight.value : diameter.value)
const containerW     = computed(() => diameter.value)

// xxs with label adds room below the ring for the external label.
const xxsLabelExtra  = computed(() => (isXxs.value && hasLabel.value) ? 20 : 0)
const totalHeight    = computed(() => containerH.value + xxsLabelExtra.value)

/* ── SVG top offset (half-circle: shift SVG down so arc baseline = container bottom) ─── */
// Outer container has overflow:visible; separate clip wrapper handles SVG clipping.
const svgTop = computed(() => isHalf.value ? strokeWidth.value / 2 : 0)

/* ── Text center (top from outer container top) ──────────────────── */
const textTop = computed(() => {
  if (isHalf.value) {
    const offsetMap = (hasLabel.value && !isXxs.value)
      ? HALF_OFFSET_WITH_LABEL
      : HALF_OFFSET_NO_LABEL
    return containerH.value / 2 + offsetMap[props.size]
  }
  // Full circle: center in the ring (not in totalHeight, to stay at ring center for xxs+label)
  return diameter.value / 2
})

/* ── External label top (xxs below the ring) ─────────────────────── */
const externalLabelTop = computed(() => containerH.value + 4)

const valueFont = computed(() => VALUE_FONT[props.size])
const labelFont = computed(() => LABEL_FONT[props.size])
</script>

<template>
  <!--
    Outer container: no overflow restriction — text may extend slightly
    beyond containerH for half-circle (intentional, matches Figma).
  -->
  <div
    :style="{
      position: 'relative',
      width:    `${containerW}px`,
      height:   `${totalHeight}px`,
    }"
  >
    <!--
      SVG clip wrapper: clips the bottom of the full-circle SVG so only
      the top arc is visible for half-circle. overflow:visible for full circles.
    -->
    <div
      :style="{
        position: 'absolute',
        top: 0,
        left: 0,
        width:    `${containerW}px`,
        height:   `${containerH}px`,
        overflow: isHalf ? 'hidden' : 'visible',
      }"
    >
      <svg
        :width="diameter"
        :height="diameter"
        :viewBox="`0 0 ${diameter} ${diameter}`"
        :style="{ position: 'absolute', top: `${svgTop}px`, left: 0, display: 'block' }"
        aria-hidden="true"
      >
        <!-- Track (background arc) -->
        <circle
          :cx="cx"
          :cy="cy"
          :r="radius"
          fill="none"
          stroke="var(--ds-bg-neutral)"
          :stroke-width="strokeWidth"
          :stroke-dasharray="`${arcLength} ${arcLength}`"
          stroke-linecap="butt"
          :transform="transform"
        />
        <!-- Progress fill -->
        <circle
          :cx="cx"
          :cy="cy"
          :r="radius"
          fill="none"
          stroke="var(--ds-text-brand)"
          :stroke-width="strokeWidth"
          :stroke-dasharray="`${arcLength} ${arcLength}`"
          :stroke-dashoffset="dashOffset"
          stroke-linecap="round"
          :transform="transform"
          class="ds-progress-circle__fill"
        />
      </svg>
    </div>

    <!-- Inner text (value + optional label for xs+) -->
    <div
      :style="{
        position:   'absolute',
        left:       '50%',
        top:        `${textTop}px`,
        transform:  'translate(-50%, -50%)',
        display:    'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap:        '2px',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }"
    >
      <!-- Label above value (xs+ only; xxs uses external label below) -->
      <span
        v-if="hasLabel && !isXxs"
        :style="{
          fontFamily: 'var(--ds-typography-font-family-poppins)',
          fontSize:   labelFont.size,
          fontWeight: '500',
          lineHeight: labelFont.line,
          color:      'var(--ds-text-subtle)',
        }"
      >{{ label }}</span>

      <span
        :style="{
          fontFamily:    'var(--ds-typography-font-family-poppins)',
          fontSize:      valueFont.size,
          fontWeight:    '600',
          lineHeight:    valueFont.line,
          letterSpacing: valueFont.tracking ?? 'normal',
          fontVariantNumeric: 'tabular-nums',
          color:         'var(--ds-text-strong)',
        }"
      >{{ pct }}</span>
    </div>

    <!-- External label for xxs (rendered below the ring) -->
    <span
      v-if="hasLabel && isXxs"
      :style="{
        position:   'absolute',
        left:       '50%',
        top:        `${externalLabelTop}px`,
        transform:  'translateX(-50%)',
        fontFamily: 'var(--ds-typography-font-family-poppins)',
        fontSize:   labelFont.size,
        fontWeight: '500',
        lineHeight: labelFont.line,
        color:      'var(--ds-text-subtle)',
        whiteSpace: 'nowrap',
      }"
    >{{ label }}</span>
  </div>
</template>

<style scoped>
.ds-progress-circle__fill {
  transition: stroke-dashoffset var(--ds-motion-duration-process) var(--ds-motion-easing-out);
}
</style>
