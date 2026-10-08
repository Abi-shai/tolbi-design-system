<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, provide, ref, toRef, watch } from 'vue'
import { Badge } from '../Badge'
import { IconButton } from '../IconButton'
import { Scrollbar } from '../Scrollbar'
import { TOLBI_AI_PANEL } from './context'

/**
 * Tolbi AI, docked: a column in the page's layout, 400px wide, the height of
 * the surface it stands in — the page makes room for it rather than sitting
 * under it (ADR-0062). It does not float, so it does not take the house
 * entrance: opening is a width that travels, ADR-0037's column.
 *
 * Expanded, it takes the row it stands in — the page's whole surface, the bar
 * and the navigation untouched — and the page stays under it as it was left
 * (ADR-0064).
 *
 * Put it last in a flex row, beside the page; it carries its own 12px from the
 * page, inside the width that travels, so a closed panel leaves no gap behind.
 * The page must be its own stacking context: expanded, the panel covers it, and
 * anything in it with a `z-index` of its own — a map's controls — would paint
 * through.
 *
 *     <div style="display: flex">
 *       <main style="flex: 1; min-width: 0; isolation: isolate">…</main>
 *       <TolbiAiPanel v-model:open="open" v-model:expanded="expanded">
 *         <TolbiAiWelcome … /> or <TolbiAiThread>…</TolbiAiThread>
 *         <template #composer><TolbiAiComposer … /></template>
 *       </TolbiAiPanel>
 *     </div>
 */
interface Props {
  /** For the bar's entry to point at — `aria-controls`. */
  id?: string
  title?: string
  /** Beside the name — « ALPHA ». `null` hides it. */
  badge?: string | null
  historyLabel?: string
  newConversationLabel?: string
  expandLabel?: string
  collapseLabel?: string
  closeLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  title: 'Tolbi AI',
  badge: 'ALPHA',
  historyLabel: 'Historique',
  newConversationLabel: 'Nouvelle conversation',
  expandLabel: 'Agrandir',
  collapseLabel: 'Réduire',
  closeLabel: 'Fermer',
})

const emit = defineEmits<{
  history: []
  'new-conversation': []
}>()

const open = defineModel<boolean>('open', { default: false })
/**
 * The page's whole surface instead of 400px, read in a 720px column — for a
 * long answer, a table. The page stays under it, untouched; collapsing hands it
 * back as it was. Kept when the panel closes: it reopens as it was left.
 */
const expanded = defineModel<boolean>('expanded', { default: false })

provide(TOLBI_AI_PANEL, { open: toRef(() => open.value), expanded: toRef(() => expanded.value) })

const root = ref<HTMLElement>()
const surface = ref<HTMLElement>()
const scroller = ref<InstanceType<typeof Scrollbar>>()
const content = ref<HTMLElement>()

/* ── The thread follows what arrives ──────────────────────────────────── */
/*
  An answer arrives whole — the Yield API does not stream it — so following it
  to the bottom would land the reader on its actions with the answer's first
  lines scrolled away above. What arrives is brought into view instead:
  all of it when it fits, and when it does not, **the question it answers at
  the top** — the question, then the answer's first lines, which is where
  reading starts.

  Between arrivals, a reader at the end stays at the end as the last message
  grows (a transcript opened); one who has scrolled up to reread is left there.
*/
const NEAR_END = 48
let atEnd = true
let resizes: ResizeObserver | undefined
let arrivals: MutationObserver | undefined

const viewport = () => scroller.value?.viewport as HTMLElement | null | undefined

/** Scroll to the newest message, whatever the reader was looking at. */
function scrollToEnd() {
  const el = viewport()
  if (!el) return
  el.scrollTop = el.scrollHeight
  atEnd = true
}

function follow() {
  const el = viewport()
  const newest = content.value?.querySelector<HTMLElement>('.ds-tolbi-ai-thread > :last-child')
  if (!el || !newest) return scrollToEnd()
  if (newest.offsetHeight <= el.clientHeight - NEAR_END) return scrollToEnd()
  /* The question it answers — not the waiting line, which is still leaving as
     the answer arrives, and would take the scroll with it when it goes. */
  let anchor: HTMLElement = newest
  if (newest.classList.contains('ds-tolbi-ai-answer')) {
    let before = newest.previousElementSibling
    while (before && !before.matches('.ds-tolbi-ai-question, .ds-tolbi-ai-voice-note')) before = before.previousElementSibling
    if (before instanceof HTMLElement) anchor = before
  }
  el.scrollTop = anchor.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - NEAR_END / 2
  onScroll()
}

function onScroll() {
  const el = viewport()
  if (el) atEnd = el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_END
}

/* ── Expanded, the panel takes the row ────────────────────────────────── */
/*
  The surface covers the row the panel stands in, and only the row: its width
  is measured, since a surface cannot otherwise know how much page there is.
  It is set without a transition — a window that resizes is not a gesture, and
  a surface trailing it by 200ms would uncover the page at its edge.
*/
let rowSize: ResizeObserver | undefined

