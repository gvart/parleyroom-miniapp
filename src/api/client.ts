const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:8080'

let currentToken: string | null = null

export function setApiToken(token: string | null): void {
  currentToken = token
}

export function getApiToken(): string | null {
  return currentToken
}

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string | null,
  ) {
    super(detail ?? `HTTP ${status}`)
  }
}

interface ApiInit extends Omit<RequestInit, 'body'> {
  auth?: boolean
  body?: BodyInit | null | object
}

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { auth = true, body, headers: initHeaders, ...rest } = init

  const headers = new Headers(initHeaders)
  headers.set('Accept', 'application/json')

  let serializedBody: BodyInit | null | undefined
  if (body !== undefined && body !== null) {
    if (
      typeof body === 'string' ||
      body instanceof FormData ||
      body instanceof Blob ||
      body instanceof ArrayBuffer ||
      body instanceof URLSearchParams
    ) {
      serializedBody = body
    } else {
      serializedBody = JSON.stringify(body)
      if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
    }
  }

  if (auth && currentToken) headers.set('Authorization', `Bearer ${currentToken}`)

  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers, body: serializedBody })
  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as
      | { detail?: string; title?: string }
      | null
    throw new ApiError(res.status, errBody?.detail ?? errBody?.title ?? null)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
