import type { Notification, NotificationType } from '@/api/types'

export function notificationIcon(type: NotificationType): string {
  if (type.startsWith('LESSON') || type.startsWith('RESCHEDULE') || type.startsWith('JOIN')) {
    return 'videocam'
  }
  if (type.startsWith('VOCAB')) return 'menu_book'
  return 'notifications'
}

export function notificationText(n: Notification): string {
  const who = `${n.actor.firstName} ${n.actor.lastName}`
  switch (n.type) {
    case 'LESSON_CREATED':
      return `${who} scheduled a new lesson.`
    case 'LESSON_REQUESTED':
      return `${who} requested a lesson.`
    case 'LESSON_ACCEPTED':
      return `${who} confirmed your lesson.`
    case 'LESSON_CANCELLED':
      return `${who} cancelled a lesson.`
    case 'LESSON_STARTED':
      return `Your lesson with ${who} just started.`
    case 'LESSON_COMPLETED':
      return `${who} marked your lesson as complete.`
    case 'RESCHEDULE_REQUESTED':
      return `${who} asked to reschedule a lesson.`
    case 'RESCHEDULE_ACCEPTED':
      return `${who} accepted your reschedule request.`
    case 'RESCHEDULE_REJECTED':
      return `${who} declined your reschedule request.`
    case 'JOIN_REQUESTED':
      return `${who} asked to join a club.`
    case 'JOIN_ACCEPTED':
      return `${who} accepted your join request.`
    case 'JOIN_REJECTED':
      return `${who} declined your join request.`
    case 'VOCAB_REVIEW_DUE':
      return 'You have words ready to review.'
  }
}

export function relativeTime(iso: string, now: number = Date.now()): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Math.max(0, Math.round((now - t) / 1000))
  if (diff < 30) return 'just now'
  if (diff < 60) return `${diff}s ago`
  const m = Math.round(diff / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}
