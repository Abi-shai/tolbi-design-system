<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Logo } from '../Logo'
import { Breadcrumbs } from '../Breadcrumbs'
import { Avatar } from '../Avatar'
import { CreditsChip } from '../CreditsChip'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import { Tooltip } from '../Tooltip'
import { ModulesList } from '../ModulesList'
import { SurfaceTransition } from '../SurfaceTransition'
import type { ModulesListItem } from '../ModulesList'
import type { CreditsChipTone } from '../CreditsChip'
import type { BreadcrumbsItem } from '../Breadcrumbs'

/**
 * A crumb is what `Breadcrumbs` calls a crumb. `active` is gone: the current
 * segment is the **last** one, by position — a per-item flag let a trail have
 * zero or two current segments and meant nothing knew where the end was
 * (ADR-0024, the same call `ButtonGroupItem.active` got).
 */
export type BreadcrumbItem = BreadcrumbsItem

export type NavModule = ModulesListItem

interface Props {
  breadcrumbs?:     BreadcrumbItem[]
  /** Où mène la maison du fil. Avec, c'est une ancre ; sans, un bouton. */
  homeHref?:        string
  /** Le nom accessible de la maison — une chaîne appartient au produit. */
  homeLabel?:       string
  credits?:         number
  /** Expiry reminder shown in the credits chip, e.g. `Expirent dans 14 jours`. */
  creditsReminder?: string
  /** How bad the credits situation is — see `CreditsChipTone`. */
  creditsTone?: CreditsChipTone
  userInitials?:    string
  hasNotification?: boolean
  modules?:         NavModule[]
}

const props = withDefaults(defineProps<Props>(), {
  credits:         0,
  userInitials:    'TD',
  hasNotification: false,
  modules:         () => [],
})

const emit = defineEmits<{
  /**
   * La maison du fil. **Distinct de `learn`** : elle émettait le même
   * évènement que « Apprendre », donc cliquer sur l'accueil ouvrait le centre
   * d'aide.
   */
  home:            [event: MouseEvent]
  /** Un maillon du fil a été activé — émis même sur une ancre, pour qu'un
      routeur puisse `preventDefault()` et naviguer côté client. */
  'breadcrumb-select': [item: BreadcrumbItem, event: MouseEvent]
  learn:           []
  settings:        []
  notifications:   []
  user:            []
  credits:         []
  'module-select': [module: NavModule]
}>()

const activeTooltip = ref<string | null>(null)
function showTooltip(name: string) {
  if (modulesOpen.value) return
  activeTooltip.value = name
}
function hideTooltip() { activeTooltip.value = null }

// ── Modules dropdown ───────────────────────────────────────────────
const modulesOpen    = ref(false)
const modulesWrapRef = ref<HTMLElement | null>(null)

function toggleModules() {
  modulesOpen.value = !modulesOpen.value
  if (modulesOpen.value) hideTooltip()
}

function selectModule(mod: NavModule) {
  if (mod.disabled) return
  emit('module-select', mod)
  modulesOpen.value = false
}

