<script setup lang="ts">
import { computed } from 'vue'
import { Badge, type BadgeTone, type BadgeVariant } from '../Badge'
import type { IconName } from '../Icon'
import { ModuleIcon, type ModuleName } from '../ModuleIcon'

/**
 * One module's harvested data, on one row of the home page's dark band
 * (`ModuleBanner`) — **the band of 14 September, compact** (ADR-0202, variant
 * N2): it reads left to right as **which module · how much · made of what ·
 * where it stands**, about 56px high.
 *
 * - **The module**: its drawing on a 40px tile, then the module's name over the
 *   row's name, in a column that **hugs its words up to 15rem** (ADR-0203), past
 *   which they are cut.
 * - **How much**: the figure (`heading-lg`, tabular) and its unit just after it
 *   on the baseline; under it **one** line of context, when it says something
 *   the figure does not (« 2 316 parcelles · 4 120 ha »).
 * - **Made of what** (Scan, Source): a segmented bar, 8px, and its legend.
 * - **Where it stands**: on one line, the date or the freshness then the status
 *   badge (ADR-0203); the date alone without a status.
 *
 * **It is dark whatever the page** — the band is dark on the light home — and
 * **neutral, never green-grey**: its grounds, rules and inks are its own
 * `gray-light` primitives (ADR-0010's categorical clause, as `MapPin`'s, named
 * suppressions), and it carries `data-theme="dark"` so what it renders (its
 * `Badge`) takes its dark tones. The capsule is **darker than its band**,
 * hollowed into it (900 in 800) — the reverse of ADR-0048.
 *
 * The props of the first form still work, so a product passing them needs no
 * change: `signals` become the context line — or the spread when they are
 * shares (« Arachide 58 % ») — and `progress` becomes the spread. `context` and
 * `spread` say it directly. `valueBadge`, `attribute`, the delta's glyph and the
 * unit's placement and style are no longer drawn (ADR-0202).
 */
export type CapsuleTone = 'success' | 'error' | 'warning' | 'neutral'

export interface CapsuleBadge {
  label: string
  tone?: BadgeTone
  variant?: BadgeVariant
  icon?: IconName
}

export interface CapsuleSignal {
  icon: IconName
  label: string
  tone?: CapsuleTone
}

export interface CapsuleDelta {
  icon?: IconName
  value?: string
  comparison: string
  tone?: CapsuleTone
}

export interface CapsuleAttribute {
  label: string
  badge?: CapsuleBadge
}

export interface CapsuleProgress {
  label: string
  /** 0–100. */
  value: number
  context?: string
  badge?: CapsuleBadge
  delta?: CapsuleDelta
}

/** One part of a spread: its name and its share, 0–100. */
export interface CapsuleSpreadPart {
  label: string
  value: number
}

interface Props {
  module?: ModuleName
  /** The module's name as shown. Defaults to `module`. */
  moduleLabel?: string
  /** What this row is about — « Cacao Démo SA ». */
  title: string
  /** Where it stands — « Terminé ». Drawn at the capsule's end, over the date. */
  status?: CapsuleBadge
  /** The hero figure. */
  value?: string | number
  /** What the figure counts — « producteurs ». */
  unit?: string
  /** The one line under the figure — « 2 316 parcelles · 4 120 ha ». Absent: made from `signals` or the delta. */
  context?: string
  /** Made of what — the parts of a spread, biggest first. Absent: made from share `signals` or `progress`. */
  spread?: CapsuleSpreadPart[]
  /** « 2026 », « Mis à jour hier ». */
  freshness?: string
  /** @deprecated Not drawn since ADR-0202. */
  attribute?: CapsuleAttribute
  /** @deprecated Not drawn since ADR-0202: the unit sits after the figure. */
  unitPlacement?: 'inline' | 'below'
  /** @deprecated Not drawn since ADR-0202. */
  unitStyle?: 'text' | 'symbol'
  /** @deprecated Not drawn since ADR-0202. */
  valueBadge?: CapsuleBadge
  /** The context line when nothing else gives one: its figure and its comparison. */
  delta?: CapsuleDelta
  /** Drawn as a spread of one part: its share, the rest grey. */
  progress?: CapsuleProgress
  /** Their labels make the context line, or the spread when they are shares. */
  signals?: CapsuleSignal[]
}

