<script setup lang="ts">
import { Icon } from '../Icon'
import { ModuleIcon } from '../ModuleIcon'
import { Scrollbar } from '../Scrollbar'
import type { ModuleName } from '../ModuleIcon'

export interface ModulesListItem {
  name:      ModuleName
  label?:    string
  active?:   boolean
  disabled?: boolean
  /**
   * Where the module lives (ADR-0164). Given, the entry is a real `<a>` —
   * middle click, a new tab, the address on hover — and still emits `select`
   * with the click, so a router can take over (`event.preventDefault()`).
   */
  href?:     string
}

/**
 * Where the list stands (ADR-0164). `panel` — the bar's drawer: a fixed
 * 3-column box of 48px drawings, two rows and the drawings of a third, its
 * own elevation (ADR-0163). `page` — the modules on a page (etolbi's home):
 * a fluid grid, no fixed height, no shadow, each entry a row — the drawing at
 * 32 and the name — on a bordered block.
 */
export type ModulesListLayout = 'panel' | 'page'

interface Props {
  modules?: ModulesListItem[]
  layout?:  ModulesListLayout
}

const props = withDefaults(defineProps<Props>(), {
  modules: () => [],
  layout:  'panel',
})

const emit = defineEmits<{
  /** An entry was pressed — with the click, so a link's navigation can be taken over. */
  select: [item: ModulesListItem, event: MouseEvent]
}>()

function onSelect(item: ModulesListItem, event: MouseEvent) {
  if (item.disabled) {
    event.preventDefault()
    return
  }
  /* A link clicked with a modifier is the browser's (ADR-0165): a new tab, a
     new window, a download. Emitting would let a router take a click the
     person meant for the browser — so the product had to filter it itself. */
  if (item.href && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) return
  emit('select', item, event)
}

/* A link that is the current page says so as a page (ADR-0033); a button says
   « current » — this is where you are. */
function current(item: ModulesListItem) {
  if (!item.active) return undefined
  return item.href ? 'page' : 'true'
}
</script>

<template>
  <div class="ds-modules-list" :class="`ds-modules-list--${layout}`">
    <!-- The drawer scrolls inside its box; a page scrolls itself. -->
    <component
      :is="layout === 'panel' ? Scrollbar : 'div'"
      class="ds-modules-list__viewport"
      v-bind="layout === 'panel' ? { shadows: true, persistent: true } : {}"
    >
      <ul class="ds-modules-list__inner">
        <li v-for="mod in modules" :key="mod.name" class="ds-modules-list__entry">
          <!--
            A link when the module has an address (ADR-0164), else a button.
            A disabled link keeps its look and drops its `href`: an `<a>`
            without one is not focusable and goes nowhere.
          -->
          <component
            :is="mod.href ? 'a' : 'button'"
            class="ds-modules-list__item"
            :class="{
              'ds-modules-list__item--active':   mod.active,
              'ds-modules-list__item--disabled': mod.disabled,
            }"
            :href="mod.href && !mod.disabled ? mod.href : undefined"
            :type="mod.href ? undefined : 'button'"
            :disabled="!mod.href && mod.disabled ? true : undefined"
            :aria-disabled="mod.href && mod.disabled ? 'true' : undefined"
            :aria-current="current(mod)"
            @click="onSelect(mod, $event)"
          >
            <!--
              The primitive, not the logo: the entry already supplies the surface
              (its own radius, hover background, and bg-selected when current), so the
              logo's tile would be a tile inside a tile and would fight the active state.
              aria-label is null because the visible label already names the module.
            -->
            <ModuleIcon
              :module="mod.name"
              variant="illustration"
              :size="layout === 'page' ? 32 : 48"
              :aria-label="null"
            />
            <span class="ds-modules-list__label">{{ mod.label ?? mod.name }}</span>
            <!-- On a page, the way out of it (ADR-0165): shown with the hover, its place kept. -->
            <Icon
              v-if="layout === 'page' && !mod.disabled"
              name="arrow-up-right"
              :size="16"
              class="ds-modules-list__go"
              aria-hidden="true"
            />
          </component>
        </li>
      </ul>
    </component>
  </div>
