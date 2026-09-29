import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Banner, Button, Card, EmptyState, PageHeader, Ring, Section, Sheet, TextField, type Tone } from '@/ui'
import { formatShortDate } from '@/lib/intl'
import {
  useAbandonGoal,
  useCompleteGoal,
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoalProgress,
} from '@/hooks/useGoals'
import type { Goal } from '@/api/types'

const TONES: Tone[] = ['leaf', 'grape', 'sunny', 'coral', 'sky', 'accent']
const PROGRESS_STEPS = [0, 25, 50, 75, 100] as const

export function Goals() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goalsQuery = useGoals({ status: 'ACTIVE' })
  const [sheetOpen, setSheetOpen] = useState(false)

  const goals = goalsQuery.data?.goals ?? []
  const isEmpty = !goalsQuery.isLoading && goals.length === 0

  return (
    <div>
      <PageHeader
        eyebrow={t('goals')}
        title={t('your_rhythm')}
        action={
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="btn-primary"
            aria-label={t('new_goal')}
            style={{ width: 44, minHeight: 44, padding: 0 }}
          >
            <span className="ms" style={{ fontSize: 24 }} aria-hidden="true">
              add
            </span>
          </button>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon="flag"
          title={t('empty_goals_title')}
          sub={t('empty_goals_sub')}
          action={
            <Button leadingIcon="add" onClick={() => setSheetOpen(true)}>
              {t('set_goal')}
            </Button>
          }
        />
      ) : (
        <Section eyebrow={t('this_week')}>
          {goals.map((g, i) => (
            <GoalCard key={g.id} goal={g} tone={TONES[i % TONES.length]} />
          ))}
        </Section>
      )}

      <NewGoalSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={() => {
          setSheetOpen(false)
          navigate('/goals', { replace: true })
        }}
      />
    </div>
  )
}

function GoalCard({ goal, tone }: { goal: Goal; tone: Tone }) {
  const { t } = useTranslation()
  const complete = useCompleteGoal()
  const abandon = useAbandonGoal()
  const remove = useDeleteGoal()
  const updateProgress = useUpdateGoalProgress()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const meta = goal.setBy === 'TEACHER' ? t('set_by_teacher') : t('set_by_you')
  const targetMeta = goal.targetDate
    ? `${meta} · ${t('target_by', { date: formatShortDate(goal.targetDate) })}`
    : meta

  const anyError = complete.error ?? abandon.error ?? remove.error ?? updateProgress.error

  return (
    <Card style={{ marginBottom: 10, position: 'relative' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Ring value={goal.progress} size={58} stroke={5} tone={tone} label={`${goal.progress}%`} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 700, marginBottom: 3 }}>
            {goal.description}
          </div>
          <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--ink-2)' }}>{targetMeta}</div>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((m) => !m)}
          className="ico-btn"
          aria-label={t('more_options')}
          aria-expanded={menuOpen}
          style={{ width: 38, height: 38 }}
        >
          <span className="ms" style={{ fontSize: 20 }} aria-hidden="true">
            more_horiz
          </span>
        </button>
      </div>

      {menuOpen && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid var(--hair)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              {t('progress_label')}
            </div>
            <div className="seg">
              {PROGRESS_STEPS.map((p) => {
                const active = Math.abs(goal.progress - p) < 5
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateProgress.mutate({ id: goal.id, progress: p })}
                    disabled={updateProgress.isPending || active}
                    className={active ? 'on' : undefined}
                    style={{ cursor: active ? 'default' : 'pointer' }}
                  >
                    {p}%
                  </button>
                )
              })}
            </div>
          </div>

          {anyError && (
            <Banner tone="error">
              {anyError instanceof Error ? anyError.message : t('action_failed')}
            </Banner>
          )}

          {confirmDelete ? (
            <Banner tone="error" icon="delete">
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ flex: 1 }}>{t('delete_goal_confirm')}</span>
                <Button
                  size="sm"
                  variant="danger"
                  loading={remove.isPending}
                  onClick={() => remove.mutate(goal.id)}
                >
                  {t('delete')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                >
                  {t('cancel_no')}
                </Button>
              </div>
            </Banner>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="sm"
                variant="primary"
                block
                loading={complete.isPending}
                onClick={() => {
                  complete.mutate(goal.id)
                  setMenuOpen(false)
                }}
              >
                {t('complete')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                block
                loading={abandon.isPending}
                onClick={() => {
                  abandon.mutate(goal.id)
                  setMenuOpen(false)
                }}
              >
                {t('abandon')}
              </Button>
              <Button
                size="sm"
                variant="danger"
                aria-label={t('delete')}
                onClick={() => setConfirmDelete(true)}
              >
                <span className="ms" style={{ fontSize: 18 }} aria-hidden="true">
                  delete_outline
                </span>
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

interface NewGoalProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

function NewGoalSheet({ open, onClose, onCreated }: NewGoalProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const create = useCreateGoal()
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')

  useEffect(() => {
    if (open) {
      setDescription('')
      setTargetDate('')
      create.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const canSubmit = description.trim().length > 0 && !create.isPending

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    try {
      await create.mutateAsync({
        studentId: user.id,
        description: description.trim(),
        targetDate: targetDate || null,
      })
      onCreated()
    } catch {
      /* error surfaces via create.error */
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <form onSubmit={submit} style={{ padding: '0 20px 4px' }}>
        <div className="section-title" style={{ marginBottom: 4 }}>
          {t('new_goal')}
        </div>
        <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', marginBottom: 18 }}>
          {t('empty_goals_sub')}
        </div>

        <div style={{ marginBottom: 14 }}>
          <TextField
            label={t('goal_description_label')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('goal_description_placeholder')}
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
              {create.error instanceof Error ? create.error.message : t('create_failed')}
            </Banner>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          block
          disabled={!canSubmit}
          loading={create.isPending}
        >
          {t('set_goal')}
        </Button>
      </form>
    </Sheet>
  )
}
