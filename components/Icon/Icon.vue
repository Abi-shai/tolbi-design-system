<script setup lang="ts">
import { computed } from 'vue'
import { icons, type IconName } from './registry'

/**
 * The sanctioned icon scale. Icons are drawn on a 24px grid at stroke-width 2
 * and the stroke scales with the box, so the effective stroke is `2 × size / 24`:
 *
 *   16px → 1.33   20px → 1.67   24px → 2.00   32px → 2.67
 *
 * The weight is deliberately *not* compensated at small sizes — thinner at 16,
 * heavier at 32, as specified in Figma (`Stroke effectif`, node 34:12).
 *
 * Use one of these four for any standalone icon. 16px is the floor.
 */
export type IconSize = 16 | 20 | 24 | 32

interface Props {
  name: IconName
  /**
   * Prefer an `IconSize`. Arbitrary numbers stay allowed for glyphs *inside* a
   * control that must track the control's own variant — a checkbox tick, a tag's
   * close affordance. Those are ornaments, not icons, and are exempt from the
   * 16px floor. Never reach for an off-scale number for a standalone icon.
   *
   * `number & {}` keeps editor autocomplete for the four scale values, which a
   * plain `IconSize | number` union would collapse away.
   */
  size?: IconSize | (number & {})
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), { size: 24 })

const component = computed(() => icons[props.name])

/** Effective stroke at the current size — `2 × size / 24`. */
const effectiveStroke = computed(() => (2 * Number(props.size)) / 24)
</script>

<template>
  <component
    :is="component"
    :width="size"
    :height="size"
    :data-effective-stroke="effectiveStroke.toFixed(2)"
    :aria-hidden="!ariaLabel || undefined"
    :aria-label="ariaLabel"
    :role="ariaLabel ? 'img' : undefined"
    class="ds-icon"
  />
</template>

<style scoped>
.ds-icon {
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}
</style>
