export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
}

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  initials: string
  role: Role
  status: string
  locale: string
  level?: Level | null
  avatarUrl?: string | null
  telegramId?: number | null
  telegramUsername?: string | null
  createdAt: string
}

export interface TelegramLink {
  telegramId: number
  telegramUsername: string | null
}

export type LessonStatus =
  | 'CONFIRMED'
  | 'REQUEST'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'IN_PROGRESS'

export type LessonType = 'ONE_ON_ONE' | 'SPEAKING_CLUB' | 'READING_CLUB'

export interface LessonStudent {
  id: string
  firstName: string
  lastName: string
  status: string
}

export interface Lesson {
  id: string
  title: string
  topic: string
  type: LessonType
  scheduledAt: string
  durationMinutes: number
  teacherId: string
  status: LessonStatus
  level: Level | null
  maxParticipants: number | null
  students: LessonStudent[]
  startedAt: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface LessonPage {
  lessons: Lesson[]
  total: number
  page: number
  pageSize: number
}

export type VocabStatus = 'NEW' | 'REVIEW' | 'LEARNED'
export type VocabCategory = 'NOUN' | 'VERB' | 'ADJECTIVE' | 'ADVERB' | 'GRAMMAR'

export interface VocabularyWord {
  id: string
  studentId: string
  lessonId: string | null
  german: string
  english: string
  exampleSentence: string | null
  exampleTranslation: string | null
  category: VocabCategory
  status: VocabStatus
  nextReviewAt: string | null
  reviewCount: number
  addedAt: string
}

export interface VocabularyPage {
  words: VocabularyWord[]
  total: number
  page: number
  pageSize: number
}

export type HomeworkCategory =
  | 'WRITING'
  | 'READING'
  | 'GRAMMAR'
  | 'VOCABULARY'
  | 'LISTENING'

export type HomeworkStatus =
  | 'OPEN'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'DONE'
  | 'REJECTED'

export type HomeworkAttachmentType = 'FILE' | 'LINK'

export interface Homework {
  id: string
  studentId: string
  teacherId: string
  lessonId: string | null
  title: string
  description: string | null
  category: HomeworkCategory
  status: HomeworkStatus
  dueDate: string | null
  submissionText: string | null
  submissionUrl: string | null
  teacherFeedback: string | null
  attachmentType: HomeworkAttachmentType | null
  attachmentUrl: string | null
  attachmentName: string | null
  createdAt: string
  updatedAt: string
}

export interface HomeworkPage {
  homework: Homework[]
  total: number
  page: number
  pageSize: number
}
