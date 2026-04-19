import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import { apiUrl, getApiToken } from '@/api/client'

const isMockSession = (): boolean =>
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('mock') === '1'

export function useNotifications() {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications(),
    // Polling fallback in case SSE is unavailable / drops.
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return
    if (isMockSession()) return
    const token = getApiToken()
    if (!token) return

    const url = apiUrl(
      `/api/v1/notifications/stream?access_token=${encodeURIComponent(token)}`,
    )
    let es: EventSource
    try {
      es = new EventSource(url)
    } catch {
      return
    }

    const refresh = (event?: MessageEvent) => {
      void qc.invalidateQueries({ queryKey: ['notifications'] })
      if (!event?.data) return
      try {
        const parsed = JSON.parse(event.data) as { type?: string }
        if (
          parsed.type === 'MATERIAL_SHARED' ||
          parsed.type === 'FOLDER_SHARED' ||
          parsed.type === 'MATERIAL_ATTACHED_TO_LESSON'
        ) {
          void qc.invalidateQueries({ queryKey: ['materials'] })
          void qc.invalidateQueries({ queryKey: ['material-folders'] })
          void qc.invalidateQueries({ queryKey: ['lesson-materials'] })
        }
        if (parsed.type?.startsWith('LESSON') || parsed.type?.startsWith('RESCHEDULE')) {
          void qc.invalidateQueries({ queryKey: ['lessons'] })
        }
      } catch {
        // Non-JSON (pings/heartbeats) — nothing to do beyond the notifications refresh.
      }
    }

    es.addEventListener('message', refresh)
    es.addEventListener('notification', refresh)
    es.addEventListener('error', () => {
      // Silent fall-through: polling keeps the inbox fresh.
      es.close()
    })

    return () => {
      es.close()
    }
  }, [qc])

  return query
}

export function useMarkNotificationsViewed() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => api.markNotificationsViewed(ids),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
