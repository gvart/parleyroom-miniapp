import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Button, Card, Pill, Ring, Section } from '@/ui'
import { useUsers } from '@/hooks/useCreateLesson'
import { useLessons } from '@/hooks/useLessons'
import { useHomework } from '@/hooks/useHomework'
import { useGoals } from '@/hooks/useGoals'
import { hueFor, initialsOf } from './avatarHue'
import { lessonTime, todayISO } from '@/lib/lesson'
import { AssignHomeworkSheet } from './AssignHomeworkSheet'
import { AssignGoalSheet } from './AssignGoalSheet'
import type { Lesson } from '@/api/types'

export function StudentProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const usersQuery = useUsers()
  const lessonsQuery = useLessons()
  const homeworkQuery = useHomework(id ? { studentId: id } : {})
  const goalsQuery = useGoals(id ? { studentId: id } : {})
  const [assignHwOpen, setAssignHwOpen] = useState(false)
  const [assignGoalOpen, setAssignGoalOpen] = useState(false)

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

  const studentName = `${student.firstName} ${student.lastName}`.trim()
  const homework = homeworkQuery.data?.homework ?? []
  const activeHomework = homework.filter((h) => h.status !== 'DONE' && h.status !== 'REJECTED')
  const goals = goalsQuery.data?.goals ?? []
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE')

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
          {studentName}
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

      <div style={{ padding: '0 20px 18px', display: 'flex', gap: 8 }}>
        <Button
          variant="primary"
          size="sm"
          block
          leadingIcon="task_alt"
          onClick={() => setAssignHwOpen(true)}
        >
          {t('assign_homework')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          block
          leadingIcon="flag"
          onClick={() => setAssignGoalOpen(true)}
        >
          {t('assign_goal')}
        </Button>
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

      <Section eyebrow={t('student_goals')}>
        {activeGoals.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('no_goals_yet')}</div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeGoals.map((g, i) => (
              <Card key={g.id}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Ring
                    value={g.progress}
                    size={46}
                    stroke={4}
                    hue={[172, 290, 75, 210, 145][i % 5]}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{g.description}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                      {g.setBy === 'TEACHER' ? t('set_by_teacher') : t('set_by_you')}
                      {g.targetDate ? ` · ${g.targetDate.slice(0, 10)}` : ''}
                    </div>
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}
                  >
                    {g.progress}%
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section eyebrow={t('student_homework')}>
        {homework.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('no_homework_yet')}</div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {homework.slice(0, 6).map((h) => {
              const tone =
                h.status === 'DONE'
                  ? 'accent'
                  : h.status === 'REJECTED'
                    ? 'live'
                    : h.status === 'SUBMITTED' || h.status === 'IN_REVIEW'
                      ? 'violet'
                      : 'warn'
              return (
                <Card key={h.id}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          marginBottom: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
                        {h.category.toLowerCase()}
                        {h.dueDate ? ` · ${h.dueDate.slice(0, 10)}` : ''}
                      </div>
                    </div>
                    <Pill tone={tone}>{h.status.toLowerCase().replace('_', ' ')}</Pill>
                  </div>
                  {h.submissionText && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '8px 10px',
                        background: 'var(--bg-2)',
                        borderRadius: 10,
                        fontSize: 12,
                        color: 'var(--ink-2)',
                        lineHeight: 1.4,
                      }}
                    >
                      {h.submissionText}
                    </div>
                  )}
                  {h.submissionUrl && (
                    <div
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                      }}
                    >
                      <a
                        href={h.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--accent-deep)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span className="ms" style={{ fontSize: 14 }}>
                          open_in_new
                        </span>
                        {h.submissionUrl}
                      </a>
                    </div>
                  )}
                </Card>
              )
            })}
            {activeHomework.length > 0 && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--ink-3)',
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                {t('open_count', { count: activeHomework.length })}
              </div>
            )}
          </div>
        )}
      </Section>

      <AssignHomeworkSheet
        open={assignHwOpen}
        studentId={id ?? null}
        studentName={studentName}
        onClose={() => setAssignHwOpen(false)}
      />
      <AssignGoalSheet
        open={assignGoalOpen}
        studentId={id ?? null}
        studentName={studentName}
        onClose={() => setAssignGoalOpen(false)}
      />
    </div>
  )
}
