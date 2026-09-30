import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, EmptyState, PageHeader, Pill, Segmented, StatChip, type PillTone } from '@/ui'
import { useHomework } from '@/hooks/useHomework'
import { computeDue, dueLabel, isDoneStatus, isOpenStatus, isReviewStatus, isReworkStatus, type DueInfo } from '@/lib/homework'
import type { HomeworkStatus } from '@/api/types'

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
  const navigate = useNavigate()
  const homeworkQuery = useHomework()
  const [tab, setTab] = useState<Tab>('open')

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
              const rework = isReworkStatus(h)
              return (
                <button
                  type="button"
                  key={h.id}
                  onClick={() => navigate(`/homework/${h.id}`)}
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
                      {rework && <Pill tone="live">{t('hw_returned')}</Pill>}
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
    </div>
  )
}
