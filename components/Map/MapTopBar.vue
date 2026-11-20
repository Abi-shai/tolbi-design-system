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
import { Avatar } from '../Avatar'
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
 * **The bar.** 60px at `viewsSize="md"` (3.5 / 3.75 / 4rem for `sm` / `md` /
 * `lg` — `--ds-map-top-bar-height`, public: what starts under the bar reads it;
 * ADR-0236), the whole width, no corners; the map passes under it. **The map
 * controls' glass** (`bg-map-control` under `backdrop-map-control`, ADR-0236 —
 * it was the reading glass at 90 % with `shadow-md`): the map shows through,
 * the switch stands off it, and the `border-inset` rule along its foot is the
 * only edge — **no shadow** (amends ADR-0220). `spacing-xl` in from
 * both sides. Three zones: the start and the end share what is left, the
 * centre sits in the bar's middle.
 *
 * **Start** — **the module's mark alone** (ADR-0241): the drawing (48,
 * `variant="illustration"`), named, not interactive — it says which module one
 * is in. (`#module-menu` still makes it ADR-0221's menu, for a product that
 * keeps one.) Then the way out (`backLabel` — « Quitter » in the product;
 * `Button sm secondary-gray`, `arrow-left`) and **the project's name**
 * (`label-lg-strong`, one line, cut — given whole in a tooltip only when cut).
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
 * **End** — two groups (ADR-0243): the page's (`#action`, « Télécharger »,
 * « Partager »), then the map's and the person's (the basemap and the avatar,
 * `spacing-sm` apart). One 20px rule between them, only when the first is
 * there; none inside either. In order:
 * 1. **the project's action** (`#action`, one `Button sm`), with an optional
 *    count (`actionCount`);
 * 2. **the basemap** (`basemaps` + `v-model:basemap`, ADR-0242 — back from the
 *    tools column): `MapBasemapPicker`'s square thumbnail, opening under it at
 *    its end; square so it never reads as a second avatar beside the round one;
 * 3. **the file**, when asked: « Télécharger » (`#downloads`) and « Partager »
 *    (`share`, off by default);
 * 4. **the avatar**, last: **the app's own** (ADR-0242) — `HorizontalNavigation`'s
 *    `Dropdown trigger="avatar"`, the same header (`userName`, `userEmail`) and
 *    the product's rows (`#account-menu` — « Se déconnecter »). The module's
 *    credits head it only when the product passes `credits`.
 *
 * **The bar says where one is and lets one leave** (ADR-0241); search stays in
 * `MapNavigator`'s column. Every control is `sm`.
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
 * `viewsSize` sets the switch and the row together: `md` (48 in 3.75rem) was
 * retained; `sm` (44 in 3.5rem) and `lg` (52 in 4rem) were tried in the
 * product and stay available. The row does not depend on whether there are
 * views: a bar whose height changed between projects would be ADR-0042's
 * defect.
 */
export type MapTopBarSurface = 'glass' | 'solid'

/**
 * The views' switch and the bar's row together (ADR-0236): `sm` 44 in 3.5rem,
 * `md` 48 in 3.75rem (retained), `lg` 52 in 4rem (tried, read too exposed).
 */
export type MapTopBarViewsSize = 'sm' | 'md' | 'lg'

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
  /** The person's initials on the avatar, at the bar's end (ADR-0241). */
  userInitials?: string
  /** The person's picture on the avatar. */
  userSrc?: string
  /** Who is signed in — the account menu's header, as in the app's bar (ADR-0242). */
  userName?: string
  userEmail?: string
  /** The avatar's name — « Profil {userName} » by default, as in the app's bar. */
  accountLabel?: string
  /** The basemaps, between the action and the avatar (ADR-0242). Fewer than two: no picker. */
  basemaps?: MapBasemapOption[]
  /** The chosen basemap — `v-model:basemap`. */
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
  /**
   * The views' switch and the row with it (ADR-0236): `md` (48 in 3.75rem) by
   * default, `sm` (44 in 3.5rem), `lg` (52 in 4rem). The row's height is
   * public, `--ds-map-top-bar-height`.
   */
  viewsSize?: MapTopBarViewsSize
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
  userInitials: undefined,
  userSrc: undefined,
  userName: undefined,
  userEmail: undefined,
  accountLabel: undefined,
  basemaps: () => [],
  basemap: undefined,
  basemapLabel: 'Fond de carte',
  downloadLabel: 'Télécharger',
  share: false,
  shareLabel: 'Partager',
  surface: undefined,
  viewsSize: 'md',
})

const emit = defineEmits<{
  /** « Retour » — with the click, so a router can take a link over. */
  back: [event: MouseEvent]
  'update:view': [value: string]
  /** The credits at the head of the module's menu — the menu closes. */
  credits: [event: MouseEvent]
  share: []
  'update:basemap': [value: string]
}>()

const slots = defineSlots<{
  /** In place of the views' switch. */
  center?: () => unknown
  /** The project's one action — a `Button sm`. */
  action?: () => unknown
  /** The module's menu rows — `DropdownItem`s, the heavy action last after a divider. Absent: the mark alone. */
  'module-menu'?: (props: { close: () => void }) => unknown
  /** The account's rows, under the credits — `DropdownItem`s, sign-out last after a divider (ADR-0241). */
  'account-menu'?: (props: { close: () => void }) => unknown
  /** « Télécharger »'s rows — `DropdownItem`s. Absent: no « Télécharger ». */
  downloads?: (props: { close: () => void }) => unknown
}>()

const moduleOpen = ref(false)
const downloadsOpen = ref(false)
const accountOpen = ref(false)

