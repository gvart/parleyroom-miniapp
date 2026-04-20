import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button, Sheet, TextField } from '@/ui'
import { useCreateGoal } from '@/hooks/useGoals'

interface Props {
  open: boolean
  studentId: string | null
  studentName?: string
  onClose: () => void
  onDone?: () => void
}

export function AssignGoalSheet({ open, studentId, studentName, onClose, onDone }: Props) {
  const { t } = useTranslation()
  const create = useCreateGoal()
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setDescription('')
      setTargetDate('')
      setSubmitted(false)
      create.reset()
    }
  }, [open, create])

  if (!studentId) return null

  const canSubmit = description.trim().length > 0 && !create.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !studentId) return
    try {
      await create.mutateAsync({
        studentId,
        description: description.trim(),
        targetDate: targetDate || null,
      })
      setSubmitted(true)
      setTimeout(() => {
        onDone?.()
        onClose()
      }, 1200)
    } catch {
      /* surfaced via create.error */
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
              flag
            </span>
          </div>
          <div className="serif" style={{ fontSize: 26, marginBottom: 4 }}>
            {t('goal_assigned_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            {t('goal_assigned_sub')}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ padding: '0 22px 10px' }}>
          <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>
            {t('assign_goal_title')}
          </div>
          {studentName && (
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>
              {t('for_student', { name: studentName })}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <TextField
              label={t('goal_description_label')}
              placeholder={t('goal_description_placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <TextField
              type="date"
              label={t('goal_target_date')}
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          {create.error && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="error">
                {create.error instanceof Error ? create.error.message : t('assign_failed')}
              </Banner>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            block
            disabled={!canSubmit}
            loading={create.isPending}
            leadingIcon="flag"
          >
            {t('assign_goal_cta')}
          </Button>
        </form>
      )}
    </Sheet>
  )
}
