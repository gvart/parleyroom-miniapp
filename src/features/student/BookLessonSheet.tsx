import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/AuthGate'
import { Banner, Button, Sheet, SuccessState, TextField } from '@/ui'
import { useCreateLesson, useUsers } from '@/hooks/useCreateLesson'
import { useLessons } from '@/hooks/useLessons'
import { todayISO } from '@/lib/lesson'
import type { LessonType } from '@/api/types'

const DURATIONS = [30, 45, 60]
const TYPES: Array<{ key: LessonType; labelKey: string }> = [
  { key: 'ONE_ON_ONE', labelKey: 'type_one_on_one' },
  { key: 'SPEAKING_CLUB', labelKey: 'type_speaking_club' },
  { key: 'READING_CLUB', labelKey: 'type_reading_club' },
]

interface BookLessonSheetProps {
  open: boolean
  onClose: () => void
  defaultDate?: string
}

export function BookLessonSheet({ open, onClose, defaultDate }: BookLessonSheetProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const lessonsQuery = useLessons()
  const usersQuery = useUsers()
  const create = useCreateLesson()

  const isTeacher = user.role === 'TEACHER'

  const teacherId = useMemo(() => {
    if (isTeacher) return user.id
    const fromLessons = lessonsQuery.data?.lessons[0]?.teacherId
    if (fromLessons) return fromLessons
    return usersQuery.data?.users.find((u) => u.role === 'TEACHER')?.id
  }, [isTeacher, user.id, lessonsQuery.data, usersQuery.data])

  const availableStudents = useMemo(() => {
    if (!isTeacher) return []
    return (usersQuery.data?.users ?? []).filter((u) => u.role === 'STUDENT')
  }, [isTeacher, usersQuery.data])

  const [topic, setTopic] = useState('')
  const [date, setDate] = useState(defaultDate ?? todayISO())
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState(60)
  const [type, setType] = useState<LessonType>('ONE_ON_ONE')
  const [studentIds, setStudentIds] = useState<string[]>([])
  const [maxParticipants, setMaxParticipants] = useState<number | ''>(6)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setTopic('')
      setDate(defaultDate ?? todayISO())
      setTime('10:00')
      setDuration(60)
      setType('ONE_ON_ONE')
      setStudentIds([])
      setMaxParticipants(6)
      setSubmitted(false)
    }
  }, [open, defaultDate])

  // Reset student selection and maxParticipants when the lesson type changes —
  // a 1:1 picked list doesn't translate to a group and vice versa.
  function handleTypeChange(next: LessonType) {
    if (next === type) return
    setType(next)
    setStudentIds([])
    setMaxParticipants(next === 'ONE_ON_ONE' ? '' : 6)
  }

  function toggleStudent(id: string) {
    setStudentIds((prev) => {
      if (type === 'ONE_ON_ONE') return prev[0] === id ? [] : [id]
      return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    })
  }

  const isGroup = type !== 'ONE_ON_ONE'

  const studentSelectionValid = isTeacher
    ? type === 'ONE_ON_ONE'
      ? studentIds.length === 1
      : true // group: 0..N allowed; empty = open for join
    : true // student flow: implicit self

  const canSubmit =
    topic.trim().length > 0 &&
    Boolean(teacherId) &&
    studentSelectionValid &&
    (!isTeacher || !isGroup || maxParticipants === '' || maxParticipants > 0) &&
    !create.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !teacherId) return
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString()
    const finalStudentIds = isTeacher ? studentIds : [user.id]
    try {
      await create.mutateAsync({
        teacherId,
        studentIds: finalStudentIds,
        title: topic.trim(),
        topic: topic.trim(),
        type,
        scheduledAt,
        durationMinutes: duration,
        maxParticipants: isGroup && maxParticipants !== '' ? maxParticipants : null,
      })
      setSubmitted(true)
      setTimeout(onClose, 1200)
    } catch {
      /* error in create.error */
    }
  }


  return (
    <Sheet open={open} onClose={onClose}>
      {submitted ? (
        <SuccessState
          icon="check"
          title={isTeacher ? t('lesson_created_title') : t('request_sent_title')}
          sub={isTeacher ? t('lesson_created_sub') : t('request_sent_sub')}
        />
      ) : (
        <form onSubmit={submit} style={{ padding: '0 20px 4px' }}>
          <div className="section-title" style={{ marginBottom: 18 }}>
            {isTeacher ? t('create_lesson_title') : t('book_lesson_title')}
          </div>

          <div style={{ marginBottom: 14 }}>
            <TextField
              label={t('topic_label')}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t('topic_placeholder')}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div className="eyebrow field-label">{t('lesson_type_label')}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map((opt) => {
                const active = type === opt.key
                return (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => handleTypeChange(opt.key)}
                    aria-pressed={active}
                    className={`chip${active ? ' on' : ''}`}
                  >
                    {t(opt.labelKey)}
                  </button>
                )
              })}
            </div>
          </div>

          {isTeacher && (
            <div style={{ marginBottom: 14 }}>
              <div className="eyebrow field-label">
                {isGroup ? t('students_label_group') : t('student_label')}
              </div>
              {availableStudents.length === 0 ? (
                <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>
                  {t('no_students_available')}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {availableStudents.map((s) => {
                    const selected = studentIds.includes(s.id)
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleStudent(s.id)}
                        aria-pressed={selected}
                        className={`chip${selected ? ' on' : ''}`}
                      >
                        {selected && <span style={{ marginRight: 4 }}>✓</span>}
                        {s.firstName} {s.lastName}
                      </button>
                    )
                  })}
                </div>
              )}
              {isGroup && (
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>
                  {studentIds.length === 0
                    ? t('group_open_for_join')
                    : t('students_selected', { count: studentIds.length })}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <TextField
                type="date"
                label={t('date_label')}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <TextField
                type="time"
                label={t('time_label')}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="eyebrow field-label">{t('duration_label')}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {DURATIONS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDuration(d)}
                  aria-pressed={duration === d}
                  className={`chip${duration === d ? ' on' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {t('duration_min', { min: d })}
                </button>
              ))}
            </div>
          </div>

          {isTeacher && isGroup && (
            <div style={{ marginBottom: 18, maxWidth: 160 }}>
              <TextField
                type="number"
                inputMode="numeric"
                min={1}
                max={50}
                label={t('max_participants_label')}
                value={maxParticipants === '' ? '' : String(maxParticipants)}
                onChange={(e) => {
                  const v = e.target.value
                  setMaxParticipants(v === '' ? '' : Math.max(1, parseInt(v, 10) || 1))
                }}
                placeholder={t('max_participants_placeholder')}
              />
            </div>
          )}

          {!teacherId && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="warn">{t('no_teacher_found')}</Banner>
            </div>
          )}

          {create.error && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="error">
                {create.error instanceof Error ? create.error.message : t('booking_failed')}
              </Banner>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            block
            disabled={!canSubmit}
            loading={create.isPending}
            leadingIcon={isTeacher ? 'event' : 'send'}
          >
            {isTeacher ? t('create_lesson_cta') : t('send_request')}
          </Button>
        </form>
      )}
    </Sheet>
  )
}
