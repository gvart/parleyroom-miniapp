import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/endpoints'
import type { UserProfile } from '@/api/types'
import { Button } from '@/ui'
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
        padding: '40px 16px',
        color: 'var(--ink)',
      }}
    >
      <div className="card animate-in" style={{ padding: 24 }}>
        <span className="icon-tile" style={{ width: 52, height: 52, borderRadius: 18, marginBottom: 16 }}>
          <span className="ms fill" style={{ fontSize: 28 }} aria-hidden="true">
            translate
          </span>
        </span>
        <h1 className="page-h1">{t('choose_language_title')}</h1>
        <p className="page-sub">{t('choose_language_sub')}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '22px 0' }}>
          {LANGS.map((l) => {
            const active = selected === l.code
            return (
              <button
                type="button"
                key={l.code}
                onClick={() => pick(l.code)}
                aria-pressed={active}
                className={`mode-chip${active ? ' on' : ''}`}
              >
                <span style={{ flex: 1 }}>{t(l.labelKey)}</span>
                {active && (
                  <span className="ms fill" style={{ fontSize: 22 }} aria-hidden="true">
                    check_circle
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <Button block loading={saving} onClick={() => void confirm()}>
          {t('continue_cta')}
        </Button>
      </div>
    </div>
  )
}
