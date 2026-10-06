<script setup lang="ts">
import { computed, ref } from 'vue'
import { Icon } from '../Icon'
import { Skeleton } from '../Skeleton'
import coinSrc from './credits-coin.svg'

/**
 * The credits balance in the navigation bar.
 *
 * **The badge exists when there are two quantities to show.** Outside the demo
 * there is only one — credits — and the chip counts it, wearing the state
 * itself. In the demo there are two, credits *and* a window of time, and a
 * single counter cannot carry both: the chip goes plain and hands the tint to
 * an échéance badge. One coloured thing at a time, either way.
 *
 * So there is still **one axis**. `tone` says how bad it is; the presence of
 * `reminder` decides who wears it (ADR-0028 — derived from the content, not
 * declared by a second state prop).
 *
 * | | no `reminder` | with `reminder` |
 * |---|---|---|
 * | `default` | white, hairline | white + accent badge |
 * | `warning` | `warning-subtle` | white + accent badge |
 * | `error`   | `error-solid`    | white + `error-solid` badge |
 *
 * The escalation changes **mechanism** rather than intensity — hairline, tint,
 * solid fill — which is what lets `error` mean "stopped" rather than "more
 * orange". Accent is not available as the alert: on the chip it is already the
 * calm state, which is why the standalone ladder runs through `warning`.
 *
 * **Every state carries a border and none carries elevation.** The bar has no
 * ground of its own (ADR-0028), so a `bg-default` chip on it would have no edge
 * at all — the same thing `ModuleCapsule` found (ADR-0031). A hairline separates
 * where a shadow only grounds, which is also the rule dark mode forces
 * (ADR-0030), so the border does the job in both modes and the lift is gone.
 *
 * The width runs 132–345px across the states, which is the cost of letting the
 * badge speak. The alternative — a chip that only ever counts, never explains —
 * is drawn beside this one in Figma and was set aside.
 */
export type CreditsChipTone = 'default' | 'warning' | 'error'

interface Props {
  /**
   * The balance. Rendered tabular so it does not jitter as it counts down.
   *
   * `null` is a balance that **exists and has not arrived**: a placeholder holds
   * the number's place, and the chip wears no tone — it does not say how bad a
   * balance is before it knows it. Never `0` for want of data (ADR-0054).
   */
  credits: number | null
  /** Unit after the count. */
  unit?: string
  /**
   * The expiry notice. Its **presence** is what makes this the demo form: the
   * chip goes plain and the badge appears to carry the second quantity.
   */
  reminder?: string
  /** How bad it is. Worn by the chip, or by the badge when there is one. */
  tone?: CreditsChipTone
}

