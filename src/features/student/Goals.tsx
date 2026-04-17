import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Card, Ring, Section, Sheet } from '@/ui'
import { useAbandonGoal, useCompleteGoal, useCreateGoal, useGoals } from '@/hooks/useGoals'
import type { Goal } from '@/api/types'

const HUES = [172, 290, 75, 25, 210, 145]

export function Goals() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const goalsQuery = useGoals('ACTIVE')
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
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="tap"
            style={{
              border: 0,
              background: 'var(--ink)',
              color: 'var(--bg)',
              padding: '10px 18px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('set_goal')}
          </button>
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
  const [menuOpen, setMenuOpen] = useState(false)

  const meta =
    goal.setBy === 'TEACHER' ? t('set_by_teacher') : t('set_by_you')
  const targetMeta = goal.targetDate
    ? `${meta} · ${t('target_by', { date: goal.targetDate.slice(5) })}`
    : meta

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
            display: 'flex',
            gap: 8,
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid var(--hair)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              complete.mutate(goal.id)
              setMenuOpen(false)
            }}
            disabled={complete.isPending}
            className="tap"
            style={{
              flex: 1,
              border: 0,
              background: 'var(--ink)',
              color: 'var(--bg)',
              padding: '10px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('complete')}
          </button>
          <button
            type="button"
            onClick={() => {
              abandon.mutate(goal.id)
              setMenuOpen(false)
            }}
            disabled={abandon.isPending}
            className="tap"
            style={{
              flex: 1,
              border: '1px solid var(--hair-strong)',
              background: 'transparent',
              color: 'var(--ink)',
              padding: '10px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('abandon')}
          </button>
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
    }
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

  const labelStyle = {
    fontSize: 11,
    color: 'var(--ink-3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontWeight: 600,
    marginBottom: 8,
  }
  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--card)',
    color: 'var(--ink)',
    border: '1px solid var(--hair)',
    borderRadius: 14,
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
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
          <div style={labelStyle}>{t('goal_description_label')}</div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('goal_description_placeholder')}
            style={inputStyle}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={labelStyle}>{t('goal_target_date')}</div>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {create.error && (
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
            {create.error instanceof Error ? create.error.message : 'Create failed'}
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
          }}
        >
          {create.isPending ? `${t('set_goal')}…` : t('set_goal')}
        </button>
      </form>
    </Sheet>
  )
}

