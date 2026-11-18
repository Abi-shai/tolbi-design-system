<script setup lang="ts">
import { ref } from 'vue'
import { Avatar } from '../Avatar'
import { Button } from '../Button'
import { ButtonGroup, ButtonGroupItem } from '../ButtonGroup'
import { Dropdown } from '../Dropdown'
import { IconButton } from '../IconButton'
import type { IconName } from '../Icon'
import { ModuleIcon, type ModuleName } from '../ModuleIcon'
import { Tooltip } from '../Tooltip'

/** One view the bar switches between — « Carte », « Analytics ». */
export interface MapTopBarView {
  value: string
  label: string
  icon?: IconName
}

/**
 * The bar of a GIS project (ADR-0216). Entering a map — Carbone (Inset), the
 * eligibility zone, the ARR Dynamic baseline — the app's bar
 * (`HorizontalNavigation`) gives its place to the project's own, laid on the
 * map, as Felt does (9 of 17 map products benchmarked replace the global bar
 * with the document's). `BarTransition` swaps the two.
 *
 * **The bar.** 56px, the whole width, no corners; the map passes under it.
 * Reading glass — `bg-map-read` (90 %) under `backdrop-map-read`, the map
 * panel's (72 % and opaque were compared) — with a `border-inset` rule along
 * its foot and `shadow-md` under it (ADR-0220: the rim of light did not
 * show). `spacing-xl` in from both sides: the edges of the panel and of the
 * map's tools under it. Three zones: the start and the end
 * share what is left, the centre sits in the bar's middle.
 *
 * **Start** — the module's mark, the same drawing and size as the app's bar
 * (48, `variant="illustration"`, named), then `spacing-lg` (the app's own gap
 * before its way home) and **« Retour »**: `Button sm secondary-gray`, an
 * `arrow-left`, a link with `backHref`. No trail.
 *
 * **Centre** — the views (`views` + `v-model:view`): `ButtonGroup shape="pill"`,
 * the legend's shape and glass, its segments 32px with their glyph. Or the
 * product's own `#center`.
 *
 * **End** — `spacing-sm` apart, in this order:
 * - **the project's action** (`#action`, one `Button sm`: `primary` when it moves
 *   the project on, `secondary-gray` + a glyph when it downloads), with an
 *   optional count (`actionCount`) at its top right — the auditor's open
 *   requests;
 * - **⋯** (`#menu`; the presence decides): `IconButton sm ghost` `ellipsis`,
 *   opening a `Dropdown` at its end, 18rem (15 cut « Synchroniser avec Verra »).
 *   The rows are the product's; open, the button wears the glass's veil;
 * - **Partager** (`share`): `IconButton sm ghost` `share-2`, no word;
 * - a vertical rule, 20px;
 * - **the profile** — the app bar's own trigger: `Dropdown trigger="avatar"`
 *   (`md`, 40) and the account menu when `#user-menu` is filled, else the
 *   avatar alone, which emits `user` (ADR-0053's shape).
 *
 * Every control is `sm`: the mix of `xs` and `sm` before flattened the buttons
 * beside the icons.
 *
 * The map's instruments move down under it: on the map's container, the product
 * sets `--ds-map-overlay-top: calc(3.5rem + var(--ds-spacing-lg))`.
 */
interface Props {
  /** The module the project belongs to — its mark at the start. */
  module?: ModuleName
  /** The mark's name for a reader; the module's own by default. */
  moduleLabel?: string
  backLabel?: string
  /** Where « Retour » leads. Given, it is a link (`<a>`); it still emits `back`. */
  backHref?: string
  /** The views the centre switches between. Empty: no switch (or the product's `#center`). */
  views?: MapTopBarView[]
  /** The view shown — `v-model:view`. */
  view?: string
  /** The switch's name for a reader. */
  viewsLabel?: string
  /** A count on the project's action — the auditor's open requests. Absent or 0: none. */
  actionCount?: number
  /** The ⋯'s name. */
  menuLabel?: string
  /** « Partager »: shown, it emits `share`. */
  share?: boolean
  shareLabel?: string
  userInitials?: string
  /** The account menu's header — read when `#user-menu` is filled. */
  userName?: string
  userEmail?: string
}

const props = withDefaults(defineProps<Props>(), {
  module: undefined,
  moduleLabel: undefined,
  backLabel: 'Retour',
  backHref: undefined,
  views: () => [],
  view: undefined,
  viewsLabel: 'Vue',
  actionCount: undefined,
  menuLabel: 'Plus d’actions',
  share: true,
  shareLabel: 'Partager',
  userInitials: 'TD',
  userName: undefined,
  userEmail: undefined,
})

const emit = defineEmits<{
  /** « Retour » — with the click, so a router can take a link over. */
  back: [event: MouseEvent]
  'update:view': [value: string]
  share: []
  /** The avatar, without `#user-menu`. With a menu the click opens it and emits nothing. */
  user: []
}>()

defineSlots<{
  /** In place of the views' switch. */
  center?: () => unknown
  /** The project's one action — a `Button sm`. */
  action?: () => unknown
  /** The ⋯'s rows — `DropdownItem`s. Absent: no ⋯. */
  menu?: (props: { close: () => void }) => unknown
  /** The account menu's rows. Absent: the avatar alone. */
  'user-menu'?: (props: { close: () => void }) => unknown
}>()

const menuOpen = ref(false)
const userMenuOpen = ref(false)
</script>

