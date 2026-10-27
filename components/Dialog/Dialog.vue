<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { CloseButton } from '../CloseButton'
import { Icon, type IconName } from '../Icon'
import { SurfaceTransition } from '../SurfaceTransition'
import { pushModal, removeModal } from '../../composables/useModalStack'

/**
 * A modal: a surface that keeps the focus until it is answered (ADR-0075). In
 * the product's modal format — a head with the title and the close, ruled off
 * from the body, then a foot with the actions, which is not. Given an `icon`,
 * the head is **signed** (ADR-0076): a tile on its tone's tint, the glyph of
 * what the dialog does, before the title — a tone never says it alone
 * (ADR-0006).
 *
 * Over the page, it is the native `<dialog>` opened modal — the top layer puts
 * it over everything, popovers and clipped panels included, with no z-index,
 * and makes the page behind it inert.
 *
 * **Within a region** — `within`, a panel — the question stays where it
 * belongs: drawn over the region, under the region's own scrim, rising from
 * its bottom at `min(100% − 24px, 32rem)`, the region inert behind it and the
 * rest of the page left as it is. The dialog is teleported to the region's end
 * and painted in the top layer on the region's rectangle (ADR-0078) — so it is
 * above the popover it was opened from, which is in the top layer too.
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
 * it. Its Escape is not stopped — a list from another library inside it must
 * hear the key — and it closes only on an Escape nobody else took (ADR-0077),
 * and that was not aimed at a layer open inside it (ADR-0083): a list that
 * closes itself without cancelling the key no longer takes the dialog along.
 * While it is open, a `ToastRegion` moves inside it, so a toast stays visible
 * and answers.
 *
 * **At the side** — `placement="side"` — it is the side panel (ADR-0079): the
 * same scrim, focus and dismissal, the surface standing 12px off the screen's
 * right edge at full height, its description in the fixed head. The head and
 * the foot are each ruled off by an **inset** rule, always; what follows the
 * scroll is a fade over the body's last 64px, there while content is left
 * below. Under 40rem it takes the whole screen and the foot stacks, the
 * action on top.
 *
 * `size` is one scale for both: `sm` 24rem, `md` 32rem (the default), `lg`
 * 45rem, `xl` 60rem — each a width the catalogue already used — and `full`.
 */
export type DialogPlacement = 'centre' | 'side'
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

/** One figure of the foot's summary — « Champs liés » / « 1 champ ». */
export interface DialogSummaryItem {
  label: string
  value: string
}

interface Props {
  /** Its name: the title, read when it opens. */
  title: string
  /** The sentence under the title. The default slot takes its place for more. */
  description?: string
  /**
   * The sign before the title: the glyph of what the dialog does — `trash-2`,
   * `user-minus`, `coins`. Absent, the head has none.
   */
  icon?: IconName
  /** The sign's tint: `danger` on the error tint, `neutral` on the neutral one. */
  tone?: 'danger' | 'neutral'
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
  /** Over the page's centre, or at its side — the side panel. */
  placement?: DialogPlacement
  /** The surface's width — a ceiling, not a size: a narrow screen gives less. */
  size?: DialogSize
  /**
   * What the actions will act on, at the start of the foot — « 1 champ lié ·
   * 10 ha » (ADR-0081). The foot stays while the body scrolls, so the figures
   * stay in sight while they change; each change is announced. The `#summary`
   * slot takes their place for more.
   */
  summary?: DialogSummaryItem[]
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  icon: undefined,
  tone: 'neutral',
  role: 'dialog',
  restoreFocus: true,
  dismissible: true,
  closeLabel: 'Fermer',
  within: null,
  placement: 'centre',
  size: 'md',
  summary: undefined,
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
  /** The body, in place of `description` — read as the dialog's description. */
  default?: () => unknown
  /** What the body asks for after it has said what will happen — a field. Not read as the description. */
  form?: () => unknown
  /** The actions, in the foot, on the right. */
  actions?: () => unknown
  /** The foot's start, in place of `summary`. */
  summary?: () => unknown
}>()
const hasSummary = computed(() => Boolean(slots.summary || props.summary?.length))
const el = ref<HTMLDialogElement>()
const surface = ref<HTMLElement>()
const body = ref<HTMLElement>()
const shown = ref(false)
const id = useId()
const titleId = `ds-dialog-title-${id}`
const side = computed(() => props.placement === 'side')
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

