import { computed, shallowRef } from 'vue'

/**
 * The modal dialogs open right now, the last opened on top (ADR-0077, item 25).
 *
 * A modal `<dialog>` is in the top layer and makes everything outside it
 * inert. A toast region outside it is painted under it — an error toast while
 * a side panel is open could not be seen — and, even raised into the top layer
 * as a popover, it would stay inert: its « Annuler » would not answer. So the
 * region goes **inside** the topmost modal dialog while one is open: above its
 * scrim, alive, and back where it was when the dialog closes. `Dialog` keeps
 * the stack; `ToastRegion` reads its top.
 */
const stack = shallowRef<HTMLDialogElement[]>([])

export function pushModal(el: HTMLDialogElement) {
  if (!stack.value.includes(el)) stack.value = [...stack.value, el]
}

export function removeModal(el: HTMLDialogElement) {
  stack.value = stack.value.filter(e => e !== el)
}

export const topModal = computed(() => stack.value[stack.value.length - 1] ?? null)
