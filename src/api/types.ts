export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: number
}

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type NativeLanguage = 'ru' | 'uk' | 'en'

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  initials: string
  role: Role
  status: string
  locale: string
  /** Students only; null for teachers/admins. */
  nativeLanguage?: NativeLanguage | null
  /** Null means the client should show the one-time language picker. */
  localeConfirmedAt?: string | null
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

export type LessonStudentStatus = 'CONFIRMED' | 'REQUESTED' | 'REJECTED'

export interface LessonStudent {
  id: string
  firstName: string
  lastName: string
  status: string
}

export interface LessonTeacher {
  id: string
  firstName: string
  lastName: string
}

export interface PendingReschedule {
  newScheduledAt: string
  note: string | null
  requestedBy: string
}

export interface Lesson {
  id: string
  title: string
  topic: string
  type: LessonType
  scheduledAt: string
  durationMinutes: number
  teacherId: string
  teacher: LessonTeacher
  status: LessonStatus
  level: Level | null
  maxParticipants: number | null
  students: LessonStudent[]
  startedAt: string | null
  pendingReschedule?: PendingReschedule | null
  /** Teacher-only; null for students. */
  rawNotes?: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface StartLessonResponse {
  document: unknown
  videoRoom: VideoAccess
}

export interface LessonPage {
  lessons: Lesson[]
  total: number
  page: number
  pageSize: number
}

export interface AvailableSlot {
  start: string
  end: string
}

export interface AvailableSlotsResponse {
  slots: AvailableSlot[]
}

/** An upcoming club as a student browsing clubs sees it (`GET /lessons/open-clubs`). */
export interface OpenClub {
  id: string
  title: string
  type: LessonType
  scheduledAt: string
  durationMinutes: number
  topic: string
  level: Level | null
  teacher: LessonTeacher
  /** null = unlimited. */
  maxParticipants: number | null
  /** Confirmed participants plus pending requests; a pending request holds a spot. */
  takenSpots: number
  /** The viewer's own participation; null when they haven't asked to join. */
  myStatus: LessonStudentStatus | null
}

/** REQUESTED, or CONFIRMED when the teacher auto-accepts club joins. */
export interface JoinLessonResponse {
  status: LessonStudentStatus
}

export type VocabStatus = 'NEW' | 'LEARNING' | 'REVIEW' | 'LEARNED'
export type NounArticle = 'DER' | 'DIE' | 'DAS'
export type WordType =
  | 'NOUN'
  | 'VERB'
  | 'ADJECTIVE'
  | 'ADVERB'
  | 'PREPOSITION'
  | 'CONJUNCTION'
  | 'PRONOUN'
  | 'PHRASE'
  | 'OTHER'

/** Which fields a student sees: any of "ru", "en", "de_explanation". */
export interface VocabDisplaySetting {
  fields: string[]
  allowTranslationToggle: boolean
}

/**
 * A word in a student's vocabulary. [translations]/[explanationDe] already reflect
 * [display]; hidden translations (when the toggle is allowed) are in [revealTranslations].
 */
export interface VocabularyWord {
  id: string
  studentId: string
  entryId: string
  lemma: string
  article: NounArticle | null
  plural: string | null
  wordType: WordType
  forms: string | null
  government: string | null
  exampleSentence: string | null
  level: Level | null
  topicIds: string[]
  synonyms: string[]
  lessonId: string | null
  status: VocabStatus
  due: string | null
  reps: number
  lapses: number
  lastReview: string | null
  addedAt: string
  display: VocabDisplaySetting
  translations: Record<string, string>
  explanationDe: string | null
  revealTranslations: Record<string, string> | null
}

export interface VocabularyPage {
  words: VocabularyWord[]
  total: number
  page: number
  pageSize: number
}

export type HomeworkStatus = 'OPEN' | 'SUBMITTED' | 'REVIEWED' | 'DONE'
export type HomeworkOutcome = 'REVIEWED' | 'RETURNED' | 'DONE'
export type AssignmentItemKind = 'DOCUMENT' | 'MATERIAL' | 'TASK'
export type HomeworkResponseType = 'TEXT' | 'AUDIO' | 'VIDEO' | 'FILE'

export interface PersonRef {
  id: string
  firstName: string
  lastName: string
}

export interface HomeworkScore {
  closedCorrect: number
  closedTotal: number
  pendingReview: number
  unanswered: number
}

/** One row of `GET /homework` — a student's homework for one assignment. */
export interface HomeworkSummary {
  id: string
  assignmentId: string
  title: string
  dueDate: string | null
  lessonId: string | null
  status: HomeworkStatus
  lastOutcome: HomeworkOutcome | null
  attempt: number
  itemCount: number
  student: PersonRef
  teacher: PersonRef
  answeredUnits: number
  totalUnits: number
  lastSavedAt: string | null
  summary: HomeworkScore | null
  submittedAt: string | null
  reviewedAt: string | null
  returnedAt: string | null
  doneAt: string | null
  createdAt: string
  updatedAt: string
}

export interface HomeworkPage {
  homework: HomeworkSummary[]
  total: number
  page: number
  pageSize: number
}

export interface AssignmentItem {
  id: string
  kind: AssignmentItemKind
  title: string
  task: string | null
  responseType: HomeworkResponseType | null
}

export interface HomeworkUnitAnswer {
  assignmentItemId: string
  blockId: string | null
  itemId: string | null
  answer: { text?: string | null; uploadIds?: string[] } | null
}

/** `GET /homework/{id}` — full homework: [HomeworkSummary] fields plus content and answers. */
export interface HomeworkDetail {
  id: string
  status: HomeworkStatus
  instructions: string | null
  feedback: string | null
  items: AssignmentItem[]
  units: HomeworkUnitAnswer[]
}

export interface AnswersSavedResponse {
  updatedAt: string
  lastSavedAt: string | null
  answeredUnits: number
  totalUnits: number
}

export type NotificationType =
  | 'LESSON_CREATED'
  | 'LESSON_REQUESTED'
  | 'LESSON_ACCEPTED'
  | 'LESSON_CANCELLED'
  | 'LESSON_MOVED'
  | 'LESSON_BOOKED'
  | 'RESCHEDULE_REQUESTED'
  | 'RESCHEDULE_ACCEPTED'
  | 'RESCHEDULE_REJECTED'
  | 'JOIN_REQUESTED'
  | 'JOIN_ACCEPTED'
  | 'JOIN_REJECTED'
  | 'CLUB_JOINED'
  | 'LESSON_STARTED'
  | 'LESSON_COMPLETED'
  | 'VOCAB_REVIEW_DUE'
  | 'MATERIAL_SHARED'
  | 'FOLDER_SHARED'
  | 'MATERIAL_ATTACHED_TO_LESSON'
  | 'HOMEWORK_ASSIGNED'
  | 'HOMEWORK_SUBMITTED'
  | 'HOMEWORK_REVIEWED'
  | 'HOMEWORK_RETURNED'

export interface NotificationActor {
  id: string
  firstName: string
  lastName: string
  role: Role
}

export interface Notification {
  id: string
  type: NotificationType
  viewed: boolean
  actor: NotificationActor
  referenceId: string | null
  createdAt: string
}

export interface NotificationPage {
  notifications: Notification[]
  total: number
  page: number
  pageSize: number
}

export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED'
export type GoalSetBy = 'TEACHER' | 'STUDENT'

export interface Goal {
  id: string
  studentId: string
  teacherId: string | null
  description: string
  progress: number
  setBy: GoalSetBy
  targetDate: string | null
  status: GoalStatus
  createdAt: string
  updatedAt: string
}

export interface GoalPage {
  goals: Goal[]
  total: number
  page: number
  pageSize: number
}

export interface UserList {
  users: UserProfile[]
  total: number
  page: number
  pageSize: number
}

export type MaterialType = 'PDF' | 'AUDIO' | 'VIDEO' | 'LINK'
export type MaterialSkill = 'SPEAKING' | 'LISTENING' | 'READING' | 'WRITING' | 'GRAMMAR' | 'VOCAB'

export interface Material {
  id: string
  teacherId: string
  folderId: string | null
  name: string
  type: MaterialType
  level: Level | null
  skill: MaterialSkill | null
  contentType: string | null
  fileSize: number | null
  downloadUrl: string | null
  createdAt: string
}

export interface MaterialPage {
  materials: Material[]
  total: number
  page: number
  pageSize: number
}

export interface MaterialFolder {
  id: string
  teacherId: string
  parentFolderId: string | null
  name: string
  materialCount: number
  childFolderCount: number
  sharedWithCount: number
  createdAt: string
  updatedAt: string
}

export interface FolderTreeNode {
  folder: MaterialFolder
  children: FolderTreeNode[]
}

export interface LessonMaterial {
  material: Material
  attachedBy: string
  attachedAt: string
}

export interface LessonMaterialList {
  items: LessonMaterial[]
}

export interface VideoAccess {
  roomName: string
  accessToken: string
  url: string
}
