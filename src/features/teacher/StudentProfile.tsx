import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Avatar, Banner, Button, Card, Pill, Ring, Section, StatChip, type Tone } from '@/ui'
import { useBackButton } from '@/hooks/useBackButton'
import { useUsers } from '@/hooks/useCreateLesson'
import { useLessons } from '@/hooks/useLessons'
import { useHomework } from '@/hooks/useHomework'
import { useDeleteGoal, useGoals, useSetGoalStatus } from '@/hooks/useGoals'
import { useUpdateStudentNativeLanguage } from '@/hooks/useUpdateStudentNativeLanguage'
import { hueFor, initialsOf } from './avatarHue'
import { lessonDate, lessonTime, todayISO } from '@/lib/lesson'
import { goalPercent, goalPercentLabel, goalTitle } from '@/lib/goal'
import { formatMonthYearFromIso, formatShortDate } from '@/lib/intl'
import { AssignHomeworkSheet } from './AssignHomeworkSheet'
import { AssignGoalSheet } from './AssignGoalSheet'
import type { Goal, Lesson, NativeLanguage } from '@/api/types'
import { errorMessage } from '@/lib/errors'

const NATIVE_LANGUAGES: Array<{ key: NativeLanguage; labelKey: string }> = [
  { key: 'ru', labelKey: 'russian' },
  { key: 'uk', labelKey: 'ukrainian' },
  { key: 'en', labelKey: 'english' },
]

const GOAL_TONES: Tone[] = ['leaf', 'grape', 'sunny', 'sky', 'coral']

const HOMEWORK_STATUS_KEY: Record<string, string> = {
  OPEN: 'status_open',
  SUBMITTED: 'submitted',
  REVIEWED: 'reviewed',
  DONE: 'done',
}

