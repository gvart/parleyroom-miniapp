import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './i18n/en.json'
import de from './i18n/de.json'
import ru from './i18n/ru.json'

export const SUPPORTED_LOCALES = ['ru', 'de', 'en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

/** The app's default/fallback language — most users are Russian-speaking. */
export const DEFAULT_LOCALE: SupportedLocale = 'ru'

/** Normalizes an arbitrary language tag (e.g. "en-US", "RU") to a supported locale, or null. */
export function normalizeLocale(code: string | null | undefined): SupportedLocale | null {
  if (!code) return null
  const base = code.split('-')[0].toLowerCase()
  return (SUPPORTED_LOCALES as readonly string[]).includes(base) ? (base as SupportedLocale) : null
}

const resources = {
  en: { translation: en },
  de: { translation: de },
  ru: { translation: ru },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      // Only localStorage — the pre-login default comes from Telegram's
      // language_code (set by useTelegramLocaleBootstrap), not the browser.
      order: ['localStorage'],
      caches: ['localStorage'],
    },
  })

export default i18n
