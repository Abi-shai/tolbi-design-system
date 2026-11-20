<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Button } from '../Button'
import { ButtonGroup, ButtonGroupItem } from '../ButtonGroup'
import { Dropdown } from '../Dropdown'
import DropdownCredits from '../Dropdown/DropdownCredits.vue'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'
import type { IconName } from '../Icon'
import { ModuleIcon, type ModuleName } from '../ModuleIcon'
import { Tooltip } from '../Tooltip'
import { ViewGlyph, type ViewGlyphView } from '../ViewGlyph'
import MapBasemapPicker, { type MapBasemapOption } from './MapBasemapPicker.vue'

/** One view the bar switches between — « Carte », « Analytics ». */
export interface MapTopBarView {
  value: string
  label: string
  icon?: IconName
  /** The mode's glyph (ADR-0236) — in place of `icon`: `map`, `analytics`, `report`. */
  glyph?: ViewGlyphView
}

/**
 * The bar of a GIS project (ADR-0216, drawn again in ADR-0221). Entering a
 * map — Carbone (Inset), the eligibility zone, the ARR Dynamic baseline — the
 * app's bar (`HorizontalNavigation`) gives its place to the project's own,
 * laid on the map, as Felt does. `BarTransition` swaps the two.
 *
 * **The bar.** 60px (`--ds-map-top-bar-height`, 3.75rem, public — what starts
 * under the bar reads it; ADR-0236), the whole width, no corners; the map
 * passes under it. **The map controls' glass** (`bg-map-control` under
 * `backdrop-map-control`, ADR-0236 — it was the reading glass at 90 %), a
 * `border-inset` rule along its foot and `shadow-md` under it (ADR-0220). `spacing-xl` in from
 * both sides. Three zones: the start and the end share what is left, the
 * centre sits in the bar's middle.
 *
 * **Start** (ADR-0221) — the module's **mark is a menu**: the drawing (48,
 * `variant="illustration"`) and a `chevron-down` in one hover zone, opening
 * the package's `Dropdown` at its start, 18rem — the module's credits at its
 * head (`credits`, `DropdownCredits`), then the product's rows
 * (`#module-menu`). Then **« Retour »** (`Button sm secondary-gray`,
 * `arrow-left`) and **the project's name** (`label-lg-strong`, one line, cut
 * — given whole in a tooltip only when cut).
 *
 * **Centre** — the views (`views` + `v-model:view`), **the bar's central
 * element** (ADR-0236): the SIG has three modes — Explorer, Analyser,
 * Rapporter — and the switch says so. `ButtonGroup size="lg"` (48px, Tabs'
 * corners, not a pill), each view with its `ViewGlyph` (`glyph`) or an `icon`.
 * On glass the rail is the glass recessed (`--on-glass-sunk` + a 4 % inner
 * line) and the chosen view a raised tile (`--on-glass-raised`,
 * `elevation-map-selected`, a 6 % inner line); on a solid bar, `bg-neutral`
 * and `bg-default`. A view just chosen plays its glyph's arrival — never on
 * load, never on choosing the shown view again. Or the product's own `#center`.
 *
 * **End** — three groups, `spacing-sm` apart inside, a 20px rule between them:
 * 1. **the project's action** (`#action`, one `Button sm`), with an optional
 *    count (`actionCount`);
 * 2. **the map**: « Rechercher » (`search`, emits `search` — the map's search
 *    leaves the tools column for the bar) and **the basemap**
 *    (`basemaps` + `v-model:basemap`, `MapBasemapPicker`);
 * 3. **the file**: « Télécharger » (`#downloads`, a `Dropdown` at its end,
 *    16rem, the product's rows) and « Partager » (`share`).
 *
 * The profile is gone from the project's bar, and so is ⋯: what it held is
 * what « Télécharger » holds, and the account is in the module's menu.
 * Every control is `sm`.
 *
 * **Off the map, the bar is opaque** (ADR-0223). On a view that replaces the
 * map — Analytics — a glass bar casting a shadow on a page of data reads wrong:
 * `surface="solid"` is `bg-default`, nothing blurred, **no shadow**, the
 * `border-inset` rule alone, and its controls leave the glass too — the
 * `--on-glass-*` it hands down are reset, so the switch, the icons' hover and
 * open state and the basemap's trigger fall back on their values off the map.
 * Unset, the surface is **derived from `view`**: the first view is the map
 * (« Carte | Analytics »), any other is `solid`. The ground and the shadow fade
 * over `enter`, `easing-out`; nothing moves.
 *
 * The map's instruments move down under it: on the map's container, the product
 * sets `--ds-map-overlay-top: calc(var(--ds-map-top-bar-height) + var(--ds-spacing-lg))`.
 *
 * One size only: 48px was retained; 44 (with a 56 bar) and 52 (with a 64 bar)
 * were tried in the product, and 52 was too exposed. A bar whose height changed
 * between projects would be ADR-0042's defect, so the row is 3.75rem with or
 * without views.
 */
