<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, useSlots, watch } from 'vue'
import { Icon, type IconName } from '../Icon'
import { CloseButton } from '../CloseButton'
import { Spinner } from '../Spinner'
import { MarkTransition } from '../MarkTransition'

/**
 * A short message about something that just happened, on the catalogue's
 * floating surface — `bg-default`, a `border-subtle` hairline, `radius-surface`,
 * `elevation-overlay`: the surface of `Dropdown` and `ModulesList` (ADR-0052,
 * track A). The tone is carried by the **glyph** and its ink; the surface stays
 * neutral, as in 8 of the 20 products benchmarked. The 3px stripe it had is
 * gone — the rarest pattern of the four, and it bent in the rounded corners.
 *
 * It enters, leaves and makes room inside a `ToastRegion`, which owns the
 * motion; the toast owns its message and its time.
 */

/**
 * ADR-0009's four tones. `brand` is gone: it is interactive affordance, not a
 * tone — and the old `brand` toast had no rule at all, a black glyph and no
 * stripe. `neutral` is what `info` was.
 */
export type ToastTone = 'success' | 'error' | 'warning' | 'neutral'

interface Props {
  tone?:        ToastTone
  /**
   * One sentence — what happened. Never a generic word: « Succès » says
   * nothing the glyph does not already say.
   */
  message:      string
  /** The second line, when the sentence needs a detail. */
  detail?:      string
  /** A task still running: a spinner holds the glyph's place, and the toast waits. */
  pending?:     boolean
  dismissible?: boolean
  /**
   * How long the toast stays, in ms — `null` stays until dismissed.
   *
   * Left out, the tone decides: an **error** or a **pending** task stays (it has
   * to be read, or it is not over); a toast with **actions** stays 8 s, so the
   * action can be reached; anything else 5 s. The time **pauses** while the
   * pointer or the focus is on the toast, and starts again when a pending task
   * resolves.
   */
  duration?:    number | null
}

const props = withDefaults(defineProps<Props>(), {
  tone:        'neutral',
  pending:     false,
  dismissible: true,
  duration:    undefined,
})

const emit = defineEmits<{
  /**
   * The close was clicked, or the time ran out. Remove the toast from what the
   * `ToastRegion` renders and the region plays its exit — the toast cannot
   * animate its own removal.
   */
  dismiss: [reason: 'close' | 'timeout']
}>()

const slots = useSlots()

/* The tone picks the glyph, not only its ink (ADR-0006). */
const GLYPH: Record<ToastTone, IconName> = {
  success: 'circle-check',
  error:   'circle-alert',
  warning: 'triangle-alert',
  neutral: 'info',
}

/* Lifetimes, not motion: how long a message is worth reading. */
const LIFETIME             = 5000
const LIFETIME_WITH_ACTION = 8000

const lifetime = computed<number | null>(() => {
  if (props.duration !== undefined) return props.duration
  if (props.pending || props.tone === 'error') return null
  return slots.actions ? LIFETIME_WITH_ACTION : LIFETIME
})

/*
  The clock. A timeout per run, and what was left of it when the pointer or the
  focus arrived — so hovering a toast for ten seconds and leaving it gives back
  the time it had, not a fresh five.
*/
let timer: ReturnType<typeof setTimeout> | undefined
let remaining = 0
let startedAt = 0
let held = false

function stop() {
  if (timer !== undefined) clearTimeout(timer)
  timer = undefined
}

function run() {
  stop()
  if (lifetime.value === null || held) return
  startedAt = Date.now()
  timer = setTimeout(() => emit('dismiss', 'timeout'), remaining)
}

function restart() {
  remaining = lifetime.value ?? 0
  run()
}

function hold() {
  if (timer !== undefined) remaining -= Date.now() - startedAt
  stop()
  held = true
}

function release() {
  held = false
  run()
}

/* Focus moving between the toast's own controls is still focus on the toast. */
function onFocusOut(event: FocusEvent) {
  const next = event.relatedTarget as Node | null
  if (!next || !(event.currentTarget as HTMLElement).contains(next)) release()
}

