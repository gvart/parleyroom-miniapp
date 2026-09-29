import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Card, Pill } from '@/ui'
import { clubLabelKey, isClub, lessonTime } from '@/lib/lesson'
import type { Lesson } from '@/api/types'

interface LessonRowProps {
  lesson: Lesson
  onOpen?: (lesson: Lesson) => void
}

export function LessonRow({ lesson, onOpen }: LessonRowProps) {
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
  const teacherInitial = lesson.students.find((s) => s.id === lesson.teacherId)?.firstName
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
              : `${teacherInitial ?? t('role_teacher')} · ${lesson.level ?? '—'} · ${lesson.durationMinutes}m`}
          </div>
        </div>
        <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }} aria-hidden="true">
          chevron_right
        </span>
      </div>
    </Card>
  )
}
