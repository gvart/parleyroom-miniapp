import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Banner, Button, Card, Ring, Section, Sheet, TextField } from '@/ui'
import {
  useAbandonGoal,
  useCompleteGoal,
  useCreateGoal,
  useDeleteGoal,
  useGoals,
  useUpdateGoalProgress,
} from '@/hooks/useGoals'
import type { Goal } from '@/api/types'

const HUES = [172, 290, 75, 25, 210, 145]
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
      <div
        style={{
          padding: '8px 20px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
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
            {t('goals')}
          </div>
          <div
            className="serif"
            style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            {t('your_rhythm')}
            <span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="tap"
          aria-label={t('new_goal')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: 'var(--ink)',
            color: 'var(--bg)',
            border: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span className="ms" style={{ fontSize: 20 }}>
            add
          </span>
        </button>
      </div>

      {isEmpty ? (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>◌</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
            {t('empty_goals_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
            {t('empty_goals_sub')}
          </div>
          <Button variant="primary" size="sm" onClick={() => setSheetOpen(true)}>
            {t('set_goal')}
          </Button>
        </div>
      ) : (
        <Section eyebrow={t('this_week')}>
          {goals.map((g, i) => (
            <GoalCard key={g.id} goal={g} hue={HUES[i % HUES.length]} />
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

function GoalCard({ goal, hue }: { goal: Goal; hue: number }) {
  const { t } = useTranslation()
  const complete = useCompleteGoal()
  const abandon = useAbandonGoal()
  const remove = useDeleteGoal()
  const updateProgress = useUpdateGoalProgress()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const meta = goal.setBy === 'TEACHER' ? t('set_by_teacher') : t('set_by_you')
  const targetMeta = goal.targetDate
    ? `${meta} · ${t('target_by', { date: goal.targetDate.slice(5) })}`
    : meta

  const anyError = complete.error ?? abandon.error ?? remove.error ?? updateProgress.error

  return (
    <Card style={{ marginBottom: 10, position: 'relative' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Ring value={goal.progress} size={58} stroke={5} hue={hue} label={`${goal.progress}%`} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>
            {goal.description}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{targetMeta}</div>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((m) => !m)}
          className="tap"
          aria-label="More"
          style={{
            width: 32,
            height: 32,
            borderRadius: 999,
            background: 'var(--bg-2)',
            border: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink-2)',
          }}
        >
          <span className="ms" style={{ fontSize: 16 }}>
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
              {t('progress_label')}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {PROGRESS_STEPS.map((p) => {
                const active = Math.abs(goal.progress - p) < 5
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateProgress.mutate({ id: goal.id, progress: p })}
                    disabled={updateProgress.isPending || active}
                    className="tap"
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: active ? 'default' : 'pointer',
                      border: '1px solid var(--hair)',
                      background: active ? 'var(--ink)' : 'transparent',
                      color: active ? 'var(--bg)' : 'var(--ink)',
                    }}
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
                variant="ghost"
                aria-label={t('delete')}
                onClick={() => setConfirmDelete(true)}
                style={{ color: 'oklch(0.55 0.2 25)' }}
              >
                <span className="ms" style={{ fontSize: 18 }}>
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
      <form onSubmit={submit} style={{ padding: '0 22px 10px' }}>
        <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>
          {t('new_goal')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>
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
              {create.error instanceof Error ? create.error.message : 'Create failed'}
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
