const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  ?? 'http://localhost:8080'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
}

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'TEACHER' | 'STUDENT'
  telegramId: number | null
  telegramUsername: string | null
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string | null,
  ) {
    super(detail ?? `HTTP ${status}`)
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { token?: string },
): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (init?.token) headers.set('Authorization', `Bearer ${init.token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.detail ?? body?.title ?? null)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  signInWithMiniApp: (initData: string) =>
    request<AuthResponse>('/api/v1/token/telegram-miniapp', {
      method: 'POST',
      body: JSON.stringify({ initData }),
    }),

  signInWithPassword: (email: string, password: string) =>
    request<AuthResponse>('/api/v1/token', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  linkTelegram: (initData: string, token: string) =>
    request<{ telegramId: number; telegramUsername: string | null }>(
      '/api/v1/users/me/telegram/link',
      {
        method: 'POST',
        body: JSON.stringify({ initData }),
        token,
      },
    ),

  me: (token: string) =>
    request<UserProfile>('/api/v1/users/me', { token }),
}
