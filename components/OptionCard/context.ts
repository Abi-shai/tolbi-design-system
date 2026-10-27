import type { ComputedRef, InjectionKey } from 'vue'

export type OptionValue = string | number

/** What an `OptionList` hands its cards — internal. */
export interface OptionListContext {
  /** The radios' shared `name`, so the browser makes them one group. */
  name: string
  multiple: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
  isChecked: (value: OptionValue) => boolean
  toggle: (value: OptionValue) => void
}

export const OPTION_LIST_KEY: InjectionKey<OptionListContext> = Symbol('ds-option-list')
