import { ApiError, API_BASE, getApiToken } from '@/api/client'
import type { HomeworkUpload } from '@/api/types'

/**
 * `POST /homework/{id}/items/{itemId}/uploads` via XMLHttpRequest instead of
 * the `apiFetch` wrapper, so we can report upload progress (fetch has no
 * upload-progress event).
 */
export function uploadHomeworkFile(
  id: string,
  itemId: string,
  file: Blob,
  fileName: string,
  onProgress?: (pct: number) => void,
): Promise<HomeworkUpload> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file, fileName)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/api/v1/homework/${id}/items/${itemId}/uploads`)
    const token = getApiToken()
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(xhr.responseText ? (JSON.parse(xhr.responseText) as HomeworkUpload) : (undefined as never))
        } catch {
          reject(new Error('invalid response'))
        }
      } else {
        let detail: string | null = null
        try {
          detail = (JSON.parse(xhr.responseText) as { detail?: string })?.detail ?? null
        } catch {
          /* non-JSON error body */
        }
        reject(new ApiError(xhr.status, detail))
      }
    }
    xhr.onerror = () => reject(new Error('network error'))
    xhr.send(form)
  })
}
