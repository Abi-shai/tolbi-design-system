<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { SurfaceTransition } from '../SurfaceTransition'

export type MapPanelSize = 'sm' | 'lg'

/**
 * A surface on a map (ADR-0087) — the owner's drawing: `bg-default`, a
 * `border-subtle` hairline, `elevation-raised`, `radius-surface-sm`.
 *
 * `sm` (the default) holds an instruction, a measured area, a toolbar, a
 * year, a legend; its width is its content's, capped at 20rem. With a `title`
 * it is named by it, and `collapsible` folds it into a button bearing the title,
 * in its place (Planetary).
 *
 * `lg` is the panel a screen is read from (ADR-0099, ARR): **25rem, declared** —
 * a size, not a ceiling, or it would shift the map on every tab — as tall as
 * the overlay lets it, a head and a foot that stay, a body that scrolls between
 * them. `#header` takes what the head holds (`Tabs`), after the fold.
 *
 * **The fold (track A of `3649:1427`).** A panel with a `#header` folds into a
 * map control at its corner — `Button` icon-only, `secondary-gray`, `sm`, the
 * shape `MapControls` gives every control on a map — and the map is whole
 * again. The fold sits at the head's **end**, after the tabs, as the owner's
 * frames draw it (ADR-0103 — ADR-0099 had put it at the start). The focus
 * follows the fold, to the control that replaced the one pressed; the map is
 * not re-framed — the panel floats, it reserves nothing.
 *
 * **The motion is the catalogue's, chosen by what moves** (`SurfaceTransition`,
 * out then in: `enter` + `easing-out` in, `exit` + `easing-in` out — the exit
 * faster, ADR-0021):
 * - `lg` is a **side panel** — it stands on a whole side of the map — so it
 *   moves as `Dialog`'s side panel does (ADR-0079): the fade, with **24px of
 *   travel toward its edge** in place of the scale. The direction says where
 *   the panel lives; nothing crosses the map. On `end` it goes right.
 * - `sm` and the control it becomes **float** in a corner, so they keep the
 *   surface's scale from `--ds-motion-scale-enter`, grown from that corner.
 */
interface Props {
  title?: string
  size?: MapPanelSize
  collapsible?: boolean
  /** The fold's name — said with the title, « Replier Conformité EUDR ». */
  collapseLabel?: string
  /** The unfold's name, on the control the panel became. */
  expandLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: undefined,
  size: 'sm',
  collapsible: false,
  collapseLabel: 'Replier',
  expandLabel: 'Déplier',
})

const slots = defineSlots<{
  default?: () => unknown
  /** The head's content, after the fold — `Tabs`. Replaces the title line; `title` still names the panel. */
  header?: () => unknown
  /** The foot, held at the bottom while the body scrolls — the panel's one action. */
  footer?: () => unknown
}>()

const collapsed = defineModel<boolean>('collapsed', { default: false })

const host = ref<HTMLElement | null>(null)
const panelId = `ds-map-panel-${useId()}`
const named = (verb: string) => (props.title ? `${verb} ${props.title}` : verb)
const iconFold = computed(() => !!slots.header)

/* The pressed control is replaced; the focus moves to the one replacing it
   as it starts to arrive (out, then in) — never left on the page between. */
async function fold(next: boolean) {
  collapsed.value = next
  await nextTick()
}
function focusArrived() {
  host.value?.querySelector<HTMLElement>(collapsed.value ? '[data-map-panel-open]' : '[data-map-panel-fold]')?.focus()
}
</script>

