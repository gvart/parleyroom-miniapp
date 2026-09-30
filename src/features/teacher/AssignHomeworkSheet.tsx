import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button, Sheet, SuccessState, TextField, TextArea } from '@/ui'
import { useCreateAssignment } from '@/hooks/useHomework'

interface Props {
  open: boolean
  studentId: string | null
  studentName?: string
  onClose: () => void
  onDone?: () => void
}

export function AssignHomeworkSheet({ open, studentId, studentName, onClose, onDone }: Props) {
  const { t } = useTranslation()
  const create = useCreateAssignment()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setDueDate('')
      setSubmitted(false)
      create.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!studentId) return null

  const canSubmit = title.trim().length > 0 && !create.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !studentId) return
    try {
      await create.mutateAsync({
        title: title.trim(),
        studentIds: [studentId],
        dueDate: dueDate || null,
        items: [
          {
            kind: 'TASK',
            title: title.trim(),
            task: description.trim() || title.trim(),
            responseType: 'TEXT',
          },
        ],
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
        <SuccessState icon="task_alt" title={t('homework_assigned_title')} sub={t('homework_assigned_sub')} />
      ) : (
        <form onSubmit={submit} style={{ padding: '0 20px 4px' }}>
          <div className="section-title" style={{ marginBottom: 4 }}>
            {t('assign_homework_title')}
          </div>
          {studentName && (
            <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', marginBottom: 18 }}>
              {t('for_student', { name: studentName })}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <TextField
              label={t('homework_title_label')}
              placeholder={t('homework_title_placeholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <TextArea
              label={t('homework_description_label')}
              placeholder={t('homework_description_placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <TextField
              type="date"
              label={t('homework_due_label')}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
            leadingIcon="task_alt"
          >
            {t('assign_homework_cta')}
          </Button>
        </form>
      )}
    </Sheet>
  )
}
