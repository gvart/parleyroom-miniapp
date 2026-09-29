import type { HomeworkStatus } from '@/api/types'
import { todayISO, tomorrowISO } from './lesson'
import { formatShortDate } from './intl'

export type DueKind = 'overdue' | 'today' | 'tomorrow' | 'date' | 'none'

export interface DueInfo {
  kind: DueKind
  label: string
}

export function computeDue(dueDate: string | null): DueInfo {
  if (!dueDate) return { kind: 'none', label: '' }
  const today = todayISO()
  const tomorrow = tomorrowISO()
  if (dueDate < today) return { kind: 'overdue', label: '' }
  if (dueDate === today) return { kind: 'today', label: '' }
  if (dueDate === tomorrow) return { kind: 'tomorrow', label: '' }
  return { kind: 'date', label: formatShortDate(dueDate) }
}

export function isOpenStatus(s: HomeworkStatus): boolean {
  return s === 'OPEN'
}

export function isReviewStatus(s: HomeworkStatus): boolean {
  return s === 'SUBMITTED' || s === 'REVIEWED'
}

export function isDoneStatus(s: HomeworkStatus): boolean {
  return s === 'DONE'
}