onMounted(restart)
watch(lifetime, restart)
onBeforeUnmount(stop)

/* An error interrupts a screen reader; anything else waits its turn. */
const liveRole = computed(() => (props.tone === 'error' ? 'alert' : 'status'))
</script>

<template>
  <div
    class="ds-toast"
    :class="`ds-toast--${tone}`"
    :role="liveRole"
    aria-atomic="true"
    @mouseenter="hold"
    @mouseleave="release"
    @focusin="hold"
    @focusout="onFocusOut"
  >
    <!--
      The glyph, or the spinner while the task runs. When it resolves, the
      tone's glyph **confirms** it — `MarkTransition`, a mark arriving where the
      spinner was (ADR-0023).
    -->
    <span class="ds-toast__glyph" aria-hidden="true">
      <MarkTransition>
        <Spinner v-if="pending" key="pending" :size="20" />
        <Icon v-else :key="tone" :name="GLYPH[tone]" :size="20" />
      </MarkTransition>
    </span>

    <div class="ds-toast__text">
      <p class="ds-toast__message">{{ message }}</p>
      <p v-if="detail" class="ds-toast__detail">{{ detail }}</p>
    </div>

    <!-- On the message's line, in text: `Button variant="link" size="sm"`. -->
    <div v-if="$slots.actions" class="ds-toast__actions">
      <slot name="actions" />
    </div>

    <CloseButton
      v-if="dismissible"
      size="xs"
      aria-label="Fermer la notification"
      class="ds-toast__close"
      @click="emit('dismiss', 'close')"
    />
  </div>
</template>

<style scoped>
/*
  Every item sits on the message's first line: `flex-start`, and each one is
  given that line's height (`1lh` of `label-lg-strong`, 20px) — so a toast with
  a detail keeps its glyph, its action and its close level with the sentence,
  not centred on the block.
*/
.ds-toast {
  --toast-glyph: var(--ds-text-subtle);

  display: flex;
  align-items: flex-start;
  gap: var(--ds-spacing-lg);
  box-sizing: border-box;
  /* The width is the sentence's, up to the frame's 440. */
  width: max-content;
  max-width: 27.5rem;
  padding: var(--ds-spacing-lg) var(--ds-spacing-lg) var(--ds-spacing-lg) var(--ds-spacing-xl);
  border: var(--ds-border-width-default) solid var(--ds-border-subtle);
  border-radius: var(--ds-radius-surface);
  background-color: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-overlay);
  pointer-events: auto;
}

.ds-toast--success { --toast-glyph: var(--ds-text-success); }
.ds-toast--error   { --toast-glyph: var(--ds-text-error); }
.ds-toast--warning { --toast-glyph: var(--ds-text-warning); }

.ds-toast__glyph {
  display: flex;
  flex-shrink: 0;
  color: var(--toast-glyph);
}

.ds-toast__text {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-xxs);
  flex: 1 1 auto;
  min-width: 0;
}

.ds-toast__message {
  margin: 0;
  font: var(--ds-font-label-lg-strong);
  color: var(--ds-text-strong);
}

.ds-toast__detail {
  margin: 0;
  font: var(--ds-font-body-md);
  color: var(--ds-text-subtle);
}

.ds-toast__actions {
  display: flex;
  align-items: center;
  gap: var(--ds-spacing-lg);
  flex-shrink: 0;
  font: var(--ds-font-label-lg-strong);
  height: 1lh;
}

/*
  The 32px target stays whole for the pointer, and counts for the line's 20px in
  the layout: the box hangs 6px into the padding on every side, which puts the
  16px cross where Figma draws it, 14px from the edge.
*/
.ds-toast__close {
  flex-shrink: 0;
  /* token-lint-disable-next-line spacing-on-ramp — a hit area's overhang, (20 − 32) / 2, not rhythm */
  margin: -6px;
}
</style>
