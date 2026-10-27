<script setup lang="ts">
import { SurfaceTransition } from '../SurfaceTransition'
import { ref, onMounted, onUnmounted } from 'vue'
import { useAnchoredSurface } from '../../composables/useAnchoredSurface'
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

/**
 * The trigger's edge the panel lines up with. Declared here, not taken from
 * the composable that places it: a public type may only point at what ships.
 */
export type DropdownAlign = 'start' | 'end'

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
  /**
   * `menu` is a list of actions or choices — and only that: a menu may hold
   * menu items and nothing else. `dialog` is for a panel that holds more — a
   * search, rows with actions of their own, a field — and names itself with
   * `label` (ADR-0072).
   */
  role?:       'menu' | 'dialog'
  /** The panel's accessible name; a `dialog` needs one. */
  label?:      string
  /**
   * The trigger's edge the panel lines up with. `end` for a trigger at the end
   * of a bar (the account menu); `start` for one that heads a column or a line
   * of text (the workspace switcher, a conversation's title).
   */
  align?:      DropdownAlign
}

const props = withDefaults(defineProps<Props>(), {
  trigger:     'button',
  open:        false,
  buttonLabel: 'Account',
  role:        'menu',
  label:       undefined,
  align:       'end',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const rootEl = ref<HTMLElement | null>(null)
const panelEl = ref<HTMLElement | null>(null)

/* In the top layer, placed on the trigger (ADR-0078): a panel inside a box
   that scrolls no longer grows its scroll. */
useAnchoredSurface(rootEl, panelEl, { align: () => props.align })

function toggle() {
  emit('update:open', !props.open)
}

function close() {
  emit('update:open', false)
}

/*
  A click in a dialog that does not hold this dropdown is not a click outside
  it: a question asked from a row — teleported to the region it belongs to
  (ADR-0075) — is still part of the gesture that began here, and the list
  stays open behind it. A dropdown inside a dialog still closes on a click
  elsewhere in that dialog.
*/
function onClickOutside(e: MouseEvent) {
  const target = e.target as Element | null
  if (!rootEl.value || rootEl.value.contains(target)) return
  const dialog = target?.closest?.('.ds-dialog')
  if (dialog && !dialog.contains(rootEl.value)) return
  close()
}

/*
  Escape closes — and **hands the focus back to the trigger**. Focus left on a
  row would fall to <body> when the panel unmounts, and a keyboard user would
  start again from the top of the page (the WAI-ARIA menu button's rule). The
  trigger is the first focusable element in the root: it precedes the panel.
*/
function escape() {
  const root = rootEl.value
  if (root?.querySelector('.ds-dropdown__panel')?.contains(document.activeElement)) {
    root.querySelector<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')?.focus()
  }
  close()
}

/* Heard on the document: an Escape from elsewhere on the page. Not one someone
   already took, nor one from a dialog that does not hold this dropdown — a
   question asked from one of its rows (ADR-0077, item 24). */
function onKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !props.open || e.defaultPrevented) return
  const dialog = (e.target as Element | null)?.closest?.('.ds-dialog')
  if (dialog && !dialog.contains(rootEl.value)) return
  escape()
}

/*
  An Escape from inside the dropdown is the dropdown's, and stops there. Inside
  a dialog it used to travel on — the dialog takes its own Escape on the way
  up — and closed the whole dialog with the list (ADR-0078). Held on the root,
  so it is heard before the dialog; cancelled, so the browser does not turn it
  into the dialog's `cancel` either.
*/
function onRootKeyDown(e: KeyboardEvent) {
  if (e.key !== 'Escape' || !props.open) return
  e.stopPropagation()
  e.preventDefault()
  escape()
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
  <div class="ds-dropdown" ref="rootEl" @keydown="onRootKeyDown">
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
      ref="panelEl"
      popover="manual"
      class="ds-dropdown__panel"
      :role="role"
      :aria-label="label"
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
/* In the top layer, placed by `useAnchoredSurface` (ADR-0078): under the
   trigger's `align` edge — or over it, when the room below is short — and it
   grows from that corner (ADR-0021). It once said `top left` while pinned
   right, and the edge under the trigger travelled 9.6px on every entrance.
   The gap is the margin: the panel is placed by its margin box. The rest
   undoes what the browser gives a popover. */
.ds-dropdown__panel {
  position: fixed;
  inset: auto;
  margin: var(--ds-spacing-md) 0;
  padding: 0;
  color: inherit;
  z-index: var(--ds-z-popover);
  width: 240px;
  max-height: var(--anchor-room, none);
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
