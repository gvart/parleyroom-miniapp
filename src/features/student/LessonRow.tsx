import { useTranslation } from 'react-i18next'
import { Card, Pill } from '@/ui'
import { clubLabel, isClub, lessonTime } from '@/lib/lesson'
import type { Lesson } from '@/api/types'

interface LessonRowProps {
  lesson: Lesson
  onClick?: () => void
}

export function LessonRow({ lesson, onClick }: LessonRowProps) {
  const { t } = useTranslation()
  const time = lessonTime(lesson.scheduledAt)
  const live = lesson.status === 'IN_PROGRESS'
  const requested = lesson.status === 'REQUEST'
  const club = isClub(lesson)
  const participants = lesson.students.length
  const capacity = lesson.maxParticipants
  const teacherInitial = lesson.students.find((s) => s.id === lesson.teacherId)?.firstName

  return (
    <Card onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', position: 'relative' }}>
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
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 2 }}>
            {live && (
              <Pill tone="live">
                <span className="live-dot" />
                {t('live')}
              </Pill>
            )}
            {requested && <Pill tone="warn">{t('review')}</Pill>}
            {club && <Pill tone="violet">{clubLabel(lesson)}</Pill>}
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
