<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Logo } from '../Logo'
import { Icon } from '../Icon'
import { Avatar } from '../Avatar'
import { CreditsChip } from '../CreditsChip'
import { Tooltip } from '../Tooltip'
import { ModulesList } from '../ModulesList'
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
      <Logo variant="nav" alt="Tolbi" />

      <nav v-if="hasBreadcrumbs" class="ds-hnav__breadcrumbs" aria-label="Navigation">
        <button class="ds-hnav__crumb-btn" @click="emit('learn')" aria-label="Accueil">
          <Icon name="home-05" :size="20" />
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
        @contact-sales="emit('contact-sales')"
      />

      <!-- Actions -->
      <div class="ds-hnav__actions">

        <!-- Bouton Apprendre -->
        <button class="ds-hnav__learn-btn" @click="emit('learn')">
          <Icon name="book-open-01" :size="20" aria-hidden="true" />
          <span>Apprendre</span>
        </button>

        <!-- Paramètres -->
        <div
          class="ds-hnav__tip-wrap"
          @mouseenter="showTooltip('settings')"
          @mouseleave="hideTooltip"
        >
          <button class="ds-hnav__icon-btn" @click="emit('settings')" aria-label="Paramètres">
            <Icon name="settings-01" :size="20" />
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
            <Icon name="bell-01" :size="20" />
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
            <Icon name="dots-grid" :size="20" />
          </button>

          <Tooltip
            v-if="activeTooltip === 'apps' && !modulesOpen"
            class="ds-hnav__tip"
            title="Modules"
            arrow="top-center"
          />

          <!-- Dropdown modules -->
          <ModulesList
            v-if="modulesOpen && modules.length"
            class="ds-hnav__modules-dropdown"
            :modules="modules"
            @select="selectModule"
          />
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
  background: rgba(6, 105, 56, 0.95);
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
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.ds-hnav__crumb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-xs) var(--ds-spacing-md);
  border-radius: var(--ds-radius-sm);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--ds-color-gray-light-300);
  font-family: var(--ds-typography-font-family-inter);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.ds-hnav__crumb-btn:hover {
  background: var(--ds-semantic-bg-brand-solid-hover);
}

.ds-hnav__crumb-btn--active {
  background: rgba(5, 96, 51, 0.9);
  color: var(--ds-color-gray-light-200, #eaecf0);
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 600;
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
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  white-space: nowrap;
}

/* ── Bouton Apprendre ─────────────────────────────────────────────── */
.ds-hnav__learn-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  padding: var(--ds-spacing-md) var(--ds-spacing-lg);
  background: rgba(5, 96, 51, 0.9);
  border: 1px solid var(--ds-color-brand-600, #056033);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-xs);
  color: var(--ds-color-gray-light-200, #eaecf0);
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s ease;
}

.ds-hnav__learn-btn:hover {
  background: var(--ds-semantic-bg-brand-solid-hover);
}

/* ── Boutons icônes ───────────────────────────────────────────────── */
.ds-hnav__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ds-spacing-md);
  border-radius: var(--ds-radius-4xl);
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.85);
  transition: background 0.15s ease;
}

.ds-hnav__icon-btn:hover,
.ds-hnav__icon-btn--open {
  background: rgba(255, 255, 255, 0.1);
}

/* ── Notifications ────────────────────────────────────────────────── */
.ds-hnav__notif {
  position: relative;
}

.ds-hnav__notif-dot {
  position: absolute;
  top: 18px;
  left: 22px;
  width: 6px;
  height: 6px;
  border-radius: var(--ds-radius-full);
  background: var(--ds-semantic-fg-error-primary, #d92d20);
  border: 1.5px solid var(--ds-color-gray-light-200, #eaecf0);
}

/* ── Avatar utilisateur ───────────────────────────────────────────── */
.ds-hnav__user {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: var(--ds-radius-full);
  flex-shrink: 0;
}

/* ── Dropdown modules : positionnement uniquement ─────────────────── */
.ds-hnav__modules-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 200;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06);
}
</style>