<template>
  <!-- A box of no box: it only keeps hold of whichever form is shown. -->
  <div ref="host" class="ds-map-panel-host">
    <SurfaceTransition mode="out-in" @enter="focusArrived">
      <!-- With a head of its own: a map control at the panel's corner. -->
      <!-- The transition is the wrapper's: `Button` declares its own `transition`,
           which outweighs the surface's and would make it arrive in one frame. -->
      <div v-if="collapsible && collapsed && iconFold" key="open-icon" class="ds-map-panel__unfold">
      <Button
        data-map-panel-open
        variant="secondary-gray"
        size="sm"
        icon-only
        icon-leading="panel-left"
        :label="named(expandLabel)"
        aria-expanded="false"
        :aria-controls="panelId"
        @click="fold(false)"
      />
      </div>
      <!-- A small panel: a button bearing its title, in its place. -->
      <div v-else-if="collapsible && collapsed" key="open-title" class="ds-map-panel__unfold">
      <Button
        data-map-panel-open
        variant="secondary-gray"
        size="sm"
        :label="title ?? ''"
        icon-trailing="chevron-up"
        aria-expanded="false"
        :aria-controls="panelId"
        @click="fold(false)"
      />
      </div>
      <section
        v-else
        :id="panelId"
        key="panel"
        class="ds-map-panel"
        :class="`ds-map-panel--${size}`"
        :aria-label="props.title"
      >
        <div v-if="slots.header" class="ds-map-panel__head ds-map-panel__head--slot">
          <div class="ds-map-panel__header"><slot name="header" /></div>
          <IconButton
            v-if="collapsible"
            data-map-panel-fold
            icon="panel-left"
            size="sm"
            variant="subtle"
            :ariaLabel="named(collapseLabel)"
            aria-expanded="true"
            :aria-controls="panelId"
            @click="fold(true)"
          />
        </div>
        <div v-else-if="title" class="ds-map-panel__head">
          <span class="ds-map-panel__title">{{ title }}</span>
          <IconButton
            v-if="collapsible"
            data-map-panel-fold
            icon="chevron-down"
            size="xs"
            variant="subtle"
            :ariaLabel="named(collapseLabel)"
            aria-expanded="true"
            :aria-controls="panelId"
            @click="fold(true)"
          />
        </div>
        <div class="ds-map-panel__body"><slot /></div>
        <div v-if="slots.footer" class="ds-map-panel__foot"><slot name="footer" /></div>
      </section>
    </SurfaceTransition>
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
  /* ADR-0021: the consuming surface sets its own origin — it goes to its
     corner, where the control it becomes stands. */
  transform-origin: top left;
}

/* A side panel leaves toward its edge and comes back from it (ADR-0079's
   motion, ADR-0103): 24px of travel in place of the scale. The edge is the
   place's — `MapOverlay` turns it for `end`. Applied to `SurfaceTransition`'s
   own classes, so the durations and curves stay the catalogue's. */
.ds-map-panel--lg.ds-surface-enter-from,
.ds-map-panel--lg.ds-surface-leave-to {
  transform: translateX(calc(var(--map-panel-side, -1) * var(--ds-spacing-3xl)));
}

.ds-map-panel__body {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  min-width: 0;
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

.ds-map-panel__head:not(.ds-map-panel__head--slot) :deep(.ds-icon-button) {
  margin-block: calc(-1 * var(--ds-spacing-md));
  margin-inline-end: calc(-1 * var(--ds-spacing-md));
}

/* ── lg: the panel a screen is read from ──────────────────────────────── */
/*
  Declared, so the map beside it does not move as the content changes; as
  tall as the overlay allows (MapOverlay caps at its box less 32px), the body
  scrolling between a head and a foot that stay. The rhythm is a panel's —
  12 above and below the head and the foot, 16 at the sides — and the body's
  blocks are 16 apart.
*/
.ds-map-panel--lg {
  width: 25rem;
  max-width: 100%;
  /* In a place that has a height — a whole side of the map (ADR-0103) — it
     takes it, and its foot sits at the bottom; in a corner, it hugs. */
  flex: 1 1 auto;
  min-height: 0;
  max-height: 100%;
  gap: 0;
  padding: 0;
  border-radius: var(--ds-radius-surface);
}

.ds-map-panel--lg .ds-map-panel__head {
  flex: none;
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
}

.ds-map-panel--lg .ds-map-panel__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  gap: var(--ds-spacing-xl);
  padding: 0 var(--ds-spacing-xl) var(--ds-spacing-xl);
}

.ds-map-panel__head--slot {
  justify-content: flex-start;
}

.ds-map-panel__header {
  flex: 1 1 auto;
  min-width: 0;
}

.ds-map-panel__foot {
  flex: none;
  display: flex;
  flex-direction: column;
  /* The action keeps its own width, as the GIS screen draws it (ADR-0103). */
  align-items: flex-start;
  gap: var(--ds-spacing-md);
}

/* The rule is **inset** — it stops at the content's edges, 16px from the
   panel's, as `Dialog`'s side panel draws it (ADR-0079): a rule that runs to
   the border reads as a seam in the surface; inset, it separates the foot from
   the body and nothing else. A drawn line, so the 1px is added above. */
.ds-map-panel--lg .ds-map-panel__foot {
  position: relative;
  padding:
    calc(var(--ds-spacing-lg) + var(--ds-border-width-default)) var(--ds-spacing-xl)
    var(--ds-spacing-lg);
}

.ds-map-panel--lg .ds-map-panel__foot::before {
  content: '';
  position: absolute;
  top: 0;
  right: var(--ds-spacing-xl);
  left: var(--ds-spacing-xl);
  height: var(--ds-border-width-default);
  background: var(--ds-border-subtle);
}

.ds-map-panel__unfold {
  display: flex;
  transform-origin: top left;
}
</style>
