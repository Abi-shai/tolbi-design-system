import type { InjectionKey, Ref } from 'vue'

/** What the panel tells what it holds — today, only whether it is expanded. */
export interface TolbiAiPanelContext {
  expanded: Ref<boolean>
}

export const TOLBI_AI_PANEL: InjectionKey<TolbiAiPanelContext> = Symbol('TolbiAiPanel')
