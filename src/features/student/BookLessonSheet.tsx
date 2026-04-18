import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/auth/AuthGate'
import { Sheet } from '@/ui'
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

  const labelStyle = {
    fontSize: 11,
    color: 'var(--ink-3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontWeight: 600,
    marginBottom: 8,
  }
  const inputStyle = {
    width: '100%',
    minWidth: 0,
    padding: '12px 14px',
    background: 'var(--card)',
    color: 'var(--ink)',
    border: '1px solid var(--hair)',
    borderRadius: 14,
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <Sheet open={open} onClose={onClose}>
      {submitted ? (
        <div style={{ textAlign: 'center', padding: '36px 22px' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              background: 'var(--accent-soft)',
              color: 'var(--accent-deep)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              animation: 'scale-in .4s var(--spring)',
            }}
          >
            <span className="ms fill" style={{ fontSize: 36 }}>
              check
            </span>
          </div>
          <div className="serif" style={{ fontSize: 26, marginBottom: 4 }}>
            {isTeacher ? t('lesson_created_title') : t('request_sent_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            {isTeacher ? t('lesson_created_sub') : t('request_sent_sub')}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ padding: '0 22px 10px' }}>
          <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 18 }}>
            {isTeacher ? t('create_lesson_title') : t('book_lesson_title')}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>{t('topic_label')}</div>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={t('topic_placeholder')}
              style={inputStyle}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>{t('lesson_type_label')}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map((opt) => {
                const active = type === opt.key
                return (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => handleTypeChange(opt.key)}
                    className="tap"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--hair)',
                      background: active ? 'var(--ink)' : 'transparent',
                      color: active ? 'var(--bg)' : 'var(--ink)',
                    }}
                  >
                    {t(opt.labelKey)}
                  </button>
                )
              })}
            </div>
          </div>

          {isTeacher && (
            <div style={{ marginBottom: 14 }}>
              <div style={labelStyle}>
                {isGroup ? t('students_label_group') : t('student_label')}
              </div>
              {availableStudents.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
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
                        className="tap"
                        style={{
                          padding: '8px 14px',
                          borderRadius: 999,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: '1px solid var(--hair)',
                          background: selected ? 'var(--ink)' : 'transparent',
                          color: selected ? 'var(--bg)' : 'var(--ink)',
                        }}
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
              <div style={labelStyle}>{t('date_label')}</div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={labelStyle}>{t('time_label')}</div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={labelStyle}>{t('duration_label')}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {DURATIONS.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setDuration(d)}
                  className="tap"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 14,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--hair)',
                    background: duration === d ? 'var(--ink)' : 'transparent',
                    color: duration === d ? 'var(--bg)' : 'var(--ink)',
                  }}
                >
                  {t('duration_min', { min: d })}
                </button>
              ))}
            </div>
          </div>

          {isTeacher && isGroup && (
            <div style={{ marginBottom: 18 }}>
              <div style={labelStyle}>{t('max_participants_label')}</div>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={50}
                value={maxParticipants}
                onChange={(e) => {
                  const v = e.target.value
                  setMaxParticipants(v === '' ? '' : Math.max(1, parseInt(v, 10) || 1))
                }}
                placeholder={t('max_participants_placeholder')}
                style={{ ...inputStyle, maxWidth: 140 }}
              />
            </div>
          )}

          {!teacherId && (
            <div
              style={{
                marginBottom: 12,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'oklch(0.95 0.05 75)',
                color: 'oklch(0.45 0.12 75)',
                fontSize: 13,
              }}
            >
              {t('no_teacher_found')}
            </div>
          )}

          {create.error && (
            <div
              style={{
                marginBottom: 12,
                padding: '10px 14px',
                borderRadius: 12,
                background: 'oklch(0.96 0.05 25)',
                color: 'oklch(0.5 0.18 25)',
                fontSize: 13,
              }}
            >
              {create.error instanceof Error ? create.error.message : t('booking_failed')}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="tap"
            style={{
              width: '100%',
              border: 0,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              background: canSubmit ? 'var(--ink)' : 'var(--hair-strong)',
              color: canSubmit ? 'var(--bg)' : 'var(--ink-3)',
              padding: '14px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span className="ms fill" style={{ fontSize: 18 }}>
              {isTeacher ? 'event' : 'send'}
            </span>
            {isTeacher
              ? create.isPending
                ? `${t('create_lesson_cta')}…`
                : t('create_lesson_cta')
              : create.isPending
                ? `${t('send_request')}…`
                : t('send_request')}
          </button>
        </form>
      )}
    </Sheet>
  )
}
