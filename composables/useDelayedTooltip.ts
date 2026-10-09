import { onBeforeUnmount, ref, type Ref } from 'vue'

/**
 * How long a control waits before its tooltip says what it does (ADR-0066).
 * One value for every control that names itself this way, so they all answer
 * at the same pace — it had been written out four times.
 */
export const TOOLTIP_DELAY = 400

/**
 * A control's tooltip: shown `TOOLTIP_DELAY` after the pointer or the
 * keyboard's focus arrives, gone the moment either leaves — and when the
 * control is pressed, since the press has answered what the tooltip would
 * have said. `key` says which of several controls the tooltip belongs to;
 * with one, it is `true`.
 *
 * `soon` is the pointer's (`pointerenter`), `soonOnFocus` the focus's
 * (`focusin`): a focus asks for the tooltip only when it is `:focus-visible`,
 * a keyboard's. A focus that follows a pointer — a click, or one handed back
 * after a dialog dismissed with the mouse — is not, and the tooltip stayed
 * open over what the pointer had left (ADR-0073, the launcher's rule made
 * the catalogue's). After Escape, a key, the focus handed back is visible,
 * and the tooltip comes.
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

  function soonOnFocus(event: FocusEvent, key: K = true as K) {
    const target = event.target as Element | null
    if (target?.matches?.(':focus-visible')) soon(key)
  }

  function away() {
    clearTimeout(timer)
    shown.value = null
  }

  onBeforeUnmount(() => clearTimeout(timer))
  return { shown, soon, soonOnFocus, away }
}
