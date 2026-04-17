import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CategoryDot, Pill, Sheet, StatChip, type PillTone } from '@/ui'
import { useHomework, useSubmitHomework } from '@/hooks/useHomework'
import {
  categorySlug,
  computeDue,
  isDoneStatus,
  isOpenStatus,
  isReviewStatus,
  type DueInfo,
} from '@/lib/homework'
import type { Homework as HomeworkItem, HomeworkStatus } from '@/api/types'

type Tab = 'open' | 'review' | 'done'

const TABS: Array<{ key: Tab; labelKey: string }> = [
  { key: 'open', labelKey: 'tab_open' },
  { key: 'review', labelKey: 'tab_reviewed' },
  { key: 'done', labelKey: 'tab_done' },
]

function dueTone(d: DueInfo): PillTone {
  if (d.kind === 'overdue') return 'live'
  if (d.kind === 'today') return 'warn'
  return 'neutral'
}

function dueLabel(d: DueInfo, t: ReturnType<typeof useTranslation>['t']): string {
  if (d.kind === 'overdue') return t('overdue')
  if (d.kind === 'today') return t('today')
  if (d.kind === 'tomorrow') return `${t('due')} ${t('tomorrow')}`
  if (d.kind === 'date') return `${t('due')} ${d.label}`
  return t('due')
}

function statusLabel(status: HomeworkStatus, t: ReturnType<typeof useTranslation>['t']): string {
  switch (status) {
    case 'SUBMITTED':
      return t('submitted')
    case 'IN_REVIEW':
      return t('in_review')
    case 'REJECTED':
      return t('rejected')
    case 'DONE':
      return t('done')
    case 'OPEN':
      return ''
  }
}

