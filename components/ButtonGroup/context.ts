import type { InjectionKey } from 'vue'

export interface ButtonGroupContext {
  /**
   * Registers an item and returns its index. Idempotent: a value that is
   * already registered keeps its slot, so a remount (v-if, reorder, hot
   * reload) does not grow the list and shift every index after it.
   */
  register(value: string, el: HTMLElement): number
  /** Removes an item on unmount, so indices stay in step with the DOM. */
  unregister(value: string): void
  select(value: string): void
  isSelected(value: string): boolean
  /** The group's size — the items read it, so a group is never two sizes. */
  size(): ButtonGroupSize
}

/** `md` 32px segments on a 42px rail; `sm` 28px on 38 — a bordered `sm` control's height. */
export type ButtonGroupSize = 'sm' | 'md'

export const BUTTON_GROUP_KEY: InjectionKey<ButtonGroupContext> = Symbol('ds-button-group')
