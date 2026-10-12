import type { TFunction } from 'i18next'
import type { GoalTrackStatus, StudentGoal, UserProfile } from '@/api/types'
import type { PillTone } from '@/ui'

/** Goals live behind the server-side `roadmap` flag; while it's off the goal routes 404. */
export function roadmapEnabled(user: Pick<UserProfile, 'role' | 'features'>): boolean {
  return user.role === 'STUDENT' && user.features?.roadmap === true
}

/** "Milestone 3 of 7" / "All milestones done": the text alternative for the path. */
export function pathLabel(goal: StudentGoal, t: TFunction): string {
  const total = goal.milestones.length
  const current = goal.milestones.findIndex((m) => m.current)
  if (current < 0) return t('goal_all_done')
  return t('goal_milestone_of', { current: current + 1, total })
}

const STATUS_TONE: Record<Exclude<GoalTrackStatus, 'NO_ROADMAP'>, PillTone> = {
  AHEAD: 'accent',
  ON_TRACK: 'moss',
  BEHIND: 'warn',
}

/** Encouraging chip for a goal with a roadmap; null while the teacher is still preparing it. */
export function statusChip(status: GoalTrackStatus, t: TFunction): { tone: PillTone; label: string } | null {
  if (status === 'NO_ROADMAP') return null
  return { tone: STATUS_TONE[status], label: t(`goal_status_${status}`) }
}
