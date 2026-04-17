import { apiFetch } from './client'
import type {
  AuthResponse,
  Homework,
  HomeworkPage,
  HomeworkStatus,
  Level,
  LessonPage,
  NotificationPage,
  TelegramLink,
  UserProfile,
  VocabularyPage,
  VocabularyWord,
  VocabStatus,
} from './types'

export interface UpdateProfileRequest {
  firstName?: string | null
  lastName?: string | null
  locale?: string | null
  level?: Level | null
}

export interface LessonsQuery {
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export interface VocabularyQuery {
  status?: VocabStatus
  page?: number
  pageSize?: number
}

export interface HomeworkQuery {
  status?: HomeworkStatus
  page?: number
  pageSize?: number
}

export interface SubmitHomeworkRequest {
  submissionText?: string | null
  submissionUrl?: string | null
}

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) sp.set(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

export const api = {
  signInWithMiniApp: (initData: string) =>
    apiFetch<AuthResponse>('/api/v1/token/telegram-miniapp', {
      method: 'POST',
      auth: false,
      body: { initData },
    }),

  signInWithPassword: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/v1/token', {
      method: 'POST',
      auth: false,
      body: { email, password },
    }),

  linkTelegram: (initData: string) =>
    apiFetch<TelegramLink>('/api/v1/users/me/telegram/link', {
      method: 'POST',
      body: { initData },
    }),

  me: () => apiFetch<UserProfile>('/api/v1/users/me'),

  updateMe: (patch: UpdateProfileRequest) =>
    apiFetch<UserProfile>('/api/v1/users/me', {
      method: 'PATCH',
      body: patch,
    }),

  lessons: (query: LessonsQuery = {}) =>
    apiFetch<LessonPage>(`/api/v1/lessons${qs({ ...query })}`),

  vocabulary: (query: VocabularyQuery = {}) =>
    apiFetch<VocabularyPage>(`/api/v1/vocabulary${qs({ ...query })}`),

  reviewVocabularyWord: (id: string) =>
    apiFetch<VocabularyWord>(`/api/v1/vocabulary/${id}/review`, { method: 'POST' }),

  homework: (query: HomeworkQuery = {}) =>
    apiFetch<HomeworkPage>(`/api/v1/homework${qs({ ...query })}`),

  submitHomework: (id: string, body: SubmitHomeworkRequest) =>
    apiFetch<Homework>(`/api/v1/homework/${id}/submit`, {
      method: 'POST',
      body,
    }),

  notifications: (page = 1, pageSize = 20) =>
    apiFetch<NotificationPage>(`/api/v1/notifications${qs({ page, pageSize })}`),

  markNotificationsViewed: (notificationIds: string[]) =>
    apiFetch<void>('/api/v1/notifications/viewed', {
      method: 'POST',
      body: { notificationIds },
    }),
}
