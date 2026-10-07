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
 * Put it beside the page in a flex row; it carries its own 12px from the page,
 * inside the width that travels, so a closed panel leaves no gap behind.
 *
 *     <div style="display: flex">
 *       <main style="flex: 1; min-width: 0">…</main>
 *       <TolbiAiPanel v-model:open="open">
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
/** 720px instead of 400 — for a long answer, a table, a wider look. */
const expanded = defineModel<boolean>('expanded', { default: false })

provide(TOLBI_AI_PANEL, { expanded: toRef(() => expanded.value) })

const surface = ref<HTMLElement>()
const scroller = ref<InstanceType<typeof Scrollbar>>()
const content = ref<HTMLElement>()

/* ── The thread follows what arrives ──────────────────────────────────── */
/*
  An answer arrives whole — the Yield API does not stream it — so following it
  to the bottom would land the reader on « Pour continuer » with the answer's
  first lines scrolled away above. What arrives is brought into view instead:
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

onMounted(() => {
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
  A control that asks — a suggestion, a follow-up — is often gone once it has:
  the welcome makes way for the thread. When the focus falls out of the panel
  with the element that held it, it lands in the field, where the next
  question goes, rather than on the page.
*/
function onFocusOut() {
  setTimeout(() => {
    if (open.value && (!document.activeElement || document.activeElement === document.body)) focusField()
  })
}

defineExpose({ scrollToEnd })
</script>

<template>
  <aside
    :id="props.id"
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
  place (ADR-0046's drawer). Expanding is the same travel, 400 → 720, and there
  the surface travels with it — the panel is changing size, so its contents
  reflow once.

  The 12px between the page and the panel is the panel's own, inside the width:
  as a gap in the page's row it would outlive the closed panel. `visibility`
  lands at the end of the close — which also takes the closed panel out of the
  tab order and the accessibility tree.
*/
.ds-tolbi-ai-panel {
  --tolbi-ai-panel-width: 400px;
  --tolbi-ai-panel-gap: var(--ds-spacing-lg);

  display: flex;
  justify-content: flex-end;
  flex: none;
  width: calc(var(--tolbi-ai-panel-width) + var(--tolbi-ai-panel-gap));
  min-height: 0;
  overflow: hidden;
  transition:
    width      var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
    visibility 0s;
}

.ds-tolbi-ai-panel--expanded {
  --tolbi-ai-panel-width: 720px;
}

.ds-tolbi-ai-panel--closed {
  width: 0;
  visibility: hidden;
  transition:
    width      var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out),
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

.ds-tolbi-ai-panel__content {
  display: flex;
  flex-direction: column;
  padding: var(--ds-spacing-2xl) var(--ds-spacing-2xl) var(--ds-spacing-xl);
}

.ds-tolbi-ai-panel__composer {
  padding: var(--ds-spacing-xs) var(--ds-spacing-xl) var(--ds-spacing-lg);
}
</style>
