import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Card, Pill } from '@/ui'
import { clubLabel, isClub, lessonTime } from '@/lib/lesson'
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
    <Card onClick={onClick} style={{ cursor: 'pointer', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 48,
            gap: 2,
          }}
        >
          <div className="mono" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.04em' }}>
            {time.split(':')[0]}
          </div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>
            :{time.split(':')[1]}
          </div>
        </div>
        <div style={{ width: 1, height: 38, background: 'var(--hair)' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2, flexWrap: 'wrap' }}>
            {live && (
              <Pill tone="live">
                <span className="live-dot" />
                {t('live')}
              </Pill>
            )}
            {requested && <Pill tone="warn">{t('review')}</Pill>}
            {club && <Pill tone="violet">{clubLabel(lesson)}</Pill>}
            {hasPendingReschedule && <Pill tone="warn">{t('reschedule_pending')}</Pill>}
            {canJoin && <Pill tone="accent">{t('join_available')}</Pill>}
          </div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {lesson.topic || lesson.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
            {club
              ? `${participants}${capacity ? `/${capacity}` : ''} · ${lesson.level ?? '—'} · ${lesson.durationMinutes}m`
              : `${teacherInitial ?? 'Teacher'} · ${lesson.level ?? '—'} · ${lesson.durationMinutes}m`}
          </div>
        </div>
        <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }}>
          chevron_right
        </span>
      </div>
    </Card>
  )
}
