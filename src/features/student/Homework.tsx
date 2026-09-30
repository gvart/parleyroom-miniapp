import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Banner,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Pill,
  Segmented,
  Sheet,
  StatChip,
  SuccessState,
  TextArea,
  type PillTone,
} from '@/ui'
import {
  useHomework,
  useHomeworkDetail,
  useSaveHomeworkAnswers,
  useSubmitHomework,
} from '@/hooks/useHomework'
import { computeDue, dueLabel, isDoneStatus, isOpenStatus, isReviewStatus, type DueInfo } from '@/lib/homework'
import type { HomeworkSummary, HomeworkStatus } from '@/api/types'

type Tab = 'open' | 'review' | 'done'

const TABS: Array<{ key: Tab; labelKey: string }> = [
  { key: 'open', labelKey: 'tab_open' },
  { key: 'review', labelKey: 'tab_reviewed' },
  { key: 'done', labelKey: 'tab_done' },
]

const TILE: Record<Tab, { background: string; color: string }> = {
  open: { background: 'var(--sunny-soft)', color: 'var(--sunny-ink)' },
  review: { background: 'var(--sky-soft)', color: 'var(--sky-ink)' },
  done: { background: 'var(--leaf-soft)', color: 'var(--leaf-ink)' },
}
const TILE_ICON: Record<Tab, string> = { open: 'edit_note', review: 'rate_review', done: 'task_alt' }

function dueTone(d: DueInfo): PillTone {
  if (d.kind === 'overdue') return 'live'
  if (d.kind === 'today') return 'warn'
  return 'neutral'
}