/* The first view is the map: off it, the bar leaves the glass (ADR-0223). */
const solid = computed(() =>
  props.surface ? props.surface === 'solid' : props.views.length > 0 && props.view !== undefined && props.view !== props.views[0].value,
)

const moduleName = computed(() => props.moduleLabel ?? props.module)

/* The switch's size for each of the bar's (ADR-0236). */
const SWITCH_SIZE = { sm: 'lg-compact', md: 'lg', lg: 'xl' } as const

/* The view just chosen plays its glyph's arrival (ADR-0236) — not on load, not
   on choosing the shown view again. */
const glyphsReady = ref(false)
const arrived = ref<string | null>(null)
watch(() => props.view, (value) => { if (glyphsReady.value) arrived.value = value ?? null })

/* The groups at the end, and a rule only between two that are there. */
const hasAction = computed(() => !!slots.action)
const hasFile = computed(() => !!slots.downloads || props.share)
const hasAccount = computed(() => !!slots['account-menu'] || !!props.userInitials || !!props.userSrc)
const hasBasemap = computed(() => props.basemaps.length > 1)
const accountName = computed(() => props.accountLabel ?? `Profil ${props.userName ?? props.userInitials ?? ''}`.trim())

function onCredits(event: MouseEvent) {
  moduleOpen.value = false
  accountOpen.value = false
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
  <header class="ds-map-top-bar" :class="[`ds-map-top-bar--views-${viewsSize}`, { 'ds-map-top-bar--solid': solid }]">
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
        <template v-if="credits !== undefined && !$slots['account-menu']" #header>
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
          :size="SWITCH_SIZE[viewsSize]"
          :model-value="view"
          :aria-label="viewsLabel"
          class="ds-map-top-bar__views"
          @update:model-value="emit('update:view', $event)"
        >
          <ButtonGroupItem v-for="v in views" :key="v.value" :value="v.value" :label="v.label" :icon="v.glyph ? undefined : v.icon">
            <template v-if="v.glyph" #icon="{ selected }">
              <ViewGlyph :view="v.glyph" :active="selected" :arrived="arrived === v.value" :size="viewsSize === 'lg' ? 28 : 24" />
            </template>
          </ButtonGroupItem>
        </ButtonGroup>
      </slot>
    </div>

    <div class="ds-map-top-bar__end">
      <!-- Two groups (ADR-0243): the page's — its action, « Télécharger » — then
           the map's and the person's — the basemap and the avatar — with one
           rule between them, and none inside. -->
      <div v-if="hasAction" class="ds-map-top-bar__action">
        <slot name="action" />
        <span v-if="actionCount" class="ds-map-top-bar__count" aria-hidden="true">{{ actionCount }}</span>
      </div>

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

      <span v-if="(hasAction || hasFile) && (hasBasemap || hasAccount)" class="ds-map-top-bar__rule" aria-hidden="true" />

      <div v-if="hasBasemap || hasAccount" class="ds-map-top-bar__mine">
        <!-- The basemap (ADR-0242), square, opening under it at its end. -->
        <MapBasemapPicker
          v-if="hasBasemap"
          :basemaps="basemaps"
          :model-value="basemap"
          :label="basemapLabel"
          @update:model-value="emit('update:basemap', $event)"
        />

        <!-- The person, last: the app's own avatar and menu (ADR-0242) — the same
             `Dropdown trigger="avatar"` as `HorizontalNavigation`, the same header. -->
        <Dropdown
          v-if="$slots['account-menu']"
          v-model:open="accountOpen"
          trigger="avatar"
          class="ds-map-top-bar__account"
          :button-label="accountName"
          :avatar-initials="userInitials"
          :avatar-src="userSrc"
          :user-name="userName"
          :user-email="userEmail"
        >
          <template v-if="credits !== undefined" #header>
            <DropdownCredits :balance="credits" :module="moduleName" :href="creditsHref" @select="onCredits" />
          </template>
          <slot name="account-menu" :close="() => (accountOpen = false)" />
        </Dropdown>
        <Avatar v-else-if="hasAccount" :src="userSrc" :initials="userInitials" size="md" class="ds-map-top-bar__avatar" />
      </div>
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
  grid-template-rows: 3.75rem;
  padding-inline: var(--ds-spacing-xl);
  /* A line, not a rim of light (ADR-0220): `border-map-edge` did not show. The
     rule is `border-inset` (black 8 %), which sits on glass without dirtying
     it. No shadow since ADR-0236: on the map controls' glass the map shows
     through, and the bar reads as one of the map's controls, not over them. */
  box-shadow: inset 0 calc(-1 * var(--ds-border-width-default)) 0 var(--ds-border-inset);
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

/* The row follows the switch (ADR-0236): 44 in 3.5rem, 48 in 3.75rem, 52 in 4rem. */
.ds-map-top-bar--views-sm {
  grid-template-rows: 3.5rem;
}

.ds-map-top-bar--views-lg {
  grid-template-rows: 4rem;
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
/* The avatar, last (ADR-0242): the app's own, `Dropdown`'s avatar trigger —
   40px, its ring when open. Nothing of the bar's own. */
.ds-map-top-bar__avatar {
  flex: none;
}

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
/* The basemap and the avatar, one group (ADR-0243): no rule between them. */
.ds-map-top-bar__mine {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-sm);
}

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
   the map's overlay top, Tolbi xAI, a view laid under it. It follows
   `viewsSize`: 3.5 / 3.75 / 4rem. */
:root {
  --ds-map-top-bar-height: 3.75rem;
}

:root:has(.ds-map-top-bar--views-sm) {
  --ds-map-top-bar-height: 3.5rem;
}

:root:has(.ds-map-top-bar--views-lg) {
  --ds-map-top-bar-height: 4rem;
}
</style>
