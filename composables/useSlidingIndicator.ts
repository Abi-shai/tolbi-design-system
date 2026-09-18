import { ref, watch, onMounted, onBeforeUnmount, nextTick, type Ref } from 'vue'

/**
 * The mechanics behind a selection that *moves* rather than cross-fades: an
 * absolutely-positioned element that measures the active child and slides to it.
 *
 * ADR-0024. Extracted from `Tabs`, which had it inline, so `ButtonGroup` could
 * have the same motion instead of a second copy.
 *
 * It carries **both axes in the transform**. The first two consumers were
 * horizontal rows, so the vertical offset never moved and shipped as a static
 * `top` — which meant a vertical consumer would have *jumped*, because `top`
 * is not what the transition list animates. `SideNavigation` is that consumer.
 * A horizontal row has `offsetTop` constant, so `translate(x, 0)` is exactly
 * what `translateX(x)` was: the change is free for Tabs and ButtonGroup.
 *
 * Which axis actually animates is the consumer's CSS, not this composable's:
 * a row transitions `transform, width`, a column `transform, height`.
 *
 * Two details that are easy to get wrong and are the reason this is shared:
 *
 * - The transition is withheld until after the first paint (`ready`). Without
 *   that the indicator flies in from `translateX(0)` on mount.
 * - A `ResizeObserver` re-measures, because the active child's geometry changes
 *   when the container reflows — a label wrapping, a font loading — and a stale
 *   indicator is worse than none.
 */
export interface SlidingIndicatorStyle {
  transform: string
  width: string
  height: string
}

export function useSlidingIndicator(activeIndex: Ref<number>) {
  const containerRef = ref<HTMLElement>()
  const itemRefs = ref<HTMLElement[]>([])
  const style = ref<SlidingIndicatorStyle>({
    transform: 'translate(0px, 0px)', width: '0px', height: '0px',
  })
  /** False until the first paint, so the indicator does not fly in on mount. */
  const ready = ref(false)

  function measure() {
    const el = itemRefs.value[activeIndex.value]
    if (!el) return
    style.value = {
      transform: `translate(${el.offsetLeft}px, ${el.offsetTop}px)`,
      width:     `${el.offsetWidth}px`,
      height:    `${el.offsetHeight}px`,
    }
  }

  let ro: ResizeObserver | null = null

  onMounted(async () => {
    await nextTick()
    measure()
    requestAnimationFrame(() => { ready.value = true })
    ro = new ResizeObserver(() => measure())
    if (containerRef.value) ro.observe(containerRef.value)
  })

  onBeforeUnmount(() => { ro?.disconnect(); ro = null })

  watch(activeIndex, async () => { await nextTick(); measure() })

  return { containerRef, itemRefs, style, ready, measure }
}
