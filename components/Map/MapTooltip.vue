<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { CloseButton } from '../CloseButton'

/** One line of the bubble: a mark, a word, a value. */
export interface MapTooltipRow {
  label: string
  value?: string
  /** The mark's colour — the class the point falls in on the map's scale. Pass a token. */
  color?: string
}

/**
 * What a click on a map says about the point (ADR-0100, Figma `3667:2638`):
 * a title and its close, a sentence, then one row per thing — a mark, a word,
 * a value. It is **not** `ChartTooltip`: that one follows a pointer over a
 * plot and holds nothing; this one is **opened by a click and stays**, so it
 * is a small non-modal dialog named by its title. Two components because they
 * are found in two places — the map's pieces and the chart's — and a reader of
 * the catalogue looking for one should not have to know it hides in the other.
 *
 * The focus goes in when it opens and back to what held it when it closes —
 * the map's canvas, the marker — only if it was still inside (ADR-0062: a
 * focus is not held hostage). Escape closes it. The engine places it, at the
 * point (ADR-0006): a point on a canvas is not an element the system can
 * anchor to. The words carry the class; the colour repeats it (ADR-0006).
 */
interface Props {
  title: string
  description?: string
  rows?: MapTooltipRow[]
  closeLabel?: string
}

withDefaults(defineProps<Props>(), {
  description: undefined,
  rows: () => [],
  closeLabel: 'Fermer',
})

const emit = defineEmits<{
  /** The close or Escape. The product removes it. */
  close: []
}>()

defineSlots<{
  /** Under the rows — a link to the point's detail. */
  default?: () => unknown
}>()

const root = ref<HTMLElement | null>(null)
const titleId = `ds-map-tooltip-${useId()}`

let opener: HTMLElement | null = null
onMounted(() => {
  opener = document.activeElement as HTMLElement | null
  root.value?.focus({ preventScroll: true })
})
onBeforeUnmount(() => {
  if (root.value?.contains(document.activeElement) && opener?.isConnected) opener.focus({ preventScroll: true })
})

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  event.stopPropagation()
  emit('close')
}
</script>

<template>
  <div
    ref="root"
    class="ds-map-tooltip"
    role="dialog"
    :aria-labelledby="titleId"
    tabindex="-1"
    @keydown="onKeydown"
  >
    <div class="ds-map-tooltip__head">
      <span :id="titleId" class="ds-map-tooltip__title">{{ title }}</span>
      <CloseButton class="ds-map-tooltip__close" size="xs" :ariaLabel="closeLabel" @click="emit('close')" />
    </div>
    <p v-if="description" class="ds-map-tooltip__description">{{ description }}</p>
    <ul v-if="rows.length" class="ds-map-tooltip__rows">
      <li v-for="(r, i) in rows" :key="i" class="ds-map-tooltip__row">
        <span class="ds-map-tooltip__mark" :style="{ backgroundColor: r.color }" aria-hidden="true" />
        <span class="ds-map-tooltip__label">{{ r.label }}</span>
        <span v-if="r.value" class="ds-map-tooltip__value">{{ r.value }}</span>
      </li>
    </ul>
    <slot />
  </div>
</template>

<style scoped>
/* 280px as drawn: a size, so the bubble does not resize from one point to the
   next. 12 around, 8 between everything. */
.ds-map-tooltip {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  box-sizing: border-box;
  width: 17.5rem;
  max-width: 100%;
  padding: var(--ds-spacing-lg);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-raised);
  outline: none;
}

/* A 20px line: the close's 32px box gives back what it takes above, below and
   at the end, so the glyph sits where the drawing puts it. */
.ds-map-tooltip__head {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-height: 20px;
}

.ds-map-tooltip__title {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font: var(--ds-font-label-md);
  color: var(--ds-text-strong);
}

.ds-map-tooltip__close {
  flex: none;
  margin-block: calc(-1 * var(--ds-spacing-sm));
  margin-inline-end: calc(-1 * var(--ds-spacing-md));
}

.ds-map-tooltip__description {
  margin: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-map-tooltip__rows {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ds-map-tooltip__row {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-height: 20px;
}

/* The ramp's first step is pale on white: the hairline keeps its edge. */
.ds-map-tooltip__mark {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: var(--ds-radius-pill);
  box-shadow: inset 0 0 0 var(--ds-border-width-default) var(--ds-border-inset);
}

.ds-map-tooltip__label {
  flex: 1 1 auto;
  min-width: 0;
  font: var(--ds-font-body-sm);
  color: var(--ds-text-default);
}

.ds-map-tooltip__value {
  flex: none;
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
}
</style>
