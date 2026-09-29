import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Avatar, Button, Sheet } from '@/ui'
import { useLessons } from '@/hooks/useLessons'
import { useLiveKit, type LiveKitStatus } from '@/hooks/useLiveKit'
import { useStartLesson } from '@/hooks/useLessonActions'
import { VideoTile } from './VideoTile'
import { LessonAttachmentsList } from './LessonAttachmentsList'
import { LessonCompleteSheet } from '../teacher/LessonCompleteSheet'

const AUTO_REDIRECT_MS = 5000
const LIVE_STATUSES: LiveKitStatus[] = ['fetching-token', 'connecting', 'connected', 'lesson-not-started']

function fmtElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const STATUS_MESSAGE_KEY: Partial<Record<LiveKitStatus, string>> = {
  'fetching-token': 'live_status_fetching_token',
  connecting: 'live_status_connecting',
  'lesson-not-started': 'live_status_lesson_not_started',
  'permission-denied': 'live_status_permission_denied',
  unavailable: 'live_status_unavailable',
  error: 'live_status_error',
  disconnected: 'live_status_disconnected',
}

function statusMessageKey(status: LiveKitStatus): string | null {
  return STATUS_MESSAGE_KEY[status] ?? null
}

export function LessonLive() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const lessonsQuery = useLessons()
  const lesson = lessonsQuery.data?.lessons.find((l) => l.id === id)
  const live = useLiveKit(id)

  const [showRecap, setShowRecap] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const startLesson = useStartLesson()
  const startedRef = useRef(false)
  const isTeacher = user.role === 'TEACHER' || user.role === 'ADMIN'
  const canStart =
    isTeacher && lesson?.status === 'CONFIRMED' && !lesson.startedAt

  useEffect(() => {
    if (canStart && !startedRef.current) {
      startedRef.current = true
      startLesson.mutate(id!)
    }
    // startLesson is a mutation object recreated every render — intentionally
    // left out of deps (guarded by startedRef instead) so this only fires once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canStart, id])

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const elapsed = lesson?.startedAt
    ? Math.max(0, Math.floor((now - new Date(lesson.startedAt).getTime()) / 1000))
    : 0

  const teacher = lesson?.teacher
  const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : ''
  const teacherInitials = teacher
    ? `${teacher.firstName[0] ?? ''}${teacher.lastName[0] ?? ''}`.toUpperCase()
    : ''
  const userInitials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
  const statusKey = statusMessageKey(live.status)
  const banner = statusKey ? t(statusKey) : null
  const showLivePill = LIVE_STATUSES.includes(live.status)

  // Server-initiated end (teacher completed the lesson / room deleted) — the
  // student never pressed end-call themselves.
  const showFinishedCard = !isTeacher && live.status === 'disconnected'

  useEffect(() => {
    if (!showFinishedCard) return
    const timeout = setTimeout(() => navigate('/'), AUTO_REDIRECT_MS)
    return () => clearTimeout(timeout)
  }, [showFinishedCard, navigate])

  async function endCall() {
    await live.disconnect()
    if (isTeacher) {
      setCompleteOpen(true)
    } else {
      navigate(-1)
    }
  }

  if (showFinishedCard) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          color: 'var(--ink)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '30px 16px',
        }}
      >
        <div
          className="card animate-in"
          style={{
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 12,
          }}
        >
          <span
            className="icon-tile"
            style={{
              width: 76,
              height: 76,
              borderRadius: 26,
              background: 'var(--sunny-soft)',
              color: 'var(--sunny-ink)',
              animation: 'scale-in var(--spring-bouncy-ms) var(--spring-bouncy)',
            }}
          >
            <span className="ms fill" style={{ fontSize: 40 }} aria-hidden="true">
              celebration
            </span>
          </span>
          <h1 className="page-h1" style={{ marginTop: 6 }}>
            {t('lesson_finished_title')}
          </h1>
          <p className="page-sub" style={{ margin: 0, maxWidth: 300 }}>
            {t('lesson_finished_sub')}
          </p>
          <Button leadingIcon="home" onClick={() => navigate('/')} style={{ marginTop: 12 }}>
            {t('go_to_dashboard')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="dark"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--bg)',
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(60% 45% at 30% 30%, color-mix(in srgb, var(--blob-1) 45%, transparent), transparent 70%), radial-gradient(55% 45% at 75% 70%, color-mix(in srgb, var(--blob-2) 35%, transparent), transparent 70%)',
          }}
        />

        {live.remoteVideoTrack ? (
          <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
            <VideoTile track={live.remoteVideoTrack} />
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Avatar
              hue={140}
              initials={teacherInitials || '··'}
              size={120}
              live={live.status === 'connected'}
            />
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            top: 'calc(var(--tg-viewport-safe-area-inset-top, env(safe-area-inset-top)) + var(--tg-viewport-content-safe-area-inset-top, 0px) + 16px)',
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {showLivePill ? (
            <span className="countdown-chip is-live" style={{ background: 'var(--glass-bg-strong)' }}>
              <span className="live-dot" aria-hidden="true" />
              {live.status === 'connected' ? t('live_elapsed', { time: fmtElapsed(elapsed) }) : t('live')}
            </span>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="ico-btn"
            aria-label={t('back')}
            style={{ background: 'var(--glass-bg-strong)' }}
          >
            <span className="ms" style={{ fontSize: 22 }} aria-hidden="true">
              expand_more
            </span>
          </button>
        </div>

        {banner && (
          <div
            className="glass animate-in"
            style={{
              position: 'absolute',
              top: 'calc(var(--tg-viewport-safe-area-inset-top, env(safe-area-inset-top)) + var(--tg-viewport-content-safe-area-inset-top, 0px) + 76px)',
              left: 16,
              right: 16,
              padding: '12px 16px',
              borderRadius: 20,
              background: 'var(--glass-bg-strong)',
              color: 'var(--ink)',
              fontSize: 'var(--text-small)',
              fontWeight: 700,
              lineHeight: 1.4,
              textAlign: 'center',
            }}
          >
            {banner}
            {live.errorMessage && (
              <div style={{ marginTop: 6, fontSize: 'var(--text-caption)', fontWeight: 400, color: 'var(--ink-2)' }}>
                {live.errorMessage}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 16,
            width: 92,
            height: 132,
            borderRadius: 22,
            background: 'linear-gradient(180deg, var(--grape-soft), var(--glass-bg-strong))',
            border: '2px solid var(--glass-border)',
            boxShadow: 'var(--shadow-2)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {live.cameraEnabled && live.localVideoTrack ? (
            <VideoTile track={live.localVideoTrack} mirror />
          ) : live.cameraEnabled ? (
            <Avatar hue={290} initials={userInitials} size={48} src={user.avatarUrl} />
          ) : (
            <span className="ms" style={{ fontSize: 28, color: 'var(--ink-2)' }} aria-hidden="true">
              videocam_off
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '0 12px calc(var(--tg-viewport-safe-area-inset-bottom, env(safe-area-inset-bottom)) + 12px)' }}>
        <div className="glass-chrome" style={{ borderRadius: 'var(--radius-chrome)', padding: '16px 16px 18px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              className="font-headline"
              style={{
                fontSize: 'var(--text-card-title)',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {lesson?.topic ?? teacherName}
            </div>
            <Button variant="secondary" size="sm" leadingIcon="note_alt" onClick={() => setShowRecap(true)}>
              {t('notes_button')}
            </Button>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 14,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CallBtn
              icon={live.micEnabled ? 'mic' : 'mic_off'}
              active={live.micEnabled}
              onClick={() => void live.setMic(!live.micEnabled)}
            />
            <CallBtn
              icon={live.cameraEnabled ? 'videocam' : 'videocam_off'}
              active={live.cameraEnabled}
              onClick={() => void live.setCamera(!live.cameraEnabled)}
            />
            <button
              type="button"
              onClick={() => void endCall()}
              className="btn-primary"
              aria-label={t('end_call')}
              style={{
                width: 64,
                height: 64,
                padding: 0,
                background: 'var(--coral-vivid)',
                color: 'var(--on-coral-ink)',
                boxShadow: '0 4px 0 color-mix(in srgb, var(--coral-vivid) 55%, #000), 0 10px 22px -8px var(--coral-vivid)',
              }}
            >
              <span className="ms fill" style={{ fontSize: 28 }} aria-hidden="true">
                call_end
              </span>
            </button>
          </div>
        </div>
      </div>

      <LessonCompleteSheet
        open={completeOpen}
        lesson={lesson ?? null}
        onClose={() => setCompleteOpen(false)}
        onDone={() => navigate(-1)}
      />

      <Sheet open={showRecap} onClose={() => setShowRecap(false)} dark>
        <div style={{ padding: '0 20px 4px' }}>
          <div className="section-title" style={{ marginBottom: 4 }}>
            {t('lesson_notes_title')}
          </div>
          <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', marginBottom: 18 }}>
            {t('lesson_notes_sub')}
          </div>
          {id && <LessonAttachmentsList lessonId={id} />}
        </div>
      </Sheet>
    </div>
  )
}

function CallBtn({
  icon,
  onClick,
  active,
}: {
  icon: string
  onClick?: () => void
  active: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="ico-btn"
      style={{
        width: 54,
        height: 54,
        background: active ? 'var(--glass-bg-inner)' : 'var(--coral-soft)',
        color: active ? 'var(--ink)' : 'var(--coral-ink)',
      }}
    >
      <span className="ms fill" style={{ fontSize: 24 }} aria-hidden="true">
        {icon}
      </span>
    </button>
  )
}
