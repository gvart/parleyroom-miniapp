import { apiFetch } from './client'
import type {
  AuthResponse,
  FolderTreeNode,
  Goal,
  GoalPage,
  GoalStatus,
  Homework,
  HomeworkPage,
  HomeworkStatus,
  Lesson,
  LessonMaterialList,
  LessonType,
  Level,
  LessonPage,
  MaterialFolder,
  MaterialPage,
  MaterialSkill,
  MaterialType,
  NotificationPage,
  StartLessonResponse,
  TelegramLink,
  UserProfile,
  UserList,
  VideoAccess,
  VocabularyPage,
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

export type PracticeRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'
export type PracticeMode = 'DE_TO_MEANING' | 'MEANING_TO_DE' | 'ARTICLE'

export interface ReviewVocabularyWordRequest {
  rating: PracticeRating
  mode: PracticeMode
  responseMs?: number | null
}

export interface HomeworkQuery {
  studentId?: string
  status?: HomeworkStatus
  page?: number
  pageSize?: number
}

export interface SubmitHomeworkRequest {
  submissionText?: string | null
  submissionUrl?: string | null
}

export type AssignmentItemKind = 'DOCUMENT' | 'MATERIAL' | 'TASK'
export type HomeworkResponseType = 'TEXT' | 'AUDIO' | 'VIDEO' | 'FILE'

export interface AssignmentItemInput {
  kind: AssignmentItemKind
  documentId?: string | null
  materialId?: string | null
  title?: string | null
  task?: string | null
  responseType?: HomeworkResponseType | null
}

export interface CreateAssignmentRequest {
  title: string
  instructions?: string | null
  dueDate?: string | null
  lessonId?: string | null
  studentIds?: string[]
  groupIds?: string[]
  items: AssignmentItemInput[]
}

export interface RescheduleRequest {
  newScheduledAt: string
  note?: string | null
}

export interface UpdateLessonContentRequest {
  rawNotes?: string | null
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

  reviewVocabularyWord: (id: string, body: ReviewVocabularyWordRequest) =>
    apiFetch<unknown>(`/api/v1/vocabulary/${id}/review`, { method: 'POST', body }),

  homework: (query: HomeworkQuery = {}) =>
    apiFetch<HomeworkPage>(`/api/v1/homework${qs({ ...query })}`),

  submitHomework: (id: string, body: SubmitHomeworkRequest) =>
    apiFetch<Homework>(`/api/v1/homework/${id}/submit`, {
      method: 'POST',
      body,
    }),

  createAssignment: (body: CreateAssignmentRequest) =>
    apiFetch<unknown>('/api/v1/assignments', { method: 'POST', body }),

  notifications: (page = 1, pageSize = 20) =>
    apiFetch<NotificationPage>(`/api/v1/notifications${qs({ page, pageSize })}`),

  markNotificationsViewed: (notificationIds: string[]) =>
    apiFetch<void>('/api/v1/notifications/viewed', {
      method: 'POST',
      body: { notificationIds },
    }),

  goals: (query: { studentId?: string; status?: GoalStatus } = {}) =>
    apiFetch<GoalPage>(`/api/v1/goals${qs({ ...query })}`),

  createGoal: (body: { studentId: string; description: string; targetDate?: string | null }) =>
    apiFetch<Goal>('/api/v1/goals', { method: 'POST', body }),

  completeGoal: (id: string) =>
    apiFetch<Goal>(`/api/v1/goals/${id}/complete`, { method: 'POST' }),

  abandonGoal: (id: string) =>
    apiFetch<Goal>(`/api/v1/goals/${id}/abandon`, { method: 'POST' }),

  updateGoalProgress: (id: string, progress: number) =>
    apiFetch<Goal>(`/api/v1/goals/${id}/progress`, {
      method: 'PUT',
      body: { progress },
    }),

  deleteGoal: (id: string) =>
    apiFetch<void>(`/api/v1/goals/${id}`, { method: 'DELETE' }),

  users: (page = 1, pageSize = 100) =>
    apiFetch<UserList>(`/api/v1/users${qs({ page, pageSize })}`),

  createLesson: (body: CreateLessonRequest) =>
    apiFetch<Lesson>('/api/v1/lessons', { method: 'POST', body }),

  acceptLesson: (id: string) =>
    apiFetch<Lesson>(`/api/v1/lessons/${id}/accept`, { method: 'POST' }),

  videoToken: (id: string) =>
    apiFetch<VideoAccess>(`/api/v1/lessons/${id}/video-token`, { method: 'POST' }),

  cancelLesson: (id: string, reason?: string) =>
    apiFetch<Lesson>(`/api/v1/lessons/${id}/cancel`, {
      method: 'POST',
      body: reason ? { reason } : null,
    }),

  startLesson: (id: string) =>
    apiFetch<StartLessonResponse>(`/api/v1/lessons/${id}/start`, { method: 'POST' }),

  completeLesson: (id: string) =>
    apiFetch<unknown>(`/api/v1/lessons/${id}/complete`, { method: 'POST' }),

  updateLessonContent: (id: string, body: UpdateLessonContentRequest) =>
    apiFetch<Lesson>(`/api/v1/lessons/${id}/content`, { method: 'PATCH', body }),

  joinLesson: (id: string) =>
    apiFetch<void>(`/api/v1/lessons/${id}/join`, { method: 'POST' }),

  acceptJoinRequest: (lessonId: string, studentId: string) =>
    apiFetch<void>(
      `/api/v1/lessons/${lessonId}/participants/${studentId}/accept`,
      { method: 'POST' },
    ),

  rejectJoinRequest: (lessonId: string, studentId: string) =>
    apiFetch<void>(
      `/api/v1/lessons/${lessonId}/participants/${studentId}/reject`,
      { method: 'POST' },
    ),

  requestReschedule: (id: string, body: RescheduleRequest) =>
    apiFetch<void>(`/api/v1/lessons/${id}/reschedule`, { method: 'POST', body }),

  acceptReschedule: (id: string) =>
    apiFetch<Lesson>(`/api/v1/lessons/${id}/reschedule/accept`, { method: 'POST' }),

  rejectReschedule: (id: string) =>
    apiFetch<void>(`/api/v1/lessons/${id}/reschedule/reject`, { method: 'POST' }),

  materials: (
    query: {
      folderId?: string
      unfiled?: boolean
      lessonId?: string
      type?: MaterialType
      level?: Level
      skill?: MaterialSkill
      page?: number
      pageSize?: number
    } = {},
  ) => apiFetch<MaterialPage>(`/api/v1/materials${qs({ ...query })}`),

  materialFolders: (tree = true) =>
    apiFetch<FolderTreeNode[]>(`/api/v1/material-folders${qs({ tree })}`),

  materialFolder: (id: string) =>
    apiFetch<MaterialFolder>(`/api/v1/material-folders/${id}`),

  lessonMaterials: (lessonId: string) =>
    apiFetch<LessonMaterialList>(`/api/v1/lessons/${lessonId}/materials`),

  createMaterial: (input: {
    name: string
    type: MaterialType
    file?: File | null
    url?: string | null
    folderId?: string | null
    level?: Level | null
    skill?: MaterialSkill | null
  }) => {
    const form = new FormData()
    const metadata: Record<string, unknown> = {
      name: input.name,
      type: input.type,
    }
    if (input.folderId) metadata.folderId = input.folderId
    if (input.level) metadata.level = input.level
    if (input.skill) metadata.skill = input.skill
    if (input.url) metadata.url = input.url
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
    )
    if (input.file) form.append('file', input.file)
    return apiFetch<{ id: string; name: string; type: MaterialType }>(
      '/api/v1/materials',
      { method: 'POST', body: form },
    )
  },

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
