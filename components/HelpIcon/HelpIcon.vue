<script setup lang="ts">
import { SurfaceTransition } from '../SurfaceTransition'
/* token-lint-disable no-literal-dimension-js — tooltip positioning offsets,
   not spacing: they align the bubble's tail to the trigger, and no token can
   express that relationship. */
import { ref, computed } from 'vue'
import { Icon } from '../Icon'
import { Tooltip } from '../Tooltip'
import type { TooltipArrow } from '../Tooltip'

export type HelpPlacement =
  | 'top'
  | 'top-arrow'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'left'
  | 'right'

interface Props {
  title?:         string
  supportingText?: string
  placement?:     HelpPlacement
}

const props = withDefaults(defineProps<Props>(), {
  title:     'This is a tooltip',
  placement: 'top',
})

const isOpen = ref(false)

const arrowMap: Record<HelpPlacement, TooltipArrow> = {
  'top':       'none',
  'top-arrow': 'bottom-center',
  'top-left':  'bottom-right',
  'top-right': 'bottom-left',
  'bottom':    'top-center',
  'left':      'right',
  'right':     'left',
}

const arrow = computed(() => arrowMap[props.placement])

/*
 * Where the panel grows from (ADR-0021: a surface is scaled from its anchor).
 *
 * This was `bottom center` for every placement and nobody could tell, because
 * the scale never ran — see the note on `translate` below. Now that it does,
 * the origin is visible, so it has to be right.
 */
const originMap: Record<HelpPlacement, string> = {
  'top':       'bottom center',
  'top-arrow': 'bottom center',
  'top-left':  'bottom right',
  'top-right': 'bottom left',
  'bottom':    'top center',
  'left':      'center right',
  'right':     'center left',
}

/*
 * Position CSS du tooltip par rapport à l'icône (gap de 4px).
 *
 * Centring uses the independent `translate` property, NOT `transform`.
 *
 * `:style` is inline, so `transform: translateX(-50%)` here beat
 * SurfaceTransition's `transform: scale(…)` — which is a stylesheet rule — and
 * five of the seven placements silently got the fade without the scale. The
 * failure is invisible: the entrance still runs, just without half of itself.
 *
 * `translate` / `scale` / `rotate` are separate properties that COMPOSE with
 * `transform` rather than replacing it, so the offset and the entrance can sit
 * on one element without competing. Keeping them on one element also keeps the
 * DOM identical — an earlier attempt moved the offset to a wrapper div and
 * shifted two placements, because an absolutely positioned box and a static
 * child of one shrink-wrap differently.
 */
const tooltipStyle = computed<Partial<Record<string, string>>>(() => {
  const origin = { transformOrigin: originMap[props.placement] }
  switch (props.placement) {
    case 'top':
    case 'top-arrow':
      return { ...origin, bottom: 'calc(100% + 4px)', left: '50%', translate: '-50% 0' }
    case 'top-left':
      return { ...origin, bottom: 'calc(100% + 4px)', right: '-12px' }
    case 'top-right':
      return { ...origin, bottom: 'calc(100% + 4px)', left: '-12px' }
    case 'bottom':
      return { ...origin, top: 'calc(100% + 4px)', left: '50%', translate: '-50% 0' }
    case 'left':
      return { ...origin, right: 'calc(100% + 3px)', top: '50%', translate: '0 -50%' }
    case 'right':
      return { ...origin, left: 'calc(100% + 4px)', top: '50%', translate: '0 -50%' }
  }
})
</script>

<template>
  <div
    class="ds-help-icon"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
    @focusin="isOpen = true"
    @focusout="isOpen = false"
  >
    <button
      class="ds-help-icon__btn"
      :class="{ 'ds-help-icon__btn--open': isOpen }"
      type="button"
      :aria-label="title"
      :aria-expanded="isOpen"
    >
      <Icon name="circle-question-mark" :size="16" />
    </button>

    <SurfaceTransition>
      <Tooltip
        v-if="isOpen"
        class="ds-help-icon__tooltip"
        :style="tooltipStyle"
        :title="title"
        :supporting-text="supportingText"
        :arrow="arrow"
      />
    </SurfaceTransition>
  </div>
</template>

<style scoped>
.ds-help-icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ds-help-icon__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--ds-text-subtlest);
  transition: color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
  border-radius: var(--ds-radius-pill);
}

.ds-help-icon__btn:hover,
.ds-help-icon__btn--open {
  color: var(--ds-text-subtle);
}

.ds-help-icon__btn:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

.ds-help-icon__tooltip {
  /* transform-origin is set inline, per placement — see originMap. */
  position: absolute;
  z-index: var(--ds-z-popover);
  white-space: normal;
}

</style>
