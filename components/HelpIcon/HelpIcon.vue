<script setup lang="ts">
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

// Position CSS du tooltip par rapport à l'icône (gap de 4px)
const tooltipStyle = computed<Partial<Record<string, string>>>(() => {
  switch (props.placement) {
    case 'top':
    case 'top-arrow':
      return { bottom: 'calc(100% + 4px)', left: '50%', transform: 'translateX(-50%)' }
    case 'top-left':
      return { bottom: 'calc(100% + 4px)', right: '-12px' }
    case 'top-right':
      return { bottom: 'calc(100% + 4px)', left: '-12px' }
    case 'bottom':
      return { top: 'calc(100% + 4px)', left: '50%', transform: 'translateX(-50%)' }
    case 'left':
      return { right: 'calc(100% + 3px)', top: '50%', transform: 'translateY(-50%)' }
    case 'right':
      return { left: 'calc(100% + 4px)', top: '50%', transform: 'translateY(-50%)' }
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

    <Transition name="ds-help-icon__tooltip">
      <Tooltip
        v-if="isOpen"
        class="ds-help-icon__tooltip"
        :style="tooltipStyle"
        :title="title"
        :supporting-text="supportingText"
        :arrow="arrow"
      />
    </Transition>
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
  position: absolute;
  z-index: var(--ds-z-popover);
  white-space: normal;
}

/* Transition */
.ds-help-icon__tooltip-enter-active {
  transition: opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
              transform var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
}
.ds-help-icon__tooltip-leave-active {
  transition: opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-in),
              transform var(--ds-motion-duration-moderate) var(--ds-motion-easing-in);
}
.ds-help-icon__tooltip-enter-from,
.ds-help-icon__tooltip-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
