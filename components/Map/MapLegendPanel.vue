<script setup lang="ts">
import { computed } from 'vue'
import type { ChartLegendShape } from '../ChartLegend'
import ChartLegendMark from '../ChartLegend/ChartLegendMark.vue'
import { Dropdown, DropdownItem, DropdownTrigger } from '../Dropdown'
import { IconButton } from '../IconButton'
import { PanelBlock } from '../PanelBlock'
import { Tooltip } from '../Tooltip'
import MapPanel from './MapPanel.vue'

/** One thing the map draws — a row of the key. */
export interface MapLegendPanelItem {
  /** Stable, unique across the key: what `v-model:hidden` holds. */
  value: string
  label: string
  /** How the map draws it: a glyph (`glyph-*`), a fill (`square`), a point, a zone, a ring. */
  mark: ChartLegendShape
  /** The colour it is drawn in. A glyph without one takes the ramp's middle. */
  color?: string
}

/** One family of things — a block of the key. */
export interface MapLegendPanelGroup {
  value: string
  title: string
  items: MapLegendPanelItem[]
}

/** An indicator the map can be coloured by — the first block's menu. */
export interface MapLegendPanelMetric {
  value: string
  label: string
  disabled?: boolean
}

/**
 * The map's key (ADR-0226, Felt) — what the map draws, and the reader's hand on
 * it. It **is** `MapPanel` as a key (ADR-0224): `lg` in `compact` density, at
 * its content's height, no rule under « Légende », folding from the end of its
 * line into a `sliders-horizontal` control and cut back out of it (ADR-0225).
 *
 * **One block per family** (`groups`, `PanelBlock`). The **first** carries the
 * indicator when there is one (`metrics`): its title is the indicator's menu —
 * the legend's chip, `v-model:metric` — or the indicator's name when there is
 * one to choose from, and its actions are « À propos » (`metricHelp`, a
 * tooltip) and the eye, which hides the indicator's layer
 * (`v-model:metric-hidden`).
 *
 * **A row is a mark and a word** — the map's own mark (`ChartLegendMark`, the
 * marks `ChartLegend` draws, ADR-0001), no count. Its actions, at its end:
 * « Afficher seulement » (`focus`), pressed while the row is alone in its
 * family, pressed again to bring the family back; and the eye, which hides the
 * row — its glyph and its name turn (`eye` → `eye-off`, « Masquer » →
 * « Afficher »), with no `aria-pressed` (ADR-0151). A hidden row is greyed.
 * One model holds what is hidden: `v-model:hidden`, the rows' values.
 *
 * **The actions show on approach** — the pointer over the row or the block, or
 * the keyboard's focus inside it — with no ground on the row; each button has
 * its own hover. An action that carries a state (a row alone, a row or the
 * indicator hidden) stays. Without hover (a touch screen) they are always
 * there. Rows are 28px; the actions are `IconButton xs`, pulled into the
 * block's padding so the glyphs make one column (ADR-0226).
 */
interface Props {
  title?: string
  groups: MapLegendPanelGroup[]
  /** The indicators the first block chooses between. Absent: the first block is a family like the others. */
  metrics?: MapLegendPanelMetric[]
  /** The indicator shown — `v-model:metric`. */
  metric?: string
  /** What the indicator means — « À propos » shows it. Absent: no « À propos ». */
  metricHelp?: string
  /** The indicator's layer is hidden — `v-model:metric-hidden`. */
  metricHidden?: boolean
  /** The rows hidden, by `value` — `v-model:hidden`. */
  hidden?: string[]
  /** Folded into its control — `v-model:collapsed`. */
  collapsed?: boolean
  soloLabel?: string
  hideLabel?: string
  showLabel?: string
  aboutLabel?: string
  collapseLabel?: string
  expandLabel?: string
  /**
   * `comfortable` (default, ADR-0227) — a key read from a distance and pointed
   * at: 22rem, 16px titles and words, 36px rows, the marks a step up.
   * `compact` — ADR-0226's 18rem key: 14px, 28px rows.
   */
  density?: 'comfortable' | 'compact'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Légende',
  metrics: () => [],
  metric: undefined,
  metricHelp: undefined,
  metricHidden: false,
  hidden: () => [],
  collapsed: false,
  soloLabel: 'Afficher seulement',
  hideLabel: 'Masquer',
  showLabel: 'Afficher',
  aboutLabel: 'À propos de',
  collapseLabel: 'Replier',
  expandLabel: 'Afficher',
  density: 'comfortable',
})

