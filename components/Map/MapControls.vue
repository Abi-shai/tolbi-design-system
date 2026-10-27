<script setup lang="ts">
import { Button } from '../Button'
import type { IconName } from '../Icon'
import { Tooltip } from '../Tooltip'

/**
 * The map's buttons (ADR-0087) — the owner's drawing: separate square buttons,
 * one under the other, 8px apart. Each is `Button` icon-only `secondary-gray`
 * `sm` (36px), the package's own button and not a drawing of its own
 * (ADR-0001): its `border-default` reads better on imagery than the Figma
 * component's `border-subtle`. Its label is its name and its tooltip, which
 * opens away from the map's edge — on the left by default, since controls sit
 * on the right (10 / 14). A tool that stays on (« Tracer ») is `pressed`:
 * `Button`'s chosen mark and `aria-pressed`; a zoom at its limit is
 * `disabled`.
 *
 * Place it in a `MapOverlay`. Extra buttons go in the slot.
 */
export interface MapControl {
  key: string
  icon: IconName
  /** Its name and its tooltip — « Zoomer », « Tracer une parcelle ». */
  label: string
  /** A tool that stays on until it is pressed again. */
  pressed?: boolean
  disabled?: boolean
}

interface Props {
  controls?: MapControl[]
  /** The tooltips' side: away from the edge the controls stand on. */
  tooltipPlacement?: 'left' | 'right'
  /** The group's name. */
  ariaLabel?: string
}

withDefaults(defineProps<Props>(), {
  controls: () => [],
  tooltipPlacement: 'left',
  ariaLabel: 'Contrôles de la carte',
})

const emit = defineEmits<{ action: [key: string] }>()
</script>

<template>
  <div class="ds-map-controls" role="group" :aria-label="ariaLabel">
    <Tooltip v-for="c in controls" :key="c.key" :title="c.label" :placement="tooltipPlacement">
      <Button
        icon-only
        variant="secondary-gray"
        size="sm"
        :icon-leading="c.icon"
        :label="c.label"
        :selected="c.pressed"
        :aria-pressed="c.pressed === undefined ? undefined : c.pressed"
        :disabled="c.disabled"
        @click="emit('action', c.key)"
      />
    </Tooltip>
    <slot />
  </div>
</template>

<style scoped>
.ds-map-controls {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
}
</style>
