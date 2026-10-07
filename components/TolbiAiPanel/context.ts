import type { InjectionKey, Ref } from 'vue'

/** What the panel tells what it holds. */
export interface TolbiAiPanelContext {
  open: Ref<boolean>
  expanded: Ref<boolean>
}

export const TOLBI_AI_PANEL: InjectionKey<TolbiAiPanelContext> = Symbol('TolbiAiPanel')
