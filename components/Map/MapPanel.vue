<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { Button } from '../Button'
import { IconButton } from '../IconButton'

/**
 * A surface on a map (ADR-0087) — the owner's drawing: `bg-default`, a
 * `border-subtle` hairline, `elevation-raised`, `radius-surface-sm`, 12px
 * inside. It holds an instruction, a measured area, a toolbar, a year, a
 * legend; its width is its content's, capped at 20rem.
 *
 * With a `title` it is named by it. `collapsible` puts a chevron in its head
 * that folds it into a button bearing the title, in its place (Planetary) —
 * for a small map; the focus follows the fold, to the control that replaced
 * the one pressed.
 */
interface Props {
  title?: string
  collapsible?: boolean
  /** The fold's name — said with the title, « Replier Conformité EUDR ». */
  collapseLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  collapsible: false,
  collapseLabel: 'Replier',
})

const collapsed = defineModel<boolean>('collapsed', { default: false })

const host = ref<HTMLElement | null>(null)

/* The pressed control is replaced; the focus moves to the one replacing it. */
async function fold(next: boolean) {
  collapsed.value = next
  await nextTick()
  host.value?.querySelector<HTMLElement>(next ? '[data-map-panel-open]' : '[data-map-panel-fold]')?.focus()
}
</script>

<template>
  <!-- A box of no box: it only keeps hold of whichever form is shown. -->
  <div ref="host" class="ds-map-panel-host">
  <Button
    v-if="collapsible && collapsed"
    data-map-panel-open
    variant="secondary-gray"
    size="sm"
    :label="title ?? ''"
    icon-trailing="chevron-up"
    aria-expanded="false"
    @click="fold(false)"
  />
  <section v-else class="ds-map-panel" :aria-label="props.title">
    <div v-if="title" class="ds-map-panel__head">
      <span class="ds-map-panel__title">{{ title }}</span>
      <IconButton
        v-if="collapsible"
        data-map-panel-fold
        icon="chevron-down"
        size="xs"
        variant="subtle"
        :ariaLabel="`${collapseLabel} ${title}`"
        aria-expanded="true"
        @click="fold(true)"
      />
    </div>
    <slot />
  </section>
  </div>
</template>

<style scoped>
.ds-map-panel-host {
  display: contents;
}

.ds-map-panel {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  box-sizing: border-box;
  /* A ceiling for text, not for a row of buttons: what cannot wrap widens it. */
  max-width: 20rem;
  min-width: min-content;
  padding: var(--ds-spacing-lg);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface-sm);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-raised);
}

/* The head is one title line: the fold's 32px box gives back its 8px above,
   beside and below, so the line stays the title's while the target keeps
   its size. */
.ds-map-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  font: var(--ds-font-label-md-strong);
}

.ds-map-panel__title {
  min-width: 0;
  overflow: hidden;
  color: var(--ds-text-strong);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-map-panel__head :deep(.ds-icon-button) {
  margin-block: calc(-1 * var(--ds-spacing-md));
  margin-inline-end: calc(-1 * var(--ds-spacing-md));
}
</style>
