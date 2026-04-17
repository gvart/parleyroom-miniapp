import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/ui'
import { useMarkNotificationsViewed, useNotifications } from '@/hooks/useNotifications'
import { notificationIcon, notificationText, relativeTime } from '@/lib/notifications'

export function Notifications() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const notificationsQuery = useNotifications()
  const markViewed = useMarkNotificationsViewed()

  const items = notificationsQuery.data?.notifications ?? []

  // Give users a beat to register which notifications are unread before
  // we silently mark them read on the server.
  useEffect(() => {
    const unreadIds = items.filter((n) => !n.viewed).map((n) => n.id)
    if (unreadIds.length === 0) return
    const timer = setTimeout(() => markViewed.mutate(unreadIds), 1500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((n) => n.id).join(',')])

  return (
    <div>
      <div
        style={{
          padding: '8px 20px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="tap"
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
          aria-label={t('back')}
        >
          <span className="ms" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </button>
        <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>
          {t('notifications')}
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ padding: '0 20px' }}>
        {items.length === 0 ? (
          !notificationsQuery.isLoading && (
            <div style={{ padding: '40px 30px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>◌</div>
              <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
                {t('all_caught_up')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('no_new_notifications')}</div>
            </div>
          )
        ) : (
          <Card padded={false}>
            {items.map((n, i) => {
              const unread = !n.viewed
              return (
                <div
                  key={n.id}
                  style={{
                    padding: '16px 18px',
                    borderBottom: i < items.length - 1 ? '1px solid var(--hair)' : 0,
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    background: unread ? 'var(--accent-soft)' : 'transparent',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      background: unread ? 'var(--accent)' : 'var(--bg-2)',
                      color: unread ? '#fff' : 'var(--ink-2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span className="ms" style={{ fontSize: 18 }}>
                      {notificationIcon(n.type)}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        lineHeight: 1.4,
                        marginBottom: 2,
                        color: 'var(--ink)',
                      }}
                    >
                      {notificationText(n)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                      {relativeTime(n.createdAt)}
                    </div>
                  </div>
                  {unread && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: 'var(--accent)',
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </Card>
        )}
      </div>
    </div>
  )
}
