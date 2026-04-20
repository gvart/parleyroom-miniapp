import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button, Sheet, TextField, TextArea } from '@/ui'
import { useCreateHomework } from '@/hooks/useHomework'
import type { HomeworkCategory } from '@/api/types'

interface Props {
  open: boolean
  studentId: string | null
  studentName?: string
  onClose: () => void
  onDone?: () => void
}

const CATEGORIES: Array<{ key: HomeworkCategory; labelKey: string }> = [
  { key: 'WRITING', labelKey: 'writing' },
  { key: 'READING', labelKey: 'reading' },
  { key: 'GRAMMAR', labelKey: 'grammar' },
  { key: 'VOCABULARY', labelKey: 'vocab' },
  { key: 'LISTENING', labelKey: 'listening' },
]

export function AssignHomeworkSheet({ open, studentId, studentName, onClose, onDone }: Props) {
  const { t } = useTranslation()
  const create = useCreateHomework()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<HomeworkCategory>('WRITING')
  const [dueDate, setDueDate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setCategory('WRITING')
      setDueDate('')
      setSubmitted(false)
      create.reset()
    }
  }, [open, create])

  if (!studentId) return null

  const canSubmit = title.trim().length > 0 && !create.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !studentId) return
    try {
      await create.mutateAsync({
        studentId,
        title: title.trim(),
        description: description.trim() || null,
        category,
        dueDate: dueDate || null,
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
              task_alt
            </span>
          </div>
          <div className="serif" style={{ fontSize: 26, marginBottom: 4 }}>
            {t('homework_assigned_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            {t('homework_assigned_sub')}
          </div>
        </div>
      ) : (
        <form onSubmit={submit} style={{ padding: '0 22px 10px' }}>
          <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>
            {t('assign_homework_title')}
          </div>
          {studentName && (
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>
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
            <div
              style={{
                fontSize: 11,
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {t('homework_category_label')}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map((c) => {
                const active = category === c.key
                return (
                  <button
                    type="button"
                    key={c.key}
                    onClick={() => setCategory(c.key)}
                    className="tap"
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid var(--hair)',
                      background: active ? 'var(--ink)' : 'transparent',
                      color: active ? 'var(--bg)' : 'var(--ink)',
                    }}
                  >
                    {t(c.labelKey)}
                  </button>
                )
              })}
            </div>
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