const props = withDefaults(defineProps<Props>(), {
  unit: 'crédits',
  tone: 'default',
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const pending = computed(() => props.credits === null)

/* Who wears the tone: the badge when there is one, and nobody while the balance
   it would judge has not arrived. */
const register = computed(() => (props.reminder || pending.value ? 'default' : props.tone))

/*
  **The number rolls**, like the bar's identity (ADR-0042): the old one leaves
  through the top, the new one arrives from below — an odometer, a value changing
  in place, always the same direction.

  And its window **travels its width** rather than stepping it. Both numbers sit
  in one cell, so the cell is as wide as the wider of the two, and at the end of
  the roll it would snap to the new one — a digit's width, ~10px, on the chip's
  edge. So the window is pinned to its width as the old number starts to leave,
  then transitions to the new number's width while the two cross, and goes back
  to `auto` once only the new one is left: a width written down for the length
  of one roll, never longer, so a late web font can never find it stale.
*/
const countWindow = ref<HTMLElement>()

/* Widths with their fractions: `offsetWidth` rounds, and the window travelled
   to 26px, then stepped to the number's 26.42 when it went back to `auto`. */
function holdWidth() {
  const win = countWindow.value
  if (win) win.style.width = `${win.getBoundingClientRect().width}px`
}

function travelWidth(el: Element) {
  const win = countWindow.value
  if (!win) return
  const width = el.getBoundingClientRect().width
  void win.offsetWidth
  win.style.width = `${width}px`
}

function releaseWidth() {
  const win = countWindow.value
  if (win && win.children.length <= 1) win.style.width = ''
}
</script>

<template>
  <!--
    A real control, not a div that emits click: the chevron promises it opens
    something, and a div is unreachable by keyboard (ADR-0014).
  -->
  <button
    type="button"
    class="ds-credits-chip"
    :class="`ds-credits-chip--${register}`"
    :aria-busy="pending || undefined"
    @click="emit('click', $event)"
  >
    <span class="ds-credits-chip__balance">
      <img :src="coinSrc" alt="" class="ds-credits-chip__coin" width="24" height="24" />
      <!-- One run of text, not two boxes: the count and its unit are separated
           by a space rather than a gap, and share one colour. The count sits
           in its window, which the roll travels through. -->
      <span><span ref="countWindow" class="ds-credits-chip__count-window"><Transition
        name="ds-credits-chip-roll"
        @before-leave="holdWidth"
        @enter="travelWidth"
        @after-enter="releaseWidth"
        @after-leave="releaseWidth"
      ><span v-if="pending" key="pending" class="ds-credits-chip__count"><Skeleton
        class="ds-credits-chip__placeholder" emphasis="strong" width="3ch" /></span><span
        v-else :key="credits!" class="ds-credits-chip__count">{{ credits }}</span></Transition></span> <span
        class="ds-credits-chip__unit">{{ unit }}</span></span>
    </span>

    <span
      v-if="reminder"
      class="ds-credits-chip__reminder"
      :class="`ds-credits-chip__reminder--${tone === 'error' ? 'expired' : 'soon'}`"
    >
      <Icon :name="tone === 'error' ? 'clock' : 'alarm-clock'" :size="16" aria-hidden="true" />
      <span>{{ reminder }}</span>
    </span>

    <Icon name="chevron-down" :size="16" class="ds-credits-chip__chevron" aria-hidden="true" />
  </button>
</template>

<style scoped>
/*
  One geometry for all five states. The padding used to differ between the
  compact and the expanded form; it does not any more, because a chip that
  changes its own padding when the badge arrives moves the balance under the
  pointer for no reason.
*/
.ds-credits-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  padding: var(--ds-spacing-sm) var(--ds-spacing-md) var(--ds-spacing-sm) var(--ds-spacing-sm);
  box-sizing: border-box;
  border: var(--ds-border-width-default) solid var(--chip-border);
  border-radius: var(--ds-radius-pill);
  background-color: var(--chip-bg);
  cursor: pointer;
  flex-shrink: 0;
  white-space: nowrap;
  /*
    The tone **fades**: a register is a state, not a thing that travels, so it
    takes the default curve — over the roll's own duration, because the balance
    and its verdict change together (ADR-0037: one gesture, one duration).
  */
  transition:
    background-color var(--ds-motion-duration-enter) var(--ds-motion-easing-default),
    border-color     var(--ds-motion-duration-enter) var(--ds-motion-easing-default);
}

/* ADR-0006: one focus treatment, and no component defines its own. */
.ds-credits-chip:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

/*
  Three registers, one per step, and each is a different *kind* of surface
  rather than a deeper version of the last. ADR-0010: these alias semantic
  tokens, so they are variant switches with component-scoped names, not tokens.
*/
.ds-credits-chip--default {
  --chip-bg:      var(--ds-bg-default);
  --chip-border:  var(--ds-border-subtle);
  --chip-text:    var(--ds-text-strong);
  --chip-chevron: var(--ds-text-subtlest);
}

/* `warning`, not `accent`: accent is the chip's calm identity, so it cannot
   also be its alarm. */
.ds-credits-chip--warning {
  --chip-bg:      var(--ds-bg-warning-subtle);
  --chip-border:  var(--ds-border-on-warning-subtle);
  --chip-text:    var(--ds-text-on-warning-subtle);
  --chip-chevron: var(--ds-text-on-warning-subtle);
}

.ds-credits-chip--error {
  --chip-bg:      var(--ds-bg-error-solid);
  --chip-border:  var(--ds-border-error);
  --chip-text:    var(--ds-text-on-error-solid);
  --chip-chevron: var(--ds-text-on-error-solid);
}

/* ── Balance ──────────────────────────────────────────────────────── */
/* The gap is the coin's alone. The unit used to be a third flex child dimmed to
   `text-default`; it is now the same colour as the count, so the two are one
   run of text and the hierarchy rides on size and weight only — 16 semibold
   against 14 medium. */
.ds-credits-chip__balance {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
  color: var(--chip-text);
  transition: color var(--ds-motion-duration-enter) var(--ds-motion-easing-default);
}

/*
  24px, deliberately, against the 27x28 drawing Figma's CreditsChip/démo
  carries. The two are different artwork, and Figma's fills sit just off the
  palette — near-misses of accent-400 and accent-500 at deltaE 0.76 and 3.75.
  This one is drawn on the primitives themselves.
*/
.ds-credits-chip__coin {
  display: block;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

/*
  The window the count rolls through: one cell for the leaving and the arriving
  number, each at its own width (`justify-items: end`, so the digits keep to the
  unit), clipped by `clip-path` rather than `overflow` — an inline box with
  `overflow: hidden` takes its baseline from its bottom edge, and the count would
  drop off the unit's line.
*/
.ds-credits-chip__count-window {
  display: inline-grid;
  /*
    The column is the window's width, not its widest number's. With an `auto`
    column the leaving number held the track at its own width while the window
    narrowed, so the arriving one — aligned to the column's end — sat past the
    window's edge and was clipped: filmed, « 12 » was invisible for the last
    half of its roll.
  */
  grid-template-columns: minmax(0, 1fr);
  justify-items: end;
  clip-path: inset(0);
  transition: width var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

.ds-credits-chip__count {
  grid-area: 1 / 1;
  font: var(--ds-font-label-xl-strong);
  /* Must follow `font:`, which resets font-variant-numeric (ADR-0011). */
  font-variant-numeric: tabular-nums;
}

/* Three digits' worth (`3ch` at the count's size), on the count's line, and
   `strong`: the placeholder previews the weight of what is coming (ADR-0039),
   and the count is the chip's heaviest text — the default grey on the chip's
   white all but vanished. */
.ds-credits-chip__placeholder {
  display: inline-block;
  vertical-align: -0.1em;
}

/* `enter` + `easing-in-out`, both halves, the bar identity's own roll: the
   easing is "a thing that travels", and the two numbers are one movement. */
.ds-credits-chip-roll-enter-active,
.ds-credits-chip-roll-leave-active {
  transition: transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/* Arrives from below. */
.ds-credits-chip-roll-enter-from {
  transform: translateY(100%);
}

/* Leaves through the top. */
.ds-credits-chip-roll-leave-to {
  transform: translateY(-100%);
}

/*
  The number changes, nothing travels. The leaving one goes from the first
  frame: Vue swaps its classes a frame late, and two numbers would stand in one
  cell for that frame (ADR-0052's reduced-motion finding).
*/
@media (prefers-reduced-motion: reduce) {
  .ds-credits-chip__count-window,
  .ds-credits-chip-roll-enter-active,
  .ds-credits-chip-roll-leave-active {
    transition: none;
  }

  .ds-credits-chip-roll-enter-from,
  .ds-credits-chip-roll-leave-to {
    transform: none;
  }

  .ds-credits-chip-roll-leave-active {
    visibility: hidden;
  }
}

.ds-credits-chip__unit {
  font: var(--ds-font-label-lg);
}

/* ── Badge d'échéance ─────────────────────────────────────────────── */
.ds-credits-chip__reminder {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  padding: var(--ds-spacing-xxs) var(--ds-spacing-md);
  border-radius: var(--ds-radius-pill);
  font: var(--ds-font-label-lg);
}

.ds-credits-chip__reminder--soon {
  border: var(--ds-border-width-default) solid var(--ds-border-on-accent-subtle);
  background-color: var(--ds-bg-accent-subtle);
  color: var(--ds-text-on-accent-subtle);
}

/* A solid fill needs no hairline (ADR-0009) — but it keeps a transparent one,
   or the two badges differ by 2px and the chip's height flickers between the
   two demo states. The background paints under it, so nothing shows. */
.ds-credits-chip__reminder--expired {
  border: var(--ds-border-width-default) solid transparent;
  background-color: var(--ds-bg-error-solid);
  color: var(--ds-text-on-error-solid);
}

/* ── Chevron ──────────────────────────────────────────────────────── */
.ds-credits-chip__chevron {
  flex-shrink: 0;
  color: var(--chip-chevron);
  transition: color var(--ds-motion-duration-enter) var(--ds-motion-easing-default);
}
</style>