function statusLabel(status: HomeworkStatus, t: ReturnType<typeof useTranslation>['t']): string {
  switch (status) {
    case 'SUBMITTED':
      return t('submitted')
    case 'REVIEWED':
      return t('reviewed')
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
  const [openTask, setOpenTask] = useState<HomeworkSummary | null>(null)

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
      <PageHeader eyebrow={t('homework')} title={t('tasks')} />

      {!isEmpty && (
        <div
          style={{
            padding: '0 16px 16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}
        >
          <StatChip icon="pending_actions" value={groups.open.length} label={t('tab_open')} tone="coral" />
          <StatChip icon="rate_review" value={groups.review.length} label={t('tab_reviewed')} tone="sky" />
          <StatChip icon="task_alt" value={groups.done.length} label={t('tab_done')} tone="leaf" />
        </div>
      )}

      {!isEmpty && (
        <div style={{ padding: '0 16px 16px' }}>
          <Segmented
            options={TABS.map(({ key, labelKey }) => ({
              key,
              label: t(labelKey),
              count: groups[key].length,
            }))}
            value={tab}
            onChange={setTab}
          />
        </div>
      )}

      {isEmpty ? (
        <EmptyState
          icon="task_alt"
          title={t('empty_homework_title')}
          sub={t('empty_homework_sub')}
        />
      ) : list.length > 0 ? (
        <div style={{ padding: '0 16px' }}>
          <Card padded={false} className="row-list" style={{ overflow: 'hidden' }}>
            {list.map((h) => {
              const due = computeDue(h.dueDate)
              const tone = dueTone(due)
              const sLabel = statusLabel(h.status, t)
              return (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => setOpenTask(h)}
                  className="row-btn"
                >
                  <span className="icon-tile" style={TILE[tab]}>
                    <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
                      {TILE_ICON[tab]}
                    </span>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 700, marginBottom: 4 }}>
                      {h.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {(due.kind !== 'none' || tab === 'open') && (
                        <Pill tone={tone}>{dueLabel(due, t, { prefixed: true })}</Pill>
                      )}
                      {sLabel && (
                        <span
                          style={{
                            fontSize: 'var(--text-caption)',
                            fontWeight: 700,
                            color: 'var(--ink-2)',
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
        <EmptyState
          icon="done_all"
          title={t('empty_stack_title')}
          sub={t('empty_stack_sub')}
        />
      )}

      <HomeworkSubmitSheet task={openTask} onClose={() => setOpenTask(null)} />
    </div>
  )
}

interface SheetProps {
  task: HomeworkSummary | null
  onClose: () => void
}

function HomeworkSubmitSheet({ task, onClose }: SheetProps) {
  const { t } = useTranslation()
  const detailQuery = useHomeworkDetail(task?.id ?? null)
  const saveAnswers = useSaveHomeworkAnswers()
  const submit = useSubmitHomework()
  const [text, setText] = useState('')
  const [submittedOk, setSubmittedOk] = useState(false)

  const detail = detailQuery.data
  const item = detail?.items.find((i) => i.kind === 'TASK' && i.responseType === 'TEXT') ?? null

  useEffect(() => {
    if (task) setSubmittedOk(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id])

  useEffect(() => {
    if (!item) return
    const existing = detail?.units.find((u) => u.assignmentItemId === item.id)
    setText(existing?.answer?.text ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, detail?.units])

  if (!task) return null

  const due = computeDue(task.dueDate)
  const dueText = due.kind === 'none' ? '' : dueLabel(due, t, { prefixed: true })
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const isPending = saveAnswers.isPending || submit.isPending
  const canSubmit = !!item && text.trim().length > 0 && !isPending
  const submitError = saveAnswers.error ?? submit.error

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!task || !item || !canSubmit) return
    try {
      await saveAnswers.mutateAsync({
        id: task.id,
        body: { answers: [{ assignmentItemId: item.id, answer: { text: text.trim() } }] },
      })
      await submit.mutateAsync(task.id)
      setSubmittedOk(true)
      setTimeout(onClose, 1200)
    } catch {
      /* error surfaces via submitError */
    }
  }

  return (
    <Sheet open={!!task} onClose={onClose}>
      <div style={{ padding: '0 16px 4px' }}>
        {submittedOk ? (
          <SuccessState icon="check" title={t('submitted_title')} sub={t('submitted_sub')} />
        ) : (
          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 18 }}>
              {dueText && (
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  {dueText}
                </div>
              )}
              <h2 className="section-title" style={{ margin: 0 }}>
                {task.title}
              </h2>
            </div>

            {detail?.instructions && (
              <div
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--ink-2)',
                  lineHeight: 1.5,
                  marginBottom: 16,
                  padding: '12px 14px',
                  borderRadius: 18,
                }}
                className="glass-inner"
              >
                {detail.instructions}
              </div>
            )}

            {detail?.feedback && (
              <div
                style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--ink-2)',
                  lineHeight: 1.5,
                  marginBottom: 16,
                  padding: '12px 14px',
                  borderRadius: 18,
                }}
                className="glass-inner"
              >
                <div className="eyebrow" style={{ marginBottom: 4 }}>
                  {t('teacher_feedback')}
                </div>
                {detail.feedback}
              </div>
            )}

            {item ? (
              <>
                <TextArea
                  label={t('notes')}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('submission_placeholder')}
                  disabled={!isOpenStatus(task.status)}
                  rows={5}
                  style={{ lineHeight: 1.5, marginBottom: 8 }}
                />
                <div
                  style={{
                    fontSize: 'var(--text-caption)',
                    fontWeight: 700,
                    color: 'var(--ink-3)',
                    textAlign: 'right',
                    marginBottom: 18,
                  }}
                >
                  {t('words_count', { count: wordCount })}
                </div>
              </>
            ) : (
              !detailQuery.isLoading && (
                <div style={{ marginBottom: 18 }}>
                  <Banner tone="info">{t('homework_unsupported')}</Banner>
                </div>
              )
            )}

            {submitError && (
              <Banner tone="error" style={{ marginBottom: 12 }}>
                {submitError instanceof Error ? submitError.message : t('submit_failed')}
              </Banner>
            )}

            {item && isOpenStatus(task.status) && (
              <Button type="submit" block disabled={!canSubmit} loading={isPending} leadingIcon="send">
                {t('ok_submit')}
              </Button>
            )}
          </form>
        )}
      </div>
    </Sheet>
  )
}
