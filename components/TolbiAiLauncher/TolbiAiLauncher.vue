<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { SurfaceTransition } from '../SurfaceTransition'
import { TolbiAiSpark } from '../TolbiAiSpark'
import { Tooltip } from '../Tooltip'
import { useDelayedTooltip } from '../../composables/useDelayedTooltip'

/**
 * Tolbi AI's way in: a white disc with the sign, floating at the bottom right
 * of the screen, over the page (Figma `2308:2429`, ADR-0070) — not in the bar,
 * which is about the app. It opens the docked panel (ADR-0062) and gives way
 * while the panel is open, whose own close brings it back. ⌘J (Ctrl+J
 * elsewhere) does what a click does, from anywhere on the page. When the
 * pointer arrives, the sign turns once to meet it (ADR-0071).
 *
 * Put it once in the page, beside the panel; `v-model:open` is the panel's.
 *
 *     <TolbiAiLauncher v-model:open="open" controls="tolbi-ai-panel" />
 *     <TolbiAiPanel id="tolbi-ai-panel" v-model:open="open" … />
 */
interface Props {
  /** The name a reader hears: the disc shows only the sign. */
  label?: string
  /**
   * Shown on hover and focus — these words and nothing else. The shortcut is
   * declared to assistive tech (`aria-keyshortcuts`), not written here.
   */
  tooltip?: string
  /** The panel's `id`, so the button says what it opens. */
  controls?: string
  /** Listen for ⌘J / Ctrl+J while the launcher is on the page. */
  shortcut?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Tolbi AI',
  tooltip: 'Interroger Tolbi xAI',
  controls: undefined,
  shortcut: true,
})

const open = defineModel<boolean>('open', { default: false })

const button = ref<HTMLButtonElement>()
const spark = ref<InstanceType<typeof TolbiAiSpark>>()

/* ── The shortcut ─────────────────────────────────────────────────────── */
const apple = ref(false)
const ariaKeys = computed(() => (apple.value ? 'Meta+J' : 'Control+J'))

function onKey(event: KeyboardEvent) {
  const modifier = apple.value ? event.metaKey : event.ctrlKey
  if (!modifier || event.shiftKey || event.altKey || event.key.toLowerCase() !== 'j') return
  event.preventDefault()
  open.value = !open.value
}

onMounted(() => {
  apple.value = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  if (props.shortcut) window.addEventListener('keydown', onKey)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
})

/*
  Closing from inside the panel — its own close button, Escape in a field —
  leaves the focus on something about to be hidden. It comes back here, to the
  control that opens it again, once the launcher is back on the page.
*/
let handingBack = false

watch(open, (now, was) => {
  if (now || !was) return
  const panel = props.controls ? document.getElementById(props.controls) : null
  const active = document.activeElement
  if (!active || active === document.body || panel?.contains(active)) {
    void nextTick(() => {
      handingBack = true
      button.value?.focus({ preventScroll: true })
      handingBack = false
    })
  }
})

/* ── Saying what it does: after a beat, on hover or a keyboard focus ──── */
const { shown: tip, soon: tipSoon, away: tipAway } = useDelayedTooltip()

function toggle() {
  tipAway()
  open.value = !open.value
}

/*
  The sign turns to meet the pointer — or the keyboard's focus, hover's other
  input (ADR-0044) — with the awakening's turn, alone: one turn, nothing
  dimmed, from rest to rest (ADR-0071). The sign keeps the count: an approach
  during a turn does not restart it. Not when the focus is handed back as the
  panel closes: the disc is arriving then, and one movement is enough.
*/
function onEnter() {
  tipSoon()
  spark.value?.turn()
}

/*
  A focus is an approach only from the keyboard (`:focus-visible`), and never
  when the launcher takes the focus back as the panel closes — from « Fermer »
  or ⌘J, the pointer is elsewhere, and a tooltip 400ms after every close would
  answer a question nobody asked. Hover still says it (ADR-0066).
*/
function onFocus() {
  if (handingBack || !button.value?.matches(':focus-visible')) return
  tipSoon()
  spark.value?.turn()
}
</script>

<template>
  <SurfaceTransition>
    <div v-show="!open" class="ds-tolbi-ai-launcher">
      <button
        ref="button"
        type="button"
        class="ds-tolbi-ai-launcher__button"
        :aria-label="label"
        :aria-expanded="open"
        :aria-controls="controls"
        :aria-keyshortcuts="shortcut ? ariaKeys : undefined"
        @click="toggle"
        @pointerenter="onEnter"
        @pointerleave="tipAway"
        @focus="onFocus"
        @blur="tipAway"
      >
        <TolbiAiSpark ref="spark" :size="32" :aria-label="null" />
      </button>
      <SurfaceTransition>
        <Tooltip
          v-if="tip"
          class="ds-tolbi-ai-launcher__tip"
          :title="tooltip"
          arrow="right"
          role="presentation"
        />
      </SurfaceTransition>
    </div>
  </SurfaceTransition>
</template>

<style scoped>
/*
  Where Figma puts it: over the page's bottom-right corner, 40px in. The
  corner is the page's own — 12px in from the screen's right edge, the
  column's margin (ADR-0047), and on the screen's bottom — so the disc stands
  `spacing-5xl` from both of the page's edges, Figma's 54 / 38 to within 2px.
  It floats, so it arrives and leaves as anything that floats does (ADR-0021).
*/
.ds-tolbi-ai-launcher {
  position: fixed;
  right: calc(var(--ds-spacing-lg) + var(--ds-spacing-5xl));
  bottom: var(--ds-spacing-5xl);
  z-index: var(--ds-z-raised);
  display: inline-flex;
  transform-origin: center;
}

/*
  It comes back once the panel has gone: the panel closes over `enter`, and
  the disc would otherwise grow under its closing edge. An arrival waits for
  the place it lands in to be free (ADR-0049).
*/
.ds-tolbi-ai-launcher.ds-surface-enter-active {
  transition-delay: var(--ds-motion-duration-enter);
}

/*
  Figma's disc: the sign at 32, 8px around it, a hairline — 50px, declared in
  `border-box` (ADR-0039) — on `bg-default` with `elevation-control`.
*/
.ds-tolbi-ai-launcher__button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  padding: 0;
  border: var(--ds-border-width-default) solid var(--ds-border-subtlest);
  border-radius: var(--ds-radius-pill);
  background: var(--ds-bg-default);
  box-shadow: var(--ds-elevation-control);
  cursor: pointer;
  outline: none;
  transition:
    border-color var(--ds-motion-duration-moderate) var(--ds-motion-easing-default),
    box-shadow   var(--ds-motion-duration-instant) var(--ds-motion-easing-default);
}

/* On white no tint can say hover (ADR-0044): the contour steps up instead, as
   `IconButton`'s white disc does. */
.ds-tolbi-ai-launcher__button:hover,
.ds-tolbi-ai-launcher__button:focus-visible {
  border-color: var(--ds-border-default);
}

/* The ring joins the disc's own shadow rather than replacing it. */
.ds-tolbi-ai-launcher__button:focus-visible {
  box-shadow: var(--ds-focus-ring-gray-shadow-xs);
}

/* To its left, centred on it: below and to the right is the screen's edge. */
.ds-tolbi-ai-launcher__tip {
  position: absolute;
  top: 50%;
  right: calc(100% + var(--ds-spacing-md));
  translate: 0 -50%;
  white-space: nowrap;
  pointer-events: none;
  transform-origin: right center;
}
</style>
