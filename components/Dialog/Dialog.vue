<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { CloseButton } from '../CloseButton'
import { SurfaceTransition } from '../SurfaceTransition'

/**
 * A modal: a surface that keeps the focus until it is answered (ADR-0075). In
 * the product's modal format — a head with the title and the close, ruled off
 * from the body, then a foot with the actions, which is not.
 *
 * Over the page, it is the native `<dialog>` opened modal — the top layer puts
 * it over everything, popovers and clipped panels included, with no z-index,
 * and makes the page behind it inert.
 *
 * **Within a region** — `within`, a panel — the question stays where it
 * belongs: drawn inside the region, under the region's own scrim, rising from
 * its bottom at `min(100% − 24px, 32rem)`, the region inert behind it and the
 * rest of the page left as it is. The region must be a positioned box; the
 * dialog is teleported to its end.
 *
 * It arrives as anything that floats does (ADR-0021: scale and fade, the exit
 * faster than the entrance), over the time the scale keeps for heavy surfaces,
 * `considered` — a modal and a destructive confirmation are what that step was
 * minted for. The scrim is `bg-overlay`.
 *
 * Opening moves the focus in — to `[data-autofocus]`, else the first control —
 * Tab and Shift+Tab go round inside, and closing hands it back to what opened
 * it. The close, Escape and a click on the scrim cancel, unless `dismissible`
 * is off — then there is no close either.
 * Render it where it is used: a popover it was opened from stays open behind
 * it, and the Escape it handles stops at the dialog.
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
  /** The close, Escape and a click on the scrim cancel. Off, there is no close. */
  dismissible?: boolean
  /** The close's name. */
  closeLabel?: string
  /**
   * The region the question belongs to — a positioned box, a panel. Given, the
   * dialog is drawn inside it rather than over the page.
   */
  within?: HTMLElement | null
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  role: 'dialog',
  restoreFocus: true,
  dismissible: true,
  closeLabel: 'Fermer',
  within: null,
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** Dismissed — the close, Escape or the scrim — rather than answered. */
  cancel: []
  /** Gone: the exit is over and the focus handed back. */
  closed: []
}>()

/* Declared rather than inferred: inside the `<Teleport>`, the template's use
   of `slots` made their type depend on itself, and the declaration build
   dropped the component (TS7022). */
const slots = defineSlots<{
  /** The body, in place of `description`. */
  default?: () => unknown
  /** The actions, in the foot, on the right. */
  actions?: () => unknown
}>()
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

/*
  Within a region, the browser makes nothing inert — the dialog is not modal
  to the page, only to the region. So the region's other children are made
  inert while it is open, and only what was made inert here is handed back.
*/
let held: HTMLElement[] = []

function hold(on: boolean) {
  for (const node of held) node.inert = false
  held = []
  const region = props.within
  if (!on || !region) return
  for (const node of region.children) {
    if (node === el.value || !(node instanceof HTMLElement) || node.inert) continue
    node.inert = true
    held.push(node)
  }
}

async function show() {
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  shown.value = true
  await nextTick()
  if (el.value && !el.value.open) {
    if (props.within) {
      el.value.show()
      hold(true)
    } else el.value.showModal()
  }
  const first = surface.value?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? surface.value
  first?.focus({ preventScroll: true })
}

/* The surface leaves first; the dialog closes when it is gone — and the region
   is handed back before the focus, or it would land on an inert element. */
function afterLeave() {
  if (el.value?.open) el.value.close()
  hold(false)
  if (props.restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true })
  opener = null
  emit('closed')
}

watch(open, (now) => (now ? void show() : (shown.value = false)), { immediate: true })

onBeforeUnmount(() => hold(false))

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
  /* The popover behind listens for Escape on the document: this one is ours.
     Over the page, the browser turns it into `cancel`; within a region the
     dialog is not modal and gets no `cancel`, so it answers it here. */
  if (event.key === 'Escape') {
    event.stopPropagation()
    if (props.within) {
      event.preventDefault()
      dismiss()
    }
    return
  }
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
  <Teleport :to="within ?? 'body'" :disabled="!within">
    <dialog
      ref="el"
      class="ds-dialog"
      :class="{ 'ds-dialog--within': within }"
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
          <header class="ds-dialog__head">
            <h2 :id="titleId" class="ds-dialog__title">{{ title }}</h2>
            <CloseButton v-if="dismissible" size="sm" :ariaLabel="closeLabel" @click="dismiss" />
          </header>
          <div v-if="slots.default || description" class="ds-dialog__body">
            <div v-if="slots.default" :id="descriptionId" class="ds-dialog__description"><slot /></div>
            <p v-else :id="descriptionId" class="ds-dialog__description">{{ description }}</p>
          </div>
          <footer v-if="slots.actions" class="ds-dialog__foot">
            <slot name="actions" />
          </footer>
        </div>
      </SurfaceTransition>
    </dialog>
  </Teleport>
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
  not the shadow, that separates (ADR-0030). 32rem — the product's modals' —
  is a ceiling, not a size (ADR-0031): on a narrow screen it takes what there
  is. A long body scrolls; the head and the foot stay.
*/
.ds-dialog__surface {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 32rem;
  max-height: 100%;
  overflow: hidden;
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-overlay);
  outline: none;
}

/* The head is ruled off from the body with the surface's own hairline; the
   foot is not — the owner took its rule out of the Figma component (9 Oct.),
   and the body's 24px is what parts it from the actions. */
.ds-dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-xl);
  padding: var(--ds-spacing-xl) var(--ds-spacing-xl) var(--ds-spacing-xl) var(--ds-spacing-3xl);
}

.ds-dialog__body {
  min-height: 0;
  overflow-y: auto;
  padding: var(--ds-spacing-3xl);
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-dialog__foot {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-xl) var(--ds-spacing-3xl);
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

/*
  Within a region (Figma section 18, track C1): the dialog covers the region
  only — its scrim takes the region's corners — and the surface rises from the
  region's bottom, 12px in from its edges, centred. One rule for every width:
  the surface's `100%` of the padded region under its 32rem ceiling gives 376px
  in a docked Tolbi AI panel and 512 on the expanded one, centred on the
  reading column. Above anything the region floats of its own — the popover
  it was opened from — and not in the top layer: this is what `z-overlay` was
  kept for.
*/
.ds-dialog--within {
  position: absolute;
  z-index: var(--ds-z-overlay);
  padding: var(--ds-spacing-lg);
  border-radius: inherit;
}

.ds-dialog--within[open] {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
}

.ds-dialog--within .ds-dialog__scrim {
  position: absolute;
  border-radius: inherit;
}

/* It grows from the edge it rises from (ADR-0021: the surface sets its own origin). */
.ds-dialog--within .ds-dialog__surface {
  transform-origin: bottom center;
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

</style>
