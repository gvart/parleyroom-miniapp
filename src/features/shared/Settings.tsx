import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Avatar, Card, Section, Sheet } from '@/ui'

interface SettingsItem {
  icon: string
  label: string
  to?: string
  comingSoon?: boolean
}

export function Settings() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [comingSoonItem, setComingSoonItem] = useState<string | null>(null)

  const groups: Array<{ title: string; items: SettingsItem[] }> = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Edit profile', to: '/settings/profile' },
        { icon: 'credit_card', label: 'Subscription', comingSoon: true },
        { icon: 'language', label: 'Interface language', to: '/settings/language' },
      ],
    },
    {
      title: 'Privacy',
      items: [
        { icon: 'lock', label: 'Change password', to: '/settings/password' },
        { icon: 'notifications', label: 'Notifications', comingSoon: true },
        { icon: 'help', label: 'Support', comingSoon: true },
      ],
    },
  ]

  const subtitle =
    user.role === 'TEACHER' ? 'Teacher' : user.level ? `Level ${user.level}` : 'Learning German'

  return (
    <div>
      <div style={{ padding: '8px 20px 18px' }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {t('settings')}
        </div>
        <div
          className="serif"
          style={{ fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          {user.firstName}
          <span style={{ color: 'var(--accent)' }}>.</span>
        </div>
      </div>

      <div style={{ padding: '0 20px 18px' }}>
        <Card
          onClick={() => navigate('/settings/profile')}
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        >
          <Avatar hue={172} initials={user.initials} size={56} src={user.avatarUrl} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{subtitle}</div>
          </div>
          <span className="ms" style={{ fontSize: 22, color: 'var(--ink-3)' }}>
            chevron_right
          </span>
        </Card>
      </div>

      {groups.map((grp) => (
        <Section key={grp.title} eyebrow={grp.title}>
          <Card padded={false}>
            {grp.items.map((it, i) => (
              <button
                key={it.label}
                type="button"
                className="tap"
                onClick={() => (it.to ? navigate(it.to) : setComingSoonItem(it.label))}
                style={{
                  width: '100%',
                  border: 0,
                  background: 'transparent',
                  textAlign: 'left',
                  padding: '14px 18px',
                  borderBottom:
                    i < grp.items.length - 1 ? '1px solid var(--hair)' : 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  color: 'var(--ink)',
                }}
              >
                <span className="ms" style={{ fontSize: 20, color: 'var(--ink-2)' }}>
                  {it.icon}
                </span>
                <div style={{ flex: 1, fontSize: 14 }}>{it.label}</div>
                <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }}>
                  chevron_right
                </span>
              </button>
            ))}
          </Card>
        </Section>
      ))}

      <div style={{ padding: '8px 20px 0' }}>
        <button
          type="button"
          className="tap"
          onClick={signOut}
          style={{
            width: '100%',
            border: '1px solid var(--hair-strong)',
            background: 'transparent',
            color: 'var(--ink)',
            padding: '12px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('sign_out')}
        </button>
      </div>

      <Sheet open={!!comingSoonItem} onClose={() => setComingSoonItem(null)}>
        <div style={{ padding: '0 22px' }}>
          <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 6 }}>
            {comingSoonItem}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('coming_soon')}</div>
        </div>
      </Sheet>
    </div>
  )
}
