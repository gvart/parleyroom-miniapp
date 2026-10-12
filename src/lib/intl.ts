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

/** "10 мин" / "1 Std." / "3 days" — compact localized duration for a rating's next-interval hint. */
export function formatDurationShort(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60))
  const [value, unit]: [number, 'minute' | 'hour' | 'day' | 'month' | 'year'] =
    minutes < 60 ? [minutes, 'minute']
      : minutes < 60 * 24 ? [Math.round(minutes / 60), 'hour']
        : minutes < 60 * 24 * 30 ? [Math.round(minutes / 1440), 'day']
          : minutes < 60 * 24 * 365 ? [Math.round(minutes / 43_200), 'month']
            : [Math.round(minutes / 525_600), 'year']
  return new Intl.NumberFormat(activeIntlLocale(), { style: 'unit', unit, unitDisplay: 'short' }).format(value)
}

/** "1,5 МБ" / "1,5 MB" / "12 kB" — localized file size; '' for null/0. */
export function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  const [value, unit, digits]: [number, 'byte' | 'kilobyte' | 'megabyte', number] =
    bytes < 1024 ? [bytes, 'byte', 0]
      : bytes < 1024 * 1024 ? [Math.round(bytes / 1024), 'kilobyte', 0]
        : [bytes / 1024 / 1024, 'megabyte', 1]
  return new Intl.NumberFormat(activeIntlLocale(), {
    style: 'unit',
    unit,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}

/** "15 дек. 2026 г." / "15. Dez. 2026" / "Dec 15, 2026" from a `YYYY-MM-DD` date. */
export function formatDateWithYear(iso: string): string {
  return new Intl.DateTimeFormat(activeIntlLocale(), { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(`${iso.slice(0, 10)}T00:00:00`),
  )
}

/** "62 %" / "62%" — `value` is 0–100. */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat(activeIntlLocale(), { style: 'percent', maximumFractionDigits: 0 }).format(value / 100)
}
