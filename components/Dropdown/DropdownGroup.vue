<script setup lang="ts">
import { useId } from 'vue'

/**
 * A titled run of rows in a `Dropdown` — « Aujourd’hui », « Hier ».
 *
 * The menu's `SideNavGroup` (ADR-0046), with the same title: `label-md` in
 * `text-subtle`, which holds AA in both modes where `text-subtlest` fails in
 * dark. A `role="group"` named by its title, so a reader hears where a row
 * belongs as well as what it is (ADR-0069).
 */
interface Props {
  label: string
}

defineProps<Props>()

const id = useId()
</script>

<template>
  <div class="ds-dropdown-group" role="group" :aria-labelledby="id">
    <span :id="id" class="ds-dropdown-group__label">{{ label }}</span>
    <slot />
  </div>
</template>

<style scoped>
.ds-dropdown-group {
  display: flex;
  flex-direction: column;
}

.ds-dropdown-group + .ds-dropdown-group {
  margin-top: var(--ds-spacing-xs);
}

/* On the rows' text: a row stands `spacing-sm` in and its content 10px more,
   which is `spacing-xl` from the panel's edge. */
.ds-dropdown-group__label {
  padding: var(--ds-spacing-md) var(--ds-spacing-xl) var(--ds-spacing-xs);
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
}
</style>
