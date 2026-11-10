/**
 * The arithmetic of `DatePicker` (ADR-0152), kept out of the components so it
 * can be read on its own. A day is carried as an ISO string (`2026-03-12`) at
 * the edge and as a **key** inside (`20260312`), which orders like the date;
 * a year is its own key. No time, no time zone: a calendar day is a label.
 */

export type DateGranularity = 'day' | 'year'
export type SegmentKind = 'day' | 'month' | 'year'

export interface DateParts {
  y: number | null
  m: number | null
  d: number | null
}

export const noParts = (): DateParts => ({ y: null, m: null, d: null })

/** Years shown on one page of the year grid: 4 × 4. */
export const YEARS_PER_PAGE = 16

export function daysIn(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

export function dayKey(y: number, m: number, d: number): number {
  return y * 10000 + m * 100 + d
}

export function fromDayKey(k: number): { y: number; m: number; d: number } {
  return { y: Math.floor(k / 10000), m: Math.floor(k / 100) % 100, d: k % 100 }
}

const pad = (n: number, w: number) => String(n).padStart(w, '0')

export function toIso(y: number, m: number, d: number): string {
  return `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}`
}

export function parseIso(s: string | null | undefined): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s ?? '')
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  if (mo < 1 || mo > 12 || d < 1 || d > daysIn(y, mo)) return null
  return { y, m: mo, d }
}

export function today(): { y: number; m: number; d: number } {
  const t = new Date()
  return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() }
}

/** A key from a bound given as a year or an ISO day; `edge` says which end of a year. */
export function boundKey(
  bound: number | string | undefined,
  granularity: DateGranularity,
  edge: 'start' | 'end',
): number | undefined {
  if (bound === undefined || bound === null || bound === '') return undefined
  if (typeof bound === 'number') {
    if (granularity === 'year') return bound
    return edge === 'start' ? dayKey(bound, 1, 1) : dayKey(bound, 12, 31)
  }
  const p = parseIso(bound)
  if (!p) return undefined
  return granularity === 'year' ? p.y : dayKey(p.y, p.m, p.d)
}

export const yearOf = (k: number, granularity: DateGranularity) => (granularity === 'year' ? k : Math.floor(k / 10000))

/** The page of 16 years that holds `y`, its first year counted from `base` (min, or 0). */
export function pageStartOf(y: number, base: number): number {
  return base + Math.floor((y - base) / YEARS_PER_PAGE) * YEARS_PER_PAGE
}

/* ── Locale ─────────────────────────────────────────────────────────── */

/** The order of the day's segments in the locale — JJ/MM/AAAA in French, MM/DD/YYYY in US English. */
export function segmentOrder(locale: string): SegmentKind[] {
  try {
    const parts = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
      .formatToParts(new Date(2020, 10, 22))
    const kinds = parts.map((p) => p.type).filter((t): t is SegmentKind => t === 'day' || t === 'month' || t === 'year')
    if (kinds.length === 3) return kinds
  } catch { /* an unknown locale falls back */ }
  return ['day', 'month', 'year']
}

/** The literal between the segments — « / », « . », « - ». */
export function segmentSeparator(locale: string): string {
  try {
    const lit = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
      .formatToParts(new Date(2020, 10, 22))
      .find((p) => p.type === 'literal')
    if (lit) return lit.value.trim() || '/'
  } catch { /* falls back */ }
  return '/'
}

const lang = (locale: string) => locale.toLowerCase().split('-')[0]

const PLACEHOLDERS: Record<string, Record<SegmentKind, string>> = {
  fr: { day: 'JJ', month: 'MM', year: 'AAAA' },
  es: { day: 'DD', month: 'MM', year: 'AAAA' },
  pt: { day: 'DD', month: 'MM', year: 'AAAA' },
  en: { day: 'DD', month: 'MM', year: 'YYYY' },
}
export const placeholdersFor = (locale: string) => PLACEHOLDERS[lang(locale)] ?? PLACEHOLDERS.en

