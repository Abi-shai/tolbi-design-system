import { ref, watch, onBeforeUnmount, type Ref } from 'vue'

/**
 * A surface that floats from a trigger — a menu, a select's list — and is
 * never clipped, scrolled or pushed by what contains it (ADR-0078).
 *
 * It used to be `position: absolute` under its trigger, in the flow of every
 * ancestor: inside anything that scrolls — a side panel's body, a dialog, a
 * filter bar with `overflow` — opening it at the bottom *grew the scroll*, and
 * the options were below the fold of the very box they belonged to.
 *
 * So the surface goes to the **top layer** (`popover="manual"`, shown here),
 * the layer a modal dialog already lives in: above every overflow, transform
 * and z-index, with no z-index of its own. It stays where it is in the DOM —
 * the click outside, the focus order, Escape and the consumer's `:deep()`
 * rules all work as before; only where it is *painted* changes. And since it
 * is painted relative to the viewport, its place is **computed** from the
 * anchor's rectangle, and re-computed while anything scrolls or resizes.
 *
 * - It opens **below**, and **flips above** when the room below is short and
 *   the room above is larger. Where neither side holds it, it takes the larger
 *   and is capped to it: `--anchor-room` is the height it has there, which the
 *   surface reads as its `max-height` — its list scrolls, the screen does not.
 * - The gap is the surface's own `margin-block`, so it stays in CSS, on a
 *   token: the surface is placed by its margin box, with `top` below and
 *   `bottom` above, and the margin says how far.
 * - `align` lines it up with the anchor's start or end edge, kept inside the
 *   viewport. `matchWidth` gives it the anchor's width — a select's list.
 * - `--anchor-width` carries the anchor's width to the consumer's CSS, for a
 *   floor (`min-width: var(--anchor-width)`) — `100%` meant the anchor while
 *   the surface sat inside it; in the top layer it would mean the screen.
 * - `transform-origin` follows the side it opened on, so an entrance scales
 *   from the corner under the trigger (ADR-0021) whichever way it flipped.
 * - `side` is where it opens first: `below` (a menu, the default), `above`
 *   (a tooltip), or beside — `left` / `right`, the gap then being its
 *   `margin-inline`. Each flips to its opposite when it is short there and
 *   the opposite has more room; `placed` says where it went, for an arrow.
 *   `center` aligns it on the anchor's middle (ADR-0082).
 */
export type AnchorAlign = 'start' | 'end' | 'center'
export type AnchorSide = 'below' | 'above' | 'left' | 'right'

export interface AnchoredSurfaceOptions {
  align: () => AnchorAlign
  matchWidth?: boolean
  side?: () => AnchorSide
}

const OPPOSITE: Record<AnchorSide, AnchorSide> = { below: 'above', above: 'below', left: 'right', right: 'left' }

export function useAnchoredSurface(
  anchor: Ref<HTMLElement | null | undefined>,
  surface: Ref<HTMLElement | null | undefined>,
  options: AnchoredSurfaceOptions,
) {
  let frame = 0
  let observer: ResizeObserver | null = null
  const placed = ref<AnchorSide>(options.side?.() ?? 'below')

  function place() {
    frame = 0
    const el = surface.value
    const at = anchor.value
    if (!el || !at) return
    const a = at.getBoundingClientRect()
    const viewport = document.documentElement
    const vw = viewport.clientWidth
    const vh = viewport.clientHeight
    const style = getComputedStyle(el)
    const wanted = options.side?.() ?? 'below'

    if (wanted === 'left' || wanted === 'right') {
      placeBeside(el, a, style, wanted, vw, vh)
      return
    }

    const gap = parseFloat(style.marginTop) || 0

    el.style.setProperty('--anchor-width', `${a.width}px`)
    if (options.matchWidth) el.style.width = `${a.width}px`

    /* Measured uncapped, or the last cap would decide the next flip. The gap
       is kept on both sides: from the anchor, and from the screen's edge. */
    el.style.removeProperty('--anchor-room')
    const height = el.offsetHeight + gap * 2
    const below = vh - a.bottom
    const above = a.top
    const flip = wanted === 'above'
      ? !(above < height && below > above)
      : below < height && above > below
    placed.value = flip ? 'above' : 'below'
    /* `max-height` excludes the border and padding in a content box. */
    const chrome = style.boxSizing === 'border-box' ? 0
      : [style.borderTopWidth, style.borderBottomWidth, style.paddingTop, style.paddingBottom]
        .reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
    el.style.setProperty('--anchor-room', `${Math.max(0, (flip ? above : below) - gap * 2 - chrome)}px`)

    const width = el.offsetWidth
    const align = options.align()
    const x = align === 'end' ? a.right - width : align === 'center' ? a.left + (a.width - width) / 2 : a.left
    const left = Math.min(Math.max(x, gap), Math.max(gap, vw - width - gap))

    el.style.left = `${left}px`
    if (flip) {
      el.style.top = 'auto'
      el.style.bottom = `${vh - a.top}px`
    } else {
      el.style.bottom = 'auto'
      el.style.top = `${a.bottom}px`
    }
    el.style.transformOrigin = `${flip ? 'bottom' : 'top'} ${align === 'end' ? 'right' : align === 'center' ? 'center' : 'left'}`
  }

  /* Beside the anchor, centred on its middle and kept on the screen; the gap
     is the surface's `margin-inline`. */
  function placeBeside(el: HTMLElement, a: DOMRect, style: CSSStyleDeclaration, wanted: AnchorSide, vw: number, vh: number) {
    const gap = parseFloat(style.marginLeft) || 0
    const width = el.offsetWidth + gap * 2
    const room = { left: a.left, right: vw - a.right }
    const other = OPPOSITE[wanted] as 'left' | 'right'
    const side = room[wanted as 'left' | 'right'] < width && room[other] > room[wanted as 'left' | 'right'] ? other : wanted
    placed.value = side

    const height = el.offsetHeight
    const y = a.top + (a.height - height) / 2
    el.style.top = `${Math.min(Math.max(y, 0), Math.max(0, vh - height))}px`
    el.style.bottom = 'auto'
    if (side === 'right') {
      el.style.right = 'auto'
      el.style.left = `${a.right}px`
    } else {
      el.style.left = 'auto'
      el.style.right = `${vw - a.left}px`
    }
    el.style.transformOrigin = `${side === 'right' ? 'left' : 'right'} center`
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(place)
  }

  function start(el: HTMLElement) {
    /* Unsupported, the attribute is inert and the surface stays a fixed box
       at `z-popover` — placed the same way, only not above everything. */
    if (typeof el.showPopover === 'function' && !el.matches(':popover-open')) el.showPopover()
    place()
    window.addEventListener('scroll', schedule, { capture: true, passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    observer = new ResizeObserver(schedule)
    observer.observe(el)
    if (anchor.value) observer.observe(anchor.value)
  }

  function stop() {
    window.removeEventListener('scroll', schedule, { capture: true })
    window.removeEventListener('resize', schedule)
    observer?.disconnect()
    observer = null
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  /* The element ref is the lifecycle: it appears when the surface mounts and
     goes when its exit has played and it leaves the DOM — the browser takes it
     out of the top layer then, and placing stops with it. `post`, so it is
     shown before the first frame of its entrance. */
  watch(surface, (el, was) => {
    if (was) stop()
    if (el) start(el)
  }, { flush: 'post' })

  onBeforeUnmount(stop)

  return { place, placed }
}
