import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { useLessons } from '@/hooks/useLessons'
import { useUsers } from '@/hooks/useCreateLesson'
import { useNotifications } from '@/hooks/useNotifications'
import { useAcceptLesson, useCancelLesson } from '@/hooks/useLessonActions'
import { Avatar, Button, Card, EmptyState, PageHeader, Pill, Section, StatChip } from '@/ui'
import { isClub, lessonDate, lessonTime, todayISO } from '@/lib/lesson'
import type { Lesson, UserProfile } from '@/api/types'

function minutesUntil(scheduledAt: string): number {
  return Math.round((new Date(scheduledAt).getTime() - Date.now()) / 60000)
}

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
      <PageHeader
        eyebrow={t('good_morning')}
        title={user.firstName}
        sub={
          <>
            {t('lessons_today', { count: todayLessons.length })}
            {requests.length > 0 && ` · ${t('requests_count', { count: requests.length })}`}
          </>
        }
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

      {live && (
        <div style={{ padding: '0 16px 16px' }}>
          <Card
            padded={false}
            onClick={() => navigate(`/lessons/${live.id}/live`)}
            className="lesson-live tap"
            style={{ cursor: 'pointer' }}
          >
            <div style={{ position: 'relative', padding: '20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar
                hue={140}
                initials={
                  live.students.find((s) => s.id !== live.teacherId)?.firstName?.[0]?.toUpperCase() ??
                  '??'
                }
                size={48}
                live
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="countdown-chip is-live" style={{ marginBottom: 6 }}>
                  <span className="live-dot" aria-hidden="true" />
                  {t('live')} · {lessonTime(live.scheduledAt)}
                </span>
                <div className="section-title" style={{ lineHeight: 1.2 }}>
                  {live.topic}
                </div>
              </div>
              <span className="btn-primary join-live" style={{ width: 44, minHeight: 44, padding: 0 }} aria-hidden="true">
                <span className="ms fill" style={{ fontSize: 22 }}>videocam</span>
              </span>
            </div>
          </Card>
        </div>
      )}

      <div
        style={{
          padding: '0 16px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}
      >
        <StatChip icon="groups" value={students.length} label={t('active_students')} tone="leaf" />
        <StatChip icon="event" value={todayLessons.length} label={t('today')} tone="sky" />
        <StatChip icon="schedule" value={requests.length} label={t('requests')} tone="coral" />
        <StatChip icon="task_alt" value={'—'} label={t('pending_homework')} tone="grape" />
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
            <button type="button" onClick={() => navigate('/calendar')} className="link-action">
              {t('see_all')}
            </button>
          }
        >
          <Card padded={false} className="row-list" style={{ overflow: 'hidden' }}>
            {todayLessons.map((l) => (
              <TimelineRow
                key={l.id}
                lesson={l}
                onClick={() => navigate(`/lessons/${l.id}/live`)}
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
            <button type="button" onClick={() => navigate('/students')} className="link-action">
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
              margin: '0 -16px',
              paddingLeft: 16,
              paddingRight: 16,
            }}
            className="no-scrollbar"
          >
            {students.map((s) => (
              <Card
                key={s.id}
                onClick={() => navigate(`/students/${s.id}`)}
                padded={false}
                className="tap"
                style={{ minWidth: 140, padding: '14px 14px 16px', flexShrink: 0, cursor: 'pointer', borderRadius: 24 }}
              >
                <Avatar hue={hueFor(s.id)} initials={initialsOf(s)} size={38} />
                <div
                  style={{
                    fontSize: 'var(--text-body)',
                    fontWeight: 800,
                    marginTop: 10,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.firstName} {s.lastName}
                </div>
                <div style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--ink-2)' }}>
                  {s.level ?? t('role_student')}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {todayLessons.length === 0 && requests.length === 0 && (
        <EmptyState icon="wb_sunny" title={t('quiet_day_title')} sub={t('quiet_day_sub')} />
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
          <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 800 }}>
            {student?.firstName} {student?.lastName}
          </div>
          <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-2)' }}>
            {lesson.topic} · {t('today')} {time}
          </div>
        </div>
        {lesson.level && <Pill tone="warn">{lesson.level}</Pill>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          size="sm"
          variant="primary"
          block
          loading={accept.isPending}
          onClick={() => accept.mutate(lesson.id)}
        >
          {t('accept')}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          block
          loading={cancel.isPending}
          onClick={() => cancel.mutate({ id: lesson.id })}
        >
          {t('reject')}
        </Button>
      </div>
    </Card>
  )
}

interface TimelineRowProps {
  lesson: Lesson
  onClick: () => void
}

function TimelineRow({ lesson, onClick }: TimelineRowProps) {
  const { t } = useTranslation()
  const club = isClub(lesson)
  const partner = lesson.students.find((s) => s.id !== lesson.teacherId)
  const time = lessonTime(lesson.scheduledAt)
  const live = lesson.status === 'IN_PROGRESS'
  const partnerInitials = partner ? initialsOf(partner) : '??'
  const minsUntil = minutesUntil(lesson.scheduledAt)
  const startable =
    lesson.status === 'CONFIRMED' && !lesson.startedAt && minsUntil <= 15 && minsUntil > -120

  return (
    <button
      type="button"
      onClick={onClick}
      className="row-btn"
      style={{ padding: '12px 16px', background: live ? 'var(--coral-soft)' : undefined }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48 }}>
        <div className="font-headline" style={{ fontSize: 'var(--text-lead)', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
          {time}
        </div>
        <div style={{ fontSize: 'var(--text-label)', fontWeight: 700, color: 'var(--ink-3)', marginTop: 1 }}>
          {lesson.durationMinutes}m
        </div>
      </div>
      <div
        style={{
          width: 3,
          height: 32,
          background: live ? 'var(--coral-vivid)' : 'var(--hair-strong)',
          borderRadius: 999,
        }}
      />
      {club ? (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: 'var(--grape-soft)',
            color: 'var(--grape-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 'var(--text-label)',
            fontWeight: 900,
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
            fontSize: 'var(--text-card-title)',
            fontWeight: 700,
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
            fontSize: 'var(--text-small)',
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
      {live ? (
        <Pill tone="live">
          <span className="live-dot" />
          {t('live')}
        </Pill>
      ) : startable ? (
        <Button
          size="sm"
          variant="primary"
          leadingIcon="play_arrow"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          {t('start_cta')}
        </Button>
      ) : null}
    </button>
  )
}