/*
  Within a region, the dialog is a popover on the region's rectangle (ADR-0078).
  The list it was opened from is in the top layer, and only something opened
  after it there can cover it — `z-overlay`, which this used to take, cannot.
  It follows the region while open: a panel that is resized or scrolled.
*/
let regionFrame = 0
let regionObserver: ResizeObserver | null = null

function cover() {
  regionFrame = 0
  const region = props.within
  const dialog = el.value
  if (!region || !dialog) return
  const r = region.getBoundingClientRect()
  dialog.style.top = `${r.top}px`
  dialog.style.left = `${r.left}px`
  dialog.style.width = `${r.width}px`
  dialog.style.height = `${r.height}px`
}

function scheduleCover() {
  if (!regionFrame) regionFrame = requestAnimationFrame(cover)
}

function follow(on: boolean) {
  window.removeEventListener('scroll', scheduleCover, { capture: true })
  window.removeEventListener('resize', scheduleCover)
  regionObserver?.disconnect()
  regionObserver = null
  if (!on || !props.within) return
  cover()
  window.addEventListener('scroll', scheduleCover, { capture: true, passive: true })
  window.addEventListener('resize', scheduleCover, { passive: true })
  regionObserver = new ResizeObserver(scheduleCover)
  regionObserver.observe(props.within)
}

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
      if (typeof el.value.showPopover === 'function') el.value.showPopover()
      follow(true)
      hold(true)
    } else {
      el.value.showModal()
      pushModal(el.value)
    }
  }
  const first = surface.value?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? surface.value
  first?.focus({ preventScroll: true })
}

/* The surface leaves first; the dialog closes when it is gone — and the region
   is handed back before the focus, or it would land on an inert element. */
function afterLeave() {
  if (el.value?.matches(':popover-open')) el.value.hidePopover()
  if (el.value?.open) el.value.close()
  if (el.value) removeModal(el.value)
  follow(false)
  hold(false)
  if (props.restoreFocus && opener?.isConnected) opener.focus({ preventScroll: true })
  opener = null
  emit('closed')
}

watch(open, (now) => (now ? void show() : (shown.value = false)), { immediate: true })

/*
  At the side, a fade over the body's foot says there is more below (ADR-0079):
  measured on scroll and whenever the body or what it holds changes size — a
  field's error opening grows the content, not the box.
*/
const below = ref(false)

function measureScroll() {
  const b = body.value
  if (!b) return
  below.value = Math.ceil(b.scrollTop + b.clientHeight) < b.scrollHeight
}

let bodyObserver: ResizeObserver | null = null

watch(body, (b) => {
  bodyObserver?.disconnect()
  bodyObserver = null
  if (!b) return
  bodyObserver = new ResizeObserver(measureScroll)
  bodyObserver.observe(b)
  for (const child of b.children) bodyObserver.observe(child)
  measureScroll()
}, { flush: 'post' })

onBeforeUnmount(() => bodyObserver?.disconnect())

onBeforeUnmount(() => {
  follow(false)
  hold(false)
  if (el.value) removeModal(el.value)
})

function dismiss() {
  if (!props.dismissible) return
  emit('cancel')
  open.value = false
}

/*
  An Escape aimed at a layer open inside the dialog is that layer's, taken or
  not (ADR-0083, item 34). Another library's list may close itself on `window`
  without cancelling the key — reka-ui does — and the browser, seeing nobody
  took it, then closed the dialog as well, list and all. So the key's target is
  read **before** anyone handles it (capture, on the dialog): inside an open
  listbox, menu or dialog the surface holds, or a popover in it — or on the
  control that opened one (`aria-expanded` with a popup, a combobox). A
  disclosure's `aria-expanded` is not a layer: it has no popup.
*/
const LAYER = '[role="listbox"], [role="menu"], [role="dialog"], [role="alertdialog"], [popover]'
const OPENER = '[aria-expanded="true"]:is([role="combobox"], [aria-haspopup]:not([aria-haspopup="false"]))'
let escapeForALayer = false

function isLayerEscape(target: EventTarget | null) {
  if (!(target instanceof Element) || !surface.value?.contains(target)) return false
  const layer = target.closest(LAYER)
  if (layer && layer !== el.value && surface.value.contains(layer)) return true
  return Boolean(target.closest(OPENER))
}

function onKeydownCapture(event: KeyboardEvent) {
  if (event.key !== 'Escape') return
  escapeForALayer = isLayerEscape(event.target)
  /* One Escape, one answer: a later close request (a back gesture) is not this one. */
  setTimeout(() => { escapeForALayer = false })
}

