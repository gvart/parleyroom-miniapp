import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/AuthGate'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import { ScreenHeader } from '@/ui'
import type { SupportedLocale } from '@/i18n'

const LANGS: Array<{ code: SupportedLocale; labelKey: string }> = [
  { code: 'ru', labelKey: 'russian' },
  { code: 'de', labelKey: 'german' },
  { code: 'en', labelKey: 'english' },
]

export function InterfaceLanguage() {
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()
  const updateProfile = useUpdateProfile()
  const current = user.locale

  async function pick(code: SupportedLocale) {
    if (code === current) return
    // i18n follows `user.locale` (synced in RoleRouter) once the profile refetches.
    await updateProfile.mutateAsync({ locale: code })
    await refreshUser()
  }

  return (
    <div>
      <ScreenHeader title={t('interface_language_title')} />

      <div style={{ padding: '0 16px 18px' }}>
        <div style={{ fontSize: 'var(--text-lead)', color: 'var(--ink-2)' }}>{t('interface_language_sub')}</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {LANGS.map((l) => {
            const selected = current === l.code
            return (
              <button
                type="button"
                key={l.code}
                onClick={() => void pick(l.code)}
                disabled={updateProfile.isPending}
                aria-pressed={selected}
                className={`mode-chip${selected ? ' on' : ''}`}
              >
                <div style={{ flex: 1 }}>{t(l.labelKey)}</div>
                {selected && (
                  <span
                    className="ms fill"
                    style={{ fontSize: 22, color: 'var(--accent-ink)' }}
                  >
                    check_circle
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