export type MapTopBarSurface = 'glass' | 'solid'

interface Props {
  /** The module the project belongs to — its mark at the start. */
  module?: ModuleName
  /** The module's name in words; the module's own by default. */
  moduleLabel?: string
  /** The mark's name as a menu — « Menu Inset » by default. */
  moduleMenuLabel?: string
  /**
   * The module's credits at the head of its menu (`DropdownCredits`). Absent:
   * no header; `null`: the balance on its way.
   */
  credits?: number | null
  /** Where the credits lead. Given, the block is a link; it still emits `credits`. */
  creditsHref?: string
  backLabel?: string
  /** Where « Retour » leads. Given, it is a link (`<a>`); it still emits `back`. */
  backHref?: string
  /** The project's name, after « Retour ». */
  projectName?: string
  /** The views the centre switches between. Empty: no switch (or the product's `#center`). */
  views?: MapTopBarView[]
  /** The view shown — `v-model:view`. */
  view?: string
  /** The switch's name for a reader. */
  viewsLabel?: string
  /** A count on the project's action — the auditor's open requests. Absent or 0: none. */
  actionCount?: number
  /** « Rechercher »: shown, it emits `search`. */
  search?: boolean
  searchLabel?: string
  /** The map's search is open — the button wears the open state. */
  searchOpen?: boolean
  /** The basemaps to choose from. Fewer than two: no picker. */
  basemaps?: MapBasemapOption[]
  /** The active basemap — `v-model:basemap`. */
  basemap?: string
  basemapLabel?: string
  /** « Télécharger »'s name — shown when `#downloads` is filled. */
  downloadLabel?: string
  /** « Partager »: shown, it emits `share`. */
  share?: boolean
  shareLabel?: string
  /**
   * `glass` over the map, `solid` over a view that replaces it (ADR-0223).
   * Unset: derived from `view` — the first view is the map, any other `solid`.
   */
  surface?: MapTopBarSurface
}

const props = withDefaults(defineProps<Props>(), {
  module: undefined,
  moduleLabel: undefined,
  moduleMenuLabel: undefined,
  credits: undefined,
  creditsHref: undefined,
  backLabel: 'Retour',
  backHref: undefined,
  projectName: undefined,
  views: () => [],
  view: undefined,
  viewsLabel: 'Vue',
  actionCount: undefined,
  search: false,
  searchLabel: 'Rechercher',
  searchOpen: false,
  basemaps: () => [],
  basemap: undefined,
  basemapLabel: 'Fond de carte',
  downloadLabel: 'Télécharger',
  share: true,
  shareLabel: 'Partager',
  surface: undefined,
})

const emit = defineEmits<{
  /** « Retour » — with the click, so a router can take a link over. */
  back: [event: MouseEvent]
  'update:view': [value: string]
  'update:basemap': [value: string]
  /** The credits at the head of the module's menu — the menu closes. */
  credits: [event: MouseEvent]
  search: []
  share: []
}>()

const slots = defineSlots<{
  /** In place of the views' switch. */
  center?: () => unknown
  /** The project's one action — a `Button sm`. */
  action?: () => unknown
  /** The module's menu rows — `DropdownItem`s, the heavy action last after a divider. Absent: the mark alone. */
  'module-menu'?: (props: { close: () => void }) => unknown
  /** « Télécharger »'s rows — `DropdownItem`s. Absent: no « Télécharger ». */
  downloads?: (props: { close: () => void }) => unknown
}>()

const moduleOpen = ref(false)
const downloadsOpen = ref(false)

/* The first view is the map: off it, the bar leaves the glass (ADR-0223). */
const solid = computed(() =>
  props.surface ? props.surface === 'solid' : props.views.length > 0 && props.view !== undefined && props.view !== props.views[0].value,
)

