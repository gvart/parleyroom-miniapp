import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button, Sheet, SuccessState, TextArea, TextField } from '@/ui'
import { useRequestReschedule } from '@/hooks/useLessonActions'
import { lessonDate, lessonTime } from '@/lib/lesson'
import { formatShortDate } from '@/lib/intl'
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
    // `request` is a fresh object on every render (TanStack Query v5), so
    // depending on it would re-run this effect on each keystroke and wipe
    // the form. Only re-initialize when the sheet opens or the lesson changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lesson])

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
        <SuccessState icon="schedule_send" title={t('reschedule_sent_title')} sub={t('reschedule_sent_sub')} />
      ) : (
        <form onSubmit={submit} style={{ padding: '0 20px 4px' }}>
          <div className="section-title" style={{ marginBottom: 4 }}>
            {t('reschedule_title')}
          </div>
          <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', marginBottom: 18 }}>
            {lesson.topic} · {formatShortDate(lesson.scheduledAt)} · {lessonTime(lesson.scheduledAt)}
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
