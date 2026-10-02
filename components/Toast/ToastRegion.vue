<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * Where toasts live: a fixed corner of the screen, a stack, and **the motion** —
 * a toast rises from the edge with the stack, leaves faster than it came, and
 * the others make room or close the gap instead of jumping (ADR-0052). The product
 * renders its toasts inside and removes one on `dismiss`; the region does the
 * rest, so every product gets the same behaviour from the same two components.
 *
 *     <ToastRegion>
 *       <Toast v-for="t in toasts" :key="t.id" v-bind="t" @dismiss="remove(t.id)" />
 *     </ToastRegion>
 */
export type ToastRegionPlacement = 'bottom-right' | 'bottom-center' | 'top-center'

interface Props {
  /**
   * Bottom right by default: where etolbi's toasts already are, and the corner
   * most of the benchmarked dashboards use. The newest toast sits nearest the
   * edge it comes from.
   */
  placement?: ToastRegionPlacement
  /** The landmark's name. */
  label?:     string
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom-right',
  label:     'Notifications',
})

const fromBottom = computed(() => props.placement.startsWith('bottom'))
const centred    = computed(() => props.placement.endsWith('center'))

const region = ref<HTMLElement>()
const stack  = () => region.value?.firstElementChild as HTMLElement | null | undefined

/*
  **A running transition outlives its class.** The stack's moves are FLIP: the
  group reads every toast's position, updates, reads them again and translates
  each one back by the difference. When an update lands while a move is still
  running — a toast pushed while another closes, two timing out 50ms apart —
  the group ends that move by removing its class, but the transition keeps
  running: `transition-property` falls back to its initial `all`, which still
  matches. So the second reading includes the old offset, the difference does
  not, and the toast snapped by everything it had left to travel — filmed, 54px
  down onto the one still fading.

  So before the group reads again, every toast that is not leaving has its
  transform transition cancelled (its opacity keeps fading): the second reading
  is the layout, the difference is the whole distance, and the stack travels on
  from where it is seen. Called from the hooks that run inside the update —
  after the first reading, before the second.
*/
const staying = () => [...(stack()?.children ?? [])].filter(t => !t.classList.contains('ds-toast-leave-active')) as HTMLElement[]

function settle() {
  const toasts = staying()
  for (const t of toasts) t.style.transitionProperty = 'opacity'
  void stack()?.offsetHeight
  for (const t of toasts) t.style.transitionProperty = ''
}

/*
  A newcomer starts one height and one gap beyond the toast nearest the edge —
  where that toast is **seen**. Pushed while the previous one still rises, it
  would otherwise start where that one *will* be and the two crossed, filmed at
  35px. The lag is that toast's remaining travel, read before it is settled;
  a toast that has not started yet (pushed in the same update) has none.
*/
function arrive(el: Element) {
  const toasts = staying()
  const edge = toasts[toasts.length - 1]
  const lag = edge && !edge.classList.contains('ds-toast-enter-from')
    ? new DOMMatrixReadOnly(getComputedStyle(edge).transform).m42
    : 0
  ;(el as HTMLElement).style.setProperty('--toast-lag', `${lag}px`)
  settle()
}

/*
  The leaving toast is taken out of the flow (`position: absolute` in its leave
  class) so the stack can close behind it while it fades — and it is **pinned
  where it is seen**, by the edges that do not move: the bottom (or top) the
  stack is anchored by, and the side (or the centre) its toasts align to.
  Pinned by `top` in a bottom-anchored stack, the leaver would drop by its own
  height the moment the stack shrank. *Seen*, not laid out: a toast dismissed
  while it still travels stays where it is, and its travel is cancelled.

  Its width is the **used** width, fractions included. `offsetWidth` rounds: at
  328 for a 328.28px toast the action no longer fitted on the line, the leaver
  grew 20px taller and its top rose while it faded.
*/
function pin(el: Element) {
  const toast = el as HTMLElement
  const box = stack()
  if (!box) return
  const seen  = toast.getBoundingClientRect()
  const frame = box.getBoundingClientRect()
  const width = parseFloat(getComputedStyle(toast).width)
  settle()
  closing(+1)
  toast.style.width = `${width}px`
  if (centred.value) {
    toast.style.left = '50%'
    toast.style.marginLeft = `${-width / 2}px`
  } else {
    toast.style.right = '0px'
  }
  if (fromBottom.value) toast.style.bottom = `${frame.bottom - seen.bottom}px`
  else toast.style.top = `${seen.top - frame.top}px`
}

/*
  **What leaves, leaves first; then the stack closes.** While a toast fades, the
  others wait one `exit` before they travel into its place — at the same time,
  the one above slid over the one still fading, by up to 31px (filmed at a tenth
  of the speed).
  A toast pushed during that wait waits too, so it still rises with the stack.

  The flag is set on the element itself, synchronously, from the leave hook. A
  class binding would re-render the group mid-update, and the group measures
  its children's old positions in its render: the second measure would read the
  new layout as the old one, and nothing would move.
*/
let leaving = 0
function closing(delta: number) {
  leaving = Math.max(0, leaving + delta)
  stack()?.classList.toggle('ds-toast-region__stack--closing', leaving > 0)
}

const gone = () => closing(-1)
</script>

<template>
  <section ref="region" class="ds-toast-region" :class="`ds-toast-region--${placement}`" :aria-label="label">
    <TransitionGroup
      name="ds-toast"
      tag="div"
      class="ds-toast-region__stack"
      appear
      @before-enter="arrive"
      @before-leave="pin"
      @after-leave="gone"
      @leave-cancelled="gone"
    >
      <slot />
    </TransitionGroup>
  </section>
