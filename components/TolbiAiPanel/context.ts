import type { InjectionKey, Ref } from 'vue'

/** What the panel tells what it holds. */
export interface TolbiAiPanelContext {
  open: Ref<boolean>
  expanded: Ref<boolean>
}

export const TOLBI_AI_PANEL: InjectionKey<TolbiAiPanelContext> = Symbol('TolbiAiPanel')

/**
 * What the thread tells what it holds: `settled` turns true once the thread has
 * mounted, so a child mounted after it is an arrival and one mounted with it
 * was already there — a reopened conversation does not replay (ADR-0062, 0068).
 */
export interface TolbiAiThreadContext {
  settled: Ref<boolean>
}

export const TOLBI_AI_THREAD: InjectionKey<TolbiAiThreadContext> = Symbol('TolbiAiThread')
