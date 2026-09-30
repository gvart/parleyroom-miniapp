import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { useLessons } from '@/hooks/useLessons'
import { useHomework } from '@/hooks/useHomework'
import { useNotifications } from '@/hooks/useNotifications'
import { useGoals } from '@/hooks/useGoals'
import { Card, LessonCard, PageHeader, Pill, Ring, Section, type PillTone, type Tone } from '@/ui'
import { isLessonParticipant } from '@/lib/lesson'
import { computeDue, dueLabel, isDoneStatus } from '@/lib/homework'

const GOAL_TONES: Tone[] = ['leaf', 'grape', 'sunny']

export function Home() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const lessonsQuery = useLessons()
  const homeworkQuery = useHomework()
  const notificationsQuery = useNotifications()
  const goalsQuery = useGoals({ status: 'ACTIVE' })

  const lessons = lessonsQuery.data?.lessons ?? []
  const unreadCount =
    notificationsQuery.data?.notifications.filter((n) => !n.viewed).length ?? 0
  const topGoals = (goalsQuery.data?.goals ?? []).slice(0, 3)
  const dueHomework = (homeworkQuery.data?.homework ?? [])
    .filter((h) => !isDoneStatus(h.status))
    .slice(0, 3)
  const now = new Date().toISOString()
  // My own upcoming lesson — not another student's blank busy slot — soonest first.
  const nextLesson = lessons
    .filter(
      (l) =>
        (l.status === 'CONFIRMED' || l.status === 'IN_PROGRESS') &&
        isLessonParticipant(l, user.id) &&
        (l.status === 'IN_PROGRESS' || l.scheduledAt >= now),
    )
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))[0]

  const sectionLink = (label: string, to: string) => (
    <button type="button" onClick={() => navigate(to)} className="link-action">
      {label}
      <span className="ms" style={{ fontSize: 16 }} aria-hidden="true">
        arrow_forward
      </span>
    </button>
  )

  return (
    <div>
      <PageHeader
        eyebrow={t('good_morning')}
        title={user.firstName}
        action={
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="ico-btn"
            aria-label={t('notifications')}
          >
            <span className="ms" style={{ fontSize: 22 }} aria-hidden="true">
              notifications
            </span>
            {unreadCount > 0 && <span className="dot" />}
          </button>
        }
      />

      <div style={{ padding: '0 16px 20px', display: 'flex', gap: 10 }}>
        <button
          type="button"
          onClick={() => navigate('/lessons')}
          className="card tap"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            cursor: 'pointer',
            border: 0,
            textAlign: 'left',
            font: 'inherit',
            color: 'inherit',
          }}
        >
          <span className="icon-tile" style={{ width: 36, height: 36, borderRadius: 12 }}>
            <span className="ms fill" style={{ fontSize: 18 }} aria-hidden="true">
              event_note
            </span>
          </span>
          <span style={{ fontSize: 'var(--text-small)', fontWeight: 800 }}>{t('lessons')}</span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/materials')}
          className="card tap"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            cursor: 'pointer',
            border: 0,
            textAlign: 'left',
            font: 'inherit',
            color: 'inherit',
          }}
        >
          <span className="icon-tile" style={{ width: 36, height: 36, borderRadius: 12 }}>
            <span className="ms fill" style={{ fontSize: 18 }} aria-hidden="true">
              collections_bookmark
            </span>
          </span>
          <span style={{ fontSize: 'var(--text-small)', fontWeight: 800 }}>{t('tab_library')}</span>
        </button>
      </div>

      {nextLesson ? (
        <div style={{ padding: '0 16px 24px' }}>
          <LessonCard lesson={nextLesson} variant="hero" />
        </div>
      ) : (
        !lessonsQuery.isLoading && (
          <div style={{ padding: '0 16px 24px' }}>
            <Card className="animate-in" style={{ textAlign: 'center', padding: '28px 16px' }}>
              <span
                className="icon-tile"
                style={{ width: 56, height: 56, borderRadius: 18, margin: '0 auto 12px' }}
              >
                <span className="ms fill" style={{ fontSize: 28 }} aria-hidden="true">
                  event_available
                </span>
              </span>
              <div className="section-title" style={{ marginBottom: 4 }}>
                {t('empty_lessons_title')}
              </div>
              <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', marginBottom: 18 }}>
                {t('empty_lessons_sub')}
              </div>
              <button type="button" className="btn-primary" onClick={() => navigate('/calendar')}>
                <span className="ms" style={{ fontSize: 20 }} aria-hidden="true">
                  add
                </span>
                {t('book')}
              </button>
            </Card>
          </div>
        )
      )}

      {lessonsQuery.isLoading && (
        <div style={{ padding: '0 16px 24px' }}>
          <div className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-card)' }} />
        </div>
      )}

      {dueHomework.length > 0 && (
        <Section
          eyebrow={t('homework')}
          title={
            dueHomework.length === 1
              ? t('task_open_singular')
              : `${dueHomework.length} ${t('tasks_open')}`
          }
          action={sectionLink(t('open'), '/homework')}
        >
          <Card padded={false} className="row-list" style={{ overflow: 'hidden' }}>
            {dueHomework.map((h) => {
              const due = computeDue(h.dueDate)
              const tone: PillTone =
                due.kind === 'overdue' ? 'live' : due.kind === 'today' ? 'warn' : 'neutral'
              const dueText = dueLabel(due, t)
              return (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => navigate('/homework')}
                  className="row-btn"
                >
                  <span
                    className="icon-tile"
                    style={{ background: 'var(--sunny-soft)', color: 'var(--sunny-ink)' }}
                  >
                    <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
                      edit_note
                    </span>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 'var(--text-card-title)',
                        fontWeight: 700,
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h.title}
                    </div>
                    <Pill tone={tone}>{dueText}</Pill>
                  </div>
                  <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }} aria-hidden="true">
                    chevron_right
                  </span>
                </button>
              )
            })}
          </Card>
        </Section>
      )}

      {topGoals.length > 0 && (
        <Section
          eyebrow={t('goals')}
          title={t('your_rhythm')}
          action={sectionLink(t('view_all'), '/goals')}
        >
          <Card onClick={() => navigate('/goals')} style={{ cursor: 'pointer' }}>
            {topGoals.map((g, i) => (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  marginTop: i === 0 ? 0 : 16,
                }}
              >
                <Ring
                  value={g.progress}
                  size={44}
                  stroke={5}
                  tone={GOAL_TONES[i % GOAL_TONES.length]}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 'var(--text-body)',
                      fontWeight: 700,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {g.description}
                  </div>
                  <div style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--ink-2)', marginTop: 2 }}>
                    {g.progress}%
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </Section>
      )}
    </div>
  )
}
