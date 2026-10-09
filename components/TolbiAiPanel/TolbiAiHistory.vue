<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue'
import { ConfirmDialog } from '../Dialog'
import { DropdownGroup, DropdownItem } from '../Dropdown'
import { IconButton } from '../IconButton'
import { InputField } from '../InputField'
import { Skeleton } from '../Skeleton'
import { SurfaceTransition } from '../SurfaceTransition'
import { Tooltip } from '../Tooltip'
import { useDelayedTooltip } from '../../composables/useDelayedTooltip'
import { readDuration } from '../../composables/cssTime'
import { TOLBI_AI_PANEL } from './context'
import {
  HISTORY_GROUPS,
  describe,
  fold,
  type TolbiAiConversation,
  type TolbiAiHistoryLabels,
} from './history'

/**
 * The rows of the head's switcher (ADR-0069) — internal, `TolbiAiPanel`'s
 * own. The project's conversations, the most recent first, under four
 * headings; the current one marked as every list in the catalogue marks it
 * (ADR-0050), dated by the hour, the day or the date.
 *
 * Each row carries its two actions (ADR-0072): under the pointer or the
 * focus, renaming and deleting take the time's place. Renaming happens in
 * the row; deleting asks first, in a confirmation (ADR-0075).
 */
const props = defineProps<{
  conversations: TolbiAiConversation[]
  current: string | null
  loading: boolean
  query: string
  labels: TolbiAiHistoryLabels
  /** Taken when the list opens, so the times do not move while it is read. */
  now: Date
  locale: string
}>()

const emit = defineEmits<{
  select: [id: string]
  rename: [id: string, title: string]
  remove: [id: string]
}>()

const dated = computed(() =>
  [...props.conversations]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .map((c) => ({ ...c, ...describe(c.at, props.now, props.locale) })),
)

const groups = computed(() => {
  const q = fold(props.query.trim())
  const found = q ? dated.value.filter((c) => fold(c.title).includes(q)) : dated.value
  return HISTORY_GROUPS.map((key) => ({ key, label: props.labels[key], rows: found.filter((c) => c.group === key) })).filter(
    (g) => g.rows.length,
  )
})

const hint = computed(() => {
  if (!props.conversations.length) return props.labels.empty
  if (!groups.value.length) return props.labels.noMatch.replace('{query}', props.query.trim())
  if (props.conversations.length === 1 && props.conversations[0].id === props.current) return props.labels.alone
  return null
})

const SKELETON_ROWS = ['72%', '56%', '80%', '64%', '48%']

const root = ref<HTMLElement>()
const row = (id: string) => root.value?.querySelector<HTMLElement>(`[data-conversation="${CSS.escape(id)}"]`)
const focusRow = (id: string) => void nextTick(() => row(id)?.querySelector<HTMLElement>('.ds-dropdown-item')?.focus())

/* ── Renaming, in the row ─────────────────────────────────────────────── */
/*
  The title becomes its own field, selected, and the two actions become
  « Enregistrer » and « Annuler » in the same places. Enter keeps it, Escape
  gives it back — without closing the list, so the Escape stops here — and
  leaving the field keeps it, as the products that rename in place do. An
  empty or unchanged name changes nothing.
*/
const editing = ref<string | null>(null)
const draft = ref('')

function startRename(c: TolbiAiConversation) {
  tipAway()
  editing.value = c.id
  draft.value = c.title
  void nextTick(() => {
    const input = row(c.id)?.querySelector<HTMLInputElement>('input')
    input?.focus()
    /* All of it, the caret at its start, so the field shows the title's
       beginning rather than scrolling to its end. */
    input?.setSelectionRange(0, input.value.length, 'backward')
    if (input) input.scrollLeft = 0
  })
}

function commit({ refocus = true } = {}) {
  const id = editing.value
  if (!id) return
  editing.value = null
  const title = draft.value.trim()
  const was = props.conversations.find((c) => c.id === id)?.title
  if (title && title !== was) emit('rename', id, title)
  if (refocus) focusRow(id)
}

function cancel() {
  const id = editing.value
  editing.value = null
  if (id) focusRow(id)
}

function onEscape(event: KeyboardEvent) {
  event.stopPropagation()
  cancel()
}

/* ── Deleting, once confirmed ─────────────────────────────────────────── */
/*
  A deletion asks first (ADR-0075): « Supprimer la conversation ? », the
  conversation named in the sentence. Only the confirmation emits `remove`;
  the row then closes and the focus goes to the next one — the one before,
  when it was the last — so a keyboard stays in the list. Cancelling leaves
  the list as it was and hands the focus back to the button that asked.

  The question belongs to the panel, not to the page: it is asked inside the
  panel's surface, under the panel's own scrim, rising from its bottom — the
  map beside it stays as it is (Figma section 18, track C1). Outside a panel,
  it is asked over the page.
*/
const panel = inject(TOLBI_AI_PANEL, null)
const doomed = ref<TolbiAiConversation | null>(null)
const asking = ref(false)
const confirmed = ref(false)
let after: string | undefined

