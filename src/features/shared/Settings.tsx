import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Avatar, Button, Card, PageHeader, Section } from '@/ui'

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
      <PageHeader eyebrow={t('settings')} title={user.firstName} />

      <div style={{ padding: '0 16px 18px' }}>
        <Card
          onClick={() => navigate('/settings/profile')}
          className="tap"
          style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        >
          <Avatar hue={150} initials={user.initials} size={56} src={user.avatarUrl} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 800 }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--ink-2)' }}>{subtitle}</div>
          </div>
          <span className="ms" style={{ fontSize: 22, color: 'var(--ink-3)' }}>
            chevron_right
          </span>
        </Card>
      </div>

      {groups.map((grp) => (
        <Section key={grp.title} eyebrow={grp.title}>
          <Card padded={false} className="row-list" style={{ overflow: 'hidden' }}>
            {grp.items.map((it) => (
              <button
                key={it.label}
                type="button"
                className="row-btn"
                onClick={() => navigate(it.to)}
              >
                <span className="icon-tile" style={{ width: 36, height: 36, borderRadius: 12 }}>
                  <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
                    {it.icon}
                  </span>
                </span>
                <div style={{ flex: 1, fontSize: 'var(--text-body)', fontWeight: 700 }}>{it.label}</div>
                <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }}>
                  chevron_right
                </span>
              </button>
            ))}
          </Card>
        </Section>
      ))}

      <div style={{ padding: '8px 16px 0' }}>
        <Button variant="danger" block leadingIcon="logout" onClick={signOut}>
          {t('sign_out')}
        </Button>
      </div>

    </div>
  )
}