/* Escape: the browser's own cancel, held so the exit can play — unless the
   key was a layer's. */
function onCancel(event: Event) {
  event.preventDefault()
  if (escapeForALayer) return
  dismiss()
}

/* Closed by the browser itself (a second Escape forces it): follow. */
function onClose() {
  if (open.value) open.value = false
}

function onKeydown(event: KeyboardEvent) {
  /*
    Escape is not stopped here (ADR-0077, item 24): a list from another
    library, open in the dialog and listening on `window`, must get the key —
    it used to be the dialog that closed. Whoever handles it first cancels it.
    Over the page, the browser turns an Escape nobody cancelled into `cancel`;
    within a region there is no `cancel`, so the dialog waits for every
    listener to have had its turn, and closes only if none took the key. The
    package's own dropdowns stop their Escape themselves, and ignore one coming
    from a dialog that does not hold them.
  */
  if (event.key === 'Escape') {
    const layers = escapeForALayer
    if (props.within) setTimeout(() => { if (!event.defaultPrevented && !layers) dismiss() })
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

/*
  The scrim dismisses — the scrim itself, not « whatever is not the surface ».
  That test read a click whose target had just left the document (a button
  that hides itself on click) as a click outside, and closed the dialog
  (ADR-0077). The press has to begin on the scrim too, so a selection dragged
  out of the surface does not close it either.
*/
let pressedOnScrim = false

function isScrim(target: EventTarget | null) {
  return target === el.value || (target instanceof Element && target.classList.contains('ds-dialog__scrim'))
}

function onPointerDown(event: PointerEvent) {
  pressedOnScrim = isScrim(event.target)
}

function onClick(event: MouseEvent) {
  if (pressedOnScrim && isScrim(event.target)) dismiss()
  pressedOnScrim = false
}
</script>

<template>
  <Teleport :to="within ?? 'body'" :disabled="!within">
    <dialog
      ref="el"
      class="ds-dialog"
      :class="[`ds-dialog--${placement}`, `ds-dialog--${size}`, { 'ds-dialog--within': within }]"
      :popover="within ? 'manual' : undefined"
      :role="role"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="description || (slots.default && !side) ? descriptionId : undefined"
      @cancel="onCancel"
      @close="onClose"
      @keydown.capture="onKeydownCapture"
      @keydown="onKeydown"
      @pointerdown="onPointerDown"
      @click="onClick"
    >
      <Transition name="ds-dialog-scrim">
        <div v-if="shown" class="ds-dialog__scrim" />
      </Transition>
      <SurfaceTransition @after-leave="afterLeave">
        <div
          v-if="shown"
          ref="surface"
          class="ds-dialog__surface"
          :class="{ 'ds-dialog__surface--below': below }"
          tabindex="-1"
        >
          <header class="ds-dialog__head">
            <span v-if="icon" class="ds-dialog__sign" :class="`ds-dialog__sign--${tone}`" aria-hidden="true">
              <Icon :name="icon" :size="20" />
            </span>
            <!-- At the side, the description stays with the title in the fixed head. -->
            <div v-if="side" class="ds-dialog__heading">
              <h2 :id="titleId" class="ds-dialog__title">{{ title }}</h2>
              <p v-if="description" :id="descriptionId" class="ds-dialog__subtitle">{{ description }}</p>
            </div>
            <h2 v-else :id="titleId" class="ds-dialog__title">{{ title }}</h2>
            <CloseButton v-if="dismissible" size="sm" :ariaLabel="closeLabel" @click="dismiss" />
          </header>
          <div v-if="slots.default || (description && !side) || slots.form" ref="body" class="ds-dialog__body" @scroll="measureScroll">
            <!-- At the side, the slot is the panel's body — a form — and describes nothing. -->
            <div v-if="slots.default" :id="side ? undefined : descriptionId" :class="side ? 'ds-dialog__content' : 'ds-dialog__description'"><slot /></div>
            <p v-else-if="description && !side" :id="descriptionId" class="ds-dialog__description">{{ description }}</p>
            <slot name="form" />
          </div>
          <footer v-if="slots.actions || hasSummary" class="ds-dialog__foot">
            <!-- A status: the figures move as the body is ticked, and say so once each time. -->
            <div v-if="hasSummary" class="ds-dialog__summary" role="status">
              <slot name="summary">
                <dl class="ds-dialog__figures">
                  <div v-for="item in summary" :key="item.label" class="ds-dialog__figure">
                    <dt class="ds-dialog__figure-label">{{ item.label }}</dt>
                    <dd class="ds-dialog__figure-value">{{ item.value }}</dd>
                  </div>
                </dl>
              </slot>
            </div>
            <div v-if="slots.actions" class="ds-dialog__actions">
              <slot name="actions" />
            </div>
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
  /* Never a scroller: the body is what scrolls. The browser's `overflow:
     auto` let opening — which focuses the first field — scroll the dialog
     itself to show it, and a surface still on its way in was pulled into
     place on the first frame (ADR-0079). */
  overflow: clip;
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
  max-width: var(--dialog-width);
  max-height: 100%;
  overflow: hidden;
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-overlay);
  outline: none;
}

