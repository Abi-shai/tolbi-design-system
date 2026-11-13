<script setup lang="ts">
import { computed, provide, useId } from 'vue'
import { OPTION_LIST_KEY, type OptionValue } from './context'

/**
 * A set of `OptionCard`s that holds the choice (ADR-0086). One choice:
 * `v-model`, radios; several: `multiple` and `v-model:values`, boxes — the
 * same split as `InputDropdown` (ADR-0085), so a single value never changes
 * type.
 *
 * Two forms: `grid` — side by side, equal height on a row, 2 to 4 `columns`
 * (3 by default, Cloudscape's ceiling), falling back to fewer and then to a
 * pile when a column would go under 14rem — for 2 to 7 options that compare;
 * `stack` — full width, one under the other, for a list. Past seven options,
 * an `InputDropdown`.
 *
 * It is a `fieldset`: its `legend` names the group (or `ariaLabel`, or the
 * `FormField` around it with `group`). The cards hold real radios or
 * checkboxes, so the keyboard is the browser's.
 */
interface Props {
  modelValue?: OptionValue | null
  multiple?: boolean
  values?: OptionValue[]
  layout?: 'grid' | 'stack'
  columns?: 2 | 3 | 4
  /** The group's name, shown above it. */
  legend?: string
  /** The group's name, when nothing on screen says it. */
  ariaLabel?: string
  disabled?: boolean
  /**
   * The row to show as hovered without it being chosen (ADR-0168) — the object
   * the pointer is over on the map. It takes its own hover's look, nothing more.
   */
  highlighted?: OptionValue | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  multiple: false,
  values: () => [],
  layout: 'stack',
  columns: 3,
  legend: undefined,
  ariaLabel: undefined,
  disabled: false,
  highlighted: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: OptionValue]
  'update:values': [values: OptionValue[]]
  /** A row the pointer entered (its value) or left (`null`) — the map can answer it (ADR-0168). */
  hover: [value: OptionValue | null]
}>()

provide(OPTION_LIST_KEY, {
  name: `ds-option-list-${useId()}`,
  multiple: computed(() => props.multiple),
  disabled: computed(() => props.disabled),
  isChecked: value => (props.multiple ? props.values.includes(value) : props.modelValue === value),
  toggle: value => {
    if (!props.multiple) return emit('update:modelValue', value)
    emit('update:values', props.values.includes(value) ? props.values.filter(v => v !== value) : [...props.values, value])
  },
  highlighted: computed(() => props.highlighted),
  hover: value => emit('hover', value),
})
</script>

<template>
  <fieldset
    class="ds-option-list"
    :class="`ds-option-list--${layout}`"
    :style="layout === 'grid' ? { '--option-list-columns': columns } : undefined"
    :aria-label="legend ? undefined : ariaLabel"
    :disabled="disabled"
  >
    <legend v-if="legend" class="ds-option-list__legend">{{ legend }}</legend>
    <div class="ds-option-list__items">
      <slot />
    </div>
  </fieldset>
</template>

<style scoped>
.ds-option-list {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.ds-option-list__legend {
  margin-bottom: var(--ds-spacing-sm);
  padding: 0;
  font: var(--ds-font-label-lg);
  color: var(--ds-text-default);
}

.ds-option-list__items {
  display: grid;
  gap: var(--ds-spacing-md);
}

/*
  A stack is a list read in bulk — a MapPanel's parcels — so its titles sit at
  the floor, 14, as before ADR-0144; the description already does (ADR-0145).
  A variant switch read by OptionCard's title and its line (ADR-0010).
*/
.ds-option-list--stack {
  --option-card-title-font: var(--ds-font-label-md-strong);
}

/*
  At most `columns` side by side, never under 14rem each: the max() picks the
  wider of the two, so a narrow container drops a column before it squeezes
  one — down to a pile. Cards on a row share its height (grid's own stretch).
*/
.ds-option-list--grid .ds-option-list__items {
  gap: var(--ds-spacing-lg);
  grid-template-columns: repeat(
    auto-fill,
    minmax(
      max(14rem, (100% - (var(--option-list-columns) - 1) * var(--ds-spacing-lg)) / var(--option-list-columns)),
      1fr
    )
  );
}
</style>
