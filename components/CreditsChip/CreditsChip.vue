<script setup lang="ts">
import { Icon } from '../Icon'
import coinSrc from './credits-coin.svg'

/**
 * How close the balance is to expiring. Three steps, and the last one changes
 * register rather than deepening the tint: `expired` is a solid fill with its
 * own on-colour, because a tint cannot say "too late" (Figma CreditsChip/démo).
 *
 * The thresholds are product policy, not a design system decision — the caller
 * picks the step, the component does not derive it from a day count.
 */
export type CreditsReminderTone = 'info' | 'soon' | 'expired'

interface Props {
  /** The balance. Rendered tabular so it does not jitter as it counts down. */
  credits: number
  /** Unit after the count. */
  unit?: string
  /**
   * The expiry notice. Its presence is what expands the chip onto a plain
   * surface and hands the tint to the badge — derived from the content, not
   * declared by a second state prop (ADR-0008).
   */
  reminder?: string
  reminderTone?: CreditsReminderTone
}

withDefaults(defineProps<Props>(), {
  unit:         'crédits',
  reminderTone: 'info',
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <!--
    A real control, not a div that emits click: the chevron promises it opens
    something, and a div is unreachable by keyboard (ADR-0014).
  -->
  <button
    type="button"
    class="ds-credits-chip"
    :class="reminder ? 'ds-credits-chip--reminder' : 'ds-credits-chip--compact'"
    @click="emit('click', $event)"
  >
    <span class="ds-credits-chip__balance">
      <img :src="coinSrc" alt="" class="ds-credits-chip__coin" width="24" height="24" />
      <span class="ds-credits-chip__count">{{ credits }}</span>
      <span class="ds-credits-chip__unit">{{ unit }}</span>
    </span>

    <span
      v-if="reminder"
      class="ds-credits-chip__reminder"
      :class="`ds-credits-chip__reminder--${reminderTone}`"
    >
      <Icon name="alarm-clock" :size="16" aria-hidden="true" />
      <span>{{ reminder }}</span>
    </span>

    <!-- 14px is off the 16/20/24/32 scale on purpose: a glyph inside a control
         is an ornament and is exempt (ADR-0004). -->
    <Icon
      name="chevron-down"
      :size="reminder ? 16 : 14"
      class="ds-credits-chip__chevron"
      aria-hidden="true"
    />
  </button>
</template>

<style scoped>
.ds-credits-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  border: none;
  border-radius: var(--ds-radius-pill);
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
}

/* ADR-0006: one focus treatment, and no component defines its own. */
.ds-credits-chip:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

/*
  Compact — the resting chip, toned to its own coin. Accent is the secondary
  brand colour; the tint and its on-colour come from the Figma Semantic
  collection (bg/accent-subtle, text/on-accent-subtle).
*/
.ds-credits-chip--compact {
  padding: var(--ds-spacing-sm);
  background-color: var(--ds-bg-accent-subtle);
  color: var(--ds-text-on-accent-subtle);
}

/*
  Reminder — the chip expands onto a plain surface and hands the tint to the
  échéance badge, so it marks the thing that needs attention. No border and no
  lift: the badge is what has to be seen, and the surface behind the bar is
  what separates the chip.
*/
.ds-credits-chip--reminder {
  padding: var(--ds-spacing-sm) var(--ds-spacing-md) var(--ds-spacing-sm) var(--ds-spacing-sm);
  background-color: var(--ds-bg-default);
  color: var(--ds-text-default);
}

/* ── Balance ──────────────────────────────────────────────────────── */
.ds-credits-chip__balance {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
}

/*
  24px, deliberately, against the 27x28 drawing Figma's CreditsChip/démo
  carries. The two are different artwork, and Figma's fills sit just off the
  palette — near-misses of accent-400 and accent-500 at deltaE 0.76 and 3.75.
  This one is drawn on the primitives themselves.

  The cost is 3px of width, so the chip measures 339 against Figma's 341. That
  gap is a decision, not drift.
*/
.ds-credits-chip__coin {
  display: block;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
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
.ds-credits-chip--compact .ds-credits-chip__count,
.ds-credits-chip--compact .ds-credits-chip__unit {
  color: var(--ds-text-on-accent-subtle);
}

.ds-credits-chip--reminder .ds-credits-chip__count { color: var(--ds-text-strong); }
.ds-credits-chip--reminder .ds-credits-chip__unit  { color: var(--ds-text-default); }

/* ── Badge d'échéance ─────────────────────────────────────────────── */
.ds-credits-chip__reminder {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md);
  border: var(--ds-border-width-default) solid var(--reminder-border);
  border-radius: var(--ds-radius-pill);
  background-color: var(--reminder-bg);
  color: var(--reminder-text);
  font: var(--ds-font-label-lg);
}

/*
  Three steps of one escalation. `info` and `soon` are tints with a hairline;
  `expired` is a solid fill, which needs no hairline and takes the on-colour
  its ground names (ADR-0009).
*/
.ds-credits-chip__reminder--info {
  --reminder-bg:     var(--ds-bg-neutral-subtle);
  --reminder-border: var(--ds-border-subtle);
  --reminder-text:   var(--ds-text-default);
}

.ds-credits-chip__reminder--soon {
  --reminder-bg:     var(--ds-bg-accent-subtle);
  --reminder-border: var(--ds-border-on-accent-subtle);
  --reminder-text:   var(--ds-text-on-accent-subtle);
}

.ds-credits-chip__reminder--expired {
  --reminder-bg:     var(--ds-bg-error-solid);
  --reminder-border: var(--ds-bg-error-solid);
  --reminder-text:   var(--ds-text-on-error-solid);
}

/* ── Chevron ──────────────────────────────────────────────────────── */
.ds-credits-chip__chevron { flex-shrink: 0; }
.ds-credits-chip--reminder .ds-credits-chip__chevron { color: var(--ds-text-subtlest); }
</style>