function remove(c: TolbiAiConversation) {
  tipAway()
  doomed.value = c
  confirmed.value = false
  asking.value = true
}

function confirmRemove() {
  const c = doomed.value
  if (!c) return
  const order = groups.value.flatMap((g) => g.rows.map((r) => r.id))
  const at = order.indexOf(c.id)
  after = order[at + 1] ?? order[at - 1]
  confirmed.value = true
  emit('remove', c.id)
}

function asked() {
  if (confirmed.value && after) focusRow(after)
  doomed.value = null
  confirmed.value = false
  after = undefined
}

/* ── Each action says what it does (ADR-0066) ─────────────────────────── */
const { shown: tip, soon: tipSoon, soonOnFocus: tipOnFocus, away: tipAway } = useDelayedTooltip<string>()

/* ── A row that leaves closes its height; one that comes back opens it ── */
/*
  Only what the product changes moves — a deletion, its undoing. What the
  search filters, and the list's first rows, come and go at once: a list that
  animated every keystroke would lag behind the typing. `exit` to close,
  `enter` to open (ADR-0021's asymmetry), off the cascade; nothing under
  reduced motion.
*/
const searching = ref(false)
watch(
  () => props.query,
  () => {
    searching.value = true
    void nextTick(() => (searching.value = false))
  },
)

const still = () => searching.value || matchMedia('(prefers-reduced-motion: reduce)').matches
const cascade = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

function travel(el: Element, done: () => void, from: number, to: number, duration: string, easing: string) {
  const box = el as HTMLElement
  box.style.overflow = 'hidden'
  const glide = box.animate(
    [
      { height: `${from}px`, opacity: from ? 1 : 0 },
      { height: `${to}px`, opacity: to ? 1 : 0 },
    ],
    { duration: readDuration(document.documentElement, duration), easing: cascade(easing) || 'ease' },
  )
  const end = () => {
    glide.onfinish = glide.oncancel = null
    box.style.overflow = ''
    done()
  }
  glide.onfinish = end
  glide.oncancel = end
}

function open(el: Element, done: () => void) {
  if (still()) return done()
  travel(el, done, 0, (el as HTMLElement).getBoundingClientRect().height, '--ds-motion-duration-enter', '--ds-motion-easing-out')
}

function close(el: Element, done: () => void) {
  if (still()) return done()
  travel(el, done, (el as HTMLElement).getBoundingClientRect().height, 0, '--ds-motion-duration-exit', '--ds-motion-easing-in')
}
</script>

<template>
  <div ref="root" class="ds-tolbi-ai-history">
    <div v-if="loading" class="ds-tolbi-ai-history__loading" aria-busy="true">
      <div v-for="width in SKELETON_ROWS" :key="width" class="ds-tolbi-ai-history__skeleton">
        <Skeleton :width="width" />
        <Skeleton :width="36" />
      </div>
    </div>

    <template v-else>
      <TransitionGroup :css="false" @enter="open" @leave="close">
        <DropdownGroup v-for="g in groups" :key="g.key" :label="g.label">
          <TransitionGroup :css="false" @enter="open" @leave="close">
            <div
              v-for="c in g.rows"
              :key="c.id"
              class="ds-tolbi-ai-history__row"
              :class="{ 'ds-tolbi-ai-history__row--editing': editing === c.id }"
              :data-conversation="c.id"
            >
              <template v-if="editing === c.id">
                <div class="ds-tolbi-ai-history__field">
                  <InputField
                    v-model="draft"
                    size="sm"
                    :aria-label="labels.renameField"
                    @keydown.enter.prevent="commit()"
                    @keydown.escape="onEscape"
                    @blur="commit({ refocus: false })"
                  />
                </div>
                <span class="ds-tolbi-ai-history__actions">
                  <IconButton icon="check" size="xs" variant="subtle" :ariaLabel="labels.save" @mousedown.prevent @click="commit()" />
                  <IconButton icon="x" size="xs" variant="subtle" :ariaLabel="labels.cancel" @mousedown.prevent @click="cancel" />
                </span>
              </template>

              <template v-else>
                <DropdownItem
                  as="button"
                  :label="c.title"
                  :meta="c.pending ? labels.pending : c.meta"
                  :selected="c.id === current"
                  @click="emit('select', c.id)"
                />
                <span class="ds-tolbi-ai-history__actions">
                  <span
                    v-for="action in (['rename', 'delete'] as const)"
                    :key="action"
                    class="ds-tolbi-ai-history__action"
                    @pointerenter="tipSoon(`${c.id}:${action}`)"
                    @pointerleave="tipAway"
                    @focusin="tipOnFocus($event, `${c.id}:${action}`)"
                    @focusout="tipAway"
                  >
                    <IconButton
                      :icon="action === 'rename' ? 'pencil' : 'trash-2'"
                      size="xs"
                      variant="subtle"
                      :ariaLabel="`${labels[action]} – ${c.title}`"
                      @click="action === 'rename' ? startRename(c) : remove(c)"
                    />
                    <SurfaceTransition>
                      <Tooltip
                        v-if="tip === `${c.id}:${action}`"
                        class="ds-tolbi-ai-history__tip"
                        :title="labels[action]"
                        arrow="right"
                        role="presentation"
                      />
                    </SurfaceTransition>
                  </span>
                </span>
              </template>
            </div>
          </TransitionGroup>
        </DropdownGroup>
      </TransitionGroup>
      <p v-if="hint" class="ds-tolbi-ai-history__hint">{{ hint }}</p>
    </template>

    <ConfirmDialog
      v-model:open="asking"
      :title="labels.deleteTitle"
      :message="labels.deleteBody.replace('{title}', doomed?.title ?? '')"
      :confirm-label="labels.deleteConfirm"
      :cancel-label="labels.deleteCancel"
      tone="danger"
      :restore-focus="!confirmed"
      :within="panel?.layer.value ?? null"
      @confirm="confirmRemove"
      @closed="asked"
    />
  </div>