export function StudentProfile() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const usersQuery = useUsers()
  const lessonsQuery = useLessons()
  const homeworkQuery = useHomework(id ? { studentId: id } : {})
  const goalsQuery = useGoals(id ? { studentId: id } : {})
  const updateNativeLanguage = useUpdateStudentNativeLanguage()
  const [assignHwOpen, setAssignHwOpen] = useState(false)
  const [assignGoalOpen, setAssignGoalOpen] = useState(false)
  const goBack = useCallback(() => navigate(-1), [navigate])
  const nativeBackArmed = useBackButton(goBack)

  const student = usersQuery.data?.users.find((u) => u.id === id)

  const studentLessons = useMemo<Lesson[]>(() => {
    if (!id) return []
    const today = todayISO()
    return (lessonsQuery.data?.lessons ?? [])
      .filter((l) => l.students.some((s) => s.id === id))
      .filter((l) => lessonDate(l.scheduledAt) >= today)
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
        {!nativeBackArmed && (
          <button
            type="button"
            onClick={goBack}
            className="ico-btn"
            aria-label={t('back')}
            style={{ margin: '0 auto 18px' }}
          >
            <span className="ms" style={{ fontSize: 20 }}>
              arrow_back
            </span>
          </button>
        )}
        <div className="section-title">
          {t('student_not_found')}
        </div>
      </div>
    )
  }

  const joinedDate = formatMonthYearFromIso(student.createdAt)

  const studentName = `${student.firstName} ${student.lastName}`.trim()
  const homework = homeworkQuery.data?.homework ?? []
  const activeHomework = homework.filter((h) => h.status !== 'DONE')
  const goals = goalsQuery.data ?? []
  const activeGoals = goals.filter((g) => g.status === 'ACTIVE')

  return (
    <div>
      {!nativeBackArmed && (
        <div style={{ padding: '8px 16px 0' }}>
          <button type="button" onClick={goBack} className="ico-btn" aria-label={t('back')}>
            <span className="ms" style={{ fontSize: 20 }}>
              arrow_back
            </span>
          </button>
        </div>
      )}

      <div style={{ padding: '16px 16px 20px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex' }}>
          <Avatar hue={hueFor(student.id)} initials={initialsOf(student)} size={88} src={student.avatarUrl} />
        </div>
        <h1 className="page-h1" style={{ marginTop: 14 }}>
          {studentName}
        </h1>
        <div style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--ink-2)', marginTop: 4 }}>
          {student.level ?? t('role_student')} · {t('joined', { date: joinedDate })}
        </div>
      </div>

      <div
        style={{
          padding: '0 16px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
        }}
      >
        <StatChip icon="event" value={allLessonsForStudent} label={t('lessons_count')} tone="sky" />
        <StatChip icon="school" value={student.level ?? '—'} label={t('level_short')} tone="leaf" />
        <StatChip icon="translate" value={student.locale.toUpperCase()} label={t('language')} tone="grape" />
      </div>

      <div style={{ padding: '0 16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button
          variant="primary"
          block
          leadingIcon="task_alt"
          onClick={() => setAssignHwOpen(true)}
        >
          {t('assign_homework')}
        </Button>
        <Button
          variant="secondary"
          block
          leadingIcon="flag"
          onClick={() => setAssignGoalOpen(true)}
        >
          {t('assign_goal')}
        </Button>
      </div>

      <div style={{ padding: '0 16px 18px' }}>
        <Card>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            {t('native_language_label')}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {NATIVE_LANGUAGES.map((opt) => {
              const active = (student.nativeLanguage ?? 'ru') === opt.key
              return (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() =>
                    id && updateNativeLanguage.mutate({ studentId: id, nativeLanguage: opt.key })
                  }
                  disabled={updateNativeLanguage.isPending}
                  aria-pressed={active}
                  className={`chip${active ? ' on' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {t(opt.labelKey)}
                </button>
              )
            })}
          </div>
        </Card>
      </div>

      <Section eyebrow={t('upcoming_eyebrow')} title={t('next_lessons')}>
        {studentLessons.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--ink-2)' }}>{t('no_upcoming')}</div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {studentLessons.map((l) => (
              <Card key={l.id} style={{ padding: '14px 16px', borderRadius: 24 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: 48,
                    }}
                  >
                    <div className="font-headline" style={{ fontSize: 'var(--text-lead)', fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
                      {lessonTime(l.scheduledAt)}
                    </div>
                    <div className="eyebrow" style={{ fontSize: 10 }}>
                      {formatShortDate(l.scheduledAt)}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 700 }}>{l.topic}</div>
                    <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-2)' }}>
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
            <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>{t('no_goals_yet')}</div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeGoals.map((g, i) => (
              <GoalCard key={g.id} goal={g} tone={GOAL_TONES[i % GOAL_TONES.length]} />
            ))}
          </div>
        )}
      </Section>

      <Section eyebrow={t('student_homework')}>
        {homework.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>{t('no_homework_yet')}</div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {homework.slice(0, 6).map((h) => {
              const tone = h.status === 'DONE' ? 'moss' : h.status === 'OPEN' ? 'warn' : 'info'
              return (
                <Card key={h.id} style={{ padding: '14px 16px', borderRadius: 24 }}>
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
                          fontSize: 'var(--text-card-title)',
                          fontWeight: 700,
                          marginBottom: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h.title}
                      </div>
                      <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-2)' }}>
                        {t('units_answered', { done: h.answeredUnits, total: h.totalUnits })}
                        {h.dueDate ? ` · ${formatShortDate(h.dueDate)}` : ''}
                      </div>
                    </div>
                    <Pill tone={tone}>{t(HOMEWORK_STATUS_KEY[h.status] ?? 'status_open')}</Pill>
                  </div>
                </Card>
              )
            })}
            {activeHomework.length > 0 && (
              <div
                style={{
                  fontSize: 'var(--text-caption)',
                  fontWeight: 700,
                  color: 'var(--ink-2)',
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
        defaultLevel={student.level ?? null}
        onClose={() => setAssignGoalOpen(false)}
      />
    </div>
  )
}

/** Active goal with the teacher's actions: mark achieved, archive or delete. Progress is computed, never set. */
function GoalCard({ goal, tone }: { goal: Goal; tone: Tone }) {
  const { t } = useTranslation()
  const setStatus = useSetGoalStatus()
  const remove = useDeleteGoal()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const meta = [
    goal.type === 'EXAM' ? goal.targetLevel : null,
    goal.targetDate ? formatShortDate(goal.targetDate) : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const anyError = setStatus.error ?? remove.error

  return (
    <Card>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Ring value={goalPercent(goal) ?? 0} size={46} stroke={4} tone={tone} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 700 }}>{goalTitle(goal, t)}</div>
          {meta && <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-2)' }}>{meta}</div>}
          {goal.progress.percent == null && (
            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-3)', marginTop: 2 }}>
              {t('goal_checklist_empty_teacher', { level: goal.targetLevel })}
            </div>
          )}
        </div>
        <div className="font-headline" style={{ fontSize: 'var(--text-body)', color: 'var(--ink-2)', fontWeight: 900 }}>
          {goalPercentLabel(goal)}
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((m) => !m)}
          className="ico-btn"
          aria-label={t('more_options')}
          aria-expanded={menuOpen}
          style={{ width: 38, height: 38 }}
        >
          <span className="ms" style={{ fontSize: 20 }} aria-hidden="true">
            more_horiz
          </span>
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid var(--hair)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {anyError && <Banner tone="error">{errorMessage(anyError, t, 'action_failed')}</Banner>}

          {confirmDelete ? (
            <Banner tone="error" icon="delete">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ flex: 1 }}>{t('delete_goal_confirm')}</span>
                <Button size="sm" variant="danger" loading={remove.isPending} onClick={() => remove.mutate(goal.id)}>
                  {t('delete')}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                  {t('cancel_no')}
                </Button>
              </div>
            </Banner>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="sm"
                variant="primary"
                block
                leadingIcon="emoji_events"
                loading={setStatus.isPending && setStatus.variables?.status === 'ACHIEVED'}
                disabled={setStatus.isPending}
                onClick={() => setStatus.mutate({ id: goal.id, status: 'ACHIEVED' })}
              >
                {t('goal_achieve')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                block
                leadingIcon="archive"
                loading={setStatus.isPending && setStatus.variables?.status === 'ARCHIVED'}
                disabled={setStatus.isPending}
                onClick={() => setStatus.mutate({ id: goal.id, status: 'ARCHIVED' })}
              >
                {t('goal_archive')}
              </Button>
              <Button size="sm" variant="danger" aria-label={t('delete')} onClick={() => setConfirmDelete(true)}>
                <span className="ms" style={{ fontSize: 18 }} aria-hidden="true">
                  delete_outline
                </span>
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
