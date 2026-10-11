import { useEffect, useState } from 'react'
import { API_BASE, getApiToken } from '@/api/client'

/**
 * Streams a file behind the Authorization header (homework uploads, attached
 * material files) and returns a Blob URL suitable for <audio>/<video>/<img>/<a>.
 * Ported from `MaterialPreview`'s `useAuthedObjectUrl`; used for homework and
 * material files and for avatars (`/api/v1/users/{id}/avatar?v=…`).
 */
export function useAuthedFile(downloadUrl: string | null | undefined): { url: string | null; loading: boolean; error: string | null } {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Drop the previous blob URL right away; it is revoked by the last cleanup.
    setUrl(null)
    setError(null)
    setLoading(false)
    if (!downloadUrl) return
    let cancelled = false
    let objectUrl: string | null = null
    const token = getApiToken()
    if (!token) return

    setLoading(true)
    fetch(`${API_BASE}${downloadUrl}`, { headers: { Authorization: `Bearer ${token}` } })
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
