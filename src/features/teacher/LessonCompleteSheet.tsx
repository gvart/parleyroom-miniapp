import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button, Sheet, SuccessState, TextArea } from '@/ui'
import { useCompleteLesson, useUpdateLessonContent } from '@/hooks/useLessonActions'
import type { Lesson } from '@/api/types'

interface Props {
  open: boolean
  lesson: Lesson | null
  onClose: () => void
  onDone?: () => void
}

export function LessonCompleteSheet({ open, lesson, onClose, onDone }: Props) {
  const { t } = useTranslation()
  const updateContent = useUpdateLessonContent()
  const complete = useCompleteLesson()
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setNotes('')
      setSubmitted(false)
      updateContent.reset()
      complete.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!lesson) return null

  const isPending = updateContent.isPending || complete.isPending
  const canSubmit = !isPending
  const error = updateContent.error ?? complete.error

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !lesson) return
    try {
      const entered = notes.trim()
      if (entered) {
        const appended = lesson.rawNotes ? `${lesson.rawNotes}\n${entered}` : entered
        await updateContent.mutateAsync({ id: lesson.id, body: { rawNotes: appended } })
      }
      await complete.mutateAsync(lesson.id)
      setSubmitted(true)
      setTimeout(() => {
        onDone?.()
        onClose()
      }, 1800)
    } catch {
      /* surfaced via error */
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      {submitted ? (
        <SuccessState
          icon="check"
          title={t('lesson_completed_title')}
          sub={t('lesson_completed_sub')}
          extra={t('lesson_completed_portal_hint')}
        />
      ) : (
        <form onSubmit={submit} style={{ padding: '0 20px 4px' }}>
          <div className="section-title" style={{ marginBottom: 4 }}>
            {t('complete_lesson_title')}
          </div>
          <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', marginBottom: 18 }}>
            {lesson.topic}
          </div>

          <div style={{ marginBottom: 18 }}>
            <TextArea
              label={t('teacher_notes_label')}
              placeholder={t('teacher_notes_placeholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="error">
                {error instanceof Error ? error.message : t('complete_failed')}
              </Banner>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            block
            disabled={!canSubmit}
            loading={isPending}
            leadingIcon="check"
          >
            {t('complete_lesson_cta')}
          </Button>
        </form>
      )}
    </Sheet>
  )
}