const props = withDefaults(defineProps<Props>(), {
  module: 'Data',
  moduleLabel: undefined,
  status: undefined,
  value: undefined,
  unit: undefined,
  context: undefined,
  spread: undefined,
  freshness: undefined,
  attribute: undefined,
  unitPlacement: 'inline',
  unitStyle: 'text',
  valueBadge: undefined,
  delta: undefined,
  progress: undefined,
  signals: () => [],
})

/* A signal that is a share — « Arachide 58 % » — and its number. */
const SHARE = /^(.*?)\s*(\d+(?:[.,]\d+)?)\s*%$/
const shares = computed(() => {
  if (!props.signals.length) return null
  const parts = props.signals.map((s) => SHARE.exec(s.label.trim()))
  if (parts.some((p) => !p)) return null
  return parts.map((p, i) => ({ label: props.signals[i].label, value: Number(p![2].replace(',', '.')) }))
})

const spreadParts = computed<CapsuleSpreadPart[] | null>(() => {
  if (props.spread?.length) return props.spread
  if (shares.value) return shares.value
  if (props.progress) return [{ label: `${props.progress.label} ${Math.round(props.progress.value)} %`, value: props.progress.value }]
  return null
})

/* The legend: the spread's own words, « Arachide 58 % · Mil 27 % ». */
const legend = computed(() =>
  (spreadParts.value ?? [])
    .map((p) => (SHARE.test(p.label) ? p.label : `${p.label} ${Math.round(p.value)} %`))
    .join(' · '),
)

/* The bar's segments, in their order, and the rest of the hundred in grey. */
const segments = computed(() => {
  const parts = (spreadParts.value ?? []).map((p) => Math.max(0, p.value))
  const rest = Math.max(0, 100 - parts.reduce((a, b) => a + b, 0))
  return [...parts.map((v, i) => ({ value: v, kind: i === 0 ? 'lead' : 'part' })), ...(rest > 0.5 ? [{ value: rest, kind: 'rest' }] : [])]
})

const contextLine = computed(() => {
  if (props.context) return props.context
  if (props.signals.length && !shares.value) return props.signals.map((s) => s.label).join(' · ')
  if (props.delta) return [props.delta.value, props.delta.comparison].filter(Boolean).join(' ')
  return undefined
})
</script>

<template>
  <article class="ds-module-capsule" data-theme="dark" :aria-label="title">
    <!-- The illustration, the primitive (ADR-0005): the capsule frames it, on its own tile. -->
    <div class="ds-module-capsule__tile">
      <ModuleIcon :module="module" variant="illustration" :size="28" :aria-label="null" />
    </div>

    <div class="ds-module-capsule__identity">
      <span class="ds-module-capsule__module">{{ moduleLabel ?? module }}</span>
      <p class="ds-module-capsule__title">{{ title }}</p>
    </div>

    <template v-if="value !== undefined">
      <div class="ds-module-capsule__rule" aria-hidden="true" />
      <div class="ds-module-capsule__hero">
        <p class="ds-module-capsule__figure">
          <span class="ds-module-capsule__value">{{ value }}</span>
          <span v-if="unit" class="ds-module-capsule__unit">{{ unit }}</span>
        </p>
        <p v-if="contextLine" class="ds-module-capsule__context">{{ contextLine }}</p>
      </div>
    </template>

    <div v-if="spreadParts" class="ds-module-capsule__spread">
      <div class="ds-module-capsule__bar" aria-hidden="true">
        <span
          v-for="(s, i) in segments"
          :key="i"
          :class="['ds-module-capsule__segment', `ds-module-capsule__segment--${s.kind}`]"
          :style="{ flexGrow: s.value }"
        />
      </div>
      <p class="ds-module-capsule__legend">{{ legend }}</p>
    </div>

    <div v-if="status || freshness" class="ds-module-capsule__end">
      <p v-if="freshness" class="ds-module-capsule__freshness">{{ freshness }}</p>
      <Badge
        v-if="status"
        :label="status.label"
        :tone="status.tone ?? 'success'"
        :variant="status.variant ?? 'pill-outline'"
        size="sm"
      />
    </div>
  </article>
</template>

