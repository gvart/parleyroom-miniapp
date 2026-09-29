import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/endpoints'
import type { UserProfile } from '@/api/types'
import i18n, { normalizeLocale, DEFAULT_LOCALE, type SupportedLocale } from '@/i18n'

const LANGS: Array<{ code: SupportedLocale; labelKey: string }> = [
  { code: 'ru', labelKey: 'russian' },
  { code: 'de', labelKey: 'german' },
  { code: 'en', labelKey: 'english' },
]

interface Props {
  user: UserProfile
  onConfirmed: (user: UserProfile) => void
}

/**
 * One-time "Choose your language" step shown when `user.localeConfirmedAt`
 * is null. Prefilled from the user's current (Telegram-derived) locale.
 */
export function FirstRunLocalePicker({ user, onConfirmed }: Props) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<SupportedLocale>(normalizeLocale(user.locale) ?? DEFAULT_LOCALE)
  const [saving, setSaving] = useState(false)

  function pick(code: SupportedLocale) {
    setSelected(code)
    void i18n.changeLanguage(code)
  }

  async function confirm() {
    setSaving(true)
    try {
      const updated = await api.updateMe({ locale: selected, confirmLocale: true })
      await i18n.changeLanguage(selected)
      onConfirmed(updated)
    } catch {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 22,
        padding: '40px 24px',
        background: 'var(--bg)',
        color: 'var(--ink)',
      }}
    >
      <div>
        <div
          className="font-headline"
          style={{ fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 8 }}
        >
          {t('choose_language_title')}
          <span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('choose_language_sub')}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {LANGS.map((l) => {
          const active = selected === l.code
          return (
            <button
              type="button"
              key={l.code}
              onClick={() => pick(l.code)}
              className="tap"
              style={{
                width: '100%',
                border: '1px solid var(--hair)',
                background: active ? 'var(--ink)' : 'var(--card)',
                color: active ? 'var(--bg)' : 'var(--ink)',
                padding: '16px 18px',
                borderRadius: 16,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {t(l.labelKey)}
              {active && (
                <span className="ms fill" style={{ fontSize: 20 }}>
                  check_circle
                </span>
              )}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => void confirm()}
        disabled={saving}
        className="tap"
        style={{
          width: '100%',
          border: 0,
          cursor: saving ? 'progress' : 'pointer',
          background: 'var(--ink)',
          color: 'var(--bg)',
          padding: '14px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          opacity: saving ? 0.7 : 1,
        }}
      >
        {t('continue_cta')}
      </button>
    </div>
  )
}
