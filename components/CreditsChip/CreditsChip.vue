<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import coinSrc from './credits-coin.svg'

export type CreditsState   = 'good' | 'low' | 'empty'
export type CreditsContext = 'home' | 'project'

interface Props {
  credits:  number
  state?:   CreditsState
  context?: CreditsContext
  /**
   * Expiry reminder, e.g. `Expire dans 14 jours`. Its presence expands the
   * good state onto a plain surface and hands the accent tint to the badge —
   * derived from the content, not declared by a second state prop (ADR-0008).
   */
  reminder?: string
}

const props = withDefaults(defineProps<Props>(), {
  state:   'good',
  context: 'home',
})

const emit = defineEmits<{ 'contact-sales': []; click: [event: MouseEvent] }>()

const isCritical = computed(() => props.state === 'low' || props.state === 'empty')
const unitLabel  = computed(() => (props.context === 'project' ? 'crédits utilisés' : 'crédits'))
</script>

<template>
  <!-- État critique (low / empty) : outer avec bordure rouge -->
  <div v-if="isCritical" class="ds-credits-chip ds-credits-chip--critical">
    <div class="ds-credits-chip__badge ds-credits-chip__badge--error">
      <img :src="coinSrc" alt="" class="ds-credits-chip__coin" width="24" height="24" />
      <p class="ds-credits-chip__text">
        <span>Plus que </span><strong class="ds-credits-chip__count ds-credits-chip__count--error">{{ credits }}</strong><span> crédits disponibles</span>
      </p>
    </div>

    <button type="button" class="ds-credits-chip__cta" @click="emit('contact-sales')">
      <span>Contacter sales</span>
      <Icon name="arrow-right" :size="16" aria-hidden="true" />
    </button>
  </div>

  <!--
    État normal. A real control, not a div that emits click: the chevron
    promises it opens something, and a div is unreachable by keyboard
    (ADR-0014).
  -->
  <button
    v-else
    type="button"
    class="ds-credits-chip__good"
    :class="reminder ? 'ds-credits-chip__good--reminder' : 'ds-credits-chip__good--compact'"
    @click="emit('click', $event)"
  >
    <span class="ds-credits-chip__balance">
      <img :src="coinSrc" alt="" class="ds-credits-chip__coin" width="24" height="24" />
      <span class="ds-credits-chip__count">{{ credits }}</span>
      <span class="ds-credits-chip__unit">{{ unitLabel }}</span>
    </span>

    <span v-if="reminder" class="ds-credits-chip__reminder">
      <Icon name="alarm-clock" :size="16" aria-hidden="true" />
      <span>{{ reminder }}</span>
    </span>

    <!-- 14px is off the 16/20/24/32 scale on purpose: a glyph inside a
         control is an ornament and is exempt (ADR-0004). -->
    <Icon
      name="chevron-down"
      :size="reminder ? 16 : 14"
      class="ds-credits-chip__chevron"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped>
/* ── Coin ─────────────────────────────────────────────────────────── */
.ds-credits-chip__coin {
  display: block;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

/* ── État normal ──────────────────────────────────────────────────── */
.ds-credits-chip__good {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  border-radius: var(--ds-radius-pill);
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}

/* ADR-0006: one focus treatment, and no component defines its own. */
.ds-credits-chip__good:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

/*
  Compact — the resting chip, toned to its own coin. Accent is the secondary
  brand colour; the tint and its on-colour come straight from the Figma
  Semantic collection (bg/accent-subtle, text/on-accent-subtle).
*/
.ds-credits-chip__good--compact {
  padding: var(--ds-spacing-sm);
  border: none;
  background-color: var(--ds-bg-accent-subtle);
  color: var(--ds-text-on-accent-subtle);
}

/*
  Reminder — the chip expands onto a plain surface and hands the tint to the
  échéance badge, so it marks the thing that needs attention.
*/
.ds-credits-chip__good--reminder {
  padding: var(--ds-spacing-sm) var(--ds-spacing-md) var(--ds-spacing-sm) var(--ds-spacing-sm);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-control);
  color: var(--ds-text-default);
}

.ds-credits-chip__good--reminder:focus-visible {
  /* Keep the resting lift under the ring rather than replacing it. */
  box-shadow: var(--ds-elevation-control), var(--ds-focus-ring-brand);
}

.ds-credits-chip__balance {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
}

.ds-credits-chip__count {
  font: var(--ds-font-label-xl-strong);
  /* Must follow `font:`, which resets font-variant-numeric (ADR-0011). */
  font-variant-numeric: tabular-nums;
}

.ds-credits-chip__unit {
  font: var(--ds-font-label-lg);
}

/*
  Figma runs the unit at 75% opacity. Composited on the tint that is 3.35:1 and
  fails AA for 14px text, so the hierarchy is carried by weight and size
  instead — semibold 16 against medium 14 (ADR-0009).
*/
.ds-credits-chip__good--compact .ds-credits-chip__count,
.ds-credits-chip__good--compact .ds-credits-chip__unit {
  color: var(--ds-text-on-accent-subtle);
}

.ds-credits-chip__good--reminder .ds-credits-chip__count { color: var(--ds-text-strong); }
.ds-credits-chip__good--reminder .ds-credits-chip__unit  { color: var(--ds-text-default); }

/* ── Badge d'échéance ─────────────────────────────────────────────── */
.ds-credits-chip__reminder {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  /* Figma asks for 2px 10px 2px 8px; 10px is control-padding territory
     (ADR-0013), not on the spacing ramp, so the padding is symmetric. */
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md);
  border: var(--ds-border-width-default) solid var(--ds-border-on-accent-subtle);
  border-radius: var(--ds-radius-pill);
  background-color: var(--ds-bg-accent-subtle);
  color: var(--ds-text-on-accent-subtle);
  font: var(--ds-font-label-lg);
}

.ds-credits-chip__chevron { flex-shrink: 0; }
.ds-credits-chip__good--reminder .ds-credits-chip__chevron { color: var(--ds-text-subtlest); }

/* ── État critique ────────────────────────────────────────────────── */
.ds-credits-chip {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.ds-credits-chip--critical {
  border: var(--ds-border-width-default) solid var(--ds-border-error-solid);
  border-radius: var(--ds-radius-pill);
  padding: var(--ds-spacing-sm) var(--ds-spacing-lg) var(--ds-spacing-sm) var(--ds-spacing-sm);
  gap: var(--ds-spacing-md);
  background: var(--ds-bg-default);
}

.ds-credits-chip__badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  border-radius: var(--ds-radius-pill);
  flex-shrink: 0;
}

.ds-credits-chip__badge--error { background: var(--ds-bg-error-subtle); }

.ds-credits-chip__text {
  margin: 0;
  font: var(--ds-font-body-lg-emphasis);
  color: var(--ds-text-default);
  white-space: nowrap;
}

.ds-credits-chip__count--error {
  font: var(--ds-font-label-xl-strong);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-on-error-subtle);
}

.ds-credits-chip__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font: var(--ds-font-label-xl);
  color: var(--ds-text-error);
  white-space: nowrap;
  transition: opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-credits-chip__cta:hover { opacity: 0.8; }
</style>
