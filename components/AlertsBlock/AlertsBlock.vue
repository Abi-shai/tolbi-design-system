<script setup lang="ts">
import { computed, useId } from 'vue'
import { Badge, type BadgeTone } from '../Badge'
import { Button } from '../Button'
import type { IconName } from '../Icon'
import { OptionCard } from '../OptionCard'
import { PanelBlock } from '../PanelBlock'

/** Bloque · À surveiller · À revoir — the badge's word and tone; the map's outline (`--ds-chart-status-*`). */
export type AlertsBlockSeverity = 'blocking' | 'watch' | 'review'

/**
 * One alert, or one next step after a blocking alert. The object the line is
 * about travels with it: `select` hands the whole item back, and the product
 * decides — the map and its sheet, or the data window.
 */
export interface AlertsBlockItem {
  id: string | number
  /** « code · objet » — « C1 · FPH-SBR-005 », « K2 · Projet ». */
  label: string
  /** The alert's kind — terrain, mesure, méthode — as a glyph. */
  icon?: IconName
  /** Absent on a next step: it has no gravity of its own. */
  severity?: AlertsBlockSeverity
  /** At the line's end — the delay, a figure: « sous 15 j », « |Z| 1,4 ». */
  meta?: string
  [key: string]: unknown
}

/**
 * The alerts of a project, in its panel (ADR-0143, the owner's « Couche
 * Alertes » `4037:5437`, decided): a `PanelBlock` titled « Alertes » with its
 * count, then the alerts as **one-line rows** — `OptionCard density="row"`:
 * the kind's glyph, « code · objet », the severity's badge, the delay, a
 * chevron, because each line leads somewhere (`select`).
 *
 * - **Three lines at most.** Past three, « Tout voir (n) » (`see-all`) — the
 *   data window's alerts tab, the product's — and a press **anywhere else on
 *   the block** unfolds it in place to show them all; « Réduire » folds it.
 *   `v-model:expanded`. Three or fewer: no link, nothing to unfold.
 * - **An alert that blocks** (`followUps`): its line alone at the head, then
 *   its next steps — one to three lines without gravity — and no « Tout
 *   voir »: what follows a blocking result is what to do, not more alerts.
 * - **No alert, no block**: nothing is rendered — no empty state.
 */
interface Props {
  alerts: AlertsBlockItem[]
  /** The next steps after a blocking alert — the first of `alerts` is then the one shown. */
  followUps?: AlertsBlockItem[]
  title?: string
  /** What « alerte » means here — a `HelpIcon` beside the title. */
  help?: string
  /** The lines shown before « Tout voir ». */
  limit?: number
  seeAllLabel?: string
  collapseLabel?: string
  /** The badge's words. */
  severityLabels?: Record<AlertsBlockSeverity, string>
}

const props = withDefaults(defineProps<Props>(), {
  followUps: () => [],
  title: 'Alertes',
  help: undefined,
  limit: 3,
  seeAllLabel: 'Tout voir',
  collapseLabel: 'Réduire',
  severityLabels: () => ({ blocking: 'Bloque', watch: 'À surveiller', review: 'À revoir' }),
})

const emit = defineEmits<{ select: [item: AlertsBlockItem]; 'see-all': [] }>()
const expanded = defineModel<boolean>('expanded', { default: false })

const TONE: Record<AlertsBlockSeverity, BadgeTone> = { blocking: 'error', watch: 'warning', review: 'neutral' }

const blocking = computed(() => props.followUps.length > 0 && props.alerts.length > 0)
/* More than the limit: the only case with something to see all of, or to unfold. */
const more = computed(() => !blocking.value && props.alerts.length > props.limit)
const head = computed(() => (blocking.value ? props.alerts.slice(0, 1) : props.alerts.slice(0, props.limit)))
const rest = computed(() => (more.value ? props.alerts.slice(props.limit) : []))
const steps = computed(() => (blocking.value ? props.followUps.slice(0, 3) : []))
const open = computed(() => more.value && expanded.value)
const count = computed(() => (blocking.value ? 1 : props.alerts.length))
const restId = `ds-alerts-block-rest-${useId()}`

/* A press on the block itself — not on a line, not on a link — unfolds it. The
   keyboard has « Tout voir », which reaches every alert in the data window. */
function onBlock(e: MouseEvent) {
  if (!more.value || expanded.value) return
  if ((e.target as Element | null)?.closest('button, a, .ds-option-card')) return
  expanded.value = true
}
</script>

<template>
  <div
    v-if="alerts.length"
    class="ds-alerts-block"
    :class="{ 'ds-alerts-block--unfolds': more && !expanded, 'ds-alerts-block--open': open }"
    @click="onBlock"
  >
    <PanelBlock :title="title" :help="help">
      <template #aside><Badge :label="String(count)" tone="error" size="sm" /></template>
      <div class="ds-alerts-block__rows">
        <OptionCard
          v-for="a in head"
          :key="a.id"
          density="row"
          :icon="a.icon"
          :label="a.label"
          :meta="a.meta"
          :badge="a.severity ? severityLabels[a.severity] : undefined"
          :badge-tone="a.severity ? TONE[a.severity] : undefined"
          @click="emit('select', a)"
        />
        <OptionCard
          v-for="s in steps"
          :key="`step-${s.id}`"
          density="row"
          :icon="s.icon"
          :label="s.label"
          :meta="s.meta"
          @click="emit('select', s)"
        />
        <!-- The rest opens its own space (ADR-0025), and leaves the reader's way once closed. -->
        <div v-if="rest.length" :id="restId" class="ds-alerts-block__rest">
          <div class="ds-alerts-block__rest-inner">
            <OptionCard
              v-for="a in rest"
              :key="a.id"
              density="row"
              :icon="a.icon"
              :label="a.label"
              :meta="a.meta"
              :badge="a.severity ? severityLabels[a.severity] : undefined"
              :badge-tone="a.severity ? TONE[a.severity] : undefined"
              @click="emit('select', a)"
            />
          </div>
        </div>
      </div>
      <div v-if="more" class="ds-alerts-block__foot">
        <Button variant="link" size="xs" icon-trailing="chevron-right" :label="`${seeAllLabel} (${alerts.length})`" @click="emit('see-all')" />
        <Button
          v-if="expanded"
          variant="link"
          size="xs"
          :label="collapseLabel"
          :aria-controls="restId"
          aria-expanded="true"
          class="ds-alerts-block__collapse"
          @click="expanded = false"
        />
      </div>
    </PanelBlock>
  </div>
</template>

<style scoped>
.ds-alerts-block--unfolds {
  cursor: pointer;
}

.ds-alerts-block__rows {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
}

/*
  The rows past the limit: ADR-0025's `0fr → 1fr` on the element that
  transitions. In over `enter`, the block making room; out over `exit`. Hidden
  from a reader once closed. The 6px between rows is the rows' own gap, carried
  inside, so a closed rest leaves none.
*/
.ds-alerts-block__rest {
  display: grid;
  grid-template-rows: 0fr;
  margin-top: calc(-1 * var(--ds-spacing-sm));
  visibility: hidden;
  transition:
    grid-template-rows var(--ds-motion-duration-exit) var(--ds-motion-easing-in),
    visibility 0s linear var(--ds-motion-duration-exit);
}

.ds-alerts-block--open .ds-alerts-block__rest {
  grid-template-rows: 1fr;
  visibility: visible;
  transition:
    grid-template-rows var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    visibility 0s;
}

.ds-alerts-block__rest-inner {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
  min-height: 0;
  padding-top: var(--ds-spacing-sm);
  overflow: hidden;
}

.ds-alerts-block__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
}
</style>