/*
  The widths (ADR-0079): one scale for both placements, each a width the
  catalogue already had — 24rem, `Dialog`'s 32rem, the reading column's 45rem,
  60rem. A variant switch, not a token (ADR-0010).
*/
.ds-dialog--sm { --dialog-width: 24rem; }
.ds-dialog--md { --dialog-width: 32rem; }
.ds-dialog--lg { --dialog-width: 45rem; }
.ds-dialog--xl { --dialog-width: 60rem; }
.ds-dialog--full { --dialog-width: none; }

.ds-dialog--centre.ds-dialog--full .ds-dialog__surface {
  height: 100%;
}

/* The head is ruled off from the body with the surface's own hairline; the
   foot is not — the owner took its rule out of the Figma component (9 Oct.),
   and the body's 24px is what parts it from the actions. */
/* The title and the body's text start 20px in — the side panel's edge, so the
   two placements share one (the owner's drawing, 26 Oct.). The foot keeps 24. */
.ds-dialog__head {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  padding: var(--ds-spacing-xl) var(--ds-spacing-xl) var(--ds-spacing-xl) var(--ds-spacing-2xl);
}

/*
  The sign (ADR-0076): the close's box — `CloseButton sm`, 36px — so the head's
  two ends are one size; `radius-control`, a glyph at 20 on its tone's tint
  and that tint's exact ink (ADR-0009). Brand is not a tone (it is
  interactive-only): a confirmation that is not a danger is neutral.
*/
.ds-dialog__sign {
  display: grid;
  flex: none;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: var(--ds-radius-control);
}

.ds-dialog__sign--danger {
  background: var(--ds-bg-error-subtle);
  color: var(--ds-text-on-error-subtle);
}

.ds-dialog__sign--neutral {
  background: var(--ds-bg-neutral-subtle);
  color: var(--ds-text-subtle);
}

.ds-dialog__body {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
  min-height: 0;
  overflow-y: auto;
  padding: var(--ds-spacing-3xl) var(--ds-spacing-2xl);
  border-top: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-dialog__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ds-spacing-xl) var(--ds-spacing-3xl);
  /* The start is the body's text edge (20px), so a summary lines up with
     what it sums; the actions keep the owner's 24 on the right. */
  padding: var(--ds-spacing-xl) var(--ds-spacing-3xl) var(--ds-spacing-xl) var(--ds-spacing-2xl);
}

/* On the right, and still on the right when the summary sends them under it
   (Spectrum, Polaris). */
.ds-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--ds-spacing-md);
  margin-inline-start: auto;
}

/* The figures sit on the foot's own ground — the foot is a level already, a
   tile would be a third (ADR-0048) — label over value, as the body reads. */
.ds-dialog__figures {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-spacing-md) var(--ds-spacing-3xl);
  margin: 0;
}

