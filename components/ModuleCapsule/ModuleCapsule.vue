<script setup lang="ts">
import { Badge, type BadgeTone, type BadgeVariant } from '../Badge'
import { Icon, type IconName } from '../Icon'
import { ModuleIcon, type ModuleName } from '../ModuleIcon'
import { ProgressBar } from '../ProgressBar'

/**
 * One module's harvested data, on one row — Figma *Sprint 18* `1308:5261`
 * (`Bandeau/Capsule`).
 *
 * The capsule reads left to right as four questions: **which module**, **what is
 * this**, **how much**, and **made of what**. The rules between them are
 * separators, not borders — they divide the row, they do not enclose anything.
 *
 * It is the first surface designed against the dark mode (ADR-0029) rather than
 * ported into it, which is why every value here is a semantic token and none is
 * a literal: `bg-neutral-subtle` for the tile, `text-subtlest` for the labels
 * that recede, `border-default` for the rules.
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
  /**
   * Colours the figure. `warning` is Figma's "sous le seuil" — a measure that
   * has crossed its threshold says so in its own colour, not only in its value.
   */
  tone?: CapsuleTone
}

/**
 * The reading against a previous one. Figma's `Comparaison` axis: *hausse*,
 * *baisse*, or *aucune* — the last showing only the date, which is why both the
 * glyph and the figure are optional and the comparison is not.
 */
export interface CapsuleDelta {
  /** `trending-up` for a rise, `trending-down` for a fall. */
  icon?: IconName
  /** "12 %". */
  value?: string
  /** "comparé au 08 septembre 2025". */
  comparison: string
  tone?: CapsuleTone
}

/** The second identity line — an attribute of the thing, not its status. */
export interface CapsuleAttribute {
  label: string
  badge?: CapsuleBadge
}

export interface CapsuleProgress {
  /** The stage this sits at — "Progression de la traçabilité". */
  label: string
  /** 0–100. */
  value: number
  /** The line under the bar, explaining what the percentage is *of*. */
  context?: string
  badge?: CapsuleBadge
  delta?: CapsuleDelta
}

interface Props {
  module?: ModuleName
  /** The module's name as shown. Defaults to `module`. */
  moduleLabel?: string
  /** What this row is about — "Recensement ménages — Kaolack". */
  title: string
  /** The badge beside the module name: where the collection has got to. */
  status?: CapsuleBadge
  /** The third identity line — "Culture · Mil, contre saison froide". */
  attribute?: CapsuleAttribute
  /** The hero figure. */
  value?: string | number
  /** What the figure counts — "enregistrements". */
  unit?: string
  /**
   * `inline` sets the unit beside the figure, `below` under it. Figma carries
   * both: a unit wider than its own figure reads better stacked, and four of the
   * six capsules are inline.
   */
  unitPlacement?: 'inline' | 'below'
  /**
   * `text` sets the unit in body copy (“enregistrements”), `symbol` in the
   * compact semibold Figma gives a unit that is a symbol rather than a word
   * (“t/ha”, “°C”).
   */
  unitStyle?: 'text' | 'symbol'
  /** The badge beside the hero figure — a second reading of the same number. */
  valueBadge?: CapsuleBadge
  /** The line under the figure: how it moved since the last reading. */
  delta?: CapsuleDelta
  progress?: CapsuleProgress
  /** A glyph over a figure — up to two in the reduced capsules, three in the full one. */
  signals?: CapsuleSignal[]
  /** "Mise à jour il y a 2 h". */
  freshness?: string
}

const props = withDefaults(defineProps<Props>(), {
  module: 'Data',
  moduleLabel: undefined,
  status: undefined,
  attribute: undefined,
  value: undefined,
  unit: undefined,
  unitPlacement: 'inline',
  unitStyle: 'text',
  valueBadge: undefined,
  delta: undefined,
  progress: undefined,
  signals: () => [],
  freshness: undefined,
})

