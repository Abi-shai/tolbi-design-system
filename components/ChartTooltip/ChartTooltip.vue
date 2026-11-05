<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { Badge, type BadgeTone } from '../Badge'
import { CloseButton } from '../CloseButton'

export interface ChartTooltipSeries {
  label: string
  value?: string
  /** Any CSS colour. Pass a semantic token, not a literal. */
  color?: string
}

interface Props {
  /** What is being pointed at — usually a formatted date. */
  title?: string
  /** A sentence under the title — what the rows are (« Ses 5 points de contrôle, du plus proche au plus éloigné »). */
  description?: string
  /** Short qualifier on the reading: `Mesuré`, `Estimé`. */
  tag?: string
  tagTone?: BadgeTone
  /** The hero. A tooltip has one headline figure, not a table of them. */
  value?: string
  unit?: string
  series?: ChartTooltipSeries[]
  /**
   * Opened by a **click**, not a hover — a point on a map, a bar pinned for
   * reading (ADR-0100). It then holds a close button, so it is no longer a
   * tooltip but a small non-modal dialog named by its title: the focus goes in
   * when it opens and back where it came from when it closes, Escape closes it.
   * One surface for both readings — a second tooltip that looks the same but
   * behaves differently is what a design system exists to prevent.
   */
  dismissible?: boolean
  closeLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  tagTone: 'neutral',
  series: () => [],
  dismissible: false,
  closeLabel: 'Fermer',
})

const emit = defineEmits<{
  /** The close button or Escape. The product removes it. */
  close: []
}>()

const root = ref<HTMLElement | null>(null)
const titleId = `ds-chart-tooltip-${useId()}`

/*
 * The focus is handed back to what held it at the opening — the map's canvas,
 * the marker, the bar — and only if it is still inside the surface when the
 * surface goes: a reader who clicked elsewhere has moved on (ADR-0062's rule,
 * a focus is not held hostage).
 */
let opener: HTMLElement | null = null
onMounted(() => {
  if (!props.dismissible) return
  opener = document.activeElement as HTMLElement | null
  root.value?.focus({ preventScroll: true })
})
onBeforeUnmount(() => {
  if (!props.dismissible) return
  if (root.value?.contains(document.activeElement) && opener?.isConnected) opener.focus({ preventScroll: true })
})

function onKeydown(event: KeyboardEvent) {
  if (!props.dismissible || event.key !== 'Escape') return
  event.stopPropagation()
  emit('close')
}

/*
 * Same rule as ChartLegend: a colourless series takes the categorical palette by
 * position, never brand (ADR-0016 — brand is interactive-only, and a chart is
 * not an affordance). Kept as a local copy rather than shared, because the two
 * components have no common module and one function is not worth inventing one.
 */
const CATEGORICAL_STEPS = 7

function seriesColor(color: string | undefined, index: number): string {
  return color ?? `var(--ds-chart-categorical-${(index % CATEGORICAL_STEPS) + 1})`
}
</script>

<template>
  <!--
    Presentation only: no positioning, no pointer tracking, no data. The chart
    engine decides where this goes. Every colour comes from a token, which is
    the one thing the pattern this replaces got wrong — its palette was
    entirely hard-coded.
  -->
  <div
    ref="root"
    class="ds-chart-tooltip"
    :class="{ 'ds-chart-tooltip--dismissible': dismissible }"
    :role="dismissible ? 'dialog' : 'tooltip'"
    :aria-labelledby="dismissible && title ? titleId : undefined"
    :tabindex="dismissible ? -1 : undefined"
    @keydown="onKeydown"
  >
    <div v-if="title || tag || dismissible" class="ds-chart-tooltip__head">
      <span v-if="title" :id="titleId" class="ds-chart-tooltip__title">{{ title }}</span>
      <Badge v-if="tag" :label="tag" :tone="tagTone" size="sm" />
      <CloseButton
        v-if="dismissible"
        class="ds-chart-tooltip__close"
        size="xs"
        :ariaLabel="closeLabel"
        @click="emit('close')"
      />
    </div>
    <p v-if="description" class="ds-chart-tooltip__description">{{ description }}</p>

    <div v-if="value" class="ds-chart-tooltip__value">
      {{ value }}<span v-if="unit" class="ds-chart-tooltip__unit">{{ unit }}</span>
    </div>

    <ul v-if="series.length" class="ds-chart-tooltip__series">
      <li v-for="(s, i) in series" :key="i" class="ds-chart-tooltip__serie">
        <span
          class="ds-chart-tooltip__swatch"
          :style="{ backgroundColor: seriesColor(s.color, i) }"
          aria-hidden="true"
        />
        <span class="ds-chart-tooltip__serie-label">{{ s.label }}</span>
        <span v-if="s.value" class="ds-chart-tooltip__serie-value">{{ s.value }}</span>
      </li>
    </ul>

    <slot />
  </div>
</template>

<style scoped>
.ds-chart-tooltip {
  /*
   * No semantic token fits: the widths ramp starts at 320px, and reaching for
   * --ds-space-* would mean consuming a raw primitive. Declared here so the
   * measure is one named knob a caller can override, not a magic number.
   */
  --tooltip-min-width: 10rem;
  --tooltip-max-width: 16rem;

  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  min-width: var(--tooltip-min-width);
  max-width: var(--tooltip-max-width);
  padding: var(--ds-spacing-lg);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface-sm);
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-overlay);
  font-family: var(--ds-typography-font-family-poppins);
}

.ds-chart-tooltip__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
}

.ds-chart-tooltip__title {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
  white-space: nowrap;
}

/*
  Opened by a click, the title is what the surface is called, not the date a
  figure is read at: it takes the strong ink, and the 32px close gives back its
  8px above and beside so the head stays one title line (MapPanel's rule).
*/
.ds-chart-tooltip--dismissible {
  outline: none;
}

.ds-chart-tooltip--dismissible .ds-chart-tooltip__title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
}

.ds-chart-tooltip__close {
  flex: none;
  margin-block: calc(-1 * var(--ds-spacing-md));
  margin-inline-end: calc(-1 * var(--ds-spacing-md));
}

.ds-chart-tooltip__value {
  font: var(--ds-font-heading-xl);
  letter-spacing: var(--ds-letter-spacing-heading-xl);
  color: var(--ds-text-strong);
  font-variant-numeric: tabular-nums;
}

.ds-chart-tooltip__unit {
  margin-left: 0.25em;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-chart-tooltip__series {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-chart-tooltip__serie {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  font: var(--ds-font-body-sm);
}

.ds-chart-tooltip__swatch {
  width: 8px;
  height: 8px;
  border-radius: var(--ds-radius-pill);
  flex-shrink: 0;
  /* A light step of a ramp keeps an edge on the white surface (ChartLegend's, ADR-0077). */
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-inset);
}

.ds-chart-tooltip__serie-label {
  color: var(--ds-text-default);
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-chart-tooltip__serie-value {
  color: var(--ds-text-strong);
  font-weight: var(--ds-font-weight-label-md);
  font-variant-numeric: tabular-nums;
}
.ds-chart-tooltip__description {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}
</style>
