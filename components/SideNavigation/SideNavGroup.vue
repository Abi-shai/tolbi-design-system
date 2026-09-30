<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { SIDE_NAVIGATION_KEY } from './context'

/**
 * A titled run of `SideNavItem`s — "Suivi", "Données", "Compte".
 *
 * Every panel in the survey groups its pages under a small title (Sentry,
 * Supabase, Intercom, Featurebase), and the second level is where a list grows
 * long enough to need it (ADR-0046). It works in the single column too.
 *
 * It carries **no selection and no position**. The items inside still register
 * with the list above the group, so one pill runs across every group of a
 * level; and the group stays unpositioned so each row's `offsetTop` is still
 * measured from that list — a positioned group would restart the offsets at
 * its own top and park the pill on the wrong row.
 *
 * The title is `label-md` in `text-subtle`: 6.98:1 on `bg-neutral` light and
 * 4.50:1 dark. `text-subtlest` looked like the obvious quieter pick and is
 * 3.13:1 in dark — a 12px title that fails AA in one mode.
 *
 * In the rail the title has nowhere to go, so it leaves the screen and stays in
 * the accessibility tree: the group still has a name, only the space it would
 * take is gone.
 */
interface Props {
  label: string
}

defineProps<Props>()

const group = inject(SIDE_NAVIGATION_KEY, null)
const rail = computed(() => group?.collapsed.value ?? false)
const id = useId()
</script>

<template>
  <div
    class="ds-side-nav-group"
    :class="{ 'ds-side-nav-group--rail': rail }"
    role="group"
    :aria-labelledby="id"
  >
    <span :id="id" class="ds-side-nav-group__label">{{ label }}</span>
    <slot />
  </div>
</template>

<style scoped>
/* The list's own gap is 8px between rows; a group adds 8 above itself, so a
   group break is 16 — twice the row rhythm, which is what Figma draws
   (1924:3907). The title then binds to its rows at 8. */
.ds-side-nav-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--ds-spacing-md);
  margin-top: var(--ds-spacing-md);
}

.ds-side-nav-group:first-child {
  margin-top: 0;
}

/* `spacing-lg` in, the row's own padding, so the title sits on the same line
   as the glyphs below it and the panel's title above it. */
.ds-side-nav-group__label {
  padding-left: var(--ds-spacing-lg);
  font: var(--ds-font-label-md);
  color: var(--ds-text-subtle);
}

/* Visually hidden, still announced — never display:none. */
.ds-side-nav-group--rail .ds-side-nav-group__label {
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
