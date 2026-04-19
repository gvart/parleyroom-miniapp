import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { openLink } from '@telegram-apps/sdk-react'
import type { Material } from '@/api/types'
import { API_BASE, getApiToken } from '@/api/client'

interface Props {
  material: Material
  onClose: () => void
}

function bytesToLabel(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * Streams a material's file behind the Authorization header and returns a
 * Blob URL suitable for <iframe>, <audio>, <video>, <img>. The caller is
 * responsible for revoking the URL on unmount (we do it here via cleanup).
 */
function useAuthedObjectUrl(downloadUrl: string | null): { url: string | null; loading: boolean; error: string | null } {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!downloadUrl || !downloadUrl.startsWith('/api/')) {
      // External link — no blob needed.
      setUrl(null)
      return
    }
    let cancelled = false
    let objectUrl: string | null = null
    const token = getApiToken()
    if (!token) return

    setLoading(true)
    setError(null)
    fetch(`${API_BASE}${downloadUrl}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const blob = await r.blob()
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'failed')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [downloadUrl])

  return { url, loading, error }
}

export function MaterialPreview({ material, onClose }: Props) {
  const { t } = useTranslation()
  const { url, loading, error } = useAuthedObjectUrl(material.downloadUrl)

  const isImage = material.contentType?.startsWith('image/')
  const isPdf = material.type === 'PDF'
  const isAudio = material.type === 'AUDIO'
  const isVideo = material.type === 'VIDEO'
  const isLink = material.type === 'LINK'

  return (
    <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em' }}>
          {material.name}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
          {t(material.type.toLowerCase())}
          {material.fileSize ? ` · ${bytesToLabel(material.fileSize)}` : ''}
          {material.level ? ` · ${material.level}` : ''}
          {material.skill ? ` · ${t(material.skill.toLowerCase())}` : ''}
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            background: 'oklch(0.96 0.05 25)',
            color: 'oklch(0.5 0.18 25)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {isLink && material.downloadUrl && (
        <button
          type="button"
          onClick={() => {
            try {
              openLink(material.downloadUrl!)
            } catch {
              window.open(material.downloadUrl!, '_blank', 'noopener,noreferrer')
            }
            onClose()
          }}
          className="tap"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            border: 0,
            background: 'var(--ink)',
            color: 'var(--bg)',
            padding: '14px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <span className="ms" style={{ fontSize: 18 }}>
            open_in_new
          </span>
          {t('open_link')}
        </button>
      )}

      {!isLink && loading && (
        <div style={{ fontSize: 13, color: 'var(--ink-2)', textAlign: 'center', padding: 20 }}>
          {t('preview_loading')}
        </div>
      )}

      {!isLink && url && isImage && (
        <img
          src={url}
          alt={material.name}
          style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--hair)' }}
        />
      )}
      {!isLink && url && isPdf && (
        <iframe
          src={url}
          title={material.name}
          style={{
            width: '100%',
            height: '70vh',
            border: '1px solid var(--hair)',
            borderRadius: 12,
          }}
        />
      )}
      {!isLink && url && isAudio && (
        <audio controls src={url} style={{ width: '100%' }} />
      )}
      {!isLink && url && isVideo && (
        <video
          controls
          src={url}
          style={{ width: '100%', maxHeight: '70vh', borderRadius: 12 }}
        />
      )}
    </div>
  )
}
