import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { useLessons } from '@/hooks/useLessons'
import { useUsers } from '@/hooks/useCreateLesson'
import { useNotifications } from '@/hooks/useNotifications'
import { useAcceptLesson, useCancelLesson } from '@/hooks/useLessonActions'
import { Avatar, Card, Pill, Section, StatChip } from '@/ui'
import { isClub, lessonDate, lessonTime, todayISO } from '@/lib/lesson'
import type { Lesson, UserProfile } from '@/api/types'

const HUES = [172, 290, 75, 25, 210, 145, 60]

function hueFor(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % HUES.length
  return HUES[h]
}

function initialsOf(u: UserProfile | { firstName: string; lastName: string; initials?: string }): string {
  if ('initials' in u && u.initials) return u.initials
  return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase()
}

export function TeacherHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const lessonsQuery = useLessons()
  const usersQuery = useUsers()
  const notificationsQuery = useNotifications()

  const today = todayISO()
  const all = lessonsQuery.data?.lessons ?? []
  const todayLessons = useMemo(
    () =>
      all
        .filter((l) => lessonDate(l.scheduledAt) === today)
        .sort((a, b) => lessonTime(a.scheduledAt).localeCompare(lessonTime(b.scheduledAt))),
    [all, today],
  )
  const requests = useMemo(() => all.filter((l) => l.status === 'REQUEST'), [all])
  const live = todayLessons.find((l) => l.status === 'IN_PROGRESS')
  const students = useMemo(
    () => (usersQuery.data?.users ?? []).filter((u) => u.role === 'STUDENT').slice(0, 8),
    [usersQuery.data],
  )

  const unreadCount =
    notificationsQuery.data?.notifications.filter((n) => !n.viewed).length ?? 0

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
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
            {t('lessons_today', { count: todayLessons.length })}
            {requests.length > 0 && ` · ${t('requests_count', { count: requests.length })}`}
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

      {live && (
        <div style={{ padding: '0 20px 16px' }}>
          <Card
            padded={false}
            onClick={() => navigate(`/calendar`)}
            style={{
              background:
                'linear-gradient(135deg, oklch(0.4 0.14 145) 0%, oklch(0.22 0.08 200) 100%)',
              color: '#F2F1EC',
              border: 0,
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar
                hue={172}
                initials={
                  live.students.find((s) => s.id !== live.teacherId)?.firstName?.[0]?.toUpperCase() ??
                  '??'
                }
                size={48}
                live
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: 'oklch(0.85 0.14 145)',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: 3,
                  }}
                >
                  ● Live · {lessonTime(live.scheduledAt)}
                </div>
                <div className="serif" style={{ fontSize: 20, lineHeight: 1.1 }}>
                  {live.topic}
                </div>
              </div>
              <span className="ms" style={{ fontSize: 24, color: '#F2F1EC' }}>
                arrow_forward
              </span>
            </div>
          </Card>
        </div>
      )}

      <div
        style={{
          padding: '0 20px 22px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}
      >
        <StatChip icon="groups" value={students.length} label={t('active_students')} hue={172} />
        <StatChip icon="event" value={todayLessons.length} label={t('today')} hue={210} />
        <StatChip icon="schedule" value={requests.length} label={t('requests')} hue={25} />
        <StatChip icon="task_alt" value={'—'} label={t('pending_homework')} hue={290} />
      </div>

      {requests.length > 0 && (
        <Section eyebrow={t('requests_eyebrow')} title={t('requests_title')}>
          {requests.map((r) => (
            <RequestCard key={r.id} lesson={r} />
          ))}
        </Section>
      )}

      {todayLessons.length > 0 && (
        <Section
          eyebrow={t('today')}
          title={t('timeline_title')}
          action={
            <button
              type="button"
              onClick={() => navigate('/calendar')}
              className="tap"
              style={{
                border: 0,
                background: 'transparent',
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('see_all')}
            </button>
          }
        >
          <Card padded={false}>
            {todayLessons.map((l, i) => (
              <TimelineRow
                key={l.id}
                lesson={l}
                last={i === todayLessons.length - 1}
                onClick={() => navigate('/calendar')}
              />
            ))}
          </Card>
        </Section>
      )}

      {students.length > 0 && (
        <Section
          eyebrow={t('students')}
          title={t('students_glance')}
          action={
            <button
              type="button"
              onClick={() => navigate('/students')}
              className="tap"
              style={{
                border: 0,
                background: 'transparent',
                color: 'var(--ink)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('see_all')}
            </button>
          }
        >
          <div
            style={{
              display: 'flex',
              gap: 10,
              overflowX: 'auto',
              padding: '4px 2px 10px',
              margin: '0 -20px',
              paddingLeft: 20,
              paddingRight: 20,
            }}
            className="no-scrollbar"
          >
            {students.map((s) => (
              <Card
                key={s.id}
                padded={false}
                style={{ minWidth: 140, padding: '14px 14px 16px', flexShrink: 0 }}
              >
                <Avatar hue={hueFor(s.id)} initials={initialsOf(s)} size={38} />
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginTop: 10,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.firstName} {s.lastName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  {s.level ?? 'student'}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {todayLessons.length === 0 && requests.length === 0 && (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✺</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
            {t('quiet_day_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('quiet_day_sub')}</div>
        </div>
      )}
    </div>
  )
}

function RequestCard({ lesson }: { lesson: Lesson }) {
  const { t } = useTranslation()
  const accept = useAcceptLesson()
  const cancel = useCancelLesson()
  const student =
    lesson.students.find((s) => s.id !== lesson.teacherId) ?? lesson.students[0]
  const time = lessonTime(lesson.scheduledAt)
  const initials = student
    ? initialsOf(student)
    : '??'
  return (
    <Card style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <Avatar hue={hueFor(student?.id ?? '')} initials={initials} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {student?.firstName} {student?.lastName}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
            {lesson.topic} · {t('today')} {time}
          </div>
        </div>
        {lesson.level && <Pill tone="warn">{lesson.level}</Pill>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => accept.mutate(lesson.id)}
          disabled={accept.isPending}
          className="tap"
          style={{
            flex: 1,
            border: 0,
            background: 'var(--ink)',
            color: 'var(--bg)',
            padding: '10px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('accept')}
        </button>
        <button
          type="button"
          onClick={() => cancel.mutate({ id: lesson.id })}
          disabled={cancel.isPending}
          className="tap"
          style={{
            flex: 1,
            border: '1px solid var(--hair-strong)',
            background: 'transparent',
            color: 'var(--ink)',
            padding: '10px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('reject')}
        </button>
      </div>
    </Card>
  )
}

interface TimelineRowProps {
  lesson: Lesson
  last: boolean
  onClick: () => void
}

function TimelineRow({ lesson, last, onClick }: TimelineRowProps) {
  const { t } = useTranslation()
  const club = isClub(lesson)
  const partner = lesson.students.find((s) => s.id !== lesson.teacherId)
  const time = lessonTime(lesson.scheduledAt)
  const live = lesson.status === 'IN_PROGRESS'
  const partnerInitials = partner ? initialsOf(partner) : '??'

  return (
    <button
      type="button"
      onClick={onClick}
      className="tap"
      style={{
        width: '100%',
        border: 0,
        background: 'transparent',
        color: 'var(--ink)',
        textAlign: 'left',
        padding: '14px 18px',
        borderBottom: last ? 0 : '1px solid var(--hair)',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 42 }}>
        <div className="mono" style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.03em' }}>
          {time}
        </div>
        <div
          style={{
            fontSize: 9,
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: 2,
          }}
        >
          {lesson.durationMinutes}m
        </div>
      </div>
      <div
        style={{
          width: 2,
          height: 32,
          background: live ? 'oklch(0.7 0.2 145)' : 'var(--hair-strong)',
          borderRadius: 999,
        }}
      />
      {club ? (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'oklch(0.94 0.04 290)',
            color: 'oklch(0.4 0.12 290)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {lesson.type === 'SPEAKING_CLUB' ? 'SC' : 'RC'}
        </div>
      ) : (
        <Avatar hue={hueFor(partner?.id ?? '')} initials={partnerInitials} size={36} live={live} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {club
            ? lesson.topic
            : `${partner?.firstName ?? ''} ${partner?.lastName ?? ''}`.trim() || lesson.topic}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--ink-2)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {club
            ? `${lesson.students.length}${lesson.maxParticipants ? `/${lesson.maxParticipants}` : ''} · ${lesson.topic}`
            : lesson.topic}
        </div>
      </div>
      {live && (
        <Pill tone="live">
          <span className="live-dot" />
          {t('live')}
        </Pill>
      )}
    </button>
  )
}