</template>

<style scoped>
/*
  The region covers the screen's width so the stack can align its toasts to the
  corner, and lets every click through — only a toast takes the pointer back.
*/
.ds-toast-region {
  position: fixed;
  inset-inline: var(--ds-spacing-xl);
  z-index: var(--ds-z-overlay);
  pointer-events: none;
}

.ds-toast-region--bottom-right,
.ds-toast-region--bottom-center { bottom: var(--ds-spacing-xl); }
.ds-toast-region--top-center    { top: var(--ds-spacing-xl); }

.ds-toast-region__stack {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
  width: 100%;
}

.ds-toast-region--bottom-right .ds-toast-region__stack  { align-items: flex-end; }
.ds-toast-region--bottom-center .ds-toast-region__stack { align-items: center; }

/* From the top, the newest is the first one seen: the stack reads upside down. */
.ds-toast-region--top-center .ds-toast-region__stack {
  flex-direction: column-reverse;
  align-items: center;
}
</style>

<!--
  The motion — deliberately NOT scoped. Vue puts the transition classes on each
  toast's root, which carries `Toast`'s scope id and not this one's, so a scoped
  rule would never match (ADR-0021's silent failure). `ds-toast-` is the
  namespace.
-->
<style>
/*
  The others travel: making room for the newcomer, closing the gap of the one
  that left. `easing-in-out` — its description is "a thing that travels" — on
  `enter`, the duration of the arrival they make room for: one gesture, one
  duration (ADR-0037).
*/
.ds-toast-move {
  transition: transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/* Closing behind a leaver: the stack waits until it has faded. */
.ds-toast-region__stack--closing > .ds-toast-move {
  transition-delay: var(--ds-motion-duration-exit);
}

/*
  Arriving: the newcomer **rises from the edge with the stack**. It starts one
  height and one gap below its place and travels there on the move's own
  duration and curve, so it and the toasts it pushes stay 8px apart the whole
  way, while it fades in. The house entrance (ADR-0021) scaled it in place, and
  filmed, the toast above — still easing out of that place — sat on it for
  110ms, by up to 44px: the place was not free yet (ADR-0049). The travel
  explains where it comes from, which a scale at the corner did not.

  **One class stronger than the move**, and that is load-bearing. A toast can be
  arriving or leaving *and* moved in the same update — the one that leaves is
  always flagged as moved when the stack closes under it — and at equal weight
  the move's `transition: transform` won: the opacity lost its transition and
  the leaver vanished on the first frame, filmed, while an invisible scale ran.
*/
.ds-toast-region__stack > .ds-toast-enter-active {
  transition:
    opacity   var(--ds-motion-duration-enter) var(--ds-motion-easing-out),
    transform var(--ds-motion-duration-enter) var(--ds-motion-easing-in-out);
}

/* Pushed while one is still fading: wait with the stack. */
.ds-toast-region__stack--closing > .ds-toast-enter-active {
  transition-delay: var(--ds-motion-duration-exit);
}

/*
  Leaving: faster than it came, and out of the flow (pinned by `pin`). And out
  of reach: a second click on an « Annuler » that is already fading would undo
  twice. One class heavier than the toast's own `pointer-events: auto`, whose
  order against this sheet is the consumer's import order.
*/
.ds-toast-region__stack > .ds-toast-leave-active {
  position: absolute;
  transition:
    opacity   var(--ds-motion-duration-exit) var(--ds-motion-easing-in),
    transform var(--ds-motion-duration-exit) var(--ds-motion-easing-in);
}

.ds-toast-region__stack > .ds-toast.ds-toast-leave-active {
  pointer-events: none;
}

.ds-toast-enter-from {
  opacity: 0;
  transform: translateY(calc(100% + var(--ds-spacing-md) + var(--toast-lag, 0px)));
}

/* From the top, it comes down. */
.ds-toast-region--top-center .ds-toast-enter-from {
  transform: translateY(calc(-100% - var(--ds-spacing-md) + var(--toast-lag, 0px)));
}

/* Leaving: the house exit — fade and settle to 96%, in place. */
.ds-toast-leave-to {
  opacity: 0;
  transform: scale(var(--ds-motion-scale-enter));
}

.ds-toast-region--bottom-right .ds-toast  { transform-origin: bottom right; }
.ds-toast-region--bottom-center .ds-toast { transform-origin: bottom center; }
.ds-toast-region--top-center .ds-toast    { transform-origin: top center; }

/*
  Nothing travels, nothing scales: the toast is there, then it is not — from
  the first frame, both ways. Vue swaps its classes a frame late, and filmed,
  the leaver still covered the toast that had already jumped into its place.
  The wait goes too: a delay with no movement behind it is only lateness.
*/
@media (prefers-reduced-motion: reduce) {
  .ds-toast-region__stack > .ds-toast-enter-active,
  .ds-toast-region__stack > .ds-toast-leave-active,
  .ds-toast-move {
    transition: none;
  }

  .ds-toast-enter-from,
  .ds-toast-region--top-center .ds-toast-enter-from {
    opacity: 1;
    transform: none;
  }

  .ds-toast-region__stack > .ds-toast-leave-active {
    opacity: 0;
  }

  .ds-toast-region__stack--closing > .ds-toast-move,
  .ds-toast-region__stack--closing > .ds-toast-enter-active {
    transition-delay: 0s;
  }
}
</style>
