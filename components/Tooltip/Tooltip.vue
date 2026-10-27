<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, useId, useSlots, watch } from 'vue'
import { SurfaceTransition } from '../SurfaceTransition'
import { useDelayedTooltip } from '../../composables/useDelayedTooltip'
import { useAnchoredSurface, type AnchorAlign, type AnchorSide } from '../../composables/useAnchoredSurface'
import TooltipBubble, { type TooltipArrow } from './TooltipBubble.vue'

/**
 * Where the tooltip opens first — it turns to the opposite side when the
 * screen is short there. `-start` / `-end` line it up with the trigger's edge,
 * for a trigger near the edge of a panel.
 */
export type TooltipPlacement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'right'

/**
 * A tooltip. **With a default slot**, it is anchored (ADR-0082): it wraps its
 * trigger and opens by itself — after the catalogue's 400ms on hover, or on a
 * keyboard's focus (`:focus-visible`, never a focus handed back after a
 * click), gone when the pointer or the focus leaves, when the trigger is
 * pressed, or on Escape. It is painted in the top layer at `placement`, turns
 * when the room is short, and its arrow follows. The delay is not a prop: it
 * is the catalogue's, so every tooltip answers at one pace (ADR-0066).
 *
 * Its text describes the trigger (`aria-describedby`), unless it only repeats
 * the trigger's name — an icon button's tooltip says what `ariaLabel` already
 * says. A **disabled** trigger still shows it: the wrapper takes the pointer a
 * disabled control drops. (A keyboard cannot reach a disabled control — prefer
 * `aria-disabled` when the tooltip says why.)
 *
 * **Without a slot** it is the bubble alone, for a component that places its
 * own (`arrow`).
 */
interface Props {
  title:           string
  supportingText?: string
  /** The bubble alone: where its arrow points. Anchored, the placement decides. */
  arrow?:          TooltipArrow
  placement?:      TooltipPlacement
  /** No tooltip — the trigger is left as it is. */
  disabled?:       boolean
}

const props = withDefaults(defineProps<Props>(), {
  supportingText: undefined,
  arrow: 'none',
  placement: 'top',
  disabled: false,
})

const slots = useSlots()
const anchored = computed(() => Boolean(slots.default))

const anchorEl = ref<HTMLElement | null>(null)
const bubbleEl = ref<HTMLElement | null>(null)
const descriptionId = `ds-tooltip-${useId()}`

const { shown, soon, soonOnFocus, away } = useDelayedTooltip()

const side = computed<AnchorSide>(() => {
  const base = props.placement.split('-')[0]
  return base === 'top' ? 'above' : base === 'bottom' ? 'below' : base as AnchorSide
})
const align = computed<AnchorAlign>(() =>
  props.placement.endsWith('-start') ? 'start' : props.placement.endsWith('-end') ? 'end' : 'center',
)

const { placed } = useAnchoredSurface(anchorEl, bubbleEl, { side: () => side.value, align: () => align.value })

/* The arrow points at the trigger from wherever the bubble went. */
const arrowFor = computed<TooltipArrow>(() => {
  const edge = align.value === 'start' ? 'left' : align.value === 'end' ? 'right' : 'center'
  switch (placed.value) {
    case 'above': return `bottom-${edge}` as TooltipArrow
    case 'below': return `top-${edge}` as TooltipArrow
    case 'left':  return 'right'
    default:      return 'left'
  }
})

const axis = computed(() => (side.value === 'left' || side.value === 'right' ? 'inline' : 'block'))

function enter() {
  if (!props.disabled) soon()
}

function focus(event: FocusEvent) {
  if (!props.disabled) soonOnFocus(event)
}

/* Escape closes the tooltip first, and only it (WCAG 1.4.13): a dialog under
   it hears the next one. */
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || shown.value === null) return
  event.preventDefault()
  away()
}

watch(shown, on => {
  if (on) document.addEventListener('keydown', onKeydown, true)
  else document.removeEventListener('keydown', onKeydown, true)
})

watch(() => props.disabled, off => { if (off) away() })

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown, true))

/* The trigger is described by the text — unless the text is its name already. */
onMounted(() => {
  const trigger = anchorEl.value?.firstElementChild as HTMLElement | null
  if (!trigger) return
  const name = trigger.getAttribute('aria-label') ?? trigger.textContent?.trim()
  if (name === props.title && !props.supportingText) return
  const described = trigger.getAttribute('aria-describedby')
  trigger.setAttribute('aria-describedby', described ? `${described} ${descriptionId}` : descriptionId)
})
</script>

<template>
  <span
    v-if="anchored"
    ref="anchorEl"
    class="ds-tooltip-anchor"
    @pointerenter="enter"
    @pointerleave="away"
    @focusin="focus"
    @focusout="away"
    @pointerdown="away"
  >
    <slot />
    <!-- What the trigger is described by — there before the bubble, and read whether it shows or not. -->
    <span :id="descriptionId" class="ds-tooltip-anchor__description">
      {{ title }}<template v-if="supportingText">. {{ supportingText }}</template>
    </span>
    <SurfaceTransition>
      <div
        v-if="shown !== null"
        ref="bubbleEl"
        popover="manual"
        class="ds-tooltip-anchor__bubble"
        :class="`ds-tooltip-anchor__bubble--${axis}`"
        aria-hidden="true"
      >
        <TooltipBubble :title="title" :supporting-text="supportingText" :arrow="arrowFor" />
      </div>
    </SurfaceTransition>
  </span>
  <TooltipBubble v-else :title="title" :supporting-text="supportingText" :arrow="arrow" />
</template>

<style scoped>
.ds-tooltip-anchor {
  display: inline-flex;
}

/* A disabled control drops the pointer; the wrapper takes it, so the tooltip
   that says why it is disabled still comes. */
.ds-tooltip-anchor > :deep(:is(:disabled, [aria-disabled='true'])) {
  pointer-events: none;
}

/* Visually hidden, still read — never display:none. */
.ds-tooltip-anchor__description {
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

/* In the top layer, placed on the trigger (ADR-0078); the gap is the margin
   on the side it faces — the catalogue's 4px. It is never hovered: it names,
   it holds nothing to reach. */
.ds-tooltip-anchor__bubble {
  position: fixed;
  inset: auto;
  z-index: var(--ds-z-popover);
  max-width: 20rem;
  margin: 0;
  padding: 0;
  overflow: visible;
  border: 0;
  background: none;
  color: inherit;
  pointer-events: none;
}

.ds-tooltip-anchor__bubble--block {
  margin-block: var(--ds-spacing-xs);
}

.ds-tooltip-anchor__bubble--inline {
  margin-inline: var(--ds-spacing-xs);
}
</style>
