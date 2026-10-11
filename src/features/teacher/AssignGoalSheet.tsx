import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button, FieldLabel, Segmented, Sheet, SuccessState, TextArea, TextField } from '@/ui'
import { useCreateGoal } from '@/hooks/useGoals'
import { errorMessage } from '@/lib/errors'
import { todayISO } from '@/lib/lesson'
import type { GoalType, Level } from '@/api/types'

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

interface Props {
  open: boolean
  studentId: string | null
  studentName?: string
  /** The student's current level: the default target. */
  defaultLevel: Level | null
  onClose: () => void
  onDone?: () => void
}

/** Teacher sets an exam goal (name + level + date) or a level goal (+ optional date). */
export function AssignGoalSheet({ open, studentId, studentName, defaultLevel, onClose, onDone }: Props) {
  const { t } = useTranslation()
  const create = useCreateGoal()
  const [type, setType] = useState<GoalType>('EXAM')
  const [examName, setExamName] = useState('')
  const [level, setLevel] = useState<Level>(defaultLevel ?? 'A1')
  const [targetDate, setTargetDate] = useState('')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setType('EXAM')
      setExamName('')
      setLevel(defaultLevel ?? 'A1')
      setTargetDate('')
      setNote('')
      setSubmitted(false)
      create.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!studentId) return null

  const isExam = type === 'EXAM'
  const canSubmit = (!isExam || (examName.trim().length > 0 && targetDate !== '')) && !create.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !studentId) return
    try {
      await create.mutateAsync({
        studentId,
        type,
        ...(isExam ? { examName: examName.trim() } : {}),
        targetLevel: level,
        ...(targetDate ? { targetDate } : {}),
        ...(note.trim() ? { note: note.trim() } : {}),
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
        <SuccessState icon="flag" title={t('goal_assigned_title')} sub={t('goal_assigned_sub')} />
      ) : (
        <form onSubmit={submit} style={{ padding: '0 20px 4px' }}>
          <div className="section-title" style={{ marginBottom: 4 }}>
            {t('assign_goal_title')}
          </div>
          {studentName && (
            <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', marginBottom: 18 }}>
              {t('for_student', { name: studentName })}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <Segmented
              ariaLabel={t('goal_type')}
              value={type}
              onChange={setType}
              options={[
                { key: 'EXAM', label: t('goal_type_exam') },
                { key: 'LEVEL', label: t('goal_type_level') },
              ]}
            />
          </div>

          {isExam && (
            <div style={{ marginBottom: 14 }}>
              <TextField
                label={t('goal_exam_name')}
                placeholder={t('goal_exam_placeholder')}
                value={examName}
                maxLength={100}
                onChange={(e) => setExamName(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <FieldLabel>{t('goal_target_level')}</FieldLabel>
            <Segmented
              ariaLabel={t('goal_target_level')}
              value={level}
              onChange={setLevel}
              options={LEVELS.map((l) => ({ key: l, label: l }))}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <TextField
              type="date"
              label={isExam ? t('goal_exam_date') : t('goal_target_date')}
              value={targetDate}
              min={todayISO()}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <TextArea
              label={t('goal_note')}
              placeholder={t('goal_note_placeholder')}
              value={note}
              maxLength={2000}
              rows={2}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {create.error && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="error">
                {errorMessage(create.error, t, 'assign_failed')}
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
