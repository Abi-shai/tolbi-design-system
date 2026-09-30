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
   *
   * `label` is a getter rather than a string so a renamed item renames the
   * panel it titles (ADR-0046) — the list reads it when it needs it, never a
   * copy taken at mount.
   */
  register(value: string, el: HTMLElement, label?: () => string | undefined): number
  /** Removes an item on unmount, so indices stay in step with the DOM. */
  unregister(value: string): void
  select(value: string): void
  isSelected(value: string): boolean
  /** Icon-only rail. The group owns it, like the selection and the ground. */
  collapsed: Ref<boolean>
  /**
   * What `aria-current` says on the selected item. `page` for a destination;
   * `true` for a rail item once a panel holds the destinations — the section
   * is the current one *of a set*, and the page is in the panel (ADR-0046).
   */
  current: Ref<'page' | 'true'>
}

export const SIDE_NAVIGATION_KEY: InjectionKey<SideNavigationContext> =
  Symbol('ds-side-navigation')
