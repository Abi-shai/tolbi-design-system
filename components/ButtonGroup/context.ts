import type { InjectionKey, Ref } from 'vue'

/** `md` 42px, `sm` 38px — the rail stands as tall as the fields beside it. */
export type ButtonGroupSize = 'sm' | 'md'

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
  /** The group's size — the segments read it, so it is said once. */
  size: Readonly<Ref<ButtonGroupSize>>
}

export const BUTTON_GROUP_KEY: InjectionKey<ButtonGroupContext> = Symbol('ds-button-group')
