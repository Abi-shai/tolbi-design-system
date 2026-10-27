import type { ComputedRef, InjectionKey } from 'vue'

export type AccordionValue = string | number

/** What an `Accordion` hands its items — internal. */
export interface AccordionContext {
  isOpen: (value: AccordionValue) => boolean
  toggle: (value: AccordionValue) => void
  open: (value: AccordionValue) => void
  headingLevel: ComputedRef<AccordionHeadingLevel>
}

export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6

export const ACCORDION_KEY: InjectionKey<AccordionContext> = Symbol('ds-accordion')