const NAMES: Record<string, Record<SegmentKind, string>> = {
  fr: { day: 'jour', month: 'mois', year: 'année' },
  en: { day: 'day', month: 'month', year: 'year' },
}
export const segmentNamesFor = (locale: string) => NAMES[lang(locale)] ?? NAMES.en

/** First day of the week, 1 = Monday … 7 = Sunday. */
export function firstDayOfWeek(locale: string): number {
  try {
    const loc = new Intl.Locale(locale) as Intl.Locale & { weekInfo?: { firstDay: number }; getWeekInfo?: () => { firstDay: number } }
    const info = loc.getWeekInfo?.() ?? loc.weekInfo
    if (info?.firstDay) return info.firstDay
  } catch { /* falls back */ }
  return /^en-(us|ca)$/i.test(locale) || /^(pt-br|ja|ko|zh)/i.test(locale) ? 7 : 1
}

/** The seven narrow weekday names, from the locale's first day. */
export function weekdayNames(locale: string, first: number): { narrow: string; long: string }[] {
  const narrow = new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' })
  const long = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' })
  // 2024-01-01 is a Monday (ISO day 1).
  return Array.from({ length: 7 }, (_, i) => {
    const iso = ((first - 1 + i) % 7) + 1
    const date = new Date(Date.UTC(2024, 0, iso))
    return { narrow: narrow.format(date).toUpperCase(), long: long.format(date) }
  })
}

const cap = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1)

export function monthTitle(locale: string, y: number, m: number): string {
  return cap(new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1))))
}

export function dayLabel(locale: string, y: number, m: number, d: number): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)))
}

export function shortDay(locale: string, y: number, m: number, d: number): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)))
}

/** A key written for a reader — « 2026 », « 12 mars 2026 ». */
export function keyText(locale: string, k: number, granularity: DateGranularity): string {
  if (granularity === 'year') return String(k)
  const p = fromDayKey(k)
  return shortDay(locale, p.y, p.m, p.d)
}

const WORDS: Record<string, { between: (a: string, b: string) => string; from: (a: string) => string; upTo: (b: string) => string; order: string; years: (n: number) => string; days: (n: number) => string }> = {
  fr: {
    between: (a, b) => `Entre ${a} et ${b}`,
    from: (a) => `À partir de ${a}`,
    upTo: (b) => `Jusqu’à ${b}`,
    order: 'La fin précède le début',
    years: (n) => `${n} ${n > 1 ? 'années' : 'année'}`,
    days: (n) => `${n} ${n > 1 ? 'jours' : 'jour'}`,
  },
  en: {
    between: (a, b) => `Between ${a} and ${b}`,
    from: (a) => `From ${a}`,
    upTo: (b) => `Up to ${b}`,
    order: 'The end comes before the start',
    years: (n) => `${n} ${n > 1 ? 'years' : 'year'}`,
    days: (n) => `${n} ${n > 1 ? 'days' : 'day'}`,
  },
}
export const wordsFor = (locale: string) => WORDS[lang(locale)] ?? WORDS.en

/** The span of a range, in its unit: « 11 années », « 12 jours ». Both ends count. */
export function spanText(locale: string, a: number, b: number, granularity: DateGranularity): string {
  const w = wordsFor(locale)
  if (granularity === 'year') return w.years(Math.abs(b - a) + 1)
  const pa = fromDayKey(a)
  const pb = fromDayKey(b)
  const days = Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / 86400000)
  return w.days(Math.abs(days) + 1)
}

/** A key moved by `n` units: years, or days across months. */
export function shiftKey(k: number, n: number, granularity: DateGranularity): number {
  if (granularity === 'year') return k + n
  const p = fromDayKey(k)
  const t = new Date(Date.UTC(p.y, p.m - 1, p.d + n))
  return dayKey(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate())
}

/** A day key moved by whole months, the day held inside the target month. */
export function shiftMonths(k: number, n: number): number {
  const p = fromDayKey(k)
  const idx = p.y * 12 + (p.m - 1) + n
  const y = Math.floor(idx / 12)
  const m = (idx % 12) + 1
  return dayKey(y, m, Math.min(p.d, daysIn(y, m)))
}
