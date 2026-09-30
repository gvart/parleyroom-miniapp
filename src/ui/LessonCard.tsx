import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Card } from './Card'
import { Pill } from './Pill'
import { clubLabelKey, isClub, lessonDateLabel, lessonTime } from '@/lib/lesson'
import type { Lesson } from '@/api/types'

export type LessonCardVariant = 'hero' | 'row' | 'compact'

interface LessonCardProps {
  lesson: Lesson
  /** `hero` — Home's next-lesson card. `row` (default) — list row, taps open. `compact` — Calendar's hourly slot. */
  variant?: LessonCardVariant
  onOpen?: (lesson: Lesson) => void
}

/** One lesson, rendered as a hero card, a list row, or a compact calendar slot. */
export function LessonCard({ lesson, variant = 'row', onOpen }: LessonCardProps) {
  if (variant === 'hero') return <HeroCard lesson={lesson} />
  if (variant === 'compact') return <CompactCard lesson={lesson} onOpen={onOpen} />
  return <RowCard lesson={lesson} onOpen={onOpen} />
}

function HeroCard({ lesson }: { lesson: Lesson }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const live = lesson.status === 'IN_PROGRESS'

  return (
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
          {lessonDateLabel(lesson.scheduledAt, t)} · {lessonTime(lesson.scheduledAt)}
        </span>
      </div>
      <h2 className="page-h1" style={{ position: 'relative', marginTop: 14 }}>
        {lesson.topic}
      </h2>
      {lesson.teacher.firstName && (
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
          {lesson.teacher.firstName}
        </div>
      )}
      <div style={{ position: 'relative', marginTop: 20 }}>
        <button
          type="button"
          className={`btn-primary${live ? ' join-live' : ''}`}
          onClick={() => navigate(`/lessons/${lesson.id}/live`)}
        >
          <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
            {live ? 'videocam' : 'play_arrow'}
          </span>
          {live ? t('join_now') : t('start_lesson')}
        </button>
      </div>
    </Card>
  )
}

function RowCard({ lesson, onOpen }: { lesson: Lesson; onOpen?: (lesson: Lesson) => void }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const onClick = () => {
    if (onOpen) onOpen(lesson)
    else navigate(`/lessons/${lesson.id}/live`)
  }
  const time = lessonTime(lesson.scheduledAt)
  const live = lesson.status === 'IN_PROGRESS'
  const requested = lesson.status === 'REQUEST'
  const club = isClub(lesson)
  const participants = lesson.students.length
  const capacity = lesson.maxParticipants
  const enrolled = lesson.students.some((s) => s.id === user.id)
  const atCapacity = capacity != null && participants >= capacity
  const canJoin = club && !enrolled && !atCapacity && lesson.status !== 'CANCELLED'
  const hasPendingReschedule = Boolean(lesson.pendingReschedule)

  return (
    <Card
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '14px 16px 14px 12px',
        borderRadius: 24,
        background: live ? 'color-mix(in srgb, var(--coral-vivid) 10%, var(--glass-bg))' : undefined,
      }}
      className="tap"
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div
          className="font-headline"
          style={{
            width: 56,
            flexShrink: 0,
            textAlign: 'center',
            fontSize: 'var(--text-lead)',
            fontWeight: 900,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {time}
        </div>
        <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--hair)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {(live || requested || club || hasPendingReschedule || canJoin) && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
              {live && (
                <Pill tone="live">
                  <span className="live-dot" />
                  {t('live')}
                </Pill>
              )}
              {requested && <Pill tone="warn">{t('review')}</Pill>}
              {club && <Pill tone="violet">{t(clubLabelKey(lesson) ?? '')}</Pill>}
              {hasPendingReschedule && <Pill tone="warn">{t('reschedule_pending')}</Pill>}
              {canJoin && <Pill tone="accent">{t('join_available')}</Pill>}
            </div>
          )}
          <div
            style={{
              fontSize: 'var(--text-card-title)',
              fontWeight: 700,
              marginBottom: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {lesson.topic || lesson.title}
          </div>
          <div style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--ink-2)' }}>
            {club
              ? `${participants}${capacity ? `/${capacity}` : ''} · ${lesson.level ?? '—'} · ${lesson.durationMinutes}m`
              : `${lesson.teacher.firstName || t('role_teacher')} · ${lesson.level ?? '—'} · ${lesson.durationMinutes}m`}
          </div>
        </div>
        <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }} aria-hidden="true">
          chevron_right
        </span>
      </div>
    </Card>
  )
}

function CompactCard({ lesson, onOpen }: { lesson: Lesson; onOpen?: (lesson: Lesson) => void }) {
  const { t } = useTranslation()
  const live = lesson.status === 'IN_PROGRESS'
  const club = isClub(lesson)

  return (
    <button
      type="button"
      onClick={() => onOpen?.(lesson)}
      className="tap"
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        background: live ? 'var(--coral-soft)' : club ? 'var(--grape-soft)' : 'var(--glass-bg)',
        color: 'var(--ink)',
        padding: '10px 14px',
        borderRadius: 18,
        border: '1px solid var(--glass-border)',
        borderLeft: `4px solid ${live ? 'var(--coral-vivid)' : club ? 'var(--grape-vivid)' : 'var(--accent)'}`,
        marginBottom: 4,
        boxShadow: 'var(--glass-highlight), var(--shadow-1)',
        fontFamily: 'inherit',
        fontSize: 'inherit',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <div
          style={{
            fontSize: 'var(--text-body)',
            fontWeight: 800,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {lesson.topic}
        </div>
        {live && (
          <Pill tone="live" style={{ fontSize: 'var(--text-label)', padding: '2px 8px' }}>
            <span className="live-dot" />
            {t('live').toUpperCase()}
          </Pill>
        )}
      </div>
      <div style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--ink-2)' }}>
        {lessonTime(lesson.scheduledAt)} · {lesson.durationMinutes}m ·{' '}
        {club
          ? `${lesson.students.length}${lesson.maxParticipants ? `/${lesson.maxParticipants}` : ''}`
          : lesson.teacher.firstName}
      </div>
    </button>
  )
}
