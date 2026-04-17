import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Card, Section } from '@/ui'
import { useUsers } from '@/hooks/useCreateLesson'
import { useLessons } from '@/hooks/useLessons'
import { hueFor, initialsOf } from './avatarHue'
import { lessonTime, todayISO } from '@/lib/lesson'
import type { Lesson } from '@/api/types'

export function StudentProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const usersQuery = useUsers()
  const lessonsQuery = useLessons()

  const student = usersQuery.data?.users.find((u) => u.id === id)

  const studentLessons = useMemo<Lesson[]>(() => {
    if (!id) return []
    const today = todayISO()
    return (lessonsQuery.data?.lessons ?? [])
      .filter((l) => l.students.some((s) => s.id === id))
      .filter((l) => l.scheduledAt.slice(0, 10) >= today)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
      .slice(0, 4)
  }, [lessonsQuery.data, id])

  const allLessonsForStudent = useMemo(() => {
    if (!id) return 0
    return (lessonsQuery.data?.lessons ?? []).filter((l) =>
      l.students.some((s) => s.id === id),
    ).length
  }, [lessonsQuery.data, id])

  if (!student) {
    return (
      <div style={{ padding: '40px 30px', textAlign: 'center' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="tap"
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: 'var(--card)',
            border: '1px solid var(--hair)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink)',
            margin: '0 auto 18px',
          }}
        >
          <span className="ms" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </button>
        <div className="serif" style={{ fontSize: 22, color: 'var(--ink-2)' }}>
          {t('student_not_found')}
        </div>
      </div>
    )
  }

  const joinedDate = new Date(student.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })

  return (
    <div>
      <div style={{ padding: '8px 20px 0' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="tap"
          aria-label={t('back')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: 'var(--card)',
            border: '1px solid var(--hair)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink)',
          }}
        >
          <span className="ms" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </button>
      </div>

      <div style={{ padding: '16px 20px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex' }}>
          <Avatar hue={hueFor(student.id)} initials={initialsOf(student)} size={88} />
        </div>
        <div className="serif" style={{ fontSize: 28, marginTop: 12, letterSpacing: '-0.02em' }}>
          {student.firstName} {student.lastName}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2 }}>
          {student.level ?? 'student'} · {t('joined', { date: joinedDate })}
        </div>
      </div>

      <div
        style={{
          padding: '0 20px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        <Card padded={false} style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {allLessonsForStudent}
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {t('lessons_count')}
          </div>
        </Card>
        <Card padded={false} style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {student.level ?? '—'}
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {t('level_short')}
          </div>
        </Card>
        <Card padded={false} style={{ padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {student.locale.toUpperCase()}
          </div>
          <div
            style={{
              fontSize: 10,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {t('language')}
          </div>
        </Card>
      </div>

      <Section eyebrow={t('upcoming_eyebrow')} title={t('next_lessons')}>
        {studentLessons.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('no_upcoming')}</div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {studentLessons.map((l) => (
              <Card key={l.id}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: 48,
                    }}
                  >
                    <div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>
                      {lessonTime(l.scheduledAt)}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--ink-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {l.scheduledAt.slice(5, 10)}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{l.topic}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                      {l.durationMinutes}m · {l.level ?? '—'}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
