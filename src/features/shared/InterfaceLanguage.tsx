import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import { Card } from '@/ui'
import type { SupportedLocale } from '@/i18n'

const LANGS: Array<{ code: SupportedLocale; labelKey: string }> = [
  { code: 'ru', labelKey: 'russian' },
  { code: 'de', labelKey: 'german' },
  { code: 'en', labelKey: 'english' },
]

export function InterfaceLanguage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
      <div style={{ padding: '8px 20px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="tap"
          aria-label={t('back')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: 'var(--card)',
            border: '1px solid var(--hair)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink)',
          }}
        >
          <span className="ms" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </button>
        <div className="font-headline" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>
          {t('interface_language_title')}
        </div>
      </div>

      <div style={{ padding: '0 20px 18px' }}>
        <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('interface_language_sub')}</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <Card padded={false}>
          {LANGS.map((l, i) => {
            const selected = current === l.code
            return (
              <button
                type="button"
                key={l.code}
                onClick={() => void pick(l.code)}
                disabled={updateProfile.isPending}
                className="tap"
                style={{
                  width: '100%',
                  border: 0,
                  background: 'transparent',
                  color: 'var(--ink)',
                  textAlign: 'left',
                  padding: '14px 18px',
                  borderBottom: i < LANGS.length - 1 ? '1px solid var(--hair)' : 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                }}
              >
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{t(l.labelKey)}</div>
                {selected && (
                  <span
                    className="ms fill"
                    style={{ fontSize: 22, color: 'var(--accent)' }}
                  >
                    check_circle
                  </span>
                )}
              </button>
            )
          })}
        </Card>
      </div>
    </div>
  )
}
