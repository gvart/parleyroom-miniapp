import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button, Sheet, TextArea } from '@/ui'
import { useReflectOnLesson } from '@/hooks/useLessonActions'
import type { Lesson } from '@/api/types'

interface Props {
  open: boolean
  lesson: Lesson | null
  onClose: () => void
  onDone?: () => void
}

const ratingLabels = ['', 'rating_1', 'rating_2', 'rating_3', 'rating_4', 'rating_5']

export function LessonReflectSheet({ open, lesson, onClose, onDone }: Props) {
  const { t } = useTranslation()
  const reflect = useReflectOnLesson()
  const [rating, setRating] = useState(0)
  const [reflection, setReflection] = useState('')
  const [hardToday, setHardToday] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setRating(0)
      setReflection('')
      setHardToday('')
      setSubmitted(false)
      reflect.reset()
    }
  }, [open, reflect])

  if (!lesson) return null

  const hasContent = rating > 0 || reflection.trim() !== '' || hardToday.trim() !== ''
  const canSubmit = hasContent && !reflect.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !lesson) return
    const prefix = rating > 0 ? `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}\n` : ''
    const text = reflection.trim()
    const combined = text ? `${prefix}${text}` : prefix.trim() || null
    try {
      await reflect.mutateAsync({
        id: lesson.id,
        body: {
          studentReflection: combined,
          studentHardToday: hardToday.trim() || null,
        },
      })
      setSubmitted(true)
      setTimeout(() => {
        onDone?.()
        onClose()
      }, 1200)
    } catch {
      /* surfaced via reflect.error */
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
              favorite
            </span>
          </div>
          <div className="serif" style={{ fontSize: 26, marginBottom: 4 }}>
            {t('reflection_saved_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            {t('reflection_saved_sub')}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ padding: '0 22px 10px' }}>
          <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>
            {t('reflection_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>
            {t('reflection_sub', { topic: lesson.topic })}
          </div>

          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                marginBottom: 10,
              }}
            >
              {t('how_was_it')}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = rating >= n
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(rating === n ? 0 : n)}
                    aria-label={t(ratingLabels[n])}
                    className="tap"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      border: '1px solid var(--hair)',
                      background: active ? 'var(--accent-soft)' : 'transparent',
                      color: active ? 'var(--accent-deep)' : 'var(--ink-3)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="ms fill" style={{ fontSize: 22 }}>
                      {active ? 'star' : 'star_outline'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <TextArea
              label={t('reflection_went_well_label')}
              placeholder={t('reflection_went_well_placeholder')}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <TextArea
              label={t('reflection_hard_label')}
              placeholder={t('reflection_hard_placeholder')}
              value={hardToday}
              onChange={(e) => setHardToday(e.target.value)}
              rows={3}
            />
          </div>

          {reflect.error && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="error">
                {reflect.error instanceof Error
                  ? reflect.error.message
                  : t('reflection_failed')}
              </Banner>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            block
            disabled={!canSubmit}
            loading={reflect.isPending}
            leadingIcon="send"
          >
            {t('save_reflection')}
          </Button>
        </form>
      )}
    </Sheet>
  )
}