</template>

<style scoped>
/*
  A row's two actions, `IconButton xs` touching (ADR-0066): 64px at the row's
  end, `spacing-xs` inside its hover ground. A variant switch, not a token.
*/
.ds-tolbi-ai-history {
  --tolbi-ai-history-actions: 64px;
}

.ds-tolbi-ai-history__row {
  position: relative;
  display: flex;
  align-items: center;
}

.ds-tolbi-ai-history__row > :deep(.ds-dropdown-item) {
  flex: 1;
  min-width: 0;
}

.ds-tolbi-ai-history__actions {
  position: absolute;
  top: 50%;
  right: calc(var(--ds-spacing-sm) + var(--ds-spacing-xs));
  display: flex;
  translate: 0 -50%;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--ds-motion-duration-quick) var(--ds-motion-easing-default);
}

/*
  Under the pointer or the focus — and always while renaming — the actions
  show, the time gives them its place, and the title stops before them.
  Without a pointer to hover with, they stay.
*/
.ds-tolbi-ai-history__row:hover .ds-tolbi-ai-history__actions,
.ds-tolbi-ai-history__row:focus-within .ds-tolbi-ai-history__actions,
.ds-tolbi-ai-history__row--editing .ds-tolbi-ai-history__actions {
  opacity: 1;
  pointer-events: auto;
}

.ds-tolbi-ai-history__row:hover :deep(.ds-dropdown-item__shortcut),
.ds-tolbi-ai-history__row:focus-within :deep(.ds-dropdown-item__shortcut) {
  visibility: hidden;
}

.ds-tolbi-ai-history__row:hover :deep(.ds-dropdown-item__content),
.ds-tolbi-ai-history__row:focus-within :deep(.ds-dropdown-item__content) {
  padding-right: calc(var(--tolbi-ai-history-actions) + var(--ds-spacing-md));
}

@media (hover: none) {
  .ds-tolbi-ai-history__actions {
    opacity: 1;
    pointer-events: auto;
  }

  .ds-tolbi-ai-history__row :deep(.ds-dropdown-item__shortcut) {
    visibility: hidden;
  }

  .ds-tolbi-ai-history__row :deep(.ds-dropdown-item__content) {
    padding-right: calc(var(--tolbi-ai-history-actions) + var(--ds-spacing-md));
  }
}

.ds-tolbi-ai-history__action {
  position: relative;
  display: inline-flex;
}

/* Beside the action, inside the row: a tooltip above or below a row would be
   cut by the list's own scroll. */
.ds-tolbi-ai-history__tip {
  position: absolute;
  top: 50%;
  right: calc(100% + var(--ds-spacing-xs));
  z-index: 2;
  translate: 0 -50%;
  white-space: nowrap;
  pointer-events: none;
  transform-origin: right center;
}

/* The field stands where the row's ground was, `spacing-sm` in. A small field
   is 42px and a row 40, so it overhangs the row by 1px each way rather than
   growing it: the rows below must not move when a name opens. */
.ds-tolbi-ai-history__field {
  flex: 1;
  min-width: 0;
  margin-block: -1px;
  padding: 0 calc(var(--tolbi-ai-history-actions) + var(--ds-spacing-md)) 0 var(--ds-spacing-sm);
}

/* A sentence in the list's place: on the rows' text, in the group titles' ink. */
.ds-tolbi-ai-history__hint {
  margin: 0;
  padding: var(--ds-spacing-md) var(--ds-spacing-xl);
  font: var(--ds-font-body-sm);
  color: var(--ds-text-subtle);
}

.ds-tolbi-ai-history__loading {
  display: flex;
  flex-direction: column;
}

/* A row's height and its text's edges: 40px, `spacing-xl` in. */
.ds-tolbi-ai-history__skeleton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-spacing-xl);
  height: 40px;
  padding: 0 var(--ds-spacing-xl);
}
</style>