<style scoped>
/*
  The band's palette (ADR-0202): neutral greys, dark on any page, its own and
  not the app's dark mode (which is green-grey, ADR-0029).
*/
.ds-module-capsule {
  /* token-lint-disable-next-line no-raw-primitive — the band is dark on any page, its own neutral palette (ADR-0202) */
  --capsule-ground: var(--ds-color-gray-light-900);
  /* token-lint-disable-next-line no-raw-primitive — the band is dark on any page, its own neutral palette (ADR-0202) */
  --capsule-tile: var(--ds-color-gray-light-800);
  /* token-lint-disable-next-line no-raw-primitive — the band is dark on any page, its own neutral palette (ADR-0202) */
  --capsule-rule: var(--ds-color-gray-light-700);
  /* token-lint-disable-next-line no-raw-primitive — the band is dark on any page, its own neutral palette (ADR-0202) */
  --capsule-strong: var(--ds-color-gray-light-100);
  /* token-lint-disable-next-line no-raw-primitive — the band is dark on any page, its own neutral palette (ADR-0202) */
  --capsule-subtle: var(--ds-color-gray-light-400);
  /* token-lint-disable-next-line no-raw-primitive — the spread's lead part, the band's own green (ADR-0202) */
  --capsule-lead: var(--ds-color-success-500);
  /* token-lint-disable-next-line no-raw-primitive — the spread's other parts, the band's own green (ADR-0202) */
  --capsule-part: var(--ds-color-success-800);

  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  width: fit-content;
  max-width: 100%;
  box-sizing: border-box;
  padding: var(--ds-spacing-sm) var(--ds-spacing-lg);
  border-radius: var(--ds-radius-control);
  background-color: var(--capsule-ground);
  color: var(--capsule-strong);
  overflow: hidden;
}

/* A 40px tile, the drawing at 28 in it — it no longer takes the row's height. */
.ds-module-capsule__tile {
  flex: none;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--ds-radius-control);
  background-color: var(--capsule-tile);
}

/* Hugs its words up to 15rem, past which they are cut (ADR-0203): a fixed 170
   left a gap after a short name and cut five names of seven. The marquee does
   not need one width — its two runs are the same capsules, so they match. */
.ds-module-capsule__identity {
  flex: none;
  display: flex;
  flex-direction: column;
  max-width: 15rem;
  min-width: 0;
}

.ds-module-capsule__module {
  overflow: hidden;
  font: var(--ds-font-label-md);
  color: var(--capsule-subtle);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ds-module-capsule__title {
  margin: 0;
  overflow: hidden;
  font: var(--ds-font-label-lg-strong);
  color: var(--capsule-strong);
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* A rule 40px high, the tile's: it divides the row, it encloses nothing. */
.ds-module-capsule__rule {
  flex: none;
  width: var(--ds-border-width-default);
  height: 40px;
  background-color: var(--capsule-rule);
}

.ds-module-capsule__hero {
  flex: none;
  display: flex;
  flex-direction: column;
}

/* The figure and its unit on one baseline. */
.ds-module-capsule__figure {
  display: flex;
  align-items: baseline;
  gap: var(--ds-spacing-xs);
  margin: 0;
  white-space: nowrap;
}

.ds-module-capsule__value {
  font: var(--ds-font-heading-lg);
  font-variant-numeric: tabular-nums;
  color: var(--capsule-strong);
}

.ds-module-capsule__unit {
  font: var(--ds-font-label-md);
  color: var(--capsule-subtle);
}

.ds-module-capsule__context {
  margin: 0;
  font: var(--ds-font-body-sm);
  font-variant-numeric: tabular-nums;
  color: var(--capsule-subtle);
  white-space: nowrap;
}

/* Made of what: an 8px bar of rounded parts, 2px apart, its legend under it. */
.ds-module-capsule__spread {
  flex: none;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-sm);
}

/* A scale, so one length on every capsule: two spreads read against one ruler. */
.ds-module-capsule__bar {
  display: flex;
  gap: var(--ds-spacing-xxs);
  width: 8.5rem;
  height: 8px;
}

.ds-module-capsule__segment {
  flex-basis: 0;
  min-width: 4px;
  border-radius: var(--ds-radius-pill);
}

.ds-module-capsule__segment--lead { background-color: var(--capsule-lead); }
.ds-module-capsule__segment--part { background-color: var(--capsule-part); }
.ds-module-capsule__segment--rest { background-color: var(--capsule-rule); }

.ds-module-capsule__legend {
  max-width: 14rem;
  margin: 0;
  overflow: hidden;
  font: var(--ds-font-label-md);
  font-variant-numeric: tabular-nums;
  color: var(--capsule-strong);
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Where it stands, on one line (ADR-0203): the date first, the status after it. */
.ds-module-capsule__end {
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
}

.ds-module-capsule__freshness {
  margin: 0;
  font: var(--ds-font-label-md);
  color: var(--capsule-subtle);
  white-space: nowrap;
}
</style>
