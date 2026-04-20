import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { useLessons } from '@/hooks/useLessons'
import { useHomework } from '@/hooks/useHomework'
import { useNotifications } from '@/hooks/useNotifications'
import { useGoals } from '@/hooks/useGoals'
import { Card, CategoryDot, Pill, Ring, Section, type PillTone } from '@/ui'
import { lessonTime } from '@/lib/lesson'
import { categorySlug, computeDue, isDoneStatus } from '@/lib/homework'

const GOAL_HUES = [172, 290, 75]

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
    .filter((h) => !isDoneStatus(h.status) && h.status !== 'REJECTED')
    .slice(0, 3)
  const nextLesson = lessons.find(
    (l) => l.status === 'CONFIRMED' || l.status === 'IN_PROGRESS',
  )
  const live = nextLesson?.status === 'IN_PROGRESS'
  const teacherFirstName = nextLesson?.students.find((s) => s.id === nextLesson.teacherId)
    ?.firstName

  return (
    <div>
      <div
        style={{
          padding: '8px 20px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
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
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="tap"
          aria-label={t('notifications')}
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            background: 'var(--card)',
            border: '1px solid var(--hair)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
            color: 'var(--ink)',
          }}
        >
          <span className="ms" style={{ fontSize: 22 }}>
            notifications
          </span>
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 10,
                right: 11,
                width: 8,
                height: 8,
                borderRadius: 999,
                background: 'oklch(0.68 0.19 25)',
                border: '2px solid var(--card)',
              }}
            />
          )}
        </button>
      </div>

      {nextLesson ? (
        <div style={{ padding: '0 20px 20px' }}>
          <Card
            padded={false}
            style={{
              background: live
                ? 'linear-gradient(135deg, oklch(0.42 0.12 200) 0%, oklch(0.28 0.10 240) 100%)'
                : 'linear-gradient(135deg, var(--ink) 0%, oklch(0.18 0.03 200) 100%)',
              color: '#F2F1EC',
              border: 0,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                right: -60,
                top: -60,
                width: 220,
                height: 220,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.08)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: -20,
                top: -20,
                width: 140,
                height: 140,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.12)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: 30,
                top: 30,
                width: 56,
                height: 56,
                borderRadius: 999,
                background: `radial-gradient(circle at 30% 25%, oklch(0.88 0.15 ${live ? 145 : 172}), oklch(0.55 0.16 ${live ? 145 : 172}))`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            />

            <div style={{ padding: '20px 22px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 18,
                  fontSize: 11,
                  color: 'rgba(242,241,236,0.7)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  fontWeight: 600,
                }}
              >
                {live && <span className="live-dot" />}
                {live ? t('room_live') : t('next_lesson')}
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 26,
                  lineHeight: 1.12,
                  letterSpacing: '-0.015em',
                  maxWidth: 240,
                  marginBottom: 6,
                }}
              >
                {nextLesson.topic}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: 'rgba(242,241,236,0.6)',
                  marginBottom: 22,
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <span>
                  {t('today')} · {lessonTime(nextLesson.scheduledAt)}
                </span>
                {teacherFirstName && (
                  <>
                    <span
                      style={{
                        width: 3,
                        height: 3,
                        borderRadius: 999,
                        background: 'currentColor',
                      }}
                    />
                    <span>{teacherFirstName}</span>
                  </>
                )}
              </div>

              <button
                type="button"
                className="tap"
                onClick={() => nextLesson && navigate(`/lessons/${nextLesson.id}/live`)}
                style={{
                  border: 0,
                  cursor: 'pointer',
                  background: live ? 'oklch(0.7 0.2 145)' : '#F2F1EC',
                  color: '#0D0D0C',
                  padding: '12px 18px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <span className="ms fill" style={{ fontSize: 18 }}>
                  {live ? 'videocam' : 'play_arrow'}
                </span>
                {live ? t('join_now') : t('start_lesson')}
              </button>
            </div>
          </Card>
        </div>
      ) : (
        !lessonsQuery.isLoading && (
          <div style={{ padding: '0 20px 20px' }}>
            <Card style={{ textAlign: 'center', padding: '28px 20px' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>✺</div>
              <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
                {t('empty_lessons_title')}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 14 }}>
                {t('empty_lessons_sub')}
              </div>
              <button
                type="button"
                className="tap"
                onClick={() => navigate('/calendar')}
                style={{
                  border: 0,
                  background: 'var(--ink)',
                  color: 'var(--bg)',
                  padding: '10px 18px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t('book')}
              </button>
            </Card>
          </div>
        )
      )}

      {lessonsQuery.isLoading && (
        <div style={{ padding: '0 20px 20px' }}>
          <Card style={{ height: 160, opacity: 0.5 }}>{null}</Card>
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
          action={
            <button
              type="button"
              onClick={() => navigate('/homework')}
              className="tap"
              style={{
                border: 0,
                background: 'transparent',
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {t('open')}
              <span className="ms" style={{ fontSize: 14 }}>
                arrow_forward
              </span>
            </button>
          }
        >
          <Card padded={false}>
            {dueHomework.map((h, i) => {
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
                  className="tap"
                  style={{
                    width: '100%',
                    border: 0,
                    background: 'transparent',
                    color: 'var(--ink)',
                    textAlign: 'left',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderBottom: i < dueHomework.length - 1 ? '1px solid var(--hair)' : 0,
                    cursor: 'pointer',
                  }}
                >
                  <CategoryDot cat={categorySlug(h.category)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        marginBottom: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Pill tone={tone}>{dueText}</Pill>
                      <div
                        style={{
                          fontSize: 11,
                          color: 'var(--ink-3)',
                          textTransform: 'capitalize',
                        }}
                      >
                        {h.category.toLowerCase()}
                      </div>
                    </div>
                  </div>
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
          action={
            <button
              type="button"
              onClick={() => navigate('/goals')}
              className="tap"
              style={{
                border: 0,
                background: 'transparent',
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {t('view_all')}
              <span className="ms" style={{ fontSize: 14 }}>
                arrow_forward
              </span>
            </button>
          }
        >
          <Card onClick={() => navigate('/goals')} style={{ cursor: 'pointer' }}>
            {topGoals.map((g, i) => (
              <div
                key={g.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  marginTop: i === 0 ? 0 : 14,
                }}
              >
                <Ring
                  value={g.progress}
                  size={42}
                  stroke={4}
                  hue={GOAL_HUES[i % GOAL_HUES.length]}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {g.description}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>
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