</template>

<style scoped>
/*
 * Figma node 518:15253
 * Outer  : p-sm (6px), scroll délégué à <Scrollbar>, align-items flex-start
 *          → hauteur : deux rangées et le dessin d'une troisième (ADR-0163), 288px
 * Inner  : w-246px, p-md (8px), flex wrap, gap-xl (16px)
 *          2 rangées = 8+90+16+90+8 = 212px → la boîte s'arrête là
 *          3 rangées et plus → 276px visibles (2 rangées + 16 + 56 : le dessin de la 3e), le reste défile
 * Item   : w-66px, h-90px, p-md (8px), flex-col, gap-md (8px)
 */

/*
 * Scrolling is delegated to <Scrollbar> (ADR-0001), whose thumb is absolutely
 * positioned over the content. It stands from the first frame here
 * (`persistent`, ADR-0163), so the inner panel keeps a gutter for it.
 */
/*
  Two rows and the top of a third (ADR-0163): the panel used to stop exactly
  under the second row (224px), so the eleven modules past the sixth were
  out of sight with nothing saying so. It now shows the third row's padding
  and its whole drawing, the label left below — the modules are recognised,
  and a row without its words reads as « more below » — under the viewport's
  end fade, and the thumb stands from the first frame. Fewer than seven
  modules, it hugs its two rows.
*/
.ds-modules-list {
  --modules-list-item: 90px;
  --modules-list-peek: calc(var(--ds-spacing-md) + 48px);

  box-sizing: border-box;
  background: var(--ds-bg-neutral-subtle);
  border-radius: var(--ds-radius-surface);
  padding: var(--ds-spacing-sm);
  /*
    The panel carries its own elevation (ADR-0006 — a component owns its
    chrome). It used to be the bar's: `.ds-hnav__modules-dropdown` declared the
    same `box-shadow` on this very element, under a comment reading
    "positionnement uniquement". Two scopes writing one property on one box, and
    a panel that was flat everywhere else.

    `elevation-overlay` is what every floating surface in the catalogue takes —
    Dropdown, InputDropdown, Toast, ChartTooltip.
  */
  box-shadow: var(--ds-elevation-overlay);
  display: inline-flex;
  align-items: flex-start;
  flex-shrink: 0;
}

.ds-modules-list__viewport {
  /* The inner's top padding, two rows and their gaps, then the peek. */
  max-height: calc(var(--ds-spacing-md) + 2 * var(--modules-list-item) + 2 * var(--ds-spacing-xl) + var(--modules-list-peek));
  /* The cut follows the inner panel's corners rather than slicing it flat. */
  border-radius: var(--ds-radius-surface);
  overflow: hidden;
}

.ds-modules-list__inner {
  margin: 0;
  list-style: none;
  /* 246 for three columns, plus a gutter for the thumb, which now stands
     (ADR-0163): floating over the third column it cut the current module's
     ground by 4px. The thumb is 8px inset 4 — `spacing-lg` of room. */
  width: calc(246px + var(--ds-spacing-lg));
  box-sizing: border-box;
  background: var(--ds-bg-default);
  border-radius: var(--ds-radius-surface);
  padding: var(--ds-spacing-md);
  padding-inline-end: calc(var(--ds-spacing-md) + var(--ds-spacing-lg));
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-spacing-xl);
  align-content: flex-start;
}

.ds-modules-list__entry {
  display: flex;
}

