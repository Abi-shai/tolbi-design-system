<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref, toRef, useId, watch } from 'vue'
import { useDelayedTooltip } from '../../composables/useDelayedTooltip'
import { Badge } from '../Badge'
import { Dropdown, DropdownTrigger } from '../Dropdown'
import type { IconName } from '../Icon'
import { IconButton } from '../IconButton'
import { InputField } from '../InputField'
import { Scrollbar } from '../Scrollbar'
import { Skeleton } from '../Skeleton'
import { SurfaceTransition } from '../SurfaceTransition'
import { SwapTransition } from '../SwapTransition'
import { Tooltip } from '../Tooltip'
import { TOLBI_AI_PANEL } from './context'
import TolbiAiHistory from './TolbiAiHistory.vue'
import {
  HISTORY_LABELS,
  SEARCH_FROM,
  describe,
  type TolbiAiConversation,
  type TolbiAiHistoryLabels,
} from './history'

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
 * The head names the conversation and is the way to the project's others
 * (ADR-0069): give it `conversations` and `v-model:conversation`, and its title
 * opens them — grouped by day, the current one marked. Choosing one sets
 * `conversation`; the product loads it (`loading` holds its place) and renders
 * its thread, **keyed by the conversation**, which the body swaps in by a
 * cross-fade.
 *
 *     <div style="display: flex">
 *       <main style="flex: 1; min-width: 0; isolation: isolate">…</main>
 *       <TolbiAiPanel v-model:open="open" v-model:expanded="expanded"
 *                     :conversations="list" v-model:conversation="current">
 *         <TolbiAiWelcome … /> or <TolbiAiThread :key="current">…</TolbiAiThread>
 *         <template #composer><TolbiAiComposer … /></template>
 *       </TolbiAiPanel>
 *     </div>
 */
interface Props {
  /** For the launcher to point at — `TolbiAiLauncher`'s `controls` (ADR-0070). */
  id?: string
  /**
   * The panel's name, for assistive technology — the region's label. Not
   * shown: the head names the conversation instead (ADR-0069).
   */
  title?: string
  /** After the conversation's title — « ALPHA ». `null` hides it. */
  badge?: string | null
  /**
   * The project's conversations, for the head's switcher (ADR-0069). Its
   * **presence decides**: absent, the head has no switcher; an empty list is a
   * project with none yet. Sorted, grouped and dated here.
   */
  conversations?: TolbiAiConversation[]
  /** The list is on its way: the switcher shows skeleton rows. */
  conversationsLoading?: boolean
  /** The current conversation is on its way: a skeleton of an exchange holds its place. */
  loading?: boolean
  /** What the switcher does, said to a reader after its title. */
  historyLabel?: string
  historyLabels?: Partial<TolbiAiHistoryLabels>
  /** For the history's hours, days and dates. */
  locale?: string
  /** The switcher's title while the conversation has no question yet, and the button that starts one. */
  newConversationLabel?: string
  expandLabel?: string
  collapseLabel?: string
  closeLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  title: 'Tolbi AI',
  badge: 'ALPHA',
  conversations: undefined,
  conversationsLoading: false,
  loading: false,
  historyLabel: 'Changer de conversation',
  historyLabels: () => ({}),
  locale: 'fr-FR',
  newConversationLabel: 'Nouvelle conversation',
  expandLabel: 'Agrandir',
  collapseLabel: 'Réduire',
  closeLabel: 'Fermer',
})

const emit = defineEmits<{
  /** The switcher opened — fetch the list now if it is not there yet. */
  history: []
  'new-conversation': []
  /** A row was renamed in place (ADR-0072); the product keeps the new title. */
  'rename-conversation': [id: string, title: string]
  /** A row's delete was pressed (ADR-0072); the product removes it and offers « Annuler ». */
  'delete-conversation': [id: string]
}>()

const open = defineModel<boolean>('open', { default: false })
/**
 * The page's whole surface instead of 400px, read in a 720px column — for a
 * long answer, a table. The page stays under it, untouched; collapsing hands it
 * back as it was. Kept when the panel closes: it reopens as it was left.
 */
const expanded = defineModel<boolean>('expanded', { default: false })
/** The current conversation's id; `null` while it has no question yet. */
const conversation = defineModel<string | null>('conversation', { default: null })

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

/*
  …once the field can hold it. The panel's `visibility` comes back with the
  opening, and under reduced motion the global `transition-duration: 0.01ms`
  turns that instant flip into a transition: the panel stays hidden a frame or
  two after the class lands, and focusing a hidden field does nothing — the
  focus stayed on the page. So it waits for the field to be visible, a frame
  at a time, a few frames at most, and gives up if the panel closes meanwhile.
*/
function focusWhenShown(frames = 10) {
  const field = surface.value?.querySelector<HTMLElement>('textarea')
  if (!open.value || !field) return
  if (getComputedStyle(field).visibility === 'visible') return void field.focus({ preventScroll: true })
  if (frames > 0) requestAnimationFrame(() => focusWhenShown(frames - 1))
}

