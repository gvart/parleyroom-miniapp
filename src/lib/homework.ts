import type { HomeworkCategory, HomeworkStatus } from '@/api/types'
import { todayISO, tomorrowISO } from './lesson'

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
  return { kind: 'date', label: dueDate.slice(5) }
}

const CATEGORY_TO_DESIGN: Record<HomeworkCategory, string> = {
  WRITING: 'writing',
  READING: 'reading',
  GRAMMAR: 'grammar',
  VOCABULARY: 'vocabulary',
  LISTENING: 'listening',
}

export function categorySlug(c: HomeworkCategory): string {
  return CATEGORY_TO_DESIGN[c]
}

export function isOpenStatus(s: HomeworkStatus): boolean {
  return s === 'OPEN'
}

export function isReviewStatus(s: HomeworkStatus): boolean {
  return s === 'SUBMITTED' || s === 'IN_REVIEW' || s === 'REJECTED'
}

export function isDoneStatus(s: HomeworkStatus): boolean {
  return s === 'DONE'
}
