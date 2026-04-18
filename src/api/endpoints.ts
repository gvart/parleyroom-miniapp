import { apiFetch } from './client'
import type {
  AuthResponse,
  Goal,
  GoalPage,
  GoalStatus,
  Homework,
  HomeworkPage,
  HomeworkStatus,
  Lesson,
  LessonType,
  Level,
  LessonPage,
  MaterialPage,
  MaterialType,
  NotificationPage,
  TelegramLink,
  UserProfile,
  UserList,
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

  goals: (status?: GoalStatus) =>
    apiFetch<GoalPage>(`/api/v1/goals${qs({ status })}`),

  createGoal: (body: { studentId: string; description: string; targetDate?: string | null }) =>
    apiFetch<Goal>('/api/v1/goals', { method: 'POST', body }),

  completeGoal: (id: string) =>
    apiFetch<Goal>(`/api/v1/goals/${id}/complete`, { method: 'POST' }),

  abandonGoal: (id: string) =>
    apiFetch<Goal>(`/api/v1/goals/${id}/abandon`, { method: 'POST' }),

  users: (page = 1, pageSize = 100) =>
    apiFetch<UserList>(`/api/v1/users${qs({ page, pageSize })}`),

  createLesson: (body: CreateLessonRequest) =>
    apiFetch<Lesson>('/api/v1/lessons', { method: 'POST', body }),

  acceptLesson: (id: string) =>
    apiFetch<Lesson>(`/api/v1/lessons/${id}/accept`, { method: 'POST' }),

  cancelLesson: (id: string, reason?: string) =>
    apiFetch<Lesson>(`/api/v1/lessons/${id}/cancel`, {
      method: 'POST',
      body: reason ? { reason } : null,
    }),

  materials: (query: { type?: MaterialType; page?: number; pageSize?: number } = {}) =>
    apiFetch<MaterialPage>(`/api/v1/materials${qs({ ...query })}`),

  requestPasswordReset: () =>
    apiFetch<{ token: string }>('/api/v1/password-reset', { method: 'POST' }),

  confirmPasswordReset: (token: string, newPassword: string) =>
    apiFetch<void>('/api/v1/password-reset/confirm', {
      method: 'POST',
      auth: false,
      body: { token, newPassword },
    }),

  uploadAvatar: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return apiFetch<UserProfile>('/api/v1/users/me/avatar', {
      method: 'POST',
      body: form,
    })
  },

  deleteAvatar: () =>
    apiFetch<UserProfile>('/api/v1/users/me/avatar', { method: 'DELETE' }),
}

export interface CreateLessonRequest {
  teacherId: string
  studentIds: string[]
  title: string
  type: LessonType
  scheduledAt: string
  durationMinutes?: number | null
  topic: string
  level?: Level | null
  maxParticipants?: number | null
}