watch(open, (now) => {
  if (now) void nextTick(() => focusWhenShown())
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

/*
  The head's actions say what they do in a tooltip, after 400ms on hover or
  focus — as the answer's actions and the microphone do (ADR-0066).
  Presentational: each button's own name already says it to a screen reader.
  Pressed, the action has answered the question the tooltip asked, so the
  tooltip goes; closing takes it with the panel.
*/
const { shown: tip, soon: tipSoon, away: tipAway } = useDelayedTooltip<string>()

watch(open, (now) => !now && tipAway())

/* ── The head names the conversation, and leads to the others ─────────── */
/*
  The title is the switcher (ADR-0069): Figma section 14's track B, chosen on
  8 Oct. — five of six docked assistants name the conversation in their head,
  and a menu that says its value is the plainest sign that there is a list.
  It is `DropdownTrigger`'s `ghost` chrome, the hover of the `IconButton`s
  beside it; its panel opens under it from its start, 320 wide, because its
  rows are sentences.
*/
const historyOpen = ref(false)
const query = ref('')
const now = ref(new Date())
const labels = computed<TolbiAiHistoryLabels>(() => ({ ...HISTORY_LABELS, ...props.historyLabels }))
const current = computed(() => props.conversations?.find((c) => c.id === conversation.value) ?? null)
const conversationTitle = computed(() => current.value?.title ?? props.newConversationLabel)
const searchable = computed(() => !props.conversationsLoading && (props.conversations?.length ?? 0) >= SEARCH_FROM)
const switchHint = useId()

function toggleHistory(toggle: () => void) {
  tipAway()
  if (!historyOpen.value) {
    now.value = new Date()
    emit('history')
  }
  toggle()
}

function choose(id: string) {
  historyOpen.value = false
  conversation.value = id
}

watch(historyOpen, (shown) => !shown && (query.value = ''))
watch(open, (shown) => !shown && (historyOpen.value = false))

/*
  A title the head cuts short is given in full, in a tooltip under it — with
  when it was, the switcher's own dating. Only when it is cut: a whole title
  needs no second copy.
*/
const titleEl = ref<HTMLElement>()
const conversationWhen = computed(() => {
  if (!current.value) return undefined
  const { group, meta } = describe(current.value.at, new Date(), props.locale)
  return `${labels.value[group]} · ${meta}`
})

function titleTipSoon() {
  const el = titleEl.value
  if (el && el.scrollWidth > el.clientWidth) tipSoon('title')
}

const actions = computed<{ key: string; icon: IconName; label: string; run: () => void }[]>(() => [
  { key: 'new', icon: 'square-pen', label: props.newConversationLabel, run: () => emit('new-conversation') },
  {
    key: 'size',
    icon: expanded.value ? 'minimize-2' : 'maximize-2',
    label: expanded.value ? props.collapseLabel : props.expandLabel,
    run: () => (expanded.value = !expanded.value),
  },
  { key: 'close', icon: 'x', label: props.closeLabel, run: () => (open.value = false) },
])

function act(run: () => void) {
  tipAway()
  run()
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
        <Dropdown
          v-if="conversations"
          v-model:open="historyOpen"
          class="ds-tolbi-ai-panel__switcher"
          role="dialog"
          :label="labels.title"
        >
          <template #trigger="{ open: listed, toggle }">
            <DropdownTrigger
              chrome="ghost"
              size="sm"
              chevron
              :open="listed"
              class="ds-tolbi-ai-panel__switch"
              aria-haspopup="dialog"
              :aria-describedby="switchHint"
              @click="toggleHistory(toggle)"
              @pointerenter="titleTipSoon"
              @pointerleave="tipAway"
              @focusin="titleTipSoon"
              @focusout="tipAway"
            >
              <span ref="titleEl" class="ds-tolbi-ai-panel__title">{{ conversationTitle }}</span>
            </DropdownTrigger>
            <span :id="switchHint" class="ds-tolbi-ai-panel__hidden">{{ historyLabel }}</span>
            <SurfaceTransition>
              <Tooltip
                v-if="tip === 'title' && !listed"
                class="ds-tolbi-ai-panel__title-tip"
                :title="conversationTitle"
                :supporting-text="conversationWhen"
                arrow="top-left"
                role="presentation"
              />
            </SurfaceTransition>
          </template>
          <template v-if="searchable" #header>
            <InputField v-model="query" size="sm" type="search" :placeholder="labels.search" />
          </template>
          <TolbiAiHistory
            :conversations="conversations"
            :current="conversation"
            :loading="conversationsLoading"
            :query="query"
            :labels="labels"
            :now="now"
            :locale="locale"
            @select="choose"
            @rename="(id, title) => emit('rename-conversation', id, title)"
            @remove="(id) => emit('delete-conversation', id)"
          />
        </Dropdown>
        <Badge v-if="badge" class="ds-tolbi-ai-panel__badge" :label="badge" tone="success" size="sm" />
        <div class="ds-tolbi-ai-panel__actions">
          <span
            v-for="action in actions"
            :key="action.key"
            class="ds-tolbi-ai-panel__action"
            @pointerenter="tipSoon(action.key)"
            @pointerleave="tipAway"
            @focusin="tipSoon(action.key)"
            @focusout="tipAway"
          >
            <IconButton :icon="action.icon" :ariaLabel="action.label" @click="act(action.run)" />
            <SurfaceTransition>
              <Tooltip
                v-if="tip === action.key"
                class="ds-tolbi-ai-panel__tip"
                :title="action.label"
                arrow="top-right"
                role="presentation"
              />
            </SurfaceTransition>
          </span>
        </div>
      </header>

      <Scrollbar ref="scroller" class="ds-tolbi-ai-panel__body" shadows>
        <div ref="content" class="ds-tolbi-ai-panel__content">
          <!-- One thing in place of another — the welcome, a conversation, the
               next one — by a cross-fade (ADR-0026, ADR-0069). -->
          <SwapTransition @enter="follow">
            <div
              v-if="loading"
              key="ds-tolbi-ai-panel-loading"
              class="ds-tolbi-ai-panel__skeleton"
              role="status"
              aria-busy="true"
              :aria-label="labels.loading"
            >
              <Skeleton class="ds-tolbi-ai-panel__skeleton-question" :width="220" />
              <Skeleton :lines="4" />
              <Skeleton :lines="3" />
            </div>
            <slot v-else />
          </SwapTransition>
        </div>
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
  gap: var(--ds-spacing-md);
  padding: var(--ds-spacing-lg) var(--ds-spacing-md) var(--ds-spacing-lg) var(--ds-spacing-xl);
  border-bottom: var(--ds-border-width-default) solid var(--ds-border-subtle);
}

/*
  The switcher (ADR-0069). It gives way before anything else in the head — the
  title truncates — and stands `spacing-md` out into the head's padding, so its
  hover lands 8px from the panel's edge as the close button's does on the other
  side, and the title's first letter on the content's 20px. The badge follows
  the chevron at 16px rather than 20: the 4px are what keep « Nouvelle
  conversation » whole at 400.
*/
.ds-tolbi-ai-panel__switcher {
  flex: 0 1 auto;
  min-width: 0;
  margin-left: calc(-1 * var(--ds-spacing-md));
  margin-right: calc(-1 * var(--ds-spacing-xs));
}

.ds-tolbi-ai-panel__switch {
  max-width: 100%;
  min-width: 0;
}

.ds-tolbi-ai-panel__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Under the title, from its start, 320 wide: its rows are sentences. */
.ds-tolbi-ai-panel__switcher :deep(.ds-dropdown__panel) {
  right: auto;
  left: 0;
  width: 320px;
  transform-origin: top left;
}

/* The whole title, under the cut one — from its start, as the list opens. */
.ds-tolbi-ai-panel__title-tip {
  position: absolute;
  top: calc(100% + var(--ds-spacing-sm));
  left: 0;
  z-index: var(--ds-z-popover);
  pointer-events: none;
  transform-origin: top left;
}

/* Said, not shown. */
.ds-tolbi-ai-panel__hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.ds-tolbi-ai-panel__badge {
  flex: none;
}

/* The actions keep the head's end, with or without the switcher and the badge. */
.ds-tolbi-ai-panel__actions {
  display: flex;
  align-items: center;
  flex: none;
  margin-left: auto;
}

.ds-tolbi-ai-panel__action {
  position: relative;
  display: inline-flex;
}

/*
  Under the action, as every tooltip in the bar — the head is the panel's top
  edge, and the clip would cut one above it (ADR-0064) — and ending at its
  right: the panel's edge is close on that side, and centred under the close
  button « Fermer » lost 7.7px to it. The arrow's tip sits 20px in from the
  tooltip's right edge (`spacing-lg` plus its 8px half-width) and the action's
  centre half the action in from its own, so the tooltip ends 2px past the
  action and the tip lands on the centre.
*/
.ds-tolbi-ai-panel__tip {
  position: absolute;
  top: calc(100% + var(--ds-spacing-sm));
  right: calc(50% - var(--ds-spacing-lg) - 8px);
  z-index: var(--ds-z-popover);
  white-space: nowrap;
  pointer-events: none;
  transform-origin: top right;
}

/* The thread scrolls; the head and the composer stay. */
.ds-tolbi-ai-panel__body {
  flex: 1 1 auto;
}

/* An exchange, not yet there: a question on the user's side, then an answer. */
.ds-tolbi-ai-panel__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xl);
}

.ds-tolbi-ai-panel__skeleton-question {
  align-self: flex-end;
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
