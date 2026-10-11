import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/AuthGate'
import { api } from '@/api/endpoints'
import { Banner, Button, Card, ScreenHeader, Section } from '@/ui'
import { errorMessage } from '@/lib/errors'
import { requestBotWriteAccess } from '@/lib/telegramWriteAccess'

type Pref = 'telegramLessonReminders' | 'telegramHomeworkReminders'

const PREF_LABELS: Record<Pref, { label: string; sub: string; icon: string }> = {
  telegramLessonReminders: { label: 'tg_lesson_reminders', sub: 'tg_lesson_reminders_sub', icon: 'event' },
  telegramHomeworkReminders: { label: 'tg_homework_reminders', sub: 'tg_homework_reminders_sub', icon: 'edit_note' },
}

export function TelegramNotifications() {
  const { t } = useTranslation()
  const { user, refreshUser } = useAuth()
  // In-flight optimistic values; cleared once the request settles, so a
  // failure falls back to the server value.
  const [pending, setPending] = useState<Partial<Record<Pref, boolean>>>({})
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [asking, setAsking] = useState(false)
  const [testing, setTesting] = useState(false)

  const prefs: Pref[] =
    user.role === 'STUDENT' ? ['telegramLessonReminders', 'telegramHomeworkReminders'] : ['telegramLessonReminders']
  const reachable = user.telegramReachable === true

  function valueOf(pref: Pref): boolean {
    return pending[pref] ?? user[pref] ?? true
  }

  async function toggle(pref: Pref) {
    const next = !valueOf(pref)
    setPending((p) => ({ ...p, [pref]: next }))
    setError(null)
    try {
      await api.updateMe({ [pref]: next })
      await refreshUser()
    } catch (err) {
      setError(errorMessage(err, t, 'tg_save_failed'))
    } finally {
      setPending((p) => {
        const rest = { ...p }
        delete rest[pref]
        return rest
      })
    }
  }

  async function allow() {
    setAsking(true)
    setError(null)
    setNotice(null)
    try {
      const result = await requestBotWriteAccess()
      if (result === 'granted') await refreshUser()
      else if (result === 'denied') setNotice(t('tg_access_denied'))
      else setNotice(t('tg_access_unsupported'))
    } catch (err) {
      setError(errorMessage(err, t, 'tg_test_failed'))
    } finally {
      setAsking(false)
    }
  }

  async function sendTest() {
    setTesting(true)
    setError(null)
    setNotice(null)
    try {
      await api.sendTelegramTest()
      setNotice(t('tg_test_sent'))
    } catch (err) {
      setError(errorMessage(err, t, 'tg_test_failed'))
      await refreshUser()
    } finally {
      setTesting(false)
    }
  }

  return (
    <div>
      <ScreenHeader title={t('tg_notifications_title')} />

      <div style={{ padding: '0 16px 18px' }}>
        <div style={{ fontSize: 'var(--text-lead)', color: 'var(--ink-2)' }}>{t('tg_notifications_sub')}</div>
      </div>

      {!reachable && (
        <div style={{ padding: '0 16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Banner tone="warn" icon="notifications_off">
            {t('tg_unreachable_hint')}
          </Banner>
          <Button block leadingIcon="send" loading={asking} onClick={() => void allow()}>
            {t('tg_allow_messages')}
          </Button>
        </div>
      )}

      {(error || notice) && (
        <div style={{ padding: '0 16px 18px' }}>
          <Banner tone={error ? 'error' : 'success'}>{error ?? notice}</Banner>
        </div>
      )}

      <Section eyebrow={t('tg_reminders_group')}>
        <Card padded={false} className="row-list" style={{ overflow: 'hidden' }}>
          {prefs.map((pref) => {
            const on = valueOf(pref)
            const { label, sub, icon } = PREF_LABELS[pref]
            return (
              <label key={pref} className="row-btn" style={{ cursor: 'pointer' }}>
                <span className="icon-tile" style={{ width: 36, height: 36, borderRadius: 12 }}>
                  <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
                    {icon}
                  </span>
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-body)', fontWeight: 700 }}>{t(label)}</div>
                  <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--ink-2)' }}>{t(sub)}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={on}
                  aria-label={t(label)}
                  className={`toggle${on ? ' on' : ''}`}
                  disabled={pending[pref] !== undefined}
                  onClick={() => void toggle(pref)}
                />
              </label>
            )
          })}
        </Card>
      </Section>

      {reachable && (
        <div style={{ padding: '0 16px' }}>
          <Button variant="secondary" block leadingIcon="send" loading={testing} onClick={() => void sendTest()}>
            {t('tg_send_test')}
          </Button>
        </div>
      )}
    </div>
  )
}