<template>
  <header class="ds-map-top-bar">
    <div class="ds-map-top-bar__start">
      <ModuleIcon
        v-if="module"
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
        @click="emit('back', $event)"
      />
    </div>

    <div class="ds-map-top-bar__center">
      <slot name="center">
        <ButtonGroup
          v-if="views.length"
          shape="pill"
          :model-value="view"
          :aria-label="viewsLabel"
          @update:model-value="emit('update:view', $event)"
        >
          <ButtonGroupItem v-for="v in views" :key="v.value" :value="v.value" :label="v.label" :icon="v.icon" />
        </ButtonGroup>
      </slot>
    </div>

    <div class="ds-map-top-bar__end">
      <div v-if="$slots.action" class="ds-map-top-bar__action">
        <slot name="action" />
        <span v-if="actionCount" class="ds-map-top-bar__count" aria-hidden="true">{{ actionCount }}</span>
      </div>

      <Dropdown v-if="$slots.menu" v-model:open="menuOpen" align="end" width="18rem">
        <template #trigger="{ open, toggle }">
          <Tooltip :title="menuLabel" placement="bottom-end" :disabled="open">
            <IconButton
              icon="ellipsis"
              size="sm"
              :ariaLabel="menuLabel"
              :aria-expanded="open"
              aria-haspopup="true"
              @click="toggle"
            />
          </Tooltip>
        </template>
        <slot name="menu" :close="() => (menuOpen = false)" />
      </Dropdown>

      <Tooltip v-if="share" :title="shareLabel" placement="bottom-end">
        <IconButton icon="share-2" size="sm" :ariaLabel="shareLabel" @click="emit('share')" />
      </Tooltip>

      <span class="ds-map-top-bar__rule" aria-hidden="true" />

      <Dropdown
        v-if="$slots['user-menu']"
        v-model:open="userMenuOpen"
        trigger="avatar"
        align="end"
        :button-label="`Profil ${userName ?? userInitials}`"
        :avatar-initials="userInitials"
        :user-name="userName"
        :user-email="userEmail"
      >
        <slot name="user-menu" :close="() => (userMenuOpen = false)" />
      </Dropdown>
      <button
        v-else
        type="button"
        class="ds-map-top-bar__user"
        :aria-label="`Profil ${userName ?? userInitials}`"
        @click="emit('user')"
      >
        <Avatar size="md" :initials="userInitials" />
      </button>
    </div>
  </header>
</template>

<style scoped>
/* 56px, the whole width, reading glass, a rule of light along its foot (ADR-0216). */
.ds-map-top-bar {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: var(--ds-spacing-lg);
  width: 100%;
  /* 56, said as the row rather than as a height, so a wrapper can open it from
     0 (`BarTransition variant="reveal"`, ADR-0217): a declared height would be
     the row's floor. And the rule is drawn inside, not a border — a border is
     a floor too, and held 1px of glass over the map while it waited. */
  grid-template-rows: 3.5rem;
  padding-inline: var(--ds-spacing-xl);
  /* A line and a shadow, not a rim of light (ADR-0220): `border-map-edge`
     (white 55 %) on 90 % white glass did not show, on the basemap's beige nor
     on the panel under it. The rule is `border-inset` (black 8 %), which sits
     on glass without dirtying it; `shadow-md` lifts the bar over the map. */
  box-shadow:
    inset 0 calc(-1 * var(--ds-border-width-default)) 0 var(--ds-border-inset),
    var(--ds-shadow-md);
  background: var(--ds-bg-map-read);
  -webkit-backdrop-filter: var(--ds-backdrop-map-read);
  backdrop-filter: var(--ds-backdrop-map-read);
  /* What it holds takes the glass's levels (ADR-0172/0173): the switch's
     recessed rail and raised pill, the focus ring, and the veil an open menu
     wears — `bg-hover` is the glass's own white (ADR-0216). */
  /* token-lint-disable-next-line no-shadowing-var — on map glass the role's value changes, not its name (ADR-0172) */
  --ds-text-subtlest: var(--ds-text-subtle);
  --on-glass-focus: var(--ds-focus-ring-map);
  --on-glass-hover: color-mix(in srgb, var(--ds-text-strong) 7%, transparent);
  --on-glass-sunk: var(--ds-bg-map-sunk);
  --on-glass-sunk-border: var(--ds-border-map-edge);
  --on-glass-raised: var(--ds-bg-map-raised);
  --on-glass-raised-shadow: var(--ds-elevation-map-raised);
  --on-glass-field-bg: var(--ds-bg-map-raised);
  --on-glass-field-border: color-mix(in srgb, var(--ds-text-strong) 16%, transparent);
  --on-glass-field-shadow: var(--ds-elevation-map-raised);
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

.ds-map-top-bar__mark {
  flex: none;
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

/* A vertical rule before the profile, 20px: the project's controls, then the person. */
.ds-map-top-bar__rule {
  flex: none;
  width: var(--ds-border-width-default);
  height: var(--ds-spacing-2xl);
  background: var(--ds-border-subtle);
}

/* The avatar alone — the app bar's own button (ADR-0053). */
.ds-map-top-bar__user {
  display: inline-flex;
  padding: 0;
  border: 0;
  border-radius: var(--ds-radius-pill);
  background: none;
  cursor: pointer;
  transition: box-shadow var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

.ds-map-top-bar__user:focus-visible {
  outline: none;
  box-shadow: var(--on-glass-focus, var(--ds-focus-ring-gray));
}
</style>
