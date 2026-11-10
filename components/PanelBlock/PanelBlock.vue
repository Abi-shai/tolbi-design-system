<script setup lang="ts">
import { Comment, Fragment, Text, useId, type FunctionalComponent, type VNode } from 'vue'
import { Button } from '../Button'
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
 *
 * **It carries a hairline** (ADR-0148, the owner's eligible-zone panel): a
 * block sits on the panel's white and its tint alone is 1.05:1 there.
 *
 * **`limit`** makes the body a list that holds its first items and unfolds in
 * place for the rest — `AlertsBlock`'s behaviour (ADR-0143), owned here so a
 * second list does not redraw it: past `limit`, one button « Tout voir (n) »
 * that turns to « Réduire ». Each top-level node of the default slot is an
 * item (a `v-for` counts as its items).
 */
interface Props {
  title: string
  /** What the title's term means. */
  help?: string
  /** 3 inside a panel titled in `h2`. */
  headingLevel?: SectionCardHeadingLevel
  /** Items shown before « Tout voir ». Absent, the body is shown whole. */
  limit?: number
  seeAllLabel?: string
  collapseLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  help: undefined,
  headingLevel: 3,
  limit: undefined,
  seeAllLabel: 'Tout voir',
  collapseLabel: 'Réduire',
})

/** Unfolded, with `limit`. */
const expanded = defineModel<boolean>('expanded', { default: false })

const slots = defineSlots<{
  default?: () => unknown
  /** On the title's line, at its end — a `Badge`, a count. */
  aside?: () => unknown
}>()

const restId = `ds-panel-block-rest-${useId()}`

/* The slot's items: fragments (a `v-for`) opened, comments and blank text dropped. */
function flatten(nodes: VNode[]): VNode[] {
  return nodes.flatMap((n) => {
    if (n.type === Fragment) return flatten(n.children as VNode[])
    if (n.type === Comment) return []
    if (n.type === Text && !String(n.children).trim()) return []
    return [n]
  })
}

/* Read in the render, so it follows what the slot holds now. */
function split() {
  const items = flatten((slots.default?.() as VNode[] | undefined) ?? [])
  const cut = props.limit ?? items.length
  return { total: items.length, head: items.slice(0, cut), rest: items.slice(cut) }
}

/* Renders the vnodes it is handed, as they are. */
const Nodes: FunctionalComponent<{ nodes: VNode[] }> = (p) => p.nodes
</script>

<template>
  <SectionCard :title="title" :help="help" :heading-level="headingLevel" density="compact" class="ds-panel-block">
    <template v-if="slots.aside" #actions><slot name="aside" /></template>
    <slot v-if="limit === undefined" />
    <template v-else>
    <template v-for="parts in [split()]" :key="0">
      <div class="ds-panel-block__list" :class="{ 'ds-panel-block__list--open': expanded }">
        <Nodes :nodes="parts.head" />
        <!-- The rest opens its own space (ADR-0025), and leaves the reader's way once closed. -->
        <div v-if="parts.rest.length" :id="restId" class="ds-panel-block__rest">
          <div class="ds-panel-block__rest-inner"><Nodes :nodes="parts.rest" /></div>
        </div>
      </div>
      <div v-if="parts.rest.length" class="ds-panel-block__foot">
        <!-- One button, its words turning (ADR-0143, amended): it unfolds, then says « Réduire ». -->
        <Button
          variant="link"
          size="xs"
          :icon-trailing="expanded ? 'chevron-up' : 'chevron-down'"
          :label="expanded ? collapseLabel : `${seeAllLabel} (${parts.total})`"
          :aria-expanded="expanded ? 'true' : 'false'"
          :aria-controls="restId"
          @click="expanded = !expanded"
        />
      </div>
    </template>
    </template>
  </SectionCard>
</template>

<style scoped>
/*
  The hairline (ADR-0148): `border-subtle`, where the owner's frame binds
  `border-subtlest` — in dark that token *is* the block's ground (1.000:1) and
  the edge would vanish; `border-subtle` is 1.18:1 on the panel in light and
  1.64:1 in dark, the edge every elevated surface already carries (ADR-0030).
  `Card sunk` draws a transparent 1px border, so this moves nothing.
*/
.ds-panel-block {
  border-color: var(--ds-border-subtle);
}

/*
  A list's own rhythm: `--panel-block-list-gap`, a variant switch (ADR-0010) —
  `AlertsBlock`'s 40px rows sit 6 apart, the body's 8 otherwise.
*/
.ds-panel-block__list {
  display: flex;
  flex-direction: column;
  gap: var(--panel-block-list-gap, var(--ds-spacing-md));
  min-width: 0;
}

/*
  The items past the limit: ADR-0025's `0fr → 1fr` on the element that
  transitions. In over `enter`, the block making room; out over `exit`. Hidden
  from a reader once closed. The list's gap is carried inside, so a closed rest
  leaves none.
*/
.ds-panel-block__rest {
  display: grid;
  grid-template-rows: 0fr;
  margin-top: calc(-1 * var(--panel-block-list-gap, var(--ds-spacing-md)));
  visibility: hidden;
  transition:
    grid-template-rows var(--ds-motion-duration-exit) var(--ds-motion-easing-in),
    visibility 0s linear var(--ds-motion-duration-exit);
}

.ds-panel-block__list--open .ds-panel-block__rest {
  grid-template-rows: 1fr;
  visibility: visible;
  transition:
    grid-template-rows var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    visibility 0s;
}

.ds-panel-block__rest-inner {
  display: flex;
  flex-direction: column;
  gap: var(--panel-block-list-gap, var(--ds-spacing-md));
  min-height: 0;
  padding-top: var(--panel-block-list-gap, var(--ds-spacing-md));
  overflow: hidden;
}

.ds-panel-block__foot {
  display: flex;
  align-items: center;
}
</style>
