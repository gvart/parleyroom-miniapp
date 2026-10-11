import type { TFunction } from 'i18next'
import type { Goal } from '@/api/types'

/** Progress percent, or null when the backend can't compute it (empty checklist, or the goal's teacher was deleted). */
export function goalPercent(goal: Goal): number | null {
  return goal.progress.percent
}

export function goalPercentLabel(goal: Goal): string {
  const percent = goalPercent(goal)
  return percent == null ? '—' : `${percent}%`
}

/** "telc B1" for an exam goal, "Reach B1" for a level goal. */
export function goalTitle(goal: Goal, t: TFunction): string {
  return goal.type === 'EXAM' && goal.examName ? goal.examName : t('goal_reach_level', { level: goal.targetLevel })
}

/** Why a goal has no percent yet; null when it has one. */
export function goalPercentHint(goal: Goal, t: TFunction): string | null {
  if (goal.progress.percent != null) return null
  return goal.teacherId ? t('goal_progress_pending') : t('goal_teacher_gone')
}
