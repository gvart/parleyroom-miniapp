import type { TFunction } from 'i18next'
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

/**
 * Display text for a `DueInfo`. `prefixed` adds "Due" before tomorrow/date
 * (matches the homework detail sheet); the bare form is used for list pills.
 */
export function dueLabel(d: DueInfo, t: TFunction, opts?: { prefixed?: boolean }): string {
  if (d.kind === 'overdue') return t('overdue')
  if (d.kind === 'today') return t('today')
  if (!opts?.prefixed) {
    if (d.kind === 'tomorrow') return t('tomorrow')
    if (d.kind === 'date') return d.label
    return t('due')
  }
  if (d.kind === 'tomorrow') return `${t('due')} ${t('tomorrow')}`
  if (d.kind === 'date') return `${t('due')} ${d.label}`
  return t('due')
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