/**
 * Figma binds a delta figure to `text-on-{tone}-subtle`, not `text-{tone}`.
 * In dark the two resolve to the SAME step, so this is exact; in light it is the
 * legible one — `text-success` is 3.91:1 on `bg-default` and `text-warning`
 * 3.49:1, the pre-existing failure ADR-0030 left open.
 */
const toneClass = (tone: CapsuleTone = 'success') => `ds-module-capsule--on-${tone}`
</script>

<template>
  <article class="ds-module-capsule" :aria-label="title">
    <!-- ADR-0005: the illustration is the primitive — the artwork with no tile
         of its own — and it is the right one here precisely because the capsule
         frames it. The tile is bg-neutral-subtle, a surface of this component. -->
    <div class="ds-module-capsule__tile">
      <ModuleIcon :module="module" variant="illustration" :size="44" :aria-label="null" />
    </div>

    <div class="ds-module-capsule__identity">
      <div class="ds-module-capsule__identity-row">
        <span class="ds-module-capsule__module">{{ moduleLabel ?? module }}</span>
        <Badge
          v-if="status"
          :label="status.label"
          :tone="status.tone ?? 'neutral'"
          :variant="status.variant ?? 'pill-color'"
          size="sm"
        />
      </div>
      <p class="ds-module-capsule__title">{{ title }}</p>
      <div v-if="attribute" class="ds-module-capsule__attribute">
        <span class="ds-module-capsule__attribute-label">{{ attribute.label }}</span>
        <Badge
          v-if="attribute.badge"
          :label="attribute.badge.label"
          :tone="attribute.badge.tone ?? 'neutral'"
          :variant="attribute.badge.variant ?? 'pill-outline'"
          size="sm"
        />
      </div>
    </div>

    <div v-if="value !== undefined" class="ds-module-capsule__rule" aria-hidden="true" />

    <div
      v-if="value !== undefined"
      :class="['ds-module-capsule__hero', delta && 'ds-module-capsule__hero--wide']"
    >
      <div class="ds-module-capsule__hero-row">
        <div :class="['ds-module-capsule__figure', `ds-module-capsule__figure--${unitPlacement}`]">
          <span class="ds-module-capsule__value">{{ value }}</span>
          <span
            v-if="unit"
            :class="['ds-module-capsule__unit', `ds-module-capsule__unit--${unitStyle}`]"
          >{{ unit }}</span>
        </div>
        <Badge
          v-if="valueBadge"
          :label="valueBadge.label"
          :tone="valueBadge.tone ?? 'success'"
          :variant="valueBadge.variant ?? 'pill-outline'"
          :icon="valueBadge.icon"
          size="sm"
        />
      </div>

      <div v-if="delta" class="ds-module-capsule__delta">
        <Icon v-if="delta.icon" :name="delta.icon" :size="16" :class="toneClass(delta.tone)" />
        <span v-if="delta.value" :class="['ds-module-capsule__delta-value', toneClass(delta.tone)]">
          {{ delta.value }}
        </span>
        <span class="ds-module-capsule__delta-comparison">{{ delta.comparison }}</span>
      </div>
    </div>

    <div v-if="progress" class="ds-module-capsule__rule" aria-hidden="true" />

    <div v-if="progress" class="ds-module-capsule__progress">
      <div class="ds-module-capsule__stage">
        <p class="ds-module-capsule__stage-label">{{ progress.label }}</p>
        <Badge
          v-if="progress.badge"
          :label="progress.badge.label"
          :tone="progress.badge.tone ?? 'success'"
          :variant="progress.badge.variant ?? 'pill-outline'"
          size="sm"
        />
      </div>
      <ProgressBar :value="progress.value" label="none" />
      <p v-if="progress.context" class="ds-module-capsule__context">{{ progress.context }}</p>
      <div v-if="progress.delta" class="ds-module-capsule__delta">
        <Icon
          v-if="progress.delta.icon"
          :name="progress.delta.icon"
          :size="16"
          :class="toneClass(progress.delta.tone)"
        />
        <span
          v-if="progress.delta.value"
          :class="['ds-module-capsule__delta-value', toneClass(progress.delta.tone)]"
        >{{ progress.delta.value }}</span>
        <span class="ds-module-capsule__delta-comparison">{{ progress.delta.comparison }}</span>
      </div>
    </div>

    <div v-if="signals.length || freshness" class="ds-module-capsule__rule" aria-hidden="true" />

    <div v-if="signals.length || freshness" class="ds-module-capsule__composition">
      <div v-if="signals.length" class="ds-module-capsule__signals">
        <div v-for="signal in signals" :key="signal.label" class="ds-module-capsule__signal">
          <Icon :name="signal.icon" :size="20" />
          <span :class="['ds-module-capsule__signal-label', signal.tone && toneClass(signal.tone)]">
            {{ signal.label }}
          </span>
        </div>
      </div>
      <p v-if="freshness" class="ds-module-capsule__freshness">{{ freshness }}</p>
    </div>
  </article>
