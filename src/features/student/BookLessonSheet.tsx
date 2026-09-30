import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/auth/AuthGate'
import { Banner, Button, Sheet, SuccessState, TextField } from '@/ui'
import { useCreateLesson, useUsers } from '@/hooks/useCreateLesson'
import { useLessons } from '@/hooks/useLessons'
import { hasErrorCode } from '@/lib/errors'
import { DEFAULT_LESSON_DURATION, LESSON_DURATIONS, lessonDate, todayISO } from '@/lib/lesson'
import { SlotPicker } from './SlotPicker'
import type { AvailableSlot, LessonType } from '@/api/types'

// `.chip.on`'s default is a soft accent tint — for the student's date/length/
// slot pickers we want the same solid-accent "selected" look as the calendar's
// day strip, so override it inline rather than touching the shared class.
const CHIP_ON_STYLE: CSSProperties = {
  background: 'var(--accent-face)',
  borderColor: 'var(--accent-face)',
  color: 'var(--on-accent)',
}

const AVAILABILITY_ERROR_CODES = [
  'AVAILABILITY_SLOT_BLOCKED',
  'AVAILABILITY_OVERLAP',
  'AVAILABILITY_MIN_NOTICE',
  'AVAILABILITY_BUFFER_CONFLICT',
]

const TYPES: Array<{ key: LessonType; labelKey: string }> = [
  { key: 'ONE_ON_ONE', labelKey: 'type_one_on_one' },
  { key: 'SPEAKING_CLUB', labelKey: 'type_speaking_club' },
  { key: 'READING_CLUB', labelKey: 'type_reading_club' },
]

interface BookLessonSheetProps {
  open: boolean
  onClose: () => void
  defaultDate?: string
  /** A free slot tapped directly in the calendar timeline (student flow only). */
  initialSlot?: AvailableSlot | null
}

