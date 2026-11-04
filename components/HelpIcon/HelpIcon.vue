<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '../Icon'
import { Tooltip } from '../Tooltip'
import type { TooltipPlacement } from '../Tooltip'

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

/*
 * The bubble is the anchored `Tooltip` (ADR-0082, ADR-0099): in the top layer,
 * so a panel that scrolls or clips (a `MapPanel`, a `Dialog`'s body, a table's
 * head) can no longer cut it; it flips when the side is short; and it keeps the
 * catalogue's rules — 400ms on hover, on keyboard focus only, Escape, gone on
 * press. It used to be drawn absolute beside the icon, open at once, with an
 * `aria-expanded` a tooltip does not have.
 *
 * The old placements map onto the anchored ones: `top-left` ends at the icon's
 * right (`top-end`), `top-right` starts at its left (`top-start`).
 */
const anchored: Record<HelpPlacement, TooltipPlacement> = {
  'top':       'top',
  'top-arrow': 'top',
  'top-left':  'top-end',
  'top-right': 'top-start',
  'bottom':    'bottom',
  'left':      'left',
  'right':     'right',
}
const placement = computed(() => anchored[props.placement])
</script>

<template>
  <Tooltip :title="title" :supporting-text="supportingText" :placement="placement">
    <button class="ds-help-icon__btn" type="button" :aria-label="title">
      <Icon name="circle-question-mark" :size="16" />
    </button>
  </Tooltip>
</template>

<style scoped>
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
  transition:
    color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
  border-radius: var(--ds-radius-pill);
}

.ds-help-icon__btn:hover {
  color: var(--ds-text-subtle);
}

.ds-help-icon__btn:focus-visible {
  outline: none;
  color: var(--ds-text-subtle);
  box-shadow: var(--ds-focus-ring-brand);
}
</style>