</template>

<style scoped>
/* The capsule is 90px tall and its content band is 74px — the 90 less the 8px
   padding twice. Every column centres inside that band and the rules span it,
   which is why the number is named once here rather than repeated six times.
   token-lint-disable no-literal-dimension-js — a derived geometry, not a scale value */
.ds-module-capsule {
  --capsule-band: 74px;
  --capsule-tile: 64px;

  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  /* Hugs, as every capsule in Figma does — the columns are fixed or content-sized,
     so a stretched box would just trail empty ground. A full-bleed banner is a
     caller's decision: set `width: 100%` on the instance. */
  width: fit-content;
  max-width: 100%;
  padding: var(--ds-spacing-md) var(--ds-spacing-lg);
  background-color: var(--ds-bg-default);
  border-radius: var(--ds-radius-control);
  overflow: hidden;
}

/* ── The module ───────────────────────────────────────────────────── */
.ds-module-capsule__tile {
  flex: none;
  width: var(--capsule-tile);
  height: var(--capsule-tile);
  display: grid;
  place-items: center;
  background-color: var(--ds-bg-neutral-subtle);
  border-radius: var(--ds-radius-surface);
  overflow: hidden;
}

/* ── Identity ─────────────────────────────────────────────────────── */
/* Figma draws this column at a fixed 260px, and that is a CEILING here, not a
   size. Measured across the seven capsules, a fixed width left 343px of empty
   ground in the row — 93px of it in one capsule, whose title is "Périmètre de
   Podor" and needs 167. The cap still has to hold: "Recensement ménages —
   Kaolack" wants 282 and truncates at 260, which is what Figma shows too. So the
   column hugs its content and stops at the width the design drew. */
.ds-module-capsule__identity {
  flex: none;
  max-width: 260px;
  height: var(--capsule-band);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--ds-spacing-xs);
  overflow: hidden;
}

/* Baseline-aligned rather than centred: the badge is 20px and the name's line
   box is 20px, so `flex-end` is what puts them on the same line in Figma. */
.ds-module-capsule__identity-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  width: 100%;
}

.ds-module-capsule__module {
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtlest);
  white-space: nowrap;
}

