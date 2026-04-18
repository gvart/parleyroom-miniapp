import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import i18n from '@/i18n'
import { Card } from '@/ui'

const LANGS: Array<{ code: 'en' | 'de'; labelKey: string; native: string }> = [
  { code: 'en', labelKey: 'english', native: 'English' },
  { code: 'de', labelKey: 'german', native: 'Deutsch' },
]

export function InterfaceLanguage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const current = i18n.resolvedLanguage ?? i18n.language

  function pick(code: 'en' | 'de') {
    void i18n.changeLanguage(code)
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
        <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>
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
                onClick={() => pick(l.code)}
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
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{l.native}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{t(l.labelKey)}</div>
                </div>
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