const emit = defineEmits<{
  'update:metric': [value: string]
  'update:metricHidden': [value: boolean]
  'update:hidden': [value: string[]]
  'update:collapsed': [value: boolean]
}>()

const current = computed(() => props.metrics.find((m) => m.value === props.metric) ?? props.metrics[0])
const isHidden = (item: MapLegendPanelItem) => props.hidden.includes(item.value)

/* A row is alone when it shows and every other row of its family is hidden. */
function alone(group: MapLegendPanelGroup, item: MapLegendPanelItem) {
  return !isHidden(item) && group.items.every((o) => o.value === item.value || isHidden(o))
}

/* « Afficher seulement »: the row alone in its family — or, pressed while it
   is, the family back whole. Other families are left as they are. */
function solo(group: MapLegendPanelGroup, item: MapLegendPanelItem) {
  const family = group.items.map((o) => o.value)
  const rest = props.hidden.filter((v) => !family.includes(v))
  emit('update:hidden', alone(group, item) ? rest : [...rest, ...family.filter((v) => v !== item.value)])
}

function toggle(item: MapLegendPanelItem) {
  emit('update:hidden', isHidden(item) ? props.hidden.filter((v) => v !== item.value) : [...props.hidden, item.value])
}
</script>

<template>
  <MapPanel
    class="ds-map-legend-panel"
    :class="`ds-map-legend-panel--${density}`"
    size="lg"
    :density="density"
    fit="content"
    :divided="false"
    :title="title"
    collapsible
    fold-placement="end"
    fold-icon="sliders-horizontal"
    :collapse-label="collapseLabel"
    :expand-label="expandLabel"
    :collapsed="collapsed"
    @update:collapsed="emit('update:collapsed', $event)"
  >
    <PanelBlock
      v-for="(group, g) in groups"
      :key="group.value"
      :title="g === 0 && current ? current.label : group.title"
      class="ds-map-legend-panel__block"
    >
      <!-- The indicator's menu, in place of its title (ADR-0224): the legend's chip. -->
      <template v-if="g === 0 && metrics.length > 1" #title>
        <Dropdown align="start" width="16rem" size="sm" class="ds-map-legend-panel__metric">
          <template #trigger="{ open, toggle: flip }">
            <DropdownTrigger chrome="chip" chevron :open="open" @click="flip">{{ current?.label }}</DropdownTrigger>
          </template>
          <template #default>
            <DropdownItem
              v-for="m in metrics"
              :key="m.value"
              :label="m.label"
              :disabled="m.disabled"
              :selected="m.value === current?.value"
              @click="!m.disabled && emit('update:metric', m.value)"
            />
          </template>
        </Dropdown>
      </template>
      <template v-if="g === 0 && current" #aside>
        <Tooltip v-if="metricHelp" :title="current.label" :supporting-text="metricHelp" placement="top">
          <IconButton icon="info" size="xs" variant="ghost" :ariaLabel="`${aboutLabel} ${current.label}`" />
        </Tooltip>
        <Tooltip :title="`${metricHidden ? showLabel : hideLabel} ${current.label}`" placement="top">
          <IconButton
            :icon="metricHidden ? 'eye-off' : 'eye'"
            size="xs"
            variant="ghost"
            :class="{ 'ds-map-legend-panel__kept': metricHidden }"
            :ariaLabel="`${metricHidden ? showLabel : hideLabel} ${current.label}`"
            @click="emit('update:metricHidden', !metricHidden)"
          />
        </Tooltip>
      </template>

      <ul class="ds-map-legend-panel__rows" :class="{ 'ds-map-legend-panel__rows--off': g === 0 && current && metricHidden }">
        <li
          v-for="item in group.items"
          :key="item.value"
          class="ds-map-legend-panel__row"
          :class="{ 'ds-map-legend-panel__row--hidden': isHidden(item) }"
        >
          <span class="ds-map-legend-panel__mark"><ChartLegendMark
            :shape="item.mark"
            :color="item.color"
            :size="density === 'comfortable' ? 'md' : 'sm'"
            :glyph-size="density === 'comfortable' ? 24 : 20"
          /></span>
          <span class="ds-map-legend-panel__label">{{ item.label }}</span>
          <span class="ds-map-legend-panel__actions">
            <Tooltip v-if="group.items.length > 1" :title="soloLabel" placement="top">
              <IconButton
                icon="focus"
                size="xs"
                variant="ghost"
                :active="alone(group, item)"
                :aria-pressed="alone(group, item)"
                :class="{ 'ds-map-legend-panel__kept': alone(group, item) }"
                :ariaLabel="`${soloLabel} ${item.label}`"
                @click="solo(group, item)"
              />
            </Tooltip>
            <Tooltip :title="isHidden(item) ? showLabel : hideLabel" placement="top">
              <IconButton
                :icon="isHidden(item) ? 'eye-off' : 'eye'"
                size="xs"
                variant="ghost"
                :class="{ 'ds-map-legend-panel__kept': isHidden(item) }"
                :ariaLabel="`${isHidden(item) ? showLabel : hideLabel} ${item.label}`"
                @click="toggle(item)"
              />
            </Tooltip>
          </span>
        </li>
      </ul>
    </PanelBlock>
  </MapPanel>
