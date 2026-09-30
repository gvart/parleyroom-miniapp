import type { TFunction } from 'i18next'
import type { Lesson } from '@/api/types'
import { formatShortDate, formatWeekdayShort } from './intl'

export function lessonDate(scheduledAt: string): string {
  return scheduledAt.slice(0, 10)
}

export function lessonTime(scheduledAt: string): string {
  return scheduledAt.slice(11, 16)
}

export function todayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function tomorrowISO(): string {
  const now = new Date()
  now.setDate(now.getDate() + 1)
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** ISO date `offsetDays` from today (negative = past). Used to window `/lessons` queries. */
export function addDaysISO(offsetDays: number): string {
  const now = new Date()
  now.setDate(now.getDate() + offsetDays)
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "Today" / "Tomorrow" / "Wed 8 Oct" — date-aware label for a lesson's scheduled date. */
export function lessonDateLabel(scheduledAt: string, t: TFunction): string {
  const date = lessonDate(scheduledAt)
  if (date === todayISO()) return t('today')
  if (date === tomorrowISO()) return t('tomorrow')
  return `${formatWeekdayShort(new Date(`${date}T00:00:00`))} ${formatShortDate(scheduledAt)}`
}

/** True if `userId` is a participant (teacher or enrolled student) of the lesson. */
export function isLessonParticipant(lesson: Lesson, userId: string): boolean {
  return lesson.teacherId === userId || lesson.students.some((s) => s.id === userId)
}

export function isClub(lesson: Lesson): boolean {
  return lesson.type !== 'ONE_ON_ONE'
}

/** Translation key for a club lesson's type label, or null for 1:1 lessons. */
export function clubLabelKey(lesson: Lesson): string | null {
  if (lesson.type === 'SPEAKING_CLUB') return 'type_speaking_club'
  if (lesson.type === 'READING_CLUB') return 'type_reading_club'
  return null
}
