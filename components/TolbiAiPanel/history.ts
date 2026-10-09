/**
 * One of the project's conversations with Tolbi AI, as the head's switcher
 * lists it (ADR-0069). The product owns them; the panel only sorts, groups and
 * dates them.
 */
export interface TolbiAiConversation {
  id: string
  /** The first question, as the product titles it. */
  title: string
  /** When it was last active — what the list is sorted, grouped and dated by. */
  at: Date | string | number
  /** An answer is on its way in it. */
  pending?: boolean
}

/** Every word the switcher shows, for the product to localise. */
export interface TolbiAiHistoryLabels {
  today: string
  yesterday: string
  week: string
  older: string
  /** The search's placeholder. */
  search: string
  /** No conversation on the project yet. */
  empty: string
  /** The current conversation is the only one. */
  alone: string
  /** No title matches the search; `{query}` is replaced by it. */
  noMatch: string
  /** In place of the time, while an answer is on its way. */
  pending: string
  /** The name of the skeleton that holds a conversation's place. */
  loading: string
  /** The history's own name, said when it opens. */
  title: string
  /** A row's two actions — said with the row's title after them — and the renaming field's name. */
  rename: string
  delete: string
  renameField: string
  save: string
  cancel: string
  /** The confirmation a deletion asks for: its title, its sentence (`{title}` is the conversation's), its two answers. */
  deleteTitle: string
  deleteBody: string
  deleteConfirm: string
  deleteCancel: string
}

export const HISTORY_LABELS: TolbiAiHistoryLabels = {
  today: 'Aujourd’hui',
  yesterday: 'Hier',
  week: '7 derniers jours',
  older: 'Plus ancien',
  search: 'Rechercher une conversation',
  empty: 'Vos conversations sur ce projet apparaîtront ici.',
  alone: 'Vos autres conversations sur ce projet apparaîtront ici.',
  noMatch: 'Aucune conversation ne correspond à « {query} ».',
  pending: 'En cours',
  loading: 'Chargement de la conversation',
  title: 'Conversations du projet',
  rename: 'Renommer',
  delete: 'Supprimer',
  renameField: 'Nom de la conversation',
  save: 'Enregistrer',
  cancel: 'Annuler',
  deleteTitle: 'Supprimer la conversation ?',
  deleteBody: 'La conversation « {title} » sera supprimée définitivement.',
  deleteConfirm: 'Supprimer',
  deleteCancel: 'Annuler',
}

/** From this many conversations on, the list can be searched. */
export const SEARCH_FROM = 8

export type HistoryGroup = 'today' | 'yesterday' | 'week' | 'older'
export const HISTORY_GROUPS: HistoryGroup[] = ['today', 'yesterday', 'week', 'older']

const DAY = 86_400_000
const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()

/**
 * Where a conversation falls and how it is dated: today and yesterday by the
 * hour, the rest of the week by the day, before that by the date — with the
 * year when it is not this one. Calendar days, not 24-hour spans.
 */
export function describe(at: TolbiAiConversation['at'], now: Date, locale: string): { group: HistoryGroup; meta: string } {
  const when = new Date(at)
  const days = Math.round((midnight(now) - midnight(when)) / DAY)
  if (days <= 1) {
    return {
      group: days <= 0 ? 'today' : 'yesterday',
      meta: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(when),
    }
  }
  if (days < 7) return { group: 'week', meta: new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(when) }
  const year = when.getFullYear() === now.getFullYear() ? undefined : 'numeric'
  return { group: 'older', meta: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year }).format(when) }
}

/** Case and accents aside, for the search. */
export const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
