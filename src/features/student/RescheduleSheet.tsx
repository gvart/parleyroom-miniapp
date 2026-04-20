import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button, Sheet, TextArea, TextField } from '@/ui'
import { useRequestReschedule } from '@/hooks/useLessonActions'
import { lessonDate, lessonTime } from '@/lib/lesson'
import type { Lesson } from '@/api/types'

interface Props {
  open: boolean
  lesson: Lesson | null
  onClose: () => void
  onDone?: () => void
}

export function RescheduleSheet({ open, lesson, onClose, onDone }: Props) {
  const { t } = useTranslation()
  const request = useRequestReschedule()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open && lesson) {
      setDate(lessonDate(lesson.scheduledAt))
      setTime(lessonTime(lesson.scheduledAt))
      setNote('')
      setSubmitted(false)
      request.reset()
    }
  }, [open, lesson, request])

  if (!lesson) return null

  const canSubmit = Boolean(date) && Boolean(time) && !request.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !lesson) return
    const newScheduledAt = new Date(`${date}T${time}:00`).toISOString()
    try {
      await request.mutateAsync({
        id: lesson.id,
        body: { newScheduledAt, note: note.trim() || null },
      })
      setSubmitted(true)
      setTimeout(() => {
        onDone?.()
        onClose()
      }, 1200)
    } catch {
      /* surfaced via request.error */
    }
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
              schedule_send
            </span>
          </div>
          <div className="serif" style={{ fontSize: 26, marginBottom: 4 }}>
            {t('reschedule_sent_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            {t('reschedule_sent_sub')}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ padding: '0 22px 10px' }}>
          <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>
            {t('reschedule_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>
            {lesson.topic} · {lessonDate(lesson.scheduledAt)} · {lessonTime(lesson.scheduledAt)}
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
            <TextArea
              label={t('reschedule_note_label')}
              placeholder={t('reschedule_note_placeholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {request.error && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="error">
                {request.error instanceof Error ? request.error.message : t('reschedule_failed')}
              </Banner>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            block
            disabled={!canSubmit}
            loading={request.isPending}
            leadingIcon="schedule_send"
          >
            {t('reschedule_cta')}
          </Button>
        </form>
      )}
    </Sheet>
  )
}
