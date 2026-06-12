<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Avatar } from '../Avatar'
import { Icon } from '../Icon'

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
      <Icon name="dots-vertical" :size="20" aria-hidden="true" />
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
      <div class="ds-dropdown__items">
        <slot />
      </div>
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
  gap: 4px;
  padding: 10px 14px;
  box-sizing: border-box;
  background-color: var(--ds-semantic-bg-primary);
  border: 1px solid var(--ds-semantic-border-primary);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-xs);
  cursor: pointer;
  font-family: var(--ds-typography-font-family-poppins);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-secondary);
  white-space: nowrap;
  transition: background-color var(--ds-motion-duration-quick) var(--ds-motion-easing-default), box-shadow var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-dropdown__trigger--button:hover {
  background-color: var(--ds-semantic-bg-primary-hover);
}

.ds-dropdown__trigger-chevron {
  color: var(--ds-semantic-fg-secondary);
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
  color: var(--ds-semantic-fg-secondary);
  border-radius: var(--ds-radius-sm);
  padding: 0;
  transition: color var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-dropdown__trigger--icon:hover {
  color: var(--ds-semantic-fg-primary);
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
  border-radius: var(--ds-radius-full);
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
  background-color: var(--ds-semantic-bg-primary);
  border: 1px solid var(--ds-semantic-border-secondary);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header ───────────────────────────────────────────────────────── */
.ds-dropdown__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ds-semantic-border-secondary);
  flex-shrink: 0;
}

.ds-dropdown__header-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.ds-dropdown__header-name {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-dropdown__header-email {
  font-family: var(--ds-typography-font-family-poppins);
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: var(--ds-semantic-text-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Items wrapper ────────────────────────────────────────────────── */
.ds-dropdown__items {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  max-height: 320px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--ds-semantic-bg-quaternary) transparent;
}

.ds-dropdown__items::-webkit-scrollbar {
  width: 16px;
}

.ds-dropdown__items::-webkit-scrollbar-track {
  background: transparent;
}

.ds-dropdown__items::-webkit-scrollbar-thumb {
  background-color: var(--ds-semantic-bg-quaternary);
  border-radius: var(--ds-radius-full);
  border: 4px solid transparent;
  background-clip: padding-box;
}

.ds-dropdown__items::-webkit-scrollbar-thumb:hover {
  background-color: var(--ds-semantic-fg-senary);
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
