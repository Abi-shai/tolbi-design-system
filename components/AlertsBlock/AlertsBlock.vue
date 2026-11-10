<script setup lang="ts">
import { computed } from 'vue'
import { Badge, type BadgeTone } from '../Badge'
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
 * - **Three lines at most.** Past three, « Tout voir (n) » **unfolds the block
 *   in place** and its words turn to « Réduire », which folds it — one button
 *   (the owner, amending the first cut's second button). A press anywhere else
 *   on the block unfolds it too. `v-model:expanded`. Three or fewer: no
 *   button, nothing to unfold.
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

const emit = defineEmits<{ select: [item: AlertsBlockItem] }>()
const expanded = defineModel<boolean>('expanded', { default: false })

const TONE: Record<AlertsBlockSeverity, BadgeTone> = { blocking: 'error', watch: 'warning', review: 'neutral' }

const blocking = computed(() => props.followUps.length > 0 && props.alerts.length > 0)
/* More than the limit: the only case with something to see all of, or to unfold. */
const more = computed(() => !blocking.value && props.alerts.length > props.limit)
/* Blocking, its line alone; otherwise every alert — `PanelBlock`'s `limit` holds
   the first ones and unfolds the rest (ADR-0148: the behaviour is the block's). */
const shown = computed(() => (blocking.value ? props.alerts.slice(0, 1) : props.alerts))
const steps = computed(() => (blocking.value ? props.followUps.slice(0, 3) : []))
const count = computed(() => (blocking.value ? 1 : props.alerts.length))

/* A press on the block itself — not on a line, not on the button — unfolds it.
   The keyboard has the button. */
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
    :class="{ 'ds-alerts-block--unfolds': more && !expanded }"
    @click="onBlock"
  >
    <PanelBlock
      v-model:expanded="expanded"
      :title="title"
      :help="help"
      :limit="blocking ? undefined : limit"
      :see-all-label="seeAllLabel"
      :collapse-label="collapseLabel"
    >
      <template #aside><Badge :label="String(count)" tone="error" size="sm" /></template>
      <OptionCard
        v-for="a in shown"
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
    </PanelBlock>
  </div>
</template>

<style scoped>
.ds-alerts-block--unfolds {
  cursor: pointer;
}

/* Its 40px rows sit 6 apart (ADR-0143) — `PanelBlock`'s list gap, switched. */
.ds-alerts-block {
  --panel-block-list-gap: var(--ds-spacing-sm);
}
</style>