export function Homework() {
  const { t } = useTranslation()
  const homeworkQuery = useHomework()
  const [tab, setTab] = useState<Tab>('open')
  const [openTask, setOpenTask] = useState<HomeworkItem | null>(null)

  const groups = useMemo(() => {
    const all = homeworkQuery.data?.homework ?? []
    return {
      open: all.filter((h) => isOpenStatus(h.status)),
      review: all.filter((h) => isReviewStatus(h.status)),
      done: all.filter((h) => isDoneStatus(h.status)),
    }
  }, [homeworkQuery.data])

  const list = groups[tab]
  const isLoading = homeworkQuery.isLoading
  const isEmpty =
    !isLoading && groups.open.length === 0 && groups.review.length === 0 && groups.done.length === 0

  return (
    <div>
      <div style={{ padding: '8px 20px 14px' }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {t('homework')}
        </div>
        <div className="serif" style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em' }}>
          {t('tasks')}
          <span style={{ color: 'var(--accent)' }}>.</span>
        </div>
      </div>

      {!isEmpty && (
        <div
          style={{
            padding: '0 20px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          <StatChip icon="pending_actions" value={groups.open.length} label="open" hue={25} />
          <StatChip icon="rate_review" value={groups.review.length} label="reviewed" hue={210} />
          <StatChip icon="task_alt" value={groups.done.length} label="done" hue={172} />
        </div>
      )}

      {!isEmpty && (
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {TABS.map(({ key, labelKey }) => (
              <button
                type="button"
                key={key}
                onClick={() => setTab(key)}
                className="tap"
                style={{
                  flex: 1,
                  padding: '9px 10px',
                  borderRadius: 999,
                  border: '1px solid var(--hair)',
                  background: tab === key ? 'var(--ink)' : 'transparent',
                  color: tab === key ? 'var(--bg)' : 'var(--ink-2)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {t(labelKey)} · {groups[key].length}
              </button>
            ))}
          </div>
        </div>
      )}

      {isEmpty ? (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>◌</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
            {t('empty_homework_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('empty_homework_sub')}</div>
        </div>
      ) : list.length > 0 ? (
        <div style={{ padding: '0 20px' }}>
          <Card padded={false}>
            {list.map((h, i) => {
              const due = computeDue(h.dueDate)
              const tone = dueTone(due)
              const sLabel = statusLabel(h.status, t)
              return (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => setOpenTask(h)}
                  className="tap"
                  style={{
                    width: '100%',
                    border: 0,
                    background: 'transparent',
                    color: 'var(--ink)',
                    textAlign: 'left',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderBottom: i < list.length - 1 ? '1px solid var(--hair)' : 0,
                    cursor: 'pointer',
                  }}
                >
                  <CategoryDot cat={categorySlug(h.category)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{h.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {(due.kind !== 'none' || tab === 'open') && (
                        <Pill tone={tone}>{dueLabel(due, t)}</Pill>
                      )}
                      {sLabel && (
                        <span
                          style={{
                            fontSize: 11,
                            color: 'var(--ink-3)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {sLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }}>
                    chevron_right
                  </span>
                </button>
              )
            })}
          </Card>
        </div>
      ) : (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>✓</div>
          <div className="serif" style={{ fontSize: 20, marginBottom: 4 }}>
            {t('empty_stack_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('empty_stack_sub')}</div>
        </div>
      )}

      <HomeworkSubmitSheet task={openTask} onClose={() => setOpenTask(null)} />
    </div>
  )
}

interface SheetProps {
  task: HomeworkItem | null
  onClose: () => void
}

function HomeworkSubmitSheet({ task, onClose }: SheetProps) {
  const { t } = useTranslation()
  const submit = useSubmitHomework()
  const [text, setText] = useState('')
  const [submittedOk, setSubmittedOk] = useState(false)

  useEffect(() => {
    if (task) {
      setText(task.submissionText ?? '')
      setSubmittedOk(false)
    }
  }, [task])

  if (!task) return null

  const due = computeDue(task.dueDate)
  const dueText =
    due.kind === 'overdue'
      ? t('overdue')
      : due.kind === 'today'
        ? t('today')
        : due.kind === 'tomorrow'
          ? `${t('due')} ${t('tomorrow')}`
          : due.kind === 'date'
            ? `${t('due')} ${due.label}`
            : ''
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const canSubmit = text.trim().length > 0 && !submit.isPending

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!task || !canSubmit) return
    try {
      await submit.mutateAsync({ id: task.id, body: { submissionText: text.trim() } })
      setSubmittedOk(true)
      setTimeout(onClose, 1200)
    } catch {
      /* error surfaces via submit.error */
    }
  }

  return (
    <Sheet open={!!task} onClose={onClose}>
      <div style={{ padding: '0 22px 10px' }}>
        {submittedOk ? (
          <div style={{ textAlign: 'center', padding: '36px 10px' }}>
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
              {t('submitted_title')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('submitted_sub')}</div>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 18 }}>
              <CategoryDot cat={categorySlug(task.category)} />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600,
                    marginBottom: 3,
                  }}
                >
                  {task.category.toLowerCase()}
                  {dueText && ` · ${dueText}`}
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 24, lineHeight: 1.15, letterSpacing: '-0.01em' }}
                >
                  {task.title}
                </div>
              </div>
            </div>

            {task.description && (
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--ink-2)',
                  lineHeight: 1.5,
                  marginBottom: 16,
                  padding: '12px 14px',
                  background: 'var(--bg-2)',
                  borderRadius: 12,
                }}
              >
                {task.description}
              </div>
            )}

            {task.teacherFeedback && task.status === 'REJECTED' && (
              <div
                style={{
                  fontSize: 13,
                  color: 'oklch(0.5 0.18 25)',
                  lineHeight: 1.5,
                  marginBottom: 16,
                  padding: '12px 14px',
                  background: 'oklch(0.96 0.05 25)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  {t('teacher_feedback')}
                </div>
                {task.teacherFeedback}
              </div>
            )}

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
              {t('notes')}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('submission_placeholder')}
              style={{
                width: '100%',
                minHeight: 110,
                padding: '12px 14px',
                background: 'var(--card)',
                color: 'var(--ink)',
                border: '1px solid var(--hair)',
                borderRadius: 14,
                fontSize: 14,
                lineHeight: 1.5,
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                marginBottom: 10,
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: 'var(--ink-3)',
                textAlign: 'right',
                marginBottom: 18,
              }}
            >
              {wordCount} / 200 words
            </div>

            {submit.error && (
              <div
                style={{
                  marginBottom: 12,
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: 'oklch(0.96 0.05 25)',
                  color: 'oklch(0.5 0.18 25)',
                  fontSize: 13,
                }}
              >
                {submit.error instanceof Error ? submit.error.message : 'Submit failed'}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="tap"
              style={{
                width: '100%',
                border: 0,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                background: canSubmit ? 'var(--ink)' : 'var(--hair-strong)',
                color: canSubmit ? 'var(--bg)' : 'var(--ink-3)',
                padding: '14px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span className="ms fill" style={{ fontSize: 18 }}>
                send
              </span>
              {submit.isPending ? `${t('ok_submit')}…` : t('ok_submit')}
            </button>
          </form>
        )}
      </div>
    </Sheet>
  )
}
