import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { useLessons } from '@/hooks/useLessons'
import { useHomework } from '@/hooks/useHomework'
import { useNotifications } from '@/hooks/useNotifications'
import { useGoals } from '@/hooks/useGoals'
import { Card, PageHeader, Pill, Ring, Section, type PillTone, type Tone } from '@/ui'
import { lessonTime } from '@/lib/lesson'
import { computeDue, isDoneStatus } from '@/lib/homework'

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
  const nextLesson = lessons.find(
    (l) => l.status === 'CONFIRMED' || l.status === 'IN_PROGRESS',
  )
  const live = nextLesson?.status === 'IN_PROGRESS'
  const teacherFirstName = nextLesson?.students.find((s) => s.id === nextLesson.teacherId)
    ?.firstName

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

      {nextLesson ? (
        <div style={{ padding: '0 16px 24px' }}>
          <Card className={`animate-in${live ? ' lesson-live' : ''}`} style={{ padding: 22 }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              <span className="eyebrow">{live ? t('room_live') : t('next_lesson')}</span>
              <span className={`countdown-chip${live ? ' is-live' : ''}`}>
                {live ? (
                  <span className="live-dot" aria-hidden="true" />
                ) : (
                  <span className="ms" style={{ fontSize: 16 }} aria-hidden="true">
                    schedule
                  </span>
                )}
                {t('today')} · {lessonTime(nextLesson.scheduledAt)}
              </span>
            </div>
            <h2 className="page-h1" style={{ position: 'relative', marginTop: 14 }}>
              {nextLesson.topic}
            </h2>
            {teacherFirstName && (
              <div
                style={{
                  position: 'relative',
                  marginTop: 8,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 'var(--text-small)',
                  fontWeight: 700,
                  color: 'var(--ink-2)',
                }}
              >
                <span className="ms" style={{ fontSize: 18 }} aria-hidden="true">
                  person
                </span>
                {teacherFirstName}
              </div>
            )}
            <div style={{ position: 'relative', marginTop: 20 }}>
              <button
                type="button"
                className={`btn-primary${live ? ' join-live' : ''}`}
                onClick={() => navigate(`/lessons/${nextLesson.id}/live`)}
              >
                <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
                  {live ? 'videocam' : 'play_arrow'}
                </span>
                {live ? t('join_now') : t('start_lesson')}
              </button>
            </div>
          </Card>
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
              const dueText =
                due.kind === 'overdue'
                  ? t('overdue')
                  : due.kind === 'today'
                    ? t('today')
                    : due.kind === 'tomorrow'
                      ? t('tomorrow')
                      : due.kind === 'date'
                        ? due.label
                        : t('due')
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