export function BookLessonSheet({ open, onClose, defaultDate, initialSlot }: BookLessonSheetProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const qc = useQueryClient()
  const lessonsQuery = useLessons()
  const usersQuery = useUsers()
  const create = useCreateLesson()

  const isTeacher = user.role === 'TEACHER'

  const myTeachers = useMemo(
    () => (usersQuery.data?.users ?? []).filter((u) => u.role === 'TEACHER'),
    [usersQuery.data],
  )

  // --- teacher-create fields (unchanged flow) ---
  const [topic, setTopic] = useState('')
  const [date, setDate] = useState(defaultDate ?? todayISO())
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState(DEFAULT_LESSON_DURATION)
  const [type, setType] = useState<LessonType>('ONE_ON_ONE')
  const [studentIds, setStudentIds] = useState<string[]>([])
  const [maxParticipants, setMaxParticipants] = useState<number | ''>(6)

  // --- student-request fields: date + length + a tapped slot, no topic/type ---
  const [studentTeacherId, setStudentTeacherId] = useState<string | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)

  const [submitted, setSubmitted] = useState(false)
  const [bookedStatus, setBookedStatus] = useState<'CONFIRMED' | 'REQUEST'>('REQUEST')

  const teacherId = isTeacher
    ? user.id
    : (studentTeacherId ?? lessonsQuery.data?.lessons[0]?.teacherId ?? myTeachers[0]?.id)

  const availableStudents = useMemo(() => {
    if (!isTeacher) return []
    return (usersQuery.data?.users ?? []).filter((u) => u.role === 'STUDENT')
  }, [isTeacher, usersQuery.data])

  useEffect(() => {
    if (!open) return
    setSubmitted(false)
    create.reset()
    if (isTeacher) {
      setTopic('')
      setDate(defaultDate ?? todayISO())
      setTime('10:00')
      setDuration(DEFAULT_LESSON_DURATION)
      setType('ONE_ON_ONE')
      setStudentIds([])
      setMaxParticipants(6)
    } else {
      setDate(initialSlot ? lessonDate(initialSlot.start) : (defaultDate ?? todayISO()))
      setDuration(DEFAULT_LESSON_DURATION)
      setSelectedSlot(initialSlot ?? null)
      setStudentTeacherId(undefined)
    }
    // `create`/`lessonsQuery`/`usersQuery` are fresh objects every render (TanStack
    // Query v5) — depending on them would re-run this on every keystroke/refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDate, initialSlot, isTeacher])

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

  function changeStudentDuration(next: number) {
    setDuration(next)
    setSelectedSlot(null)
  }

  function changeStudentTeacher(id: string) {
    setStudentTeacherId(id)
    setSelectedSlot(null)
  }

  function changeStudentDate(next: string) {
    setDate(next)
    setSelectedSlot(null)
  }

  const isGroup = type !== 'ONE_ON_ONE'

  const studentSelectionValid = isTeacher
    ? type === 'ONE_ON_ONE'
      ? studentIds.length === 1
      : true // group: 0..N allowed; empty = open for join
    : true

  const canSubmitTeacher =
    topic.trim().length > 0 &&
    Boolean(teacherId) &&
    studentSelectionValid &&
    (!isGroup || maxParticipants === '' || maxParticipants > 0) &&
    !create.isPending

  const canSubmitStudent = Boolean(teacherId) && Boolean(selectedSlot) && !create.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!teacherId) return

    if (isTeacher) {
      if (!canSubmitTeacher) return
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString()
      try {
        await create.mutateAsync({
          teacherId,
          studentIds,
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
      return
    }

    if (!canSubmitStudent || !selectedSlot) return
    try {
      const created = await create.mutateAsync({
        teacherId,
        studentIds: [user.id],
        title: t('booking_default_topic'),
        topic: t('booking_default_topic'),
        type: 'ONE_ON_ONE',
        scheduledAt: selectedSlot.start,
        durationMinutes: duration,
      })
      setBookedStatus(created.status === 'CONFIRMED' ? 'CONFIRMED' : 'REQUEST')
      setSubmitted(true)
      setTimeout(onClose, 1200)
    } catch (err) {
      if (hasErrorCode(err, ...AVAILABILITY_ERROR_CODES)) {
        setSelectedSlot(null)
        void qc.invalidateQueries({ queryKey: ['available-slots'] })
      }
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      {submitted ? (
        isTeacher ? (
          <SuccessState icon="check" title={t('lesson_created_title')} sub={t('lesson_created_sub')} />
        ) : bookedStatus === 'CONFIRMED' ? (
          <SuccessState icon="check" title={t('booked_title')} sub={t('booked_sub')} />
        ) : (
          <SuccessState icon="check" title={t('request_sent_title')} sub={t('request_sent_sub')} />
        )
      ) : (
        <form onSubmit={submit} style={{ padding: '0 20px 4px' }}>
          <div className="section-title" style={{ marginBottom: 18 }}>
            {isTeacher ? t('create_lesson_title') : t('book_lesson_title')}
          </div>

          {isTeacher ? (
            <>
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
                  {LESSON_DURATIONS.map((d) => (
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

              {isGroup && (
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
            </>
          ) : (
            <>
              {myTeachers.length > 1 && (
                <div style={{ marginBottom: 14 }}>
                  <div className="eyebrow field-label">{t('role_teacher')}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {myTeachers.map((tch) => {
                      const active = teacherId === tch.id
                      return (
                        <button
                          type="button"
                          key={tch.id}
                          onClick={() => changeStudentTeacher(tch.id)}
                          aria-pressed={active}
                          className={`chip${active ? ' on' : ''}`}
                          style={active ? CHIP_ON_STYLE : undefined}
                        >
                          {tch.firstName} {tch.lastName}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <div className="eyebrow field-label">{t('duration_label')}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {LESSON_DURATIONS.map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => changeStudentDuration(d)}
                      aria-pressed={duration === d}
                      className={`chip${duration === d ? ' on' : ''}`}
                      style={{ flex: 1, justifyContent: 'center', ...(duration === d ? CHIP_ON_STYLE : null) }}
                    >
                      {t('duration_min', { min: d })}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 18 }}>
                <SlotPicker
                  teacherId={teacherId}
                  date={date}
                  onDateChange={changeStudentDate}
                  durationMinutes={duration}
                  selectedStart={selectedSlot?.start ?? null}
                  onSelect={setSelectedSlot}
                />
              </div>
            </>
          )}

          {!teacherId && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="warn">{t('no_teacher_found')}</Banner>
            </div>
          )}

          {create.error && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="error">
                {!isTeacher && hasErrorCode(create.error, ...AVAILABILITY_ERROR_CODES)
                  ? t('slot_unavailable_error')
                  : create.error instanceof Error
                    ? create.error.message
                    : t('booking_failed')}
              </Banner>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            block
            disabled={isTeacher ? !canSubmitTeacher : !canSubmitStudent}
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
