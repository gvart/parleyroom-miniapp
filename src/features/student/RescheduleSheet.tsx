import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Banner, Button, Sheet, SuccessState, TextArea } from '@/ui'
import { useRequestReschedule } from '@/hooks/useLessonActions'
import { hasErrorCode } from '@/lib/errors'
import { lessonDate, lessonTime } from '@/lib/lesson'
import { formatShortDate } from '@/lib/intl'
import { SlotPicker } from './SlotPicker'
import type { AvailableSlot, Lesson } from '@/api/types'

const AVAILABILITY_ERROR_CODES = [
  'AVAILABILITY_SLOT_BLOCKED',
  'AVAILABILITY_OVERLAP',
  'AVAILABILITY_MIN_NOTICE',
  'AVAILABILITY_BUFFER_CONFLICT',
]

interface Props {
  open: boolean
  lesson: Lesson | null
  onClose: () => void
  onDone?: () => void
}

export function RescheduleSheet({ open, lesson, onClose, onDone }: Props) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const request = useRequestReschedule()
  const [date, setDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open && lesson) {
      setDate(lessonDate(lesson.scheduledAt))
      setSelectedSlot(null)
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

  const canSubmit = Boolean(selectedSlot) && !request.isPending

  function changeDate(next: string) {
    setDate(next)
    setSelectedSlot(null)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !lesson || !selectedSlot) return
    try {
      await request.mutateAsync({
        id: lesson.id,
        body: { newScheduledAt: selectedSlot.start, note: note.trim() || null },
      })
      setSubmitted(true)
      setTimeout(() => {
        onDone?.()
        onClose()
      }, 1200)
    } catch (err) {
      // The slot list is now stale either way — pick again against a fresh fetch.
      if (hasErrorCode(err, ...AVAILABILITY_ERROR_CODES)) {
        setSelectedSlot(null)
        void qc.invalidateQueries({ queryKey: ['available-slots'] })
      }
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

          <div style={{ marginBottom: 18 }}>
            <SlotPicker
              teacherId={lesson.teacherId}
              date={date}
              onDateChange={changeDate}
              durationMinutes={lesson.durationMinutes}
              selectedStart={selectedSlot?.start ?? null}
              onSelect={setSelectedSlot}
            />
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
                {hasErrorCode(request.error, ...AVAILABILITY_ERROR_CODES)
                  ? t('slot_unavailable_error')
                  : request.error instanceof Error
                    ? request.error.message
                    : t('reschedule_failed')}
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
