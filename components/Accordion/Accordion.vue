<script setup lang="ts">
import { computed, provide } from 'vue'
import { ACCORDION_KEY, type AccordionHeadingLevel, type AccordionValue } from './context'

/**
 * Sections that open and close in place (ADR-0088, track A): a title, a
 * chevron on the right that turns over (11 / 19, and the side of every
 * chevron the package already has), a rule between the sections.
 *
 * **One open at a time** by default (9 / 19): `v-model` is the open section,
 * or `null`. `multiple` lets several stay open, `v-model:values` holding them —
 * the split `InputDropdown` and `OptionList` already make (ADR-0085), so a
 * single value never changes type.
 *
 * Each title is a `<button>` in a heading (`headingLevel`, 3 by default); there
 * are no arrow keys between them — the APG withdrew them in April 2026.
 */
interface Props {
  modelValue?: AccordionValue | null
  multiple?: boolean
  values?: AccordionValue[]
  headingLevel?: AccordionHeadingLevel
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  multiple: false,
  values: () => [],
  headingLevel: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: AccordionValue | null]
  'update:values': [values: AccordionValue[]]
}>()

function isOpen(value: AccordionValue) {
  return props.multiple ? props.values.includes(value) : props.modelValue === value
}

function setOpen(value: AccordionValue, next: boolean) {
  if (props.multiple) {
    const rest = props.values.filter(v => v !== value)
    emit('update:values', next ? [...rest, value] : rest)
  } else {
    emit('update:modelValue', next ? value : null)
  }
}

provide(ACCORDION_KEY, {
  isOpen,
  toggle: value => setOpen(value, !isOpen(value)),
  open: value => setOpen(value, true),
  headingLevel: computed(() => props.headingLevel),
})
</script>

<template>
  <div class="ds-accordion">
    <slot />
  </div>
</template>

<style scoped>
.ds-accordion {
  display: flex;
  flex-direction: column;
}
</style>