.ds-modules-list__item {
  width: 66px;
  height: var(--modules-list-item);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ds-spacing-md);
  /* Vertical padding only. The 48px drawing centres itself in the 66px tile
     either way; the label gets the tile's full width — at 50px the current
     module's strong weight cut « Carbone » (ADR-0050). */
  padding: var(--ds-spacing-md) 0;
  background: transparent;
  border: none;
  border-radius: var(--ds-radius-control);
  cursor: pointer;
  overflow: hidden;
  flex-shrink: 0;
  color: inherit;
  font: inherit;
  text-decoration: none;
  /* The package's own pace (ADR-0164), not a hand-written 0.12s; the focus
     ring at `instant`, as every ring (ADR-0022). */
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* It had none: a keyboard reached the modules unseen. */
.ds-modules-list__item:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-brand);
}

@media (prefers-reduced-motion: reduce) {
  .ds-modules-list__item {
    transition: none;
  }
}

.ds-modules-list__item:hover:not(:disabled):not([aria-disabled='true']) {
  background: var(--ds-bg-hover);
}

/*
  The current module, marked the one way every list in the catalogue marks its
  current item (ADR-0050): its own ground, that ground's ink, the role's strong
  weight. It used to be the tint alone — 1.145:1 against the panel in dark,
  where hover is 1.233:1, so hovering any other module outshone the one you
  were in. `aria-current`, not a pressed state: this is where you are.

  The hover rule above outweighs this class (`:hover:not(:disabled)` counts
  three), so the current module's hover is restated in its own family.
*/
.ds-modules-list__item--active {
  background: var(--ds-bg-selected);
}

.ds-modules-list__item--active:hover:not(:disabled):not([aria-disabled='true']) {
  background: var(--ds-bg-selected-hover);
}

.ds-modules-list__item--disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ds-modules-list__label {  font: var(--ds-font-label-md);
  text-align: center;
  color: var(--ds-text-default);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.ds-modules-list__item--active .ds-modules-list__label {
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-on-brand-subtle);
}

/*
  ── On a page (ADR-0164) ────────────────────────────────────────────────
  etolbi's home, as its own recomposition drew it (`modules-row.vue`): a
  fluid grid that folds (six a row on a desktop, fewer when room runs out),
  each module a bordered block with its drawing at 32 and its name on one
  line. No fixed height, no shadow, no ground of its own — the page is the
  ground. The current module keeps the drawer's mark (ADR-0050).
*/
.ds-modules-list--page {
  display: block;
  padding: 0;
  background: none;
  border-radius: 0;
  box-shadow: none;
}

.ds-modules-list--page .ds-modules-list__inner {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: var(--ds-spacing-lg);
  padding: 0;
  background: none;
  border-radius: 0;
}

.ds-modules-list--page .ds-modules-list__item {
  flex: 1;
  flex-direction: row;
  justify-content: flex-start;
  width: auto;
  height: 3.5rem;
  padding: 0 var(--ds-spacing-lg);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  background: var(--ds-bg-default);
}

.ds-modules-list--page .ds-modules-list__label {
  width: auto;
  min-width: 0;
  font: var(--ds-font-label-md-strong);
  color: var(--ds-text-strong);
  text-align: start;
}

.ds-modules-list--page .ds-modules-list__item--active {
  background: var(--ds-bg-selected);
}

.ds-modules-list--page .ds-modules-list__item--active .ds-modules-list__label {
  color: var(--ds-text-on-brand-subtle);
}

/*
  The way out (ADR-0165): an `arrow-up-right` at the block's end, in
  `text-subtle`, arriving with the hover ground on the same pace and leaving
  with it — and on the keyboard's focus too. It is always in the row, only
  transparent, so the name's ellipsis is the same with or without it: the
  arrow never pushes the name.
*/
.ds-modules-list__go {
  flex: none;
  margin-inline-start: auto;
  color: var(--ds-text-subtle);
  opacity: 0;
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-modules-list__item:is(:hover, :focus-visible) .ds-modules-list__go {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .ds-modules-list__go {
    transition: none;
  }
}
</style>
