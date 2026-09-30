import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Banner, Button } from '@/ui'
import { haptic } from '@/lib/haptics'
import type { HomeworkUpload, HomeworkResponseType } from '@/api/types'
import { useAuthedFile } from '../lib/authedFile'
import { AudioRecorder } from './AudioRecorder'

export type MediaKind = Exclude<HomeworkResponseType, 'TEXT'>

export interface MediaAnswerProps {
  kind: MediaKind
  uploads: HomeworkUpload[]
  /** Absent -> read-only playback. */
  onUpload?: (file: Blob, name: string, onProgress: (pct: number) => void) => Promise<unknown>
  onDelete?: (uploadId: string) => Promise<unknown>
}

const MAX_UPLOADS = 5
const ACCEPT: Record<MediaKind, string | undefined> = {
  AUDIO: 'audio/*',
  VIDEO: 'video/mp4,video/webm,video/quicktime',
  FILE: 'image/*,application/pdf',
}
const ext = (b: Blob) => (b.type.includes('mp4') ? 'm4a' : b.type.includes('ogg') ? 'ogg' : 'webm')

/**
 * Audio: record in the browser (MediaRecorder) -- a new take replaces the old one; a file
 * upload works too. Video / file: upload with progress, up to five files.
 */
export function MediaAnswer({ kind, uploads, onUpload, onDelete }: MediaAnswerProps) {
  const { t } = useTranslation()
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  const editable = !!onUpload

  const send = async (file: Blob, name: string, replace: boolean) => {
    if (!onUpload) return
    setProgress(0)
    setError(null)
    try {
      if (replace) for (const u of uploads) await onDelete?.(u.id)
      await onUpload(file, name, setProgress)
      haptic('light')
    } catch {
      setError(t('hw_upload_failed'))
    } finally {
      setProgress(null)
    }
  }

  const uploading = progress !== null
  const latestAudio = kind === 'AUDIO' ? uploads[uploads.length - 1] : undefined

  if (!editable && uploads.length === 0) {
    return <p style={{ marginTop: 8, fontSize: 'var(--text-small)', color: 'var(--ink-3)' }}>{t('hw_no_answer')}</p>
  }

  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {error && <Banner tone="error">{error}</Banner>}

      {kind === 'AUDIO' && editable && (
        <AudioRecorderWithUpload upload={latestAudio} uploading={uploading} onRecorded={(blob) => void send(blob, `recording.${ext(blob)}`, true)} />
      )}

      {(kind !== 'AUDIO' || !editable) && uploads.length > 0 && (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 0, margin: 0, listStyle: 'none' }}>
          {uploads.map((u) => (
            <li key={u.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Playback kind={kind} upload={u} />
              </div>
              {editable && onDelete && (
                <button
                  type="button"
                  className="ico-btn"
                  aria-label={t('hw_remove_file', { name: u.fileName })}
                  onClick={() => void onDelete(u.id).catch(() => setError(t('hw_upload_failed')))}
                >
                  <span className="ms" style={{ fontSize: 18 }} aria-hidden="true">
                    delete
                  </span>
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editable && (
        <>
          <input
            ref={input}
            type="file"
            accept={ACCEPT[kind]}
            capture={kind === 'FILE' ? 'environment' : undefined}
            style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) void send(f, f.name, kind === 'AUDIO')
            }}
            data-testid="file-input"
          />
          {(kind === 'AUDIO' || uploads.length < MAX_UPLOADS) && (
            <Button
              type="button"
              variant={kind === 'AUDIO' || uploads.length ? 'secondary' : 'primary'}
              size="sm"
              leadingIcon="upload"
              disabled={uploading}
              onClick={() => input.current?.click()}
            >
              {uploads.length && kind !== 'AUDIO' ? t('hw_add_file') : t(`hw_upload_${kind}`)}
            </Button>
          )}
          {uploading && kind !== 'AUDIO' && (
            <div style={{ maxWidth: 320 }} role="status">
              <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-3)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-face)', transition: 'width 150ms ease' }} />
              </div>
              <p style={{ marginTop: 4, fontSize: 'var(--text-caption)', color: 'var(--ink-3)' }}>{t('hw_upload_progress', { pct: progress })}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AudioRecorderWithUpload({ upload, uploading, onRecorded }: { upload?: HomeworkUpload; uploading: boolean; onRecorded: (b: Blob) => void }) {
  const { url } = useAuthedFile(upload?.downloadUrl)
  return <AudioRecorder src={upload ? url : null} uploading={uploading} onRecorded={onRecorded} />
}

export function Playback({ kind, upload }: { kind: MediaKind; upload: HomeworkUpload }) {
  const { t } = useTranslation()
  const { url } = useAuthedFile(upload.downloadUrl)
  const isAudio = kind === 'AUDIO' || upload.contentType.startsWith('audio/')
  const isVideo = kind === 'VIDEO' || upload.contentType.startsWith('video/')
  const isImage = upload.contentType.startsWith('image/')
  if (isAudio) return url ? <audio src={url} controls style={{ width: '100%' }} data-testid="audio-playback" /> : <div className="skeleton" style={{ height: 44, borderRadius: 999 }} />
  if (isVideo)
    return url ? (
      <video src={url} controls style={{ width: '100%', borderRadius: 18, background: 'var(--bg-3)' }} data-testid="video-playback" />
    ) : (
      <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 18 }} />
    )
  if (isImage)
    return url ? (
      <img src={url} alt={upload.fileName} style={{ maxWidth: '100%', borderRadius: 14, border: '1px solid var(--hair)' }} data-testid="file-answer" />
    ) : (
      <div className="skeleton" style={{ height: 120, borderRadius: 14 }} />
    )
  return (
    <a
      href={url ?? undefined}
      download={upload.fileName}
      style={{
        display: 'inline-flex',
        maxWidth: '100%',
        alignItems: 'center',
        gap: 8,
        borderRadius: 14,
        background: 'var(--bg-2)',
        padding: '8px 12px',
        fontSize: 'var(--text-body)',
        color: 'var(--ink)',
      }}
      data-testid="file-answer"
    >
      <span className="ms" style={{ fontSize: 18, flexShrink: 0, color: 'var(--ink-2)' }} aria-hidden="true">
        description
      </span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{upload.fileName}</span>
      <span className="sr-only">{t('hw_download')}</span>
    </a>
  )
}
