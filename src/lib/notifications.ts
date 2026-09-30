import type { TFunction } from 'i18next'
import type { Notification, NotificationType } from '@/api/types'
import { activeIntlLocale } from './intl'

export function notificationIcon(type: NotificationType): string {
  if (type.startsWith('HOMEWORK')) return 'edit_note'
  if (type.startsWith('LESSON') || type.startsWith('RESCHEDULE') || type.startsWith('JOIN') || type === 'CLUB_JOINED') {
    return 'videocam'
  }
  if (type.startsWith('VOCAB')) return 'menu_book'
  if (type === 'MATERIAL_SHARED' || type === 'MATERIAL_ATTACHED_TO_LESSON') return 'description'
  if (type === 'FOLDER_SHARED') return 'folder_shared'
  return 'notifications'
}

const NOTIF_KEY: Record<NotificationType, string> = {
  LESSON_CREATED: 'notif_lesson_created',
  LESSON_REQUESTED: 'notif_lesson_requested',
  LESSON_ACCEPTED: 'notif_lesson_accepted',
  LESSON_CANCELLED: 'notif_lesson_cancelled',
  LESSON_MOVED: 'notif_lesson_moved',
  LESSON_BOOKED: 'notif_lesson_booked',
  LESSON_STARTED: 'notif_lesson_started',
  LESSON_COMPLETED: 'notif_lesson_completed',
  RESCHEDULE_REQUESTED: 'notif_reschedule_requested',
  RESCHEDULE_ACCEPTED: 'notif_reschedule_accepted',
  RESCHEDULE_REJECTED: 'notif_reschedule_rejected',
  JOIN_REQUESTED: 'notif_join_requested',
  JOIN_ACCEPTED: 'notif_join_accepted',
  JOIN_REJECTED: 'notif_join_rejected',
  CLUB_JOINED: 'notif_club_joined',
  VOCAB_REVIEW_DUE: 'notif_vocab_review_due',
  MATERIAL_SHARED: 'notif_material_shared',
  FOLDER_SHARED: 'notif_folder_shared',
  MATERIAL_ATTACHED_TO_LESSON: 'notif_material_attached',
  HOMEWORK_ASSIGNED: 'notif_homework_assigned',
  HOMEWORK_SUBMITTED: 'notif_homework_submitted',
  HOMEWORK_REVIEWED: 'notif_homework_reviewed',
  HOMEWORK_RETURNED: 'notif_homework_returned',
}

export function notificationText(n: Notification, t: TFunction): string {
  const who = `${n.actor.firstName} ${n.actor.lastName}`
  return t(NOTIF_KEY[n.type], { who })
}

export function relativeTime(iso: string, t: TFunction, now: number = Date.now()): string {
  const time = new Date(iso).getTime()
  if (Number.isNaN(time)) return ''
  const diff = Math.max(0, Math.round((now - time) / 1000))
  if (diff < 30) return t('time_just_now')
  if (diff < 60) return t('time_seconds_ago', { count: diff })
  const m = Math.round(diff / 60)
  if (m < 60) return t('time_minutes_ago', { count: m })
  const h = Math.round(m / 60)
  if (h < 24) return t('time_hours_ago', { count: h })
  const d = Math.round(h / 24)
  if (d < 7) return t('time_days_ago', { count: d })
  return new Date(iso).toLocaleDateString(activeIntlLocale())
}