</template>

<style scoped>
/*
  Comfortable (ADR-0227): rows of 36 — 32px actions fit without pushing — the
  word at `label-lg` (16), the mark in a 24px box (a glyph a step up), the
  indicator's chip at the blocks' titles' 16.
*/
.ds-map-legend-panel--comfortable .ds-map-legend-panel__row {
  min-height: 2.25rem;
}

.ds-map-legend-panel--comfortable .ds-map-legend-panel__mark {
  width: 1.5rem;
}

.ds-map-legend-panel--comfortable .ds-map-legend-panel__label {
  font: var(--ds-font-label-lg);
}

.ds-map-legend-panel--comfortable .ds-map-legend-panel__actions {
  margin-block: calc((2.25rem - 32px) / 2);
}

.ds-map-legend-panel--comfortable .ds-map-legend-panel__metric :deep(.ds-dropdown-trigger) {
  font: var(--ds-font-label-lg-strong);
}

/* The indicator's chip: its word on the blocks' titles' edge, its ground
   lent to the padding — the chip's own inline start (`control-padding-xs`, 10). */
.ds-map-legend-panel__metric {
  margin-inline-start: -10px;
}

.ds-map-legend-panel__rows {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* A row: 28px, a mark in a 20px box (a glyph's), the word, the actions —
   pulled into the block's padding by the glyph's inset, the column the block's
   own actions stand in (ADR-0226). No ground. */
.ds-map-legend-panel__row {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-height: 1.75rem;
  min-width: 0;
}

.ds-map-legend-panel__mark {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 20px;
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-map-legend-panel__label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  font: var(--ds-font-label-md);
  color: var(--ds-text-default);
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-map-legend-panel__actions {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--ds-spacing-xxs);
  margin-block: calc((1.75rem - 32px) / 2);
  margin-inline-end: calc(-1 * var(--ds-spacing-md));
}

/* A hidden row, or the indicator's rows while its layer is hidden: greyed. */
.ds-map-legend-panel__row--hidden .ds-map-legend-panel__mark,
.ds-map-legend-panel__rows--off .ds-map-legend-panel__mark {
  opacity: 0.4;
}

.ds-map-legend-panel__row--hidden .ds-map-legend-panel__label,
.ds-map-legend-panel__rows--off .ds-map-legend-panel__label {
  color: var(--ds-text-disabled);
}

/*
  On approach (ADR-0226, ADR-0111's motion): a row's actions with the pointer
  over the row or the keyboard's focus in it, the block's with the pointer
  over the block or the focus in it — opacity alone, over `quick`. An action
  that carries a state stays. Still in the tab order, so the keyboard finds
  them; always there without hover.
*/
@media (hover: hover) {
  .ds-map-legend-panel__actions :deep(.ds-icon-button:not(.ds-map-legend-panel__kept)),
  .ds-map-legend-panel__block :deep(.ds-section-card__actions .ds-icon-button:not(.ds-map-legend-panel__kept)) {
    opacity: 0;
    transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
  }

  .ds-map-legend-panel__row:is(:hover, :has(:focus-visible)) .ds-map-legend-panel__actions :deep(.ds-icon-button),
  .ds-map-legend-panel__block:is(:hover, :has(.ds-section-card__actions :focus-visible)) :deep(.ds-section-card__actions .ds-icon-button) {
    opacity: 1;
  }
}
</style>
