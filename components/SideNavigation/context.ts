import type { InjectionKey, Ref } from 'vue'

export interface SideNavigationContext {
  /**
   * Registers an item and returns its index. Idempotent: a value that is
   * already registered keeps its slot, so a remount (v-if, reorder, hot
   * reload) does not grow the list and shift every index after it.
   *
   * The element registered is the item's **wrapper**, not its button. The
   * wrapper is what the indicator measures, and the button cannot be: it
   * anchors the collapsed tooltip, so it is `position: relative`, which would
   * make its own `offsetTop` read 0.
   */
  register(value: string, el: HTMLElement): number
  /** Removes an item on unmount, so indices stay in step with the DOM. */
  unregister(value: string): void
  select(value: string): void
  isSelected(value: string): boolean
  /** Icon-only rail. The group owns it, like the selection and the ground. */
  collapsed: Ref<boolean>
}

export const SIDE_NAVIGATION_KEY: InjectionKey<SideNavigationContext> =
  Symbol('ds-side-navigation')
