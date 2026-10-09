<script setup lang="ts">
import { nextTick, ref, useId, useSlots, watch } from 'vue'
import { SurfaceTransition } from '../SurfaceTransition'

/**
 * A modal dialog: a surface over the page that keeps the focus until it is
 * answered (ADR-0075). It is the native `<dialog>`, opened modal — the top
 * layer puts it over everything, popovers and clipped panels included, with no
 * z-index, and makes the page behind it inert.
 *
 * It arrives as anything that floats does (ADR-0021: scale and fade, the exit
 * faster than the entrance), over the time the scale keeps for heavy surfaces,
 * `considered` — a modal and a destructive confirmation are what that step was
 * minted for. The scrim is `bg-overlay`.
 *
 * Opening moves the focus in — to `[data-autofocus]`, else the first control —
 * Tab and Shift+Tab go round inside, and closing hands it back to what opened
 * it. Escape and a click on the scrim cancel, unless `dismissible` is off.
 * Render it where it is used: in the top layer its place in the DOM does not
 * decide what covers what, and inside a popover a click on it is still a click
 * inside, so the popover stays open behind it.
 */
interface Props {
  /** Its name: the title, read when it opens. */
  title: string
  /** The sentence under the title. The default slot takes its place for more. */
  description?: string
  /** `alertdialog` for a question that interrupts and waits (`ConfirmDialog`). */
  role?: 'dialog' | 'alertdialog'
  /** Hand the focus back to what opened it once it has closed. */
  restoreFocus?: boolean
  /** Escape and a click on the scrim cancel. */
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  role: 'dialog',
  restoreFocus: true,
  dismissible: true,
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** Dismissed — Escape or the scrim — rather than answered. */
  cancel: []
  /** Gone: the exit is over and the focus handed back. */
  closed: []
}>()

const slots = useSlots()
const el = ref<HTMLDialogElement>()
const surface = ref<HTMLElement>()
const shown = ref(false)
const id = useId()
const titleId = `ds-dialog-title-${id}`
const descriptionId = `ds-dialog-description-${id}`
let opener: HTMLElement | null = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const focusables = () => [...(surface.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]

async function show() {
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  shown.value = true
  await nextTick()
  if (el.value && !el.value.open) el.value.showModal()
  const first = surface.value?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? surface.value
  first?.focus({ preventScroll: true })
}

/* The surface leaves first; the dialog closes when it is gone. */
function afterLeave() {
  if (el.value?.open) el.value.close()
  if (props.restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true })
  opener = null
  emit('closed')
}

watch(open, (now) => (now ? void show() : (shown.value = false)), { immediate: true })

function dismiss() {
  if (!props.dismissible) return
  emit('cancel')
  open.value = false
}

/* Escape: the browser's own cancel, held so the exit can play. */
function onCancel(event: Event) {
  event.preventDefault()
  dismiss()
}

/* Closed by the browser itself (a second Escape forces it): follow. */
function onClose() {
  if (open.value) open.value = false
}

function onKeydown(event: KeyboardEvent) {
  /* The popover behind listens for Escape on the document: this one is ours. */
  if (event.key === 'Escape') return event.stopPropagation()
  if (event.key !== 'Tab') return
  const items = focusables()
  if (!items.length) return event.preventDefault()
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

/* The dialog spans the screen; whatever is not the surface is the scrim. */
function onClick(event: MouseEvent) {
  if (surface.value && !surface.value.contains(event.target as Node)) dismiss()
}
</script>

<template>
  <dialog
    ref="el"
    class="ds-dialog"
    :role="role"
    aria-modal="true"
    :aria-labelledby="titleId"
    :aria-describedby="description || slots.default ? descriptionId : undefined"
    @cancel="onCancel"
    @close="onClose"
    @keydown="onKeydown"
    @click="onClick"
  >
    <Transition name="ds-dialog-scrim">
      <div v-if="shown" class="ds-dialog__scrim" />
    </Transition>
    <SurfaceTransition @after-leave="afterLeave">
      <div v-if="shown" ref="surface" class="ds-dialog__surface" tabindex="-1">
        <div class="ds-dialog__text">
          <h2 :id="titleId" class="ds-dialog__title">{{ title }}</h2>
          <div v-if="slots.default" :id="descriptionId" class="ds-dialog__description"><slot /></div>
          <p v-else-if="description" :id="descriptionId" class="ds-dialog__description">{{ description }}</p>
        </div>
        <div v-if="slots.actions" class="ds-dialog__actions">
          <slot name="actions" />
        </div>
      </div>
    </SurfaceTransition>
  </dialog>
</template>

<style scoped>
/*
  The native dialog spans the screen and draws nothing itself: the scrim and
  the surface are its children, so both can arrive and leave. Its own
  `::backdrop` stays transparent — a pseudo-element cannot take a transition
  the way a child can.
*/
.ds-dialog {
  position: fixed;
  inset: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  margin: 0;
  padding: var(--ds-spacing-xl);
  border: 0;
  background: transparent;
  color: inherit;
}

.ds-dialog[open] {
  display: grid;
  place-items: center;
}

.ds-dialog::backdrop {
  background: transparent;
}

.ds-dialog__scrim {
  position: fixed;
  inset: 0;
  background: var(--ds-bg-overlay);
}

/*
  The surface floats: `bg-default` with the overlay's elevation, and the
  `border-subtle` every elevated surface carries — in dark it is the border,
  not the shadow, that separates (ADR-0030). 25rem is a ceiling, not a size
  (ADR-0031): on a narrow screen it takes what there is.
*/
.ds-dialog__surface {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-3xl);
  width: 100%;
  max-width: 25rem;
  max-height: 100%;
  overflow-y: auto;
  padding: var(--ds-spacing-3xl);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-overlay);
  outline: none;
}

/* A heavy surface arrives over `considered`; it leaves as fast as any other. */
.ds-dialog__surface.ds-surface-enter-active {
  transition-duration: var(--ds-motion-duration-considered);
}

.ds-dialog-scrim-enter-active {
  transition: opacity var(--ds-motion-duration-considered) var(--ds-motion-easing-out);
}

.ds-dialog-scrim-leave-active {
  transition: opacity var(--ds-motion-duration-exit) var(--ds-motion-easing-in);
}

.ds-dialog-scrim-enter-from,
.ds-dialog-scrim-leave-to {
  opacity: 0;
}

.ds-dialog__text {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
}

.ds-dialog__title {
  margin: 0;
  font: var(--ds-font-heading-md);
  color: var(--ds-text-strong);
  overflow-wrap: anywhere;
}

.ds-dialog__description {
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
  overflow-wrap: anywhere;
}

.ds-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--ds-spacing-md);
}
</style>
