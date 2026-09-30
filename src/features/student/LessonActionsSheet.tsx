import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Banner, Button, Pill, Sheet } from '@/ui'
import {
  useAcceptReschedule,
  useCancelLesson,
  useJoinLesson,
  useRejectReschedule,
  useWithdrawReschedule,
} from '@/hooks/useLessonActions'
import { clubLabelKey, isClub, lessonTime } from '@/lib/lesson'
import { formatShortDate } from '@/lib/intl'
import type { Lesson } from '@/api/types'
import { RescheduleSheet } from './RescheduleSheet'

interface Props {
  open: boolean
  lesson: Lesson | null
  onClose: () => void
}

export function LessonActionsSheet({ open, lesson, onClose }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const join = useJoinLesson()
  const cancel = useCancelLesson()
  const acceptReschedule = useAcceptReschedule()
  const rejectReschedule = useRejectReschedule()
  const withdrawReschedule = useWithdrawReschedule()
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!lesson) return null

  const club = isClub(lesson)
  const enrolled = lesson.students.some((s) => s.id === user.id)
  const capacity = lesson.maxParticipants
  const atCapacity = capacity != null && lesson.students.length >= capacity
  const canJoin = club && !enrolled && !atCapacity && lesson.status !== 'CANCELLED'
  const pendingReschedule = lesson.pendingReschedule
  const rescheduleProposedByMe = pendingReschedule?.requestedBy === user.id
  // Backend only allows rescheduling CONFIRMED lessons (400 LESSON_INVALID_STATE
  // otherwise) — a pending REQUEST isn't scheduled yet, there's nothing to move.
  const canReschedule = lesson.status === 'CONFIRMED' && !pendingReschedule
  const canCancel =
    lesson.status !== 'CANCELLED' && lesson.status !== 'COMPLETED'
  const canJoinLive = lesson.status === 'IN_PROGRESS'

  async function handleJoin() {
    if (!lesson) return
    try {
      await join.mutateAsync(lesson.id)
      onClose()
    } catch {
      /* error via join.error */
    }
  }

  async function handleCancel() {
    if (!lesson) return
    try {
      await cancel.mutateAsync({ id: lesson.id })
      onClose()
    } catch {
      /* error via cancel.error */
    }
  }

  async function handleAcceptReschedule() {
    if (!lesson) return
    try {
      await acceptReschedule.mutateAsync(lesson.id)
      onClose()
    } catch {
      /* error via acceptReschedule.error */
    }
  }

  async function handleRejectReschedule() {
    if (!lesson) return
    try {
      await rejectReschedule.mutateAsync(lesson.id)
      onClose()
    } catch {
      /* error via rejectReschedule.error */
    }
  }

  async function handleWithdrawReschedule() {
    if (!lesson) return
    try {
      await withdrawReschedule.mutateAsync(lesson.id)
      onClose()
    } catch {
      /* error via withdrawReschedule.error */
    }
  }

  return (
    <>
      <Sheet open={open} onClose={onClose}>
        <div style={{ padding: '0 20px 4px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            {lesson.status === 'IN_PROGRESS' && (
              <Pill tone="live">
                <span className="live-dot" />
                {t('live')}
              </Pill>
            )}
            {club && <Pill tone="violet">{t(clubLabelKey(lesson) ?? '')}</Pill>}
            {lesson.pendingReschedule && <Pill tone="warn">{t('reschedule_pending')}</Pill>}
            {enrolled && club && <Pill tone="accent">{t('pill_joined')}</Pill>}
          </div>
          <div className="section-title" style={{ marginBottom: 4 }}>
            {lesson.topic}
          </div>
          <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', marginBottom: 18 }}>
            {formatShortDate(lesson.scheduledAt)} · {lessonTime(lesson.scheduledAt)} · {lesson.durationMinutes}m
            {club && capacity
              ? ` · ${lesson.students.length}/${capacity}`
              : ''}
          </div>

          {pendingReschedule && (
            <div style={{ marginBottom: 16 }}>
              <Banner tone="warn" icon="schedule">
                {t(rescheduleProposedByMe ? 'reschedule_proposed_by_you_note' : 'reschedule_pending_note', {
                  time: `${pendingReschedule.newScheduledAt.slice(0, 10)} ${pendingReschedule.newScheduledAt.slice(11, 16)}`,
                })}
              </Banner>
            </div>
          )}

          {(join.error || cancel.error || acceptReschedule.error || rejectReschedule.error || withdrawReschedule.error) && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="error">
                {(join.error ?? cancel.error ?? acceptReschedule.error ?? rejectReschedule.error ?? withdrawReschedule.error) instanceof Error
                  ? ((join.error ?? cancel.error ?? acceptReschedule.error ?? rejectReschedule.error ?? withdrawReschedule.error) as Error).message
                  : t('action_failed')}
              </Banner>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {canJoinLive && (
              <Button
                variant="primary"
                block
                leadingIcon="videocam"
                onClick={() => {
                  navigate(`/lessons/${lesson.id}/live`)
                  onClose()
                }}
              >
                {t('join_now')}
              </Button>
            )}

            {canJoin && (
              <Button
                variant="primary"
                block
                leadingIcon="group_add"
                loading={join.isPending}
                onClick={handleJoin}
              >
                {t('join_club')}
              </Button>
            )}

            {canReschedule && (
              <Button
                variant="secondary"
                block
                leadingIcon="schedule"
                onClick={() => setRescheduleOpen(true)}
              >
                {t('reschedule_cta')}
              </Button>
            )}

            {pendingReschedule && rescheduleProposedByMe && (
              <Button
                variant="secondary"
                block
                leadingIcon="undo"
                loading={withdrawReschedule.isPending}
                onClick={handleWithdrawReschedule}
              >
                {t('reschedule_withdraw')}
              </Button>
            )}

            {pendingReschedule && !rescheduleProposedByMe && (
              <>
                <Button
                  variant="primary"
                  block
                  leadingIcon="check"
                  loading={acceptReschedule.isPending}
                  onClick={handleAcceptReschedule}
                >
                  {t('reschedule_accept')}
                </Button>
                <Button
                  variant="secondary"
                  block
                  leadingIcon="close"
                  loading={rejectReschedule.isPending}
                  onClick={handleRejectReschedule}
                >
                  {t('reschedule_reject')}
                </Button>
              </>
            )}

            {canCancel && (
              confirmCancel ? (
                <Banner tone="error" icon="delete">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ flex: 1 }}>{t('cancel_confirm')}</span>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={cancel.isPending}
                      onClick={handleCancel}
                    >
                      {t('cancel_yes')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmCancel(false)}
                    >
                      {t('cancel_no')}
                    </Button>
                  </div>
                </Banner>
              ) : (
                <Button
                  variant="danger"
                  block
                  leadingIcon="close"
                  onClick={() => setConfirmCancel(true)}
                >
                  {t('cancel_lesson')}
                </Button>
              )
            )}
          </div>
        </div>
      </Sheet>

      <RescheduleSheet
        open={rescheduleOpen}
        lesson={lesson}
        onClose={() => setRescheduleOpen(false)}
        onDone={onClose}
      />
    </>
  )
}
