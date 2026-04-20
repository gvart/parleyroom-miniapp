import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button, Sheet, TextArea } from '@/ui'
import { useCompleteLesson } from '@/hooks/useLessonActions'
import type { Lesson } from '@/api/types'

interface Props {
  open: boolean
  lesson: Lesson | null
  onClose: () => void
  onDone?: () => void
}

export function LessonCompleteSheet({ open, lesson, onClose, onDone }: Props) {
  const { t } = useTranslation()
  const complete = useCompleteLesson()
  const [notes, setNotes] = useState('')
  const [wentWell, setWentWell] = useState('')
  const [workingOn, setWorkingOn] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open && lesson) {
      setNotes(lesson.teacherNotes ?? '')
      setWentWell(lesson.teacherWentWell ?? '')
      setWorkingOn(lesson.teacherWorkingOn ?? '')
      setSubmitted(false)
      complete.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lesson])

  if (!lesson) return null

  const canSubmit = !complete.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !lesson) return
    try {
      await complete.mutateAsync({
        id: lesson.id,
        body: {
          teacherNotes: notes.trim() || null,
          teacherWentWell: wentWell.trim() || null,
          teacherWorkingOn: workingOn.trim() || null,
        },
      })
      setSubmitted(true)
      setTimeout(() => {
        onDone?.()
        onClose()
      }, 1200)
    } catch {
      /* surfaced via complete.error */
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
              check
            </span>
          </div>
          <div className="serif" style={{ fontSize: 26, marginBottom: 4 }}>
            {t('lesson_completed_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            {t('lesson_completed_sub')}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ padding: '0 22px 10px' }}>
          <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>
            {t('complete_lesson_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>
            {lesson.topic}
          </div>

          <div style={{ marginBottom: 14 }}>
            <TextArea
              label={t('teacher_notes_label')}
              placeholder={t('teacher_notes_placeholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <TextArea
              label={t('went_well_label')}
              placeholder={t('went_well_placeholder')}
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              rows={2}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <TextArea
              label={t('working_on_label')}
              placeholder={t('working_on_placeholder')}
              value={workingOn}
              onChange={(e) => setWorkingOn(e.target.value)}
              rows={2}
            />
          </div>

          {complete.error && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="error">
                {complete.error instanceof Error
                  ? complete.error.message
                  : t('complete_failed')}
              </Banner>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            block
            disabled={!canSubmit}
            loading={complete.isPending}
            leadingIcon="check"
          >
            {t('complete_lesson_cta')}
          </Button>
        </form>
      )}
    </Sheet>
  )
}
