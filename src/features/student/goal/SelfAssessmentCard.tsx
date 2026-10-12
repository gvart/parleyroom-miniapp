import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import type { PendingSelfAssessment, SelfAssessmentAnswer } from '@/api/types'
import { useSelfAssessMilestone } from '@/hooks/useGoals'
import { errorMessage } from '@/lib/errors'
import { Banner, Button, Card, TextArea } from '@/ui'

const OPTIONS: Array<{ answer: SelfAssessmentAnswer; icon: string; labelKey: string }> = [
  { answer: 'YES', icon: 'sentiment_satisfied', labelKey: 'sa_yes' },
  { answer: 'PARTLY', icon: 'sentiment_neutral', labelKey: 'sa_partly' },
  { answer: 'NOT_YET', icon: 'hourglass_top', labelKey: 'sa_not_yet' },
]

const MAX_COMMENT = 1000

/** The teacher marked a milestone done: does the student feel the same? */
export function SelfAssessmentCard({ pending, onDone }: { pending: PendingSelfAssessment; onDone: () => void }) {
  const { t } = useTranslation()
  const assess = useSelfAssessMilestone()
  const [answer, setAnswer] = useState<SelfAssessmentAnswer | null>(null)
  const [comment, setComment] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!answer) return
    assess.mutate(
      { milestoneId: pending.milestoneId, body: { answer, comment: comment.trim() || null } },
      { onSuccess: onDone },
    )
  }

  return (
    <Card className="animate-in" style={{ borderColor: 'color-mix(in srgb, var(--accent-ink) 35%, transparent)' }}>
      <form onSubmit={submit}>
        <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
          <legend style={{ padding: 0 }}>
            <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span className="ms fill" style={{ fontSize: 16, color: 'var(--accent-ink)' }} aria-hidden="true">
                celebration
              </span>
              {t('sa_eyebrow')}
            </span>
            <span className="section-title" style={{ display: 'block' }}>
              {t('sa_title')}
            </span>
          </legend>
          <p style={{ margin: 0, paddingTop: 6, fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>
            {t('sa_intro')}
          </p>
          <blockquote
            style={{
              margin: '10px 0 16px',
              padding: '10px 14px',
              borderLeft: '4px solid var(--accent-face)',
              borderRadius: '4px 14px 14px 4px',
              background: 'var(--accent-soft)',
              fontSize: 'var(--text-card-title)',
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            {pending.canDo}
          </blockquote>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {OPTIONS.map((o) => {
              const on = answer === o.answer
              return (
                <button
                  key={o.answer}
                  type="button"
                  className="hw-option"
                  aria-pressed={on}
                  data-on={on || undefined}
                  onClick={() => setAnswer(o.answer)}
                  style={{ minHeight: 48, fontWeight: 700 }}
                >
                  <span className="ms" style={{ fontSize: 22, color: on ? 'var(--accent-ink)' : 'var(--ink-3)' }} aria-hidden="true">
                    {o.icon}
                  </span>
                  <span style={{ flex: 1 }}>{t(o.labelKey)}</span>
                  {on && (
                    <span className="ms fill" style={{ fontSize: 20, color: 'var(--accent-ink)' }} aria-hidden="true">
                      check_circle
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </fieldset>

        {answer && (
          <div style={{ marginTop: 14 }}>
            <TextArea
              label={t('sa_comment')}
              placeholder={t('sa_comment_placeholder')}
              value={comment}
              maxLength={MAX_COMMENT}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        )}

        {assess.isError && (
          <div style={{ marginTop: 12 }}>
            <Banner tone="error">{errorMessage(assess.error, t, 'action_failed')}</Banner>
          </div>
        )}

        <Button type="submit" block disabled={!answer} loading={assess.isPending} style={{ marginTop: 14 }}>
          {t('sa_submit')}
        </Button>
      </form>
    </Card>
  )
}
