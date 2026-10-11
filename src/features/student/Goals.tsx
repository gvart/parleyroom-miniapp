import { useTranslation } from 'react-i18next'
import { Card, EmptyState, PageHeader, Pill, Ring, Section, type Tone } from '@/ui'
import { formatShortDate } from '@/lib/intl'
import { useGoals } from '@/hooks/useGoals'
import type { Goal } from '@/api/types'
import { goalPercent, goalPercentHint, goalPercentLabel, goalTitle } from '@/lib/goal'

const TONES: Tone[] = ['leaf', 'grape', 'sunny', 'coral', 'sky', 'accent']

/** Read-only: the teacher sets goals and the backend computes their progress. */
export function Goals() {
  const { t } = useTranslation()
  const goalsQuery = useGoals({ status: 'ACTIVE' })

  const goals = goalsQuery.data ?? []
  const isEmpty = !goalsQuery.isLoading && goals.length === 0

  return (
    <div>
      <PageHeader eyebrow={t('goals')} title={t('your_rhythm')} />

      {isEmpty ? (
        <EmptyState icon="flag" title={t('empty_goals_title')} sub={t('empty_goals_sub')} />
      ) : (
        <Section eyebrow={t('this_week')}>
          {goals.map((g, i) => (
            <GoalCard key={g.id} goal={g} tone={TONES[i % TONES.length]} />
          ))}
        </Section>
      )}
    </div>
  )
}

function GoalCard({ goal, tone }: { goal: Goal; tone: Tone }) {
  const { t } = useTranslation()
  const meta = [
    goal.type === 'EXAM' ? goal.targetLevel : null,
    goal.targetDate ? t('target_by', { date: formatShortDate(goal.targetDate) }) : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const hint = goalPercentHint(goal, t)
  const onTrack = goal.progress.onTrack

  return (
    <Card style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <Ring value={goalPercent(goal) ?? 0} size={58} stroke={5} tone={tone} label={goalPercentLabel(goal)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 700, marginBottom: 3 }}>
            {goalTitle(goal, t)}
          </div>
          {meta && (
            <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--ink-2)' }}>{meta}</div>
          )}
          {hint ? (
            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-3)', marginTop: 4 }}>{hint}</div>
          ) : (
            onTrack != null && (
              <div style={{ marginTop: 6 }}>
                <Pill tone={onTrack ? 'moss' : 'warn'}>{onTrack ? t('goal_on_track') : t('goal_behind')}</Pill>
              </div>
            )
          )}
        </div>
      </div>
      {goal.note && (
        <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', fontStyle: 'italic', marginTop: 10 }}>
          {goal.note}
        </div>
      )}
    </Card>
  )
}
