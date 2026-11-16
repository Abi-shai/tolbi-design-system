import { computed, onMounted, ref, watch, type Ref } from 'vue'

export interface MapPointerAt {
  x: number
  y: number
}

/**
 * Where a bubble stands beside the pointer (ADR-0190): `spacing-xl` to its
 * right, centred on it vertically, in the map's own pixels (the engine's
 * `event.point`, read in the nearest positioned ancestor — `MapCanvas`). It
 * goes to the **left** when the right would run past the map's edge and the
 * left has the room, and comes back when the right has it again. Measured,
 * not guessed: the gap is read off the rendered box, so it is the token's.
 *
 * Internal; `MapHoverCard` and `MapTooltip` take `at` and call it.
 */
export function usePointerPlace(root: Ref<HTMLElement | null>, at: () => MapPointerAt | undefined) {
  const flipped = ref(false)

  function measure() {
    const el = root.value
    const p = at()
    const host = el?.offsetParent as HTMLElement | null
    if (!el || !p || !host) return
    const box = el.getBoundingClientRect()
    const area = host.getBoundingClientRect()
    const anchor = area.left + host.clientLeft + p.x
    // The gap as rendered: from the pointer to the near edge, on whichever side it stands.
    const gap = flipped.value ? anchor - box.right : box.left - anchor
    const fitsRight = anchor + gap + box.width <= area.right
    const fitsLeft = anchor - gap - box.width >= area.left
    if (!flipped.value && !fitsRight && fitsLeft) flipped.value = true
    else if (flipped.value && fitsRight) flipped.value = false
  }
  watch(
    () => {
      const p = at()
      return p ? `${p.x},${p.y}` : ''
    },
    measure,
    { flush: 'post' },
  )
  onMounted(measure)

  return computed(() => {
    const p = at()
    if (!p) return undefined
    return {
      position: 'absolute' as const,
      left: `${p.x}px`,
      top: `${p.y}px`,
      zIndex: 2,
      transform: flipped.value
        ? 'translate(calc(-100% - var(--ds-spacing-xl)), -50%)'
        : 'translate(var(--ds-spacing-xl), -50%)',
    }
  })
}
