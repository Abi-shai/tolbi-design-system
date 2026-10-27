import type { InjectionKey } from 'vue'

/** A choice in a hierarchy — a chapter, a heading, a subheading. */
export interface OptionTreeNode {
  value: string | number
  label: string
  /** The code before the label, in a `Tag` — « 18 », « 1803 », « 1806 10 ». */
  code?: string
  children?: OptionTreeNode[]
  /** Seen, not chosen. */
  disabled?: boolean
}

/** A run of the label, found by the search (`hit`) or not. */
export interface OptionTreeSegment {
  text: string
  hit: boolean
}

/** What the tree hands its rows — internal, one owner of the state. */
export interface OptionTreeContext {
  isVisible: (node: OptionTreeNode) => boolean
  isOpen: (node: OptionTreeNode) => boolean
  isSelected: (node: OptionTreeNode) => boolean
  isTabbable: (node: OptionTreeNode) => boolean
  toggle: (node: OptionTreeNode) => void
  select: (node: OptionTreeNode) => void
  segments: (label: string) => OptionTreeSegment[]
  register: (node: OptionTreeNode, el: HTMLElement | null) => void
}

export const OPTION_TREE_KEY: InjectionKey<OptionTreeContext> = Symbol('ds-option-tree')

export const keyOf = (value: string | number) => String(value)
