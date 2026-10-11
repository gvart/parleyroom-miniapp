import type { TFunction } from 'i18next'
import type { Goal } from '@/api/types'

/** Progress percent, or null when the backend can't compute it (e.g. the goal's teacher was deleted). */
export function goalPercent(goal: Goal): number | null {
  const p = goal.progress
  return typeof p === 'number' ? p : (p?.percent ?? null)
}

export function goalPercentLabel(goal: Goal): string {
  const percent = goalPercent(goal)
  return percent == null ? '—' : `${percent}%`
}

/** Older goals carry a free-text description; auto-tracked ones only an exam name or a target level. */
export function goalTitle(goal: Goal, t: TFunction): string {
  return goal.description || goal.examName || (goal.targetLevel ? t('goal_reach_level', { level: goal.targetLevel }) : '')
}