function setReach(width: number) {
  const el = root.value
  const box = surface.value
  if (!el || !box) return
  const reach = `${width}px`
  if (el.style.getPropertyValue('--tolbi-ai-panel-reach') === reach) return
  /* Docked, nothing reads it — and suspending the transitions there would cut
     an opening short. */
  const travels = expanded.value
  if (travels) el.style.transition = box.style.transition = 'none'
  el.style.setProperty('--tolbi-ai-panel-reach', reach)
  if (!travels) return
  void el.offsetWidth
  el.style.transition = box.style.transition = ''
}

/*
  What the expanded surface covers is out of reach too: the keyboard and a
  screen reader would otherwise walk a page no one can see. Only what the panel
  made inert is handed back.
*/
let covered: HTMLElement[] = []

function cover(on: boolean) {
  for (const el of covered) el.inert = false
  covered = []
  const row = root.value?.parentElement
  if (!on || !row) return
  for (const el of row.children) {
    if (el === root.value || !(el instanceof HTMLElement) || el.inert) continue
    el.inert = true
    covered.push(el)
  }
}

watch(() => open.value && expanded.value, cover, { flush: 'post' })

onMounted(() => {
  const row = root.value?.parentElement
  if (row && typeof ResizeObserver !== 'undefined') {
    rowSize = new ResizeObserver(([entry]) => setReach(entry.contentRect.width))
    rowSize.observe(row)
  }
  cover(open.value && expanded.value)

  viewport()?.addEventListener('scroll', onScroll, { passive: true })
  if (!content.value) return
  if (typeof ResizeObserver !== 'undefined') {
    resizes = new ResizeObserver(() => atEnd && scrollToEnd())
    resizes.observe(content.value)
  }
  /* A message added to the thread is an arrival; anything else is a change. */
  arrivals = new MutationObserver((records) => {
    const arrived = records.some((r) =>
      [...r.addedNodes].some((n) => n instanceof HTMLElement && n.parentElement?.classList.contains('ds-tolbi-ai-thread')),
    )
    if (arrived) requestAnimationFrame(follow)
  })
  arrivals.observe(content.value, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  cover(false)
  rowSize?.disconnect()
  resizes?.disconnect()
  arrivals?.disconnect()
  viewport()?.removeEventListener('scroll', onScroll)
})

/* Opened, the panel is where the question is asked: the field takes the focus. */
const focusField = () => surface.value?.querySelector<HTMLElement>('textarea')?.focus({ preventScroll: true })

watch(open, (now) => {
  if (now) void nextTick(focusField)
})

/*
  A control that asks — a suggestion — is often gone once it has:
  the welcome makes way for the thread. When the focus falls out of the panel
  with the element that held it, it lands in the field, where the next
  question goes, rather than on the page. Only then: an element still in the
  document was left, not lost — a click on the answer or on the page is the
  user's way out, and the field lets go.
*/
function onFocusOut(event: FocusEvent) {
  const left = event.target as Node
  setTimeout(() => {
    if (!open.value || left.isConnected) return
    if (!document.activeElement || document.activeElement === document.body) focusField()
  })
}

defineExpose({ scrollToEnd })
</script>

<template>
  <aside
    :id="props.id"
    ref="root"
    class="ds-tolbi-ai-panel"
    :class="{ 'ds-tolbi-ai-panel--closed': !open, 'ds-tolbi-ai-panel--expanded': expanded }"
    :aria-label="title"
  >
    <div ref="surface" class="ds-tolbi-ai-panel__surface" @focusout="onFocusOut">
      <header class="ds-tolbi-ai-panel__head">
        <div class="ds-tolbi-ai-panel__identity">
          <span class="ds-tolbi-ai-panel__title">{{ title }}</span>
          <Badge v-if="badge" :label="badge" tone="success" size="sm" />
        </div>
        <div class="ds-tolbi-ai-panel__actions">
          <IconButton icon="history" :ariaLabel="historyLabel" @click="emit('history')" />
          <IconButton icon="square-pen" :ariaLabel="newConversationLabel" @click="emit('new-conversation')" />
          <IconButton
            :icon="expanded ? 'minimize-2' : 'maximize-2'"
            :ariaLabel="expanded ? collapseLabel : expandLabel"
            @click="expanded = !expanded"
          />
          <IconButton icon="x" :ariaLabel="closeLabel" @click="open = false" />
        </div>
      </header>

      <Scrollbar ref="scroller" class="ds-tolbi-ai-panel__body" shadows>
        <div ref="content" class="ds-tolbi-ai-panel__content"><slot /></div>
      </Scrollbar>

      <div v-if="$slots.composer" class="ds-tolbi-ai-panel__composer">
        <slot name="composer" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
/*
  **Opening is a width that travels** (ADR-0037): `enter` on `easing-in-out` —
  whose own description names the drawer — open and closed alike, because one
  gesture takes one duration. The surface inside keeps its width the whole way
  and is clipped, so nothing reflows on the way, and it is **anchored to the
  edge it comes from**: it slides in from the side rather than being wiped in
  place (ADR-0046's drawer).

  The 12px between the page and the panel is the panel's own, inside the width:
  as a gap in the page's row it would outlive the closed panel. `visibility`
  lands at the end of the close — which also takes the closed panel out of the
  tab order and the accessibility tree.

  **Expanded, the surface takes the row** (ADR-0064) and the footprint does not
  move: the page stays 412px narrower, under the surface, so collapsing hands it
  back as it was left — a map is not reframed twice. The surface overflows the
  panel to the left, as wide as the row (`--tolbi-ai-panel-reach`, measured), on
  the same travel. What hides a closing panel is therefore a `clip-path` rather
  than `overflow`: a clip can open past the panel's own box, and it travels with
  the gesture. Closed while expanded, the surface keeps its width and the clip
  closes over it from the left — the page comes back the way it went, under one
  edge that travels.
*/
.ds-tolbi-ai-panel {
  --tolbi-ai-panel-width: 400px;
  --tolbi-ai-panel-gap: var(--ds-spacing-lg);
  --tolbi-ai-panel-footprint: calc(var(--tolbi-ai-panel-width) + var(--tolbi-ai-panel-gap));
  /* The reading column once expanded — Figma's 720 (2310:4829). */
  --tolbi-ai-panel-column: 720px;
  --tolbi-ai-panel-lead: var(--ds-spacing-2xl);

  display: flex;
  justify-content: flex-end;
  flex: none;
  width: var(--tolbi-ai-panel-footprint);
  min-height: 0;
  clip-path: inset(0);
  transition:
    width      var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    clip-path  var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    visibility 0s;
}

.ds-tolbi-ai-panel--expanded {
  --tolbi-ai-panel-lead: var(--ds-spacing-4xl);

  clip-path: inset(0 0 0 min(0px, var(--tolbi-ai-panel-footprint) - var(--tolbi-ai-panel-reach, 0px)));
}

.ds-tolbi-ai-panel--closed {
  width: 0;
  clip-path: inset(0);
  visibility: hidden;
  transition:
    width      var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    clip-path  var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    visibility 0s linear var(--ds-motion-duration-enter);
}

/*
  Figma's surface: `bg-default`, `radius-surface` on the top corners only — it
  runs to the bottom of the screen — and no shadow: it sits in the page.
*/
.ds-tolbi-ai-panel__surface {
  display: flex;
  flex-direction: column;
  flex: none;
  width: var(--tolbi-ai-panel-width);
  min-height: 0;
  box-sizing: border-box;
  border-radius: var(--ds-radius-surface) var(--ds-radius-surface) 0 0;
  background: var(--ds-bg-default);
  transition: width var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

.ds-tolbi-ai-panel--expanded .ds-tolbi-ai-panel__surface {
  width: var(--tolbi-ai-panel-reach, var(--tolbi-ai-panel-footprint));
}

.ds-tolbi-ai-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-lg) var(--ds-spacing-md) var(--ds-spacing-lg) var(--ds-spacing-xl);
  border-bottom: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

.ds-tolbi-ai-panel__identity {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-md);
  min-width: 0;
}

