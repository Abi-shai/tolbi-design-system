import { onBeforeUnmount, ref, type Ref } from 'vue'

/**
 * How long a control waits before its tooltip says what it does (ADR-0066).
 * One value for every control that names itself this way, so they all answer
 * at the same pace — it had been written out four times.
 */
export const TOOLTIP_DELAY = 400

/**
 * A control's tooltip: shown `TOOLTIP_DELAY` after the pointer or the focus
 * arrives, gone the moment either leaves — and when the control is pressed,
 * since the press has answered what the tooltip would have said. `key` says
 * which of several controls the tooltip belongs to; with one, it is `true`.
 *
 * Internal, like `useSlidingIndicator`: the delay is the catalogue's, not a
 * consumer's to choose.
 */
export function useDelayedTooltip<K extends string | boolean = boolean>() {
  const shown = ref(null) as Ref<K | null>
  let timer: ReturnType<typeof setTimeout> | undefined

  function soon(key: K = true as K) {
    clearTimeout(timer)
    timer = setTimeout(() => (shown.value = key), TOOLTIP_DELAY)
  }

  function away() {
    clearTimeout(timer)
    shown.value = null
  }

  onBeforeUnmount(() => clearTimeout(timer))
  return { shown, soon, away }
}
