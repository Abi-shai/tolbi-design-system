<script setup lang="ts">
import { ModuleIcon } from '../ModuleIcon'
import { Scrollbar } from '../Scrollbar'
import type { ModuleName } from '../ModuleIcon'

export interface ModulesListItem {
  name:      ModuleName
  label?:    string
  active?:   boolean
  disabled?: boolean
}

interface Props {
  modules?: ModulesListItem[]
}

const props = withDefaults(defineProps<Props>(), {
  modules: () => [],
})

const emit = defineEmits<{
  select: [item: ModulesListItem]
}>()

function onSelect(item: ModulesListItem) {
  if (item.disabled) return
  emit('select', item)
}
</script>

<template>
  <div class="ds-modules-list">
    <Scrollbar class="ds-modules-list__viewport" shadows persistent>
      <div class="ds-modules-list__inner">
        <button
          v-for="mod in modules"
          :key="mod.name"
          class="ds-modules-list__item"
          :class="{
            'ds-modules-list__item--active':   mod.active,
            'ds-modules-list__item--disabled': mod.disabled,
          }"
          :disabled="mod.disabled"
          :aria-current="mod.active ? 'true' : undefined"
          @click="onSelect(mod)"
        >
          <!--
            The primitive, not the logo: the item button already supplies the surface
            (its own radius, hover background, and bg-selected when current), so the
            logo's tile would be a tile inside a tile and would fight the active state.
            aria-label is null because the visible label below already names the module.
          -->
          <ModuleIcon
            :module="mod.name"
            variant="illustration"
            :size="48"
            :aria-label="null"
          />
          <span class="ds-modules-list__label">{{ mod.label ?? mod.name }}</span>
        </button>
      </div>
    </Scrollbar>
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
  transition: background 0.12s ease;
}

.ds-modules-list__item:hover:not(:disabled) {
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

.ds-modules-list__item--active:hover:not(:disabled) {
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
</style>
