import type { InjectionKey } from 'vue'

export interface ButtonGroupContext {
  /** Registers an item in DOM order and returns its index. */
  register(value: string, el: HTMLElement): number
  select(value: string): void
  isSelected(value: string): boolean
}

export const BUTTON_GROUP_KEY: InjectionKey<ButtonGroupContext> = Symbol('ds-button-group')
