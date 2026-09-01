<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Avatar } from '../Avatar'
import { Icon } from '../Icon'
import { Scrollbar } from '../Scrollbar'

export type DropdownTrigger = 'button' | 'icon' | 'avatar'

interface Props {
  trigger?:    DropdownTrigger
  open?:       boolean
  buttonLabel?: string
  avatarSrc?:  string
  avatarAlt?:  string
  userName?:   string
  userEmail?:  string
}

const props = withDefaults(defineProps<Props>(), {
  trigger:     'button',
  open:        false,
  buttonLabel: 'Account',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const rootEl = ref<HTMLElement | null>(null)

function toggle() {
  emit('update:open', !props.open)
}

function close() {
  emit('update:open', false)
}

function onClickOutside(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    close()
  }
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside, true)
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside, true)
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="ds-dropdown" ref="rootEl">
    <!-- ── Button trigger ─────────────────────────────────────────── -->
    <button
      v-if="trigger === 'button'"
      type="button"
      class="ds-dropdown__trigger ds-dropdown__trigger--button"
      :aria-expanded="open"
      aria-haspopup="true"
      @click="toggle"
    >
      <span class="ds-dropdown__trigger-label">{{ buttonLabel }}</span>
      <Icon
        :name="open ? 'chevron-up' : 'chevron-down'"
        :size="20"
        class="ds-dropdown__trigger-chevron"
        aria-hidden="true"
      />
    </button>

    <!-- ── Icon trigger ───────────────────────────────────────────── -->
    <button
      v-else-if="trigger === 'icon'"
      type="button"
      class="ds-dropdown__trigger ds-dropdown__trigger--icon"
      :aria-expanded="open"
      aria-haspopup="true"
      aria-label="Options"
      @click="toggle"
    >
      <Icon name="ellipsis-vertical" :size="20" aria-hidden="true" />
    </button>

    <!-- ── Avatar trigger ─────────────────────────────────────────── -->
    <button
      v-else-if="trigger === 'avatar'"
      type="button"
      class="ds-dropdown__trigger ds-dropdown__trigger--avatar"
      :class="{ 'ds-dropdown__trigger--avatar-open': open }"
      :aria-expanded="open"
      aria-haspopup="true"
      @click="toggle"
    >
      <Avatar :src="avatarSrc" :alt="avatarAlt" :status="open ? undefined : undefined" size="md" />
    </button>

    <!-- ── Panel ──────────────────────────────────────────────────── -->
    <Transition name="ds-dropdown__panel">
    <div
      v-if="open"
      class="ds-dropdown__panel"
      role="menu"
    >
      <!-- User header -->
      <div v-if="userName || userEmail" class="ds-dropdown__header">
        <Avatar :src="avatarSrc" :alt="avatarAlt" status="online" size="md" />
        <div class="ds-dropdown__header-text">
          <span v-if="userName"  class="ds-dropdown__header-name">{{ userName }}</span>
          <span v-if="userEmail" class="ds-dropdown__header-email">{{ userEmail }}</span>
        </div>
      </div>

      <!-- Items slot -->
      <Scrollbar max-height="320px">
        <div class="ds-dropdown__items">
          <slot />
        </div>
      </Scrollbar>
    </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ── Container ────────────────────────────────────────────────────── */
.ds-dropdown {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
}

/* ── Trigger: button ──────────────────────────────────────────────── */
.ds-dropdown__trigger--button {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-spacing-xs);
  padding: 10px 14px;
  box-sizing: border-box;
  background-color: var(--ds-bg-default);
  border: 1px solid var(--ds-border-default);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-control);
  cursor: pointer;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-default);
  white-space: nowrap;
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default), box-shadow var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-dropdown__trigger--button:hover {
  background-color: var(--ds-bg-hover);
}

.ds-dropdown__trigger-chevron {
  color: var(--ds-text-default);
}

/* ── Trigger: icon ────────────────────────────────────────────────── */
.ds-dropdown__trigger--icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--ds-text-default);
  border-radius: var(--ds-radius-inner);
  padding: 0;
  transition: color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-dropdown__trigger--icon:hover {
  color: var(--ds-text-strong);
}

/* ── Trigger: avatar ──────────────────────────────────────────────── */
.ds-dropdown__trigger--avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  border-radius: var(--ds-radius-pill);
}

.ds-dropdown__trigger--avatar-open {
  box-shadow: var(--ds-focus-ring-gray);
}

/* ── Panel ────────────────────────────────────────────────────────── */
.ds-dropdown__panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 100;
  width: 240px;
  background-color: var(--ds-bg-default);
  border: 1px solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-overlay);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header ───────────────────────────────────────────────────────── */
.ds-dropdown__header {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
  border-bottom: 1px solid var(--ds-border-subtle);
  flex-shrink: 0;
}

.ds-dropdown__header-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.ds-dropdown__header-name {  font: var(--ds-font-heading-sm);
  color: var(--ds-text-default);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-dropdown__header-email {  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Items wrapper ────────────────────────────────────────────────── */
/* Scroll is delegated to <Scrollbar> (ADR-0001) — its thumb overlays the list
 * instead of reserving a gutter, so the items keep the panel's full width. */
.ds-dropdown__items {
  display: flex;
  flex-direction: column;
  padding: var(--ds-spacing-xs) 0;
}

/* ── Panel transition ──────────────────────────────────────────────── */
.ds-dropdown__panel-enter-active {
  transition: opacity var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
              transform var(--ds-motion-duration-enter) var(--ds-motion-easing-out);
}
.ds-dropdown__panel-leave-active {
  transition: opacity var(--ds-motion-duration-moderate) var(--ds-motion-easing-in),
              transform var(--ds-motion-duration-moderate) var(--ds-motion-easing-in);
}
.ds-dropdown__panel-enter-from,
.ds-dropdown__panel-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}
</style>
