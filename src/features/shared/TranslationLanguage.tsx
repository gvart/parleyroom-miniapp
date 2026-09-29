import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import type { NativeLanguage } from '@/api/types'

const LANGS: Array<{ code: NativeLanguage; labelKey: string }> = [
  { code: 'ru', labelKey: 'russian' },
  { code: 'uk', labelKey: 'ukrainian' },
  { code: 'en', labelKey: 'english' },
]

export function TranslationLanguage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const updateProfile = useUpdateProfile()
  const current = user.nativeLanguage ?? 'ru'

  async function pick(code: NativeLanguage) {
    if (code === current) return
    await updateProfile.mutateAsync({ nativeLanguage: code })
    await refreshUser()
  }

  return (
    <div>
      <div style={{ padding: '12px 16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="ico-btn"
          aria-label={t('back')}
        >
          <span className="ms" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </button>
        <div className="section-title">
          {t('translation_language_title')}
        </div>
      </div>

      <div style={{ padding: '0 16px 18px' }}>
        <div style={{ fontSize: 'var(--text-lead)', color: 'var(--ink-2)' }}>{t('translation_language_sub')}</div>
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
                  <span className="ms fill" style={{ fontSize: 22, color: 'var(--accent-ink)' }}>
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