.ds-tolbi-ai-panel__title {
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
  white-space: nowrap;
}

.ds-tolbi-ai-panel__actions {
  display: flex;
  align-items: center;
  flex: none;
}

/* The thread scrolls; the head and the composer stay. */
.ds-tolbi-ai-panel__body {
  flex: 1 1 auto;
}

/*
  The reading column: centred, never wider than `--tolbi-ai-panel-column` and
  never closer than `spacing-2xl` to the edge — one rule for both widths, so the
  column follows the surface while it travels instead of switching at either
  end. Docked, it is the surface less its padding (360); expanded, it is 720.
*/
.ds-tolbi-ai-panel__content {
  display: flex;
  flex-direction: column;
  padding:
    var(--tolbi-ai-panel-lead)
    max(var(--ds-spacing-2xl), (100% - var(--tolbi-ai-panel-column)) / 2)
    var(--ds-spacing-xl);
  transition: padding-top var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/* The composer's box stands `2xl − xl` past the column on either side, at both
   widths: Figma's 368 on 360, 728 on 720. */
.ds-tolbi-ai-panel__composer {
  padding:
    var(--ds-spacing-xs)
    max(
      var(--ds-spacing-xl),
      (100% - var(--tolbi-ai-panel-column)) / 2 - (var(--ds-spacing-2xl) - var(--ds-spacing-xl))
    )
    var(--ds-spacing-lg);
}
</style>
