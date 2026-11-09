<script setup lang="ts">
import { SectionCard, type SectionCardHeadingLevel } from '../SectionCard'

/**
 * A block read in a map's panel (ADR-0143) — the sunk surface, a title (with
 * its `HelpIcon` when the term needs one), `#aside` on the title's line — a
 * badge, a count — then the body in a column.
 *
 * It is `SectionCard` at its **compact** density, rendered, not redrawn
 * (ADR-0001): the product's `ArrPanelBlock` was the same object as the form's
 * titled section, at 12 and 8 where a form breathes at 20 and 16. The name is
 * the one the panels use; the drawing is one.
 */
interface Props {
  title: string
  /** What the title's term means. */
  help?: string
  /** 3 inside a panel titled in `h2`. */
  headingLevel?: SectionCardHeadingLevel
}

withDefaults(defineProps<Props>(), {
  help: undefined,
  headingLevel: 3,
})

const slots = defineSlots<{
  default?: () => unknown
  /** On the title's line, at its end — a `Badge`, a count. */
  aside?: () => unknown
}>()
</script>

<template>
  <SectionCard :title="title" :help="help" :heading-level="headingLevel" density="compact">
    <template v-if="slots.aside" #actions><slot name="aside" /></template>
    <slot />
  </SectionCard>
</template>
