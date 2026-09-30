import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, EmptyState, ScreenHeader } from '@/ui'
import { useMarkNotificationsViewed, useNotifications } from '@/hooks/useNotifications'
import { notificationIcon, notificationText, relativeTime } from '@/lib/notifications'

export function Notifications() {
  const { t } = useTranslation()
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
      <ScreenHeader title={t('notifications')} />

      <div style={{ padding: '0 16px' }}>
        {items.length === 0 ? (
          !notificationsQuery.isLoading && (
            <EmptyState icon="notifications_off" title={t('all_caught_up')} sub={t('no_new_notifications')} />
          )
        ) : (
          <Card padded={false} className="row-list" style={{ overflow: 'hidden' }}>
            {items.map((n) => {
              const unread = !n.viewed
              return (
                <div
                  key={n.id}
                  style={{
                    padding: '16px 18px',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    background: unread ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent',
                    position: 'relative',
                  }}
                >
                  <span
                    className="icon-tile"
                    style={{
                      background: unread ? 'var(--accent-soft)' : 'var(--bg-2)',
                      color: unread ? 'var(--accent-ink)' : 'var(--ink-2)',
                    }}
                  >
                    <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
                      {notificationIcon(n.type)}
                    </span>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 'var(--text-body)',
                        fontWeight: unread ? 700 : 600,
                        lineHeight: 1.4,
                        marginBottom: 2,
                        color: 'var(--ink)',
                      }}
                    >
                      {notificationText(n, t)}
                    </div>
                    <div style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--ink-3)' }}>
                      {relativeTime(n.createdAt, t)}
                    </div>
                  </div>
                  {unread && (
                    <span
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: 999,
                        background: 'var(--accent)',
                        boxShadow: '0 0 0 3px var(--accent-soft)',
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
