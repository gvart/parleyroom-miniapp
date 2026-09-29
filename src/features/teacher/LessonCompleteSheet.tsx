import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button, Sheet, TextArea } from '@/ui'
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
        <div style={{ textAlign: 'center', padding: '36px 22px' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              background: 'var(--accent-soft)',
              color: 'var(--accent-ink)',
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
          <div className="font-headline" style={{ fontSize: 26, marginBottom: 4 }}>
            {t('lesson_completed_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            {t('lesson_completed_sub')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>
            {t('lesson_completed_portal_hint')}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ padding: '0 22px 10px' }}>
          <div className="font-headline" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>
            {t('complete_lesson_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>
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