function onDocClick(e: MouseEvent) {
  if (modulesWrapRef.value && !modulesWrapRef.value.contains(e.target as Node)) {
    modulesOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <header class="ds-hnav">

    <!-- ── Gauche : logo + breadcrumbs ────────────────────────────────── -->
    <div class="ds-hnav__left">
      <!-- The coloured lockup at Figma's tightened `sm` size. -->
      <Logo variant="default" size="sm" alt="Tolbi" />

      <!--
        The catalogue's Breadcrumbs, not a second drawing of it (ADR-0001).
        It renders at every state including `Accueil`, where the trail is the
        house alone: the home page is a depth, not the absence of one.
      -->
      <Breadcrumbs
        :items="breadcrumbs ?? []"
        :home-href="homeHref"
        :home-label="homeLabel"
        @home="emit('home', $event)"
        @select="(item, event) => emit('breadcrumb-select', item, event)"
      />
    </div>

    <!-- ── Droite : crédits + actions + avatar ────────────────────────── -->
    <div class="ds-hnav__right">

      <!-- Crédits -->
      <CreditsChip
        :credits="credits"
        :reminder="creditsReminder"
        :tone="creditsTone"
        @click="emit('credits')"
      />

      <!-- Actions -->
      <div class="ds-hnav__actions">

        <!-- The real Button, not a re-implementation (ADR-0001). `lg-compact`
             is the 36px control the bar needs; `lg` at 44px does not fit. -->
        <Button
          label="Apprendre"
          variant="secondary-gray"
          size="lg-compact"
          @click="emit('learn')"
        />

        <!-- Paramètres -->
        <div
          class="ds-hnav__tip-wrap"
          @mouseenter="showTooltip('settings')"
          @mouseleave="hideTooltip"
        >
          <IconButton icon="settings" ariaLabel="Paramètres" @click="emit('settings')" />
          <Tooltip
            v-if="activeTooltip === 'settings'"
            class="ds-hnav__tip"
            title="Paramètres"
            arrow="top-center"
          />
        </div>

        <!-- Notifications -->
        <div
          class="ds-hnav__tip-wrap"
          @mouseenter="showTooltip('notifications')"
          @mouseleave="hideTooltip"
        >
          <IconButton icon="bell" ariaLabel="Notifications" @click="emit('notifications')" />
          <span v-if="hasNotification" class="ds-hnav__notif-dot" aria-hidden="true" />
          <Tooltip
            v-if="activeTooltip === 'notifications'"
            class="ds-hnav__tip"
            title="Notifications"
            arrow="top-center"
          />
        </div>

        <!-- Modules -->
        <div
          ref="modulesWrapRef"
          class="ds-hnav__tip-wrap"
          @mouseenter="showTooltip('apps')"
          @mouseleave="hideTooltip"
        >
          <IconButton
            icon="layout-grid"
            ariaLabel="Modules"
            :active="modulesOpen"
            :aria-expanded="modulesOpen"
            aria-haspopup="true"
            @click="toggleModules"
          />

          <Tooltip
            v-if="activeTooltip === 'apps' && !modulesOpen"
            class="ds-hnav__tip"
            title="Modules"
            arrow="top-center"
          />

          <!-- Dropdown modules — a floating surface, so it takes the house entrance (ADR-0021) -->
          <SurfaceTransition>
            <ModulesList
              v-if="modulesOpen && modules.length"
              class="ds-hnav__modules-dropdown"
              :modules="modules"
              @select="selectModule"
            />
          </SurfaceTransition>
        </div>
      </div>

      <!-- Avatar utilisateur -->
      <button class="ds-hnav__user" @click="emit('user')" :aria-label="`Profil ${userInitials}`">
        <Avatar size="md" :initials="userInitials" />
      </button>
    </div>
  </header>
</template>

<style scoped>
/* ── Shell ────────────────────────────────────────────────────────── */
.ds-hnav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  /*
    No ground and no rule, deliberately: the bar takes whatever surface sits
    behind it. The Figma frame carries no fill for the same reason — that is a
    decision, not an omission.
  */
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
  overflow: visible;
}

/* ── Gauche ───────────────────────────────────────────────────────── */
.ds-hnav__left {
  display: flex;
  align-items: center;
  /* 32px between the lockup and the trail, at every depth — Figma's `left`
     frame carries the same gap in all four views. */
  gap: var(--ds-spacing-4xl);
}

/* ── Droite ───────────────────────────────────────────────────────── */
.ds-hnav__right {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-xl);
  overflow: visible;
}

/* ── Actions ──────────────────────────────────────────────────────── */
.ds-hnav__actions {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  overflow: visible;
}

/* ── Wrapper tooltip / dropdown ───────────────────────────────────── */
.ds-hnav__tip-wrap {
  position: relative;
  display: inline-flex;
  overflow: visible;
}

.ds-hnav__tip {
  position: absolute;
  top: calc(100% + var(--ds-spacing-sm));
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--ds-z-popover);
  white-space: nowrap;
}

/* ── Notifications ────────────────────────────────────────────────── */
/*
  The dot sits on the tooltip wrapper rather than inside the button: the
  wrapper shrink-wraps IconButton, so it is the same 36px box, and IconButton
  takes a glyph rather than a slot (its Figma counterpart is an instance swap).
*/
.ds-hnav__notif-dot {
  /*
    Positional geometry, not rhythm: these place a 6px dot over the bell's
    glyph inside a 36px target. There is no token for either — ADR-0020 keeps
    glyph sizes out of the scales deliberately.
  */
  position: absolute;
  top: 18px;
  left: 22px;
  width: 6px;
  height: 6px;
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-error-solid);
  /* The ring punches the dot out of whatever the bar is painted with. */
  border: var(--ds-border-width-strong) solid var(--ds-bg-default);
}

/* ── Avatar utilisateur ───────────────────────────────────────────── */
.ds-hnav__user {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: var(--ds-radius-pill);
  flex-shrink: 0;
}

/* ── Dropdown modules : positionnement uniquement ─────────────────── */
.ds-hnav__modules-dropdown {
  position: absolute;
  top: calc(100% + var(--ds-spacing-md));
  right: 0;
  /*
    A popover, not an overlay. ADR-0020 puts z-overlay (200) above a scrim; this
    panel is a dropdown anchored to its button, which is what z-popover (100) is
    for — and what the other three floating panels in the catalogue use.
  */
  z-index: var(--ds-z-popover);
  box-shadow: var(--ds-elevation-overlay);
  /* The anchor is the button above-right of the panel (ADR-0021: the surface grows from it). */
  transform-origin: top right;
}
</style>
