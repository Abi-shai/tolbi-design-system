<script setup lang="ts">
import { Tray } from '../Tray'

/**
 * Quick actions (ADR-0208) — the home page's permanent block, the same for
 * every profile at every moment: a titled `Tray` (ADR-0205), and on its white
 * surface a stack of `ActionListItem`s, `spacing-xs` apart.
 *
 * Actions, not places: the modules are « Accès rapide » (`ModulesList`), what
 * one *does* is here, each row a verb. The benchmark's split (Sitecore « Apps »
 * / « Quick actions », Oracle « Mes applications » / « Actions rapides »).
 */
interface Props {
  /** The block's title, in the tray's grey — « Actions rapides ». */
  title?: string
  headingLevel?: 2 | 3 | 4
}

withDefaults(defineProps<Props>(), { title: undefined, headingLevel: 2 })

defineSlots<{
  /** The rows — `ActionListItem`s. */
  default?: () => unknown
  /** At the end of the title's line (ADR-0205). */
  action?: () => unknown
}>()
</script>

<template>
  <Tray class="ds-action-list" :title="title" :heading-level="headingLevel">
    <template v-if="$slots.action" #action><slot name="action" /></template>
    <ul class="ds-action-list__list">
      <slot />
    </ul>
  </Tray>
</template>

<style scoped>
.ds-action-list__list {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
