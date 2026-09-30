import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/ui'

type Phase = 'idle' | 'recording' | 'unsupported' | 'denied'

interface Props {
  /** Playable URL of the saved recording (object URL or authed blob URL). */
  src: string | null
  /** A finished take; the parent uploads it. */
  onRecorded: (blob: Blob) => void
  disabled?: boolean
  uploading?: boolean
}

const pickMime = () =>
  ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(
    (m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m),
  )

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** Record -> stop -> replay -> re-record, in the Telegram webview (MediaRecorder). */
export function AudioRecorder({ src, onRecorded, disabled, uploading }: Props) {
  const { t } = useTranslation()
  const [phase, setPhase] = useState<Phase>(() =>
    typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia ? 'unsupported' : 'idle',
  )
  const [seconds, setSeconds] = useState(0)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const release = () => {
    clearInterval(timer.current)
    stream.current?.getTracks().forEach((tr) => tr.stop())
    stream.current = null
  }
  useEffect(() => release, [])

  const start = async () => {
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setPhase('denied')
      return
    }
    const mimeType = pickMime()
    const rec = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined)
    const chunks: Blob[] = []
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data)
    }
    rec.onstop = () => {
      release()
      setPhase('idle')
      if (chunks.length) onRecorded(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }))
    }
    recorder.current = rec
    rec.start()
    setSeconds(0)
    const startedAt = Date.now()
    timer.current = setInterval(() => setSeconds((Date.now() - startedAt) / 1000), 250)
    setPhase('recording')
  }

  const stop = () => recorder.current?.state === 'recording' && recorder.current.stop()

  if (phase === 'unsupported') {
    return <p style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>{t('hw_audio_unsupported')}</p>
  }

  const recording = phase === 'recording'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} data-testid="audio-recorder">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        {recording ? (
          <Button type="button" variant="danger" size="sm" leadingIcon="stop" onClick={stop} data-testid="audio-stop">
            {t('hw_audio_stop')}
          </Button>
        ) : (
          <Button
            type="button"
            variant={src ? 'secondary' : 'primary'}
            size="sm"
            leadingIcon="mic"
            onClick={() => void start()}
            disabled={disabled || uploading}
            data-testid="audio-record"
          >
            {src ? t('hw_audio_rerecord') : t('hw_audio_record')}
          </Button>
        )}
        {recording && (
          <span
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-body)', color: 'var(--coral-ink)' }}
            role="status"
            aria-live="polite"
          >
            <span className="live-dot" aria-hidden="true" />
            {t('hw_audio_recording', { time: fmt(seconds) })}
          </span>
        )}
        {uploading && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-small)', color: 'var(--ink-3)' }} role="status">
            <span className="ms" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }} aria-hidden="true">
              progress_activity
            </span>
            {t('hw_uploading')}
          </span>
        )}
      </div>
      {phase === 'denied' && <p style={{ fontSize: 'var(--text-small)', color: 'var(--coral-ink)' }}>{t('hw_audio_denied')}</p>}
      {src && !recording && (
        <audio src={src} controls style={{ width: '100%', opacity: uploading ? 0.6 : 1 }} data-testid="audio-playback" />
      )}
    </div>
  )
}