.ds-dialog__figure-label {
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-dialog__figure-value {
  margin: 0;
  font: var(--ds-font-label-lg-strong);
  font-variant-numeric: tabular-nums;
  color: var(--ds-text-strong);
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
  reading column. Above the popover it was opened from: both are in the top
  layer, and the dialog came second (ADR-0078). Its box is the region's
  rectangle, set as it opens and followed; `z-overlay` is what it falls back
  to where the top layer is not offered.
*/
.ds-dialog--within {
  inset: auto;
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

/*
  At the side (ADR-0079, Figma « Panneau latéral » track B): a surface set on
  the page, 12px off its edges, at full height — the same family as the
  dialog, so the same frame. The head holds the description and stays; the
  body scrolls between them. Head, body and foot stand 20px apart, 20px in
  from the sides; the head and the foot are each ruled off by an inset rule,
  16px from their content, always — and a fade over the body's last 64px says
  there is more below (the owner's drawing, 26 Oct.).

  The dialog is the container its surface is measured against: under 40rem
  the panel takes the whole screen, edge to edge — no inset, corner or shadow
  — and the foot stacks, the action on top. A container, not a breakpoint:
  what decides is the room the panel has.
*/
.ds-dialog--side {
  padding: 0;
  container-type: inline-size;
}

.ds-dialog--side[open] {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.ds-dialog--side .ds-dialog__surface {
  height: calc(100% - 2 * var(--ds-spacing-lg));
  max-height: none;
  margin: var(--ds-spacing-lg);
  gap: var(--ds-spacing-2xl);
}

/*
  It arrives from its edge: the house fade, with 24px of travel in place of
  the scale — the direction says where the panel lives, and nothing crosses
  the screen (track C of three filmed; ADR-0079). Over `considered` in,
  `exit` out, like the dialog.
*/
.ds-dialog--side .ds-dialog__surface.ds-surface-enter-from,
.ds-dialog--side .ds-dialog__surface.ds-surface-leave-to {
  transform: translateX(var(--ds-spacing-3xl));
}

/* The rule is inset — it ends where the head's content does — and the head
   makes room for it under its 16px. */
.ds-dialog--side .ds-dialog__head {
  position: relative;
  align-items: flex-start;
  padding:
    var(--ds-spacing-xl) var(--ds-spacing-xl)
    calc(var(--ds-spacing-xl) + var(--ds-border-width-default)) var(--ds-spacing-2xl);
}

.ds-dialog--side .ds-dialog__head::after,
.ds-dialog--side .ds-dialog__foot::after {
  content: '';
  position: absolute;
  height: var(--ds-border-width-default);
  background: var(--ds-border-subtle);
}

.ds-dialog--side .ds-dialog__head::after {
  right: var(--ds-spacing-xl);
  bottom: 0;
  left: var(--ds-spacing-2xl);
}

/* The panel's body is the product's: its blocks are the body's own rows, on
   the body's rhythm, not one block inside it. */
.ds-dialog__content {
  display: contents;
}

.ds-dialog__heading {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--ds-spacing-xs);
  min-width: 0;
  padding-top: var(--ds-spacing-sm);
}

.ds-dialog__subtitle {
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
  overflow-wrap: anywhere;
}

/* 20px in, 20px between its blocks. The 4px of padding above and below, taken
   back by the margin, is room for a field's focus ring — the body clips. */
.ds-dialog--side .ds-dialog__body {
  flex: 1 1 auto;
  gap: var(--ds-spacing-2xl);
  margin-block: calc(-1 * var(--ds-spacing-xs));
  padding: var(--ds-spacing-xs) var(--ds-spacing-2xl);
  border-top: 0;
}

.ds-dialog--side .ds-dialog__foot {
  position: relative;
  padding:
    calc(var(--ds-spacing-xl) + var(--ds-border-width-default)) var(--ds-spacing-2xl)
    var(--ds-spacing-xl);
}

.ds-dialog--side .ds-dialog__foot::after {
  top: 0;
  right: var(--ds-spacing-2xl);
  left: var(--ds-spacing-2xl);
}

/* The fade sits on the foot and reaches up over the body's last 64px. */
.ds-dialog--side .ds-dialog__foot::before {
  content: '';
  position: absolute;
  right: var(--ds-spacing-2xl);
  bottom: 100%;
  left: var(--ds-spacing-2xl);
  height: var(--ds-spacing-7xl);
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--ds-bg-default) 0%, transparent),
    color-mix(in srgb, var(--ds-bg-default) 70%, transparent) 45%,
    var(--ds-bg-default)
  );
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

.ds-dialog--side .ds-dialog__surface--below .ds-dialog__foot::before {
  opacity: 1;
}

@container (max-width: 40rem) {
  .ds-dialog--side .ds-dialog__surface {
    height: 100%;
    max-width: none;
    margin: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .ds-dialog--side .ds-dialog__foot {
    flex-direction: column;
    align-items: stretch;
  }

  .ds-dialog--side .ds-dialog__actions {
    flex-direction: column-reverse;
    align-items: stretch;
    margin-inline-start: 0;
  }
}

.ds-dialog__title {
  flex: 1;
  min-width: 0;
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
