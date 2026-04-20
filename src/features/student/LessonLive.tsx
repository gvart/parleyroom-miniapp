import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Avatar, Pill, Sheet } from '@/ui'
import { useLessons } from '@/hooks/useLessons'
import { useLiveKit, type LiveKitStatus } from '@/hooks/useLiveKit'
import { useStartLesson } from '@/hooks/useLessonActions'
import { VideoTile } from './VideoTile'
import { LessonAttachmentsList } from './LessonAttachmentsList'
import { LessonReflectSheet } from './LessonReflectSheet'
import { LessonCompleteSheet } from '../teacher/LessonCompleteSheet'

const SAMPLE_VOCAB = [
  ['die Vergangenheit', 'the past'],
  ['beiläufig', 'casually'],
  ['die Erzählung', 'the narrative'],
] as const

const SAMPLE_RULE =
  'Präteritum is used in written German (novels, news); Perfekt dominates in spoken conversation, especially in the south.'

function fmtElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function statusMessage(status: LiveKitStatus): string | null {
  switch (status) {
    case 'fetching-token':
      return 'Connecting…'
    case 'connecting':
      return 'Joining room…'
    case 'connected':
      return null
    case 'lesson-not-started':
      return 'Lesson hasn’t been started yet. Wait for your teacher to start it.'
    case 'permission-denied':
      return 'Camera or microphone access blocked. Update your browser permissions.'
    case 'unavailable':
      return 'Live video unavailable in preview mode. Open from a real lesson to connect.'
    case 'error':
      return 'Could not connect to the lesson room.'
    default:
      return null
  }
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
  const [reflectOpen, setReflectOpen] = useState(false)
  const [completeOpen, setCompleteOpen] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startLesson = useStartLesson()
  const isTeacher = user.role === 'TEACHER' || user.role === 'ADMIN'
  const canStart =
    isTeacher && lesson?.status === 'CONFIRMED' && !lesson.startedAt

  useEffect(() => {
    if (canStart && lesson && !startLesson.isPending && !startLesson.isSuccess) {
      startLesson.mutate(lesson.id)
    }
  }, [canStart, lesson, startLesson])

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const teacher = lesson?.students.find((s) => s.id === lesson.teacherId)
  const teacherName = teacher
    ? `${teacher.firstName} ${teacher.lastName}`
    : 'Helena König'
  const teacherInitials = teacher
    ? `${teacher.firstName[0] ?? ''}${teacher.lastName[0] ?? ''}`.toUpperCase()
    : 'HK'
  const userInitials = `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
  const banner = statusMessage(live.status)

  async function endCall() {
    await live.disconnect()
    if (!lesson) {
      navigate(-1)
      return
    }
    if (isTeacher) {
      setCompleteOpen(true)
    } else if (lesson.status === 'IN_PROGRESS' || lesson.status === 'COMPLETED') {
      setReflectOpen(true)
    } else {
      navigate(-1)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: '#0A0A09',
        color: '#F2F1EC',
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
              'radial-gradient(circle at 50% 40%, oklch(0.35 0.12 172) 0%, oklch(0.12 0.05 200) 70%)',
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
              hue={172}
              initials={teacherInitials}
              size={120}
              live={live.status === 'connected'}
            />
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top) + 18px)',
            left: 16,
            right: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Pill
            tone="live"
            style={{
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <span className="live-dot" />
            {live.status === 'connected' ? `Live · ${fmtElapsed(elapsed)}` : 'Live'}
          </Pill>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="tap"
            aria-label={t('back')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
            }}
          >
            <span className="ms" style={{ fontSize: 18 }}>
              expand_more
            </span>
          </button>
        </div>

        {banner && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top) + 76px)',
              left: 16,
              right: 16,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              color: 'rgba(242,241,236,0.9)',
              fontSize: 12,
              lineHeight: 1.4,
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.06)',
              animation: 'fade-in .3s var(--ease)',
            }}
          >
            {banner}
            {live.errorMessage && (
              <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(242,241,236,0.55)' }}>
                {live.errorMessage}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            bottom: 220,
            right: 16,
            width: 90,
            height: 130,
            borderRadius: 16,
            background:
              'linear-gradient(180deg, oklch(0.35 0.1 290), oklch(0.18 0.05 290))',
            border: '2px solid rgba(255,255,255,0.15)',
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
            <span className="ms" style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)' }}>
              videocam_off
            </span>
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 220,
            left: 16,
            right: 120,
            padding: '10px 14px',
            borderRadius: 16,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#F2F1EC',
            fontSize: 13,
            lineHeight: 1.35,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: 'oklch(0.75 0.14 172)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {t('live_caption_de')}
          </div>
          „Heute sprechen wir über den Unterschied zwischen Perfekt und Präteritum…"
        </div>
      </div>

      <div
        style={{
          padding: '16px 16px calc(env(safe-area-inset-bottom) + 16px)',
          background: 'linear-gradient(180deg, transparent, #0A0A09 50%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                color: 'oklch(0.7 0.1 172)',
                letterSpacing: '0.1em',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {t('lesson_deck')} · 3/8
            </div>
            <div className="serif" style={{ fontSize: 18, marginTop: 2 }}>
              {lesson?.topic ?? teacherName}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowRecap(true)}
            className="tap"
            style={{
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(255,255,255,0.06)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span className="ms" style={{ fontSize: 14 }}>
              note_alt
            </span>
            {t('notes_button')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 999,
                background: i < 3 ? 'oklch(0.75 0.14 172)' : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
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
          <CallBtn icon="screen_share" active />
          <CallBtn icon="translate" active />
          <button
            type="button"
            onClick={() => void endCall()}
            className="tap"
            aria-label={t('end_call')}
            style={{
              width: 60,
              height: 60,
              borderRadius: 999,
              background: 'oklch(0.55 0.22 25)',
              border: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff',
              boxShadow: '0 8px 24px oklch(0.55 0.22 25 / 0.5)',
            }}
          >
            <span className="ms fill" style={{ fontSize: 26 }}>
              call_end
            </span>
          </button>
        </div>
      </div>

      <LessonReflectSheet
        open={reflectOpen}
        lesson={lesson ?? null}
        onClose={() => setReflectOpen(false)}
        onDone={() => navigate(-1)}
      />
      <LessonCompleteSheet
        open={completeOpen}
        lesson={lesson ?? null}
        onClose={() => setCompleteOpen(false)}
        onDone={() => navigate(-1)}
      />

      <Sheet open={showRecap} onClose={() => setShowRecap(false)} dark>
        <div style={{ padding: '0 22px 10px' }}>
          <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 4 }}>
            {t('lesson_notes_title')}
          </div>
          <div style={{ fontSize: 13, color: '#A7A69C', marginBottom: 18 }}>
            {t('lesson_notes_sub')}
          </div>
          {id && <LessonAttachmentsList lessonId={id} dark />}
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: '#A7A69C',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {t('new_vocabulary')}
            </div>
            {SAMPLE_VOCAB.map(([de, en]) => (
              <div
                key={de}
                style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  marginBottom: 6,
                  fontSize: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  {de} · {en}
                </span>
                <span className="ms" style={{ fontSize: 16, color: 'oklch(0.7 0.12 172)' }}>
                  add_circle
                </span>
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                color: '#A7A69C',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              {t('key_rule')}
            </div>
            <div
              style={{
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 12,
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {SAMPLE_RULE}
            </div>
          </div>
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
      className="tap"
      style={{
        width: 52,
        height: 52,
        borderRadius: 999,
        border: `1px solid ${active ? 'rgba(255,255,255,0.14)' : 'transparent'}`,
        cursor: 'pointer',
        background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,100,100,0.85)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <span className="ms" style={{ fontSize: 22 }}>
        {icon}
      </span>
    </button>
  )
}
