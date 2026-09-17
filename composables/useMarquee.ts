import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
// The ONE legitimate import of the JS token export from inside the library, and
// the reason ADR-0019 gives for that platform existing: "a computation". A ramp
// running in requestAnimationFrame needs the curve evaluated at t, and there is
// no `var()` that does that — so this is not a second source of truth, it is the
// only one. `no-token-js-import` forbids importing resolved VALUES, which a
// component could and should read from the cascade instead.
import { easing } from '../tokens/dist/index.js'

/**
 * A row that scrolls continuously and never arrives — the banner's second
 * movement, extracted from the product's dashboard.
 *
 * A marquee is **not** a transition, and the motion duration scale does not
 * describe it: `instant` … `ambient` name discrete changes of state. Only the
 * two moments where this one changes state borrow from the scale — starting up
 * and stopping under the pointer.
 *
 * ## The list must be doubled
 *
 * The caller renders its items **twice**, identically. The loop wraps by
 * subtracting half the content width, so the two halves have to be
 * interchangeable or the seam jumps.
 *
 * ## Three details that are easy to re-learn
 *
 * **Speed is per second, not per frame.** The product's first version added 2px
 * on every `requestAnimationFrame`, so a 120Hz screen ran at twice the speed of
 * a 60Hz one: the rhythm was not a setting, it was the hardware. Everything here
 * is px/s multiplied by real elapsed time.
 *
 * **Elapsed time is capped.** A backgrounded tab stops firing frames; without a
 * ceiling the first frame back applies the whole gap at once and the row jumps
 * half a cycle. 50ms is the cap — three frames at 60Hz.
 *
 * **The wrap subtracts, it does not reset.** `position -= half` rather than
 * `position = 0`, because the position is fractional and dropping the remainder
 * is a visible stutter once per lap.
 *
 * The ramp runs on the real `easing-default` curve rather than a hand-written
 * approximation. The product's version used an easeOutQuart in its place,
 * believing it was the same: it is 25 percentage points off at t=0.1 (0.344
 * against 0.094), because the house curve holds back at the start and that one
 * does not.
 */
export interface MarqueeOptions {
  /**
   * Cruise speed in px/s. 60 keeps a capsule fully readable for about 1.7s in a
   * 1440px window and takes 22s to cross it — long enough to read ten values.
   */
  speed?: number
  /**
   * Ramp up and down, in ms. Defaults to `--ds-motion-duration-considered`
   * (400ms): a row that stops dead under the pointer reads as a bug, not as a
   * courtesy.
   */
  ramp?: number
}

const CAP_SECONDS = 0.05

export function useMarquee(options: MarqueeOptions = {}) {
  const { speed: cruise = 60, ramp = 400 } = options

  const container: Ref<HTMLElement | undefined> = ref()
  const content: Ref<HTMLElement | undefined> = ref()

  const isHovered = ref(false)
  const isDragging = ref(false)
  const reducedMotion = ref(false)

  /** Nought under the pointer, mid-drag, or when the system asks for less motion. */
  const targetSpeed = computed(() =>
    reducedMotion.value || isHovered.value || isDragging.value ? 0 : cruise,
  )

  let position = 0
  let speed = 0
  let rampFrom = 0
  let rampStart = 0
  let lastFrame = 0
  let frame = 0
  let dragOrigin = 0
  let dragFrom = 0

  const apply = () => {
    if (content.value) content.value.style.transform = `translateX(-${position}px)`
  }

  const wrap = () => {
    const half = (content.value?.scrollWidth ?? 0) / 2
    if (half <= 0) return
    // Subtract rather than reset — the position is fractional.
    if (position >= half) position -= half
    else if (position < 0) position += half
  }

  const tick = (now: number) => {
    const elapsed = lastFrame ? Math.min((now - lastFrame) / 1000, CAP_SECONDS) : 0
    lastFrame = now

    const progress = ramp > 0 ? Math.min((now - rampStart) / ramp, 1) : 1
    speed = rampFrom + (targetSpeed.value - rampFrom) * easing.default(progress)

    // While dragging the pointer owns the position.
    if (content.value && speed > 0 && !isDragging.value) {
      position += speed * elapsed
      wrap()
      apply()
    }

    // Keep going while there is speed left to spend: that is what lets a stop
    // finish rather than be cut off.
    if (speed > 0.05 || targetSpeed.value > 0) {
      frame = requestAnimationFrame(tick)
    } else {
      speed = 0
      lastFrame = 0
      frame = 0
    }
  }

  /** Re-aim at the current target, starting from the speed actually being run. */
  const retarget = () => {
    rampFrom = speed
    rampStart = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (!frame) {
      lastFrame = 0
      frame = requestAnimationFrame(tick)
    }
  }

  watch(targetSpeed, retarget)

  const pause = () => { isHovered.value = true }
  const resume = () => {
    if (isDragging.value) endDrag()
    isHovered.value = false
  }

  const startDrag = (event: PointerEvent | MouseEvent) => {
    isDragging.value = true
    dragOrigin = event.pageX
    dragFrom = position
  }

  const drag = (event: PointerEvent | MouseEvent) => {
    if (!isDragging.value) return
    position = dragFrom - (event.pageX - dragOrigin)
    wrap()
    apply()
  }

  const endDrag = () => { isDragging.value = false }

  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedMotion.value = query.matches
    const onChange = (e: MediaQueryListEvent) => { reducedMotion.value = e.matches }
    query.addEventListener('change', onChange)
    onUnmounted(() => query.removeEventListener('change', onChange))
    retarget()
  })

  onUnmounted(() => {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  })

  return {
    /**
     * True when the system asks for less motion. The loop is stopped then, so a
     * caller that clips its content MUST make it reachable some other way —
     * otherwise asking for less motion costs you the content past the fold.
     */
    reducedMotion,
    /** Put on the clipping element — it takes the pointer handlers. */
    container,
    /** Put on the element holding the doubled list. Its transform is written every frame. */
    content,
    isDragging,
    pause,
    resume,
    startDrag,
    drag,
    endDrag,
  }
}
