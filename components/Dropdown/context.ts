import type { InjectionKey } from 'vue'

/**
 * How big a menu's rows are (ADR-0101). `md` is the catalogue's menu — 40px
 * rows in `label-lg`; `sm` is a menu opened from a small control — 34px rows in
 * `label-md`, at the size of a 12px chip or an `sm` button. The panel declares
 * it once and its rows read it, so a menu is never two sizes.
 */
export type DropdownSize = 'sm' | 'md'

export const DROPDOWN_SIZE_KEY: InjectionKey<() => DropdownSize> = Symbol('ds-dropdown-size')
