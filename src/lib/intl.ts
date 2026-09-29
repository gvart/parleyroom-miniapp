import i18n, { normalizeLocale } from '@/i18n'

const INTL_LOCALE: Record<string, string> = { ru: 'ru-RU', de: 'de-DE', en: 'en-US' }

/** The BCP-47 tag for `Intl` calls, matching the active interface language. */
export function activeIntlLocale(): string {
  return INTL_LOCALE[normalizeLocale(i18n.resolvedLanguage) ?? 'ru']
}

/** "5 мар" / "5. März" / "Mar 5" from an ISO date or datetime string. */
export function formatShortDate(iso: string): string {
  const date = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso)
  return new Intl.DateTimeFormat(activeIntlLocale(), { day: 'numeric', month: 'short' }).format(date)
}

/** "март 2026" / "März 2026" / "March 2026". */
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat(activeIntlLocale(), { month: 'long', year: 'numeric' }).format(date)
}

/** "Пн" / "Mo" / "Mon" — short weekday label. */
export function formatWeekdayShort(date: Date): string {
  const label = new Intl.DateTimeFormat(activeIntlLocale(), { weekday: 'short' }).format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

/** "март 2026" from an ISO string, e.g. a `createdAt` timestamp. */
export function formatMonthYearFromIso(iso: string): string {
  return formatMonthYear(new Date(iso))
}
