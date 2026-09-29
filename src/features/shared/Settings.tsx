import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Avatar, Card, Section } from '@/ui'

interface SettingsItem {
  icon: string
  label: string
  to: string
}

export function Settings() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const accountItems: SettingsItem[] = [
    { icon: 'person', label: t('edit_profile'), to: '/settings/profile' },
    { icon: 'language', label: t('interface_language_title'), to: '/settings/language' },
  ]
  if (user.role === 'STUDENT') {
    accountItems.push({
      icon: 'translate',
      label: t('translation_language'),
      to: '/settings/translation-language',
    })
  }
  const groups: Array<{ title: string; items: SettingsItem[] }> = [
    { title: t('settings_group_account'), items: accountItems },
    {
      title: t('settings_group_privacy'),
      items: [{ icon: 'lock', label: t('change_password_title'), to: '/settings/password' }],
    },
  ]

  const subtitle =
    user.role === 'TEACHER'
      ? t('role_teacher')
      : user.level
        ? t('level_label_value', { level: user.level })
        : t('learning_german')

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
                onClick={() => navigate(it.to)}
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

    </div>
  )
}
