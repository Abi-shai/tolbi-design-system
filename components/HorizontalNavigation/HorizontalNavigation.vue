<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Logo } from '../Logo'
import { Icon } from '../Icon'
import { Avatar } from '../Avatar'
import { CreditsChip } from '../CreditsChip'
import { Button } from '../Button'
import { Tooltip } from '../Tooltip'
import { ModulesList } from '../ModulesList'
import { SurfaceTransition } from '../SurfaceTransition'
import type { ModulesListItem } from '../ModulesList'
import type { CreditsState, CreditsContext } from '../CreditsChip'

export type NavState = 'Accueil' | 'Module' | 'Project' | 'tabs'

export interface BreadcrumbItem {
  label:   string
  active?: boolean
}

export type NavModule = ModulesListItem

interface Props {
  state?:           NavState
  breadcrumbs?:     BreadcrumbItem[]
  credits?:         number
  creditState?:     CreditsState
  creditContext?:   CreditsContext
  /** Expiry reminder shown in the credits chip, e.g. `Expire dans 14 jours`. */
  creditsReminder?: string
  userInitials?:    string
  hasNotification?: boolean
  modules?:         NavModule[]
}

const props = withDefaults(defineProps<Props>(), {
  state:           'Accueil',
  credits:         0,
  creditState:     'good',
  creditContext:   'home',
  userInitials:    'TD',
  hasNotification: false,
  modules:         () => [],
})

const emit = defineEmits<{
  learn:           []
  settings:        []
  notifications:   []
  user:            []
  'contact-sales': []
  credits:         []
  'module-select': [module: NavModule]
}>()

const hasBreadcrumbs = computed(
  () => props.state !== 'Accueil' && !!props.breadcrumbs?.length
)

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
    <div class="ds-hnav__left" :class="{ 'ds-hnav__left--spaced': hasBreadcrumbs }">
      <!-- The coloured lockup at Figma's tightened `sm` size. -->
      <Logo variant="default" size="sm" alt="Tolbi" />

      <nav v-if="hasBreadcrumbs" class="ds-hnav__breadcrumbs" aria-label="Navigation">
        <button class="ds-hnav__crumb-btn" @click="emit('learn')" aria-label="Accueil">
          <Icon name="house" :size="20" />
        </button>

        <template v-for="(crumb, i) in breadcrumbs" :key="i">
          <Icon name="chevron-right" :size="16" class="ds-hnav__chevron" aria-hidden="true" />
          <button
            class="ds-hnav__crumb-btn"
            :class="{ 'ds-hnav__crumb-btn--active': crumb.active }"
          >
            {{ crumb.label }}
          </button>
        </template>
      </nav>
    </div>

    <!-- ── Droite : crédits + actions + avatar ────────────────────────── -->
    <div class="ds-hnav__right">

      <!-- Crédits -->
      <CreditsChip
        :credits="credits"
        :state="creditState"
        :context="creditContext"
        :reminder="creditsReminder"
        @contact-sales="emit('contact-sales')"
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
          <button class="ds-hnav__icon-btn" @click="emit('settings')" aria-label="Paramètres">
            <Icon name="settings" :size="20" />
          </button>
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
          <button class="ds-hnav__icon-btn ds-hnav__notif" @click="emit('notifications')" aria-label="Notifications">
            <Icon name="bell" :size="20" />
            <span v-if="hasNotification" class="ds-hnav__notif-dot" aria-hidden="true" />
          </button>
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
          <button
            class="ds-hnav__icon-btn"
            :class="{ 'ds-hnav__icon-btn--open': modulesOpen }"
            :aria-expanded="modulesOpen"
            aria-haspopup="true"
            aria-label="Modules"
            @click="toggleModules"
          >
            <Icon name="layout-grid" :size="20" />
          </button>

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
}

.ds-hnav__left--spaced {
  gap: var(--ds-spacing-4xl);
}

/* ── Breadcrumbs ──────────────────────────────────────────────────── */
.ds-hnav__breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
}

.ds-hnav__chevron {
  color: var(--ds-text-subtlest);
  flex-shrink: 0;
}

.ds-hnav__crumb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-xs) var(--ds-spacing-md);
  border-radius: var(--ds-radius-inner);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--ds-text-subtle);
  font: var(--ds-font-label-lg);
  white-space: nowrap;
  transition: background var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-hnav__crumb-btn:hover {
  background: var(--ds-bg-hover);
}

.ds-hnav__crumb-btn--active {
  background: var(--ds-bg-neutral-subtle);
  color: var(--ds-text-strong);
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: var(--ds-font-weight-label-lg-strong);
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

/* ── Boutons icônes ───────────────────────────────────────────────── */
.ds-hnav__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-pill);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--ds-text-default);
  transition: background var(--ds-motion-duration-moderate) var(--ds-motion-easing-default);
}

.ds-hnav__icon-btn:hover,
.ds-hnav__icon-btn--open {
  background: var(--ds-bg-hover);
}

/* ── Notifications ────────────────────────────────────────────────── */
.ds-hnav__notif {
  position: relative;
}

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
