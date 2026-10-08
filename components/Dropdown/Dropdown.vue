<script setup lang="ts">
import { SurfaceTransition } from '../SurfaceTransition'
import { ref, onMounted, onUnmounted } from 'vue'
import { Avatar } from '../Avatar'
import { Icon } from '../Icon'
import { Scrollbar } from '../Scrollbar'
import DropdownTrigger from './DropdownTrigger.vue'

/**
 * Which built-in trigger `Dropdown` renders when nothing is slotted.
 *
 * Renamed from `DropdownTrigger`, which now names the boxed trigger *component*.
 * One identifier cannot mean both a component and the enum that selects between
 * three of them.
 */
export type DropdownTriggerVariant = 'button' | 'icon' | 'avatar'

interface Props {
  trigger?:    DropdownTriggerVariant
  open?:       boolean
  /**
   * The trigger's name — the button's text, and the avatar's accessible name.
   * An avatar shows a face or initials, and neither says what pressing it does.
   */
  buttonLabel?: string
  avatarSrc?:  string
  avatarAlt?:  string
  /** What the avatar shows without a picture — on the trigger and in the header. */
  avatarInitials?: string
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

/*
  Escape closes — and **hands the focus back to the trigger**. Focus left on a
  row would fall to <body> when the panel unmounts, and a keyboard user would
  start again from the top of the page (the WAI-ARIA menu button's rule). The
  trigger is the first focusable element in the root: it precedes the panel.
*/
function onKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !props.open) return
  const root = rootEl.value
  if (root?.querySelector('.ds-dropdown__panel')?.contains(document.activeElement)) {
    root.querySelector<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')?.focus()
  }
  close()
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
    <!--
      A slotted trigger wins over the three built-ins. This is safe to open up
      only because `DropdownTrigger` exists: a consumer slots that and inherits
      the chrome, rather than rebuilding a box out of control tokens and
      drifting — which is what happened the one time it was done by hand.
    -->
    <slot name="trigger" :open="open" :toggle="toggle">
      <!-- ── Button trigger ───────────────────────────────────────── -->
      <DropdownTrigger
        v-if="trigger === 'button'"
        :open="open"
        chevron
        @click="toggle"
      >
        {{ buttonLabel }}
      </DropdownTrigger>

      <!-- ── Icon trigger — bare, no chrome to own ────────────────── -->
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

      <!-- ── Avatar trigger — bare, no chrome to own ──────────────── -->
      <button
        v-else-if="trigger === 'avatar'"
        type="button"
        class="ds-dropdown__trigger ds-dropdown__trigger--avatar"
        :class="{ 'ds-dropdown__trigger--avatar-open': open }"
        :aria-expanded="open"
        aria-haspopup="true"
        :aria-label="buttonLabel"
        @click="toggle"
      >
        <Avatar :src="avatarSrc" :alt="avatarAlt" :initials="avatarInitials" size="md" />
      </button>
    </slot>

    <!-- ── Panel ──────────────────────────────────────────────────── -->
    <SurfaceTransition>
    <div
      v-if="open"
      class="ds-dropdown__panel"
      role="menu"
    >
      <!--
        User header. The avatar is decorative — the name beside it names the
        person (ADR-0041) — and it carries no status: it used to say « En ligne »
        on every account menu, a presence the component cannot know, about the
        one user who is certainly there.
      -->
      <div v-if="userName || userEmail" class="ds-dropdown__user">
        <Avatar :src="avatarSrc" alt="" :initials="avatarInitials" size="md" />
        <div class="ds-dropdown__user-text">
          <span v-if="userName"  class="ds-dropdown__user-name">{{ userName }}</span>
          <span v-if="userEmail" class="ds-dropdown__user-email">{{ userEmail }}</span>
        </div>
      </div>

      <!--
        Header — the footer's twin at the top: outside the scroll, so what
        concerns the whole list (a search over its rows) stays in reach however
        far the list has scrolled (ADR-0069).
      -->
      <div v-if="$slots.header" class="ds-dropdown__header">
        <slot name="header" />
      </div>

      <!-- Items slot -->
      <Scrollbar max-height="320px">
        <div class="ds-dropdown__items">
          <slot />
        </div>
      </Scrollbar>

      <!--
        Footer — the header's twin at the other end: outside the scroll, so an
        action that concerns the whole list (« Créer une organisation ») stays
        reachable however long the list grows. Filled with `DropdownItem`s, which
        line up with the rows above because the padding is the list's.
      -->
      <div v-if="$slots.footer" class="ds-dropdown__footer">
        <slot name="footer" />
      </div>
    </div>
    </SurfaceTransition>
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
/* The boxed trigger's chrome now lives in `DropdownTrigger.vue`. */

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

.ds-dropdown__trigger--avatar-open,
.ds-dropdown__trigger--avatar:focus-visible {
  outline: none;
  box-shadow: var(--ds-focus-ring-gray);
}

/* ── Panel ────────────────────────────────────────────────────────── */
/* Pinned under the trigger's right edge, so it grows from that corner
   (ADR-0021: the surface scales from its anchor). It said `top left`, and the
   right edge — the one under the trigger — travelled 9.6px on every entrance. */
.ds-dropdown__panel {
  transform-origin: top right;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: var(--ds-z-popover);
  width: 240px;
  background-color: var(--ds-bg-default);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-control);
  box-shadow: var(--ds-elevation-overlay);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── User ─────────────────────────────────────────────────────────── */
.ds-dropdown__user {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
  border-bottom: var(--ds-border-width-default) solid var(--ds-border-subtle);
  flex-shrink: 0;
}

.ds-dropdown__user-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.ds-dropdown__user-name {  font: var(--ds-font-heading-sm);
  color: var(--ds-text-default);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ds-dropdown__user-email {  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Header ───────────────────────────────────────────────────────── */
/* No rule under it: a search belongs to the rows it filters. In line with
   the rows, which stand `spacing-sm` in. */
.ds-dropdown__header {
  display: flex;
  flex-direction: column;
  padding: var(--ds-spacing-sm) var(--ds-spacing-sm) var(--ds-spacing-xs);
  flex-shrink: 0;
}

/* ── Items wrapper ────────────────────────────────────────────────── */
/* Scroll is delegated to <Scrollbar> (ADR-0001) — its thumb overlays the list
 * instead of reserving a gutter, so the items keep the panel's full width. */
.ds-dropdown__items {
  display: flex;
  flex-direction: column;
  padding: var(--ds-spacing-xs) 0;
}

/* ── Footer ───────────────────────────────────────────────────────── */
/* The header's rule, mirrored; the list's padding, so its rows align. */
.ds-dropdown__footer {
  display: flex;
  flex-direction: column;
  padding: var(--ds-spacing-xs) 0;
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
  flex-shrink: 0;
}

</style>
