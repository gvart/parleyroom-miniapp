import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/AuthGate'
import { Card } from '@/ui'

export function TeacherStub() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div>
      <div style={{ padding: '8px 20px 18px' }}>
        <div
          style={{
            fontSize: 13,
            color: 'var(--ink-3)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {t('good_morning')}
        </div>
        <div
          className="serif"
          style={{ fontSize: 38, lineHeight: 1.02, letterSpacing: '-0.02em' }}
        >
          {user.firstName}
          <span style={{ color: 'var(--accent)' }}>.</span>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <Card style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>✺</div>
          <div className="serif" style={{ fontSize: 24, marginBottom: 6 }}>
            {t('teacher_view_soon')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('teacher_view_sub')}</div>
        </Card>
      </div>
    </div>
  )
}