.ds-module-capsule__title {
  margin: 0;
  font: var(--ds-font-label-xl-strong);
  color: var(--ds-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* The third identity line. `label-lg` rather than the first line's `body-md`:
   an attribute is stated, a module name is just named. */
.ds-module-capsule__attribute {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  width: 100%;
}

.ds-module-capsule__attribute-label {
  font: var(--ds-font-label-lg);
  color: var(--ds-text-subtlest);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── The rules between sections ───────────────────────────────────── */
.ds-module-capsule__rule {
  flex: none;
  width: var(--ds-border-width-default);
  height: var(--capsule-band);
  background-color: var(--ds-border-default);
}

/* ── The hero figure ──────────────────────────────────────────────── */
.ds-module-capsule__hero {
  flex: none;
  height: var(--capsule-band);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--ds-spacing-xs);
  overflow: hidden;
}

.ds-module-capsule__hero-row {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
}

.ds-module-capsule__figure {
  display: flex;
  gap: var(--ds-spacing-xs);
  white-space: nowrap;
}

.ds-module-capsule__figure--inline {
  flex-direction: row;
  align-items: center;
}

.ds-module-capsule__figure--below {
  flex-direction: column;
  align-items: flex-start;
}

.ds-module-capsule__value {
  font: var(--ds-font-heading-xl);
  letter-spacing: var(--ds-letter-spacing-heading-xl);
  color: var(--ds-text-strong);
  font-variant-numeric: tabular-nums;
}

.ds-module-capsule__unit {
  color: var(--ds-text-subtlest);
}

.ds-module-capsule__unit--text {
  font: var(--ds-font-body-md);
}

/* A unit that is a symbol rather than a word sits tighter and heavier, so it
   reads as part of the figure instead of as a second word after it. */
.ds-module-capsule__unit--symbol {
  font: var(--ds-font-label-md-strong);
}

/* ── The delta, under the figure and under the bar ────────────────── */
/* A fixed column, because the comparison ellipsizes rather than widening the
   capsule — which is also why the figure's badge goes to the far edge. */
/* Same rule as the identity column: a ceiling, not a size. The delta's
   comparison still ellipsizes against it rather than widening the capsule. */
.ds-module-capsule__hero--wide {
  max-width: 300px;
}

.ds-module-capsule__hero--wide .ds-module-capsule__hero-row {
  justify-content: space-between;
  width: 100%;
}

.ds-module-capsule__delta {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  width: 100%;
}

.ds-module-capsule__delta-value {
  font: var(--ds-font-label-lg-strong);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.ds-module-capsule__delta-comparison {
  flex: 1 0 0;
  min-width: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtlest);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


/* ── Progress ─────────────────────────────────────────────────────── */
/* The one column that does NOT hug. A bar is a scale, and its length is part of
   how it is read: let it follow its label and two capsules side by side would
   measure the same percentage against different rulers. It keeps Figma's 300. */
.ds-module-capsule__progress {
  flex: none;
  width: 300px;
  height: var(--capsule-band);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--ds-spacing-md);
}

.ds-module-capsule__stage {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  width: 100%;
}

.ds-module-capsule__stage-label {
  flex: 1 0 0;
  min-width: 0;
  margin: 0;
  font: var(--ds-font-label-xl-strong);
  color: var(--ds-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ds-module-capsule__context {
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtlest);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Composition ──────────────────────────────────────────────────── */
.ds-module-capsule__composition {
  flex: none;
  height: var(--capsule-band);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--ds-spacing-xs);
}

.ds-module-capsule__signals {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xl);
}

.ds-module-capsule__signal {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: var(--ds-spacing-sm);
  /* Figma binds the glyph to gray-forest/200 — text-default, not the fainter
     subtlest. A glyph that labels a strong figure is not the faintest thing on
     the row. */
  color: var(--ds-text-default);
}

.ds-module-capsule__signal-label {
  font: var(--ds-font-label-xl-strong);
  color: var(--ds-text-strong);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ds-module-capsule__freshness {
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtlest);
  white-space: nowrap;
}

/* ── Tones ────────────────────────────────────────────────────────── */
/* Last in the sheet on purpose: these override the colour the element already
   carries — `__signal-label` is text-strong until its measure crosses a
   threshold, and the delta figure has no colour of its own at all.
   The on-tint partners are used here on bg-default deliberately: in dark they
   resolve to the same step as text-{tone}, and in light they are the legible
   one (ADR-0030's open item). */
.ds-module-capsule--on-success { color: var(--ds-text-on-success-subtle); }
.ds-module-capsule--on-error   { color: var(--ds-text-on-error-subtle); }
.ds-module-capsule--on-warning { color: var(--ds-text-on-warning-subtle); }
.ds-module-capsule--on-neutral { color: var(--ds-text-default); }
</style>
