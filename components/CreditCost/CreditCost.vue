<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import { Skeleton } from '../Skeleton'
import { SwapTransition } from '../SwapTransition'
import coinsSrc from './credit-coins.png'

/**
 * What an action is about to cost, said **before** the click — the pattern for
 * every action that consumes credits and is launched from a creation panel
 * (ADR-0104). It goes in the foot of `Dialog placement="side"`, through the
 * `#summary` slot: the cost on the left, the action on the right, so the
 * number and the button that spends it are read together. The summary is a
 * `role="status"`, so a cost that moves with the form is announced.
 *
 * Three facts only, in order of the form's life:
 *
 * | | `cost` | shows |
 * |---|---|---|
 * | the form cannot price it yet | `undefined` | « — » |
 * | the price is being computed | `null` | a placeholder in the number's box |
 * | priced | a number | the number |
 *
 * **Not enough is derived, never declared**: given a `balance`, a cost above it
 * turns the number to the error ink *and* adds a glyph — a tone never says it
 * alone (ADR-0006). What the user can do about it is the product's: its
 * primary action becomes « Acheter des crédits » in the `#actions` slot.
 *
 * The coins are the owner's artwork (Figma `3734:2260`) — two lying, one
 * tilted, 64 × 56 — and decorative: the label says what the number is. Nothing
 * is written in the illustration's place (the benchmark: 0 of 78 products).
 */
interface Props {
  /** The price. `undefined`: not priceable yet. `null`: being computed. */
  cost?: number | null
  /** The module's balance. A cost above it is « not enough ». */
  balance?: number
  /** What the number is. */
  label?: string
  /** Read after the number when the balance does not cover it. */
  insufficientLabel?: string
  /** Read in place of the dash while the form cannot be priced. */
  unpricedLabel?: string
  /** Writes the number: « 4 720 » in `fr-FR`, « 4,720 » in `en-US`. */
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  cost: undefined,
  balance: undefined,
  label: 'Coût en crédits',
  insufficientLabel: 'Crédits insuffisants',
  unpricedLabel: 'Pas encore calculé',
  locale: 'fr-FR',
})

const state = computed(() =>
  props.cost === undefined ? 'unpriced' : props.cost === null ? 'pending' : 'priced')

const insufficient = computed(() =>
  typeof props.cost === 'number' && props.balance !== undefined && props.cost > props.balance)

const formatted = computed(() =>
  typeof props.cost === 'number' ? new Intl.NumberFormat(props.locale).format(props.cost) : '')
</script>

<template>
  <div
    class="ds-credit-cost"
    :class="{ 'ds-credit-cost--insufficient': insufficient }"
    :aria-busy="state === 'pending' || undefined"
  >
    <img :src="coinsSrc" alt="" class="ds-credit-cost__art" width="64" height="56" />
    <div class="ds-credit-cost__text">
      <span class="ds-credit-cost__label">{{ label }}</span>
      <SwapTransition>
        <span v-if="state === 'pending'" key="pending" class="ds-credit-cost__value">
          <Skeleton variant="rect" emphasis="strong" :width="72" :height="20" />
        </span>
        <span v-else-if="state === 'unpriced'" key="unpriced" class="ds-credit-cost__value ds-credit-cost__value--unpriced">
          <span aria-hidden="true">—</span>
          <span class="ds-credit-cost__hidden">{{ unpricedLabel }}</span>
        </span>
        <span v-else key="priced" class="ds-credit-cost__value">
          {{ formatted }}
          <template v-if="insufficient">
            <Icon name="circle-alert" :size="16" class="ds-credit-cost__sign" />
            <span class="ds-credit-cost__hidden">{{ insufficientLabel }}</span>
          </template>
        </span>
      </SwapTransition>
    </div>
  </div>
</template>

<style scoped>
/* The owner's drawing (Figma 3734:2259): the art, 8px, the label over the number. */
.ds-credit-cost {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

.ds-credit-cost__art {
  flex: none;
  display: block;
}

.ds-credit-cost__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ds-credit-cost__label {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

/* The number's line box holds in every state, so the foot never moves when
   the price arrives — the placeholder sits in it (ADR-0055's rule). */
.ds-credit-cost__value {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  min-height: 1lh;
  font: var(--ds-font-heading-lg);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
}

.ds-credit-cost__value--unpriced {
  color: var(--ds-text-subtlest);
}

.ds-credit-cost--insufficient .ds-credit-cost__value {
  color: var(--ds-text-error);
}

.ds-credit-cost__sign {
  flex: none;
}

/* Visually hidden, still read — never display:none. */
.ds-credit-cost__hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}
</style>