const moduleName = computed(() => props.moduleLabel ?? props.module)

/* The view just chosen plays its glyph's arrival (ADR-0236) — not on load, not
   on choosing the shown view again. */
const glyphsReady = ref(false)
const arrived = ref<string | null>(null)
watch(() => props.view, (value) => { if (glyphsReady.value) arrived.value = value ?? null })

/* The groups at the end, and a rule only between two that are there. */
const hasAction = computed(() => !!slots.action)
const hasMap = computed(() => props.search || props.basemaps.length > 1)
const hasFile = computed(() => !!slots.downloads || props.share)

function onCredits(event: MouseEvent) {
  moduleOpen.value = false
  emit('credits', event)
}

/* The name is given whole in a tooltip only when it is cut (ADR-0109). */
const nameEl = ref<HTMLElement | null>(null)
const nameCut = ref(false)
let observer: ResizeObserver | undefined
function measure() {
  const el = nameEl.value
  nameCut.value = !!el && el.scrollWidth > el.clientWidth
}
onMounted(() => {
  requestAnimationFrame(() => { glyphsReady.value = true })
  measure()
  if (nameEl.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(measure)
    observer.observe(nameEl.value)
  }
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <header class="ds-map-top-bar" :class="{ 'ds-map-top-bar--solid': solid }">
    <div class="ds-map-top-bar__start">
      <Dropdown
        v-if="module && $slots['module-menu']"
        v-model:open="moduleOpen"
        align="start"
        width="18rem"
        class="ds-map-top-bar__module"
      >
        <template #trigger="{ open, toggle }">
          <button
            type="button"
            class="ds-map-top-bar__mark-menu"
            :aria-label="moduleMenuLabel ?? `Menu ${moduleName}`"
            :aria-expanded="open"
            aria-haspopup="true"
            @click="toggle"
          >
            <ModuleIcon :module="module" variant="illustration" :size="48" :aria-label="null" />
            <Icon name="chevron-down" :size="16" class="ds-map-top-bar__chevron" aria-hidden="true" />
          </button>
        </template>
        <template v-if="credits !== undefined" #header>
          <DropdownCredits :balance="credits" :module="moduleName" :href="creditsHref" @select="onCredits" />
        </template>
        <slot name="module-menu" :close="() => (moduleOpen = false)" />
      </Dropdown>
      <ModuleIcon
        v-else-if="module"
        :module="module"
        variant="illustration"
        :size="48"
        :aria-label="moduleLabel"
        class="ds-map-top-bar__mark"
      />
      <Button
        variant="secondary-gray"
        size="sm"
        icon-leading="arrow-left"
        :label="backLabel"
        :href="backHref"
        class="ds-map-top-bar__back"
        @click="emit('back', $event)"
      />
      <Tooltip v-if="projectName" :title="projectName" placement="bottom-start" :disabled="!nameCut" class="ds-map-top-bar__name-anchor">
        <span ref="nameEl" class="ds-map-top-bar__name">{{ projectName }}</span>
      </Tooltip>
    </div>

    <div class="ds-map-top-bar__center">
      <slot name="center">
        <ButtonGroup
          v-if="views.length"
          size="lg"
          :model-value="view"
          :aria-label="viewsLabel"
          class="ds-map-top-bar__views"
          @update:model-value="emit('update:view', $event)"
        >
          <ButtonGroupItem v-for="v in views" :key="v.value" :value="v.value" :label="v.label" :icon="v.glyph ? undefined : v.icon">
            <template v-if="v.glyph" #icon="{ selected }">
              <ViewGlyph :view="v.glyph" :active="selected" :arrived="arrived === v.value" />
            </template>
          </ButtonGroupItem>
        </ButtonGroup>
      </slot>
    </div>

    <div class="ds-map-top-bar__end">
      <div v-if="hasAction" class="ds-map-top-bar__action">
        <slot name="action" />
        <span v-if="actionCount" class="ds-map-top-bar__count" aria-hidden="true">{{ actionCount }}</span>
      </div>

      <span v-if="hasAction && hasMap" class="ds-map-top-bar__rule" aria-hidden="true" />

      <template v-if="hasMap">
        <Tooltip v-if="search" :title="searchLabel" placement="bottom-end" :disabled="searchOpen">
          <IconButton icon="search" size="sm" :ariaLabel="searchLabel" :aria-expanded="searchOpen" @click="emit('search')" />
        </Tooltip>
        <MapBasemapPicker
          v-if="basemaps.length > 1"
          :basemaps="basemaps"
          :model-value="basemap"
          :label="basemapLabel"
          @update:model-value="emit('update:basemap', $event)"
        />
      </template>

      <span v-if="(hasAction || hasMap) && hasFile" class="ds-map-top-bar__rule" aria-hidden="true" />

      <Dropdown v-if="$slots.downloads" v-model:open="downloadsOpen" align="end" width="16rem">
        <template #trigger="{ open, toggle }">
          <Tooltip :title="downloadLabel" placement="bottom-end" :disabled="open">
            <IconButton
              icon="download"
              size="sm"
              :ariaLabel="downloadLabel"
              :aria-expanded="open"
              aria-haspopup="true"
              @click="toggle"
            />
          </Tooltip>
        </template>
        <slot name="downloads" :close="() => (downloadsOpen = false)" />
      </Dropdown>

      <Tooltip v-if="share" :title="shareLabel" placement="bottom-end">
        <IconButton icon="share-2" size="sm" :ariaLabel="shareLabel" @click="emit('share')" />
      </Tooltip>
    </div>
  </header>
</template>

<style scoped>
/* 56px, the whole width, reading glass, a rule of light along its foot (ADR-0216). */
.ds-map-top-bar {
  box-sizing: border-box;
  display: grid;
  /* The end never runs under the switch (ADR-0236): when its controls need more
     than half of what is left, the switch moves aside and the name gives. */
  grid-template-columns: minmax(0, 1fr) auto minmax(min-content, 1fr);
  align-items: center;
  gap: var(--ds-spacing-lg);
  width: 100%;
  /* 56, said as the row rather than as a height, so a wrapper can open it from
     0 (`BarTransition variant="reveal"`, ADR-0217): a declared height would be
     the row's floor. And the rule is drawn inside, not a border — a border is
     a floor too, and held 1px of glass over the map while it waited. */
  grid-template-rows: var(--ds-map-top-bar-height, 3.75rem);
  padding-inline: var(--ds-spacing-xl);
  /* A line and a shadow, not a rim of light (ADR-0220): `border-map-edge`
     (white 55 %) on 90 % white glass did not show, on the basemap's beige nor
     on the panel under it. The rule is `border-inset` (black 8 %), which sits
     on glass without dirtying it; `shadow-md` lifts the bar over the map. */
  box-shadow:
    inset 0 calc(-1 * var(--ds-border-width-default)) 0 var(--ds-border-inset),
    var(--ds-shadow-md);
  /* The map controls' glass (ADR-0236): the switch stands off it better than
     off the reading glass, and place names under it still stay apart from the
     project's name (no ground at all mixed them). */
  background: var(--ds-bg-map-control);
  -webkit-backdrop-filter: var(--ds-backdrop-map-control);
  backdrop-filter: var(--ds-backdrop-map-control);
  /* Glass ↔ solid (ADR-0223): the ground and the shadow fade, nothing moves.
     The shadow is the bar's elevation, not a focus ring. */
  /* token-lint-disable-next-line focus-ring-instant — the bar's elevation fading with its ground, not a focus ring (ADR-0223) */
  transition:
    background-color var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    box-shadow var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    backdrop-filter var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
  /* What it holds takes the glass's levels (ADR-0172/0173): the switch's
     recessed rail and raised pill, the focus ring, and the veil an open menu
     wears — `bg-hover` is the glass's own white (ADR-0216). */
  /* token-lint-disable-next-line no-shadowing-var — on map glass the role's value changes, not its name (ADR-0172) */
  --ds-text-subtlest: var(--ds-text-subtle);
  --on-glass-focus: var(--ds-focus-ring-map);
  --on-glass-hover: color-mix(in srgb, var(--ds-text-strong) 7%, transparent);
  /* The map panel's layers (ADR-0236): the rail a hollow with a 4 % inner
     line, the chosen view a raised tile with a 6 % one. */
  --on-glass-sunk: var(--ds-bg-map-sunk);
  --on-glass-sunk-border: transparent;
  --on-glass-sunk-edge: inset 0 0 0 var(--ds-border-width-default) color-mix(in srgb, var(--ds-text-strong) 4%, transparent);
  --on-glass-raised: var(--ds-bg-map-raised);
  --on-glass-raised-edge: color-mix(in srgb, var(--ds-text-strong) 6%, transparent);
  --on-glass-raised-shadow: var(--ds-elevation-map-selected);
  --on-glass-field-bg: var(--ds-bg-map-raised);
  --on-glass-field-border: color-mix(in srgb, var(--ds-text-strong) 16%, transparent);
  --on-glass-field-shadow: var(--ds-elevation-map-raised);
}

/* Off the map (ADR-0223): opaque, nothing blurred, no shadow — the rule alone.
   What it holds leaves the glass too: the context it hands down is reset, so
   each control falls back on its value off the map (rail `bg-neutral-subtle`,
   pill `bg-default` + `elevation-surface`, hover `bg-hover`). */
.ds-map-top-bar--solid {
  box-shadow: inset 0 calc(-1 * var(--ds-border-width-default)) 0 var(--ds-border-inset);
  background: var(--ds-bg-default);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  /* token-lint-disable-next-line no-shadowing-var — back to the role's own value off the glass (ADR-0223) */
  --ds-text-subtlest: inherit;
  --on-glass-focus: initial;
  --on-glass-hover: initial;
  /* The switch on a solid bar (ADR-0236): the rail `bg-neutral`, the tile
     `bg-default`, both inner lines kept. */
  --on-glass-sunk: var(--ds-bg-neutral);
  --on-glass-raised: initial;
  --on-glass-raised-shadow: initial;
  --on-glass-field-bg: initial;
  --on-glass-field-border: initial;
  --on-glass-field-shadow: initial;
}

/* Less transparency asked for: the same bar, opaque, nothing blurred (ADR-0172). */
@media (prefers-reduced-transparency: reduce) {
  .ds-map-top-bar {
    background: var(--ds-bg-default);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

.ds-map-top-bar__start {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  min-width: 0;
}

.ds-map-top-bar__mark,
.ds-map-top-bar__module,
.ds-map-top-bar__back {
  flex: none;
}

/* The mark as a menu (ADR-0221): the drawing and its chevron in one hover
   zone — the glass's veil, under the pointer and while the menu is open. */
.ds-map-top-bar__mark-menu {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xxs);
  padding: 0 var(--ds-spacing-xs) 0 0;
  border: 0;
  border-radius: var(--ds-radius-control);
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition:
    background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default),
    box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-map-top-bar__mark-menu:is(:hover, [aria-expanded='true']) {
  background: var(--on-glass-hover);
}

.ds-map-top-bar__mark-menu:focus-visible {
  outline: none;
  box-shadow: var(--on-glass-focus);
}

.ds-map-top-bar__chevron {
  flex: none;
  color: var(--ds-text-subtle);
}

/* The project's name: one line, the first thing to give. */
.ds-map-top-bar__name-anchor {
  min-width: 0;
}

.ds-map-top-bar__name {
  overflow: hidden;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ds-map-top-bar__center {
  display: flex;
  justify-content: center;
}

.ds-map-top-bar__end {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--ds-spacing-sm);
  min-width: 0;
}

/* The action's count, at its top right — the tools column's count (ADR-0171). */
.ds-map-top-bar__action {
  position: relative;
  display: inline-flex;
}

.ds-map-top-bar__count {
  position: absolute;
  top: calc(-1 * var(--ds-spacing-xs));
  right: calc(-1 * var(--ds-spacing-xs));
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding-inline: var(--ds-spacing-xs);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-brand-solid);
  color: var(--ds-text-on-brand-solid);
  font: var(--ds-font-label-md-strong);
  font-variant-numeric: tabular-nums;
  box-shadow: 0 0 0 var(--ds-border-width-strong) var(--ds-bg-default);
  pointer-events: none;
}

/* A vertical rule between two groups, 20px — the project, the map, the file. */
.ds-map-top-bar__rule {
  flex: none;
  width: var(--ds-border-width-default);
  height: var(--ds-spacing-2xl);
  margin-inline: var(--ds-spacing-xs);
  background: var(--ds-border-subtle);
}
</style>

<style>
/* The bar's height, public (ADR-0236): what starts under the bar reads it —
   the map's overlay top, a view laid under it. 3.75rem: the 48px switch with
   6px of glass above and below. */
:root {
  --ds-map-top-bar-height: 3.75rem;
}
</style>
