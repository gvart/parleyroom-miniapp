import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Banner, Button, Pill, Sheet } from '@/ui'
import {
  useCancelLesson,
  useJoinLesson,
} from '@/hooks/useLessonActions'
import { isClub, lessonDate, lessonTime } from '@/lib/lesson'
import type { Lesson } from '@/api/types'
import { RescheduleSheet } from './RescheduleSheet'
import { LessonReflectSheet } from './LessonReflectSheet'

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
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [reflectOpen, setReflectOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (!lesson) return null

  const club = isClub(lesson)
  const enrolled = lesson.students.some((s) => s.id === user.id)
  const capacity = lesson.maxParticipants
  const atCapacity = capacity != null && lesson.students.length >= capacity
  const canJoin = club && !enrolled && !atCapacity && lesson.status !== 'CANCELLED'
  const canReschedule =
    (lesson.status === 'CONFIRMED' || lesson.status === 'REQUEST') &&
    !lesson.pendingReschedule
  const canCancel =
    lesson.status !== 'CANCELLED' && lesson.status !== 'COMPLETED'
  const canReflect =
    lesson.status === 'COMPLETED' || lesson.status === 'IN_PROGRESS'
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

  return (
    <>
      <Sheet open={open} onClose={onClose}>
        <div style={{ padding: '0 22px 10px' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            {lesson.status === 'IN_PROGRESS' && (
              <Pill tone="live">
                <span className="live-dot" />
                {t('live')}
              </Pill>
            )}
            {club && <Pill tone="violet">{lesson.type === 'SPEAKING_CLUB' ? 'SC' : 'RC'}</Pill>}
            {lesson.pendingReschedule && <Pill tone="warn">{t('reschedule_pending')}</Pill>}
            {enrolled && club && <Pill tone="accent">{t('pill_joined')}</Pill>}
          </div>
          <div className="serif" style={{ fontSize: 24, letterSpacing: '-0.01em', marginBottom: 4 }}>
            {lesson.topic}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>
            {lessonDate(lesson.scheduledAt)} · {lessonTime(lesson.scheduledAt)} · {lesson.durationMinutes}m
            {club && capacity
              ? ` · ${lesson.students.length}/${capacity}`
              : ''}
          </div>

          {lesson.pendingReschedule && (
            <div style={{ marginBottom: 16 }}>
              <Banner tone="warn" icon="schedule">
                {t('reschedule_pending_note', {
                  time: `${lesson.pendingReschedule.newScheduledAt.slice(0, 10)} ${lesson.pendingReschedule.newScheduledAt.slice(11, 16)}`,
                })}
              </Banner>
            </div>
          )}

          {(join.error || cancel.error) && (
            <div style={{ marginBottom: 12 }}>
              <Banner tone="error">
                {(join.error ?? cancel.error) instanceof Error
                  ? ((join.error ?? cancel.error) as Error).message
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

            {canReflect && (
              <Button
                variant="secondary"
                block
                leadingIcon="edit_note"
                onClick={() => setReflectOpen(true)}
              >
                {t('add_reflection')}
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
                  variant="ghost"
                  block
                  leadingIcon="close"
                  onClick={() => setConfirmCancel(true)}
                  style={{ color: 'oklch(0.55 0.2 25)' }}
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
      <LessonReflectSheet
        open={reflectOpen}
        lesson={lesson}
        onClose={() => setReflectOpen(false)}
        onDone={onClose}
      />
    </>
  )
}
