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

export type PracticeMode = 'DE_TO_MEANING' | 'MEANING_TO_DE' | 'ARTICLE'
export type PracticeRating = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'

/** When the card would be due next for each grade; ARTICLE cards don't get one. */
export type CardIntervals = Partial<Record<PracticeRating, { dueAt: string; seconds: number }>>

export interface PracticeCard {
  mode: PracticeMode
  isNew: boolean
  word: VocabularyWord
  intervals?: CardIntervals | null
}

/** `GET /practice/queue` — due cards first, then new ones within the daily limit. */
export interface PracticeQueue {
  mode: PracticeMode
  cards: PracticeCard[]
  dueCount: number
  newCount: number
  newLimit: number
  newIntroducedToday: number
}

export interface PracticeStats {
  dueNow: number
  dueToday: number
  newAvailable: number
  newTotal: number
  newLimit: number
  newIntroducedToday: number
  reviewedToday: number
  sentencesToday: number
  sentenceLimit: number
  aiAvailable: boolean
}

export interface ArticleCheckResult {
  correct: boolean
  correctArticle: NounArticle
  rating: PracticeRating
  word: VocabularyWord
}

export interface SentenceFeedback {
  isCorrect: boolean
  corrected: string
  explanation: string
  usesWord: boolean
}

export interface OwnSentence {
  id: string
  studentVocabId: string
  sentence: string
  feedback: SentenceFeedback | null
  createdAt: string
}

/* ─── Document blocks (rendered read-only or answered inside a homework item) ─── */

export type RichMark =
  | { type: 'bold' | 'italic' | 'underline' | 'strike' | 'highlight' }
  | { type: 'link'; attrs: { href: string } }

export interface RichNode {
  type:
    | 'doc'
    | 'paragraph'
    | 'heading'
    | 'bulletList'
    | 'orderedList'
    | 'listItem'
    | 'blockquote'
    | 'hardBreak'
    | 'text'
  attrs?: { level?: number }
  content?: RichNode[]
  text?: string
  marks?: RichMark[]
}

export interface RichText {
  type: 'doc'
  content?: RichNode[]
}

export type BlockType =
  | 'heading'
  | 'rich_text'
  | 'vocab_table'
  | 'grammar_box'
  | 'gap_fill'
  | 'multiple_choice'
  | 'error_correction'
  | 'free_sentences'
  | 'writing_task'
  | 'reading'
  | 'media'
  | 'exam_part'
  | 'free_form'

interface BlockBase {
  id: string
  interactive: boolean
}

export interface Option {
  id: string
  text: string
}

export type QuestionKind = 'OPEN' | 'TRUE_FALSE' | 'CHOICE'

export interface Question {
  id: string
  kind: QuestionKind
  question: string
  options?: Option[]
  solution?: { sampleAnswer?: string; isTrue?: boolean; correctOptionIds?: string[] }
}

export interface HeadingBlock extends BlockBase {
  type: 'heading'
  text: string
  level: 1 | 2 | 3
}
export interface RichTextBlock extends BlockBase {
  type: 'rich_text'
  content: RichText
}
export interface VocabTableBlock extends BlockBase {
  type: 'vocab_table'
  title?: string | null
  rows: { id: string; vocabEntryId: string }[]
}
export interface GrammarBoxBlock extends BlockBase {
  type: 'grammar_box'
  variant: 'TIP' | 'OVERVIEW'
  title?: string | null
  content?: RichText | null
  table?: { headers: string[]; rows: string[][] } | null
  examples?: string[] | null
}
export interface GapFillItem {
  id: string
  text: string
  hint?: string | null
  solution?: { answers: string[][] }
}
export interface GapFillBlock extends BlockBase {
  type: 'gap_fill'
  instructions?: string | null
  wordBox?: string[] | null
  items: GapFillItem[]
}
export interface ChoiceItem {
  id: string
  question: string
  multiple?: boolean
  options: Option[]
  solution?: { correctOptionIds: string[] }
}
export interface MultipleChoiceBlock extends BlockBase {
  type: 'multiple_choice'
  instructions?: string | null
  items: ChoiceItem[]
}
export interface CorrectionItem {
  id: string
  sentence: string
  solution?: { corrected: string; explanation?: string | null }
}
export interface ErrorCorrectionBlock extends BlockBase {
  type: 'error_correction'
  instructions?: string | null
  items: CorrectionItem[]
}
export interface PromptItem {
  id: string
  prompt: string
  solution?: { sampleAnswer: string }
}
export type SentencesPurpose = 'SPEAKING' | 'SENTENCE_BUILDING' | 'USE_WORDS' | 'OTHER'
export interface FreeSentencesBlock extends BlockBase {
  type: 'free_sentences'
  instructions?: string | null
  /** SPEAKING: answered orally, no written answer expected. */
  purpose?: SentencesPurpose | null
  items: PromptItem[]
}
export type Register = 'INFORMAL' | 'FORMAL'
export interface WritingItem {
  id: string
  prompt: string
  register?: Register | null
  points: string[]
  minWords?: number | null
  maxWords?: number | null
  solution?: { sampleAnswer: string }
}
export interface WritingTaskBlock extends BlockBase {
  type: 'writing_task'
  instructions?: string | null
  instructionsTranslation?: { ru?: string | null; uk?: string | null; en?: string | null } | null
  items: WritingItem[]
}
export interface ReadingBlock extends BlockBase {
  type: 'reading'
  title?: string | null
  text: RichText
  questions: Question[]
}
export interface MediaBlock extends BlockBase {
  type: 'media'
  kind: 'AUDIO' | 'VIDEO'
  url?: string | null
  materialId?: string | null
  task?: RichText | null
  questions: Question[]
}
export interface ExamPartBlock extends BlockBase {
  type: 'exam_part'
  exam: string
  part: string
  instructions?: string | null
  timeMinutes?: number | null
  content?: RichText | null
  questions: Question[]
}
export interface FreeFormBlock extends BlockBase {
  type: 'free_form'
  instructions?: string | null
  content: RichText
  items: PromptItem[]
}

export type Block =
  | HeadingBlock
  | RichTextBlock
  | VocabTableBlock
  | GrammarBoxBlock
  | GapFillBlock
  | MultipleChoiceBlock
  | ErrorCorrectionBlock
  | FreeSentencesBlock
  | WritingTaskBlock
  | ReadingBlock
  | MediaBlock
  | ExamPartBlock
  | FreeFormBlock

/** A library word referenced by a vocab_table, already filtered to this viewer's display setting. */
export interface DocumentVocabEntry {
  id: string
  lemma: string
  article: NounArticle | null
  plural: string | null
  wordType: WordType
  forms: string | null
  government: string | null
  exampleSentence: string | null
  level: Level | null
  display?: VocabDisplaySetting
  translations: Record<string, string>
  explanationDe: string | null
  revealTranslations?: Record<string, string> | null
}

export type HomeworkStatus = 'OPEN' | 'SUBMITTED' | 'REVIEWED' | 'DONE'
export type HomeworkOutcome = 'REVIEWED' | 'RETURNED' | 'DONE'
export type AssignmentItemKind = 'DOCUMENT' | 'MATERIAL' | 'TASK'
export type HomeworkResponseType = 'TEXT' | 'AUDIO' | 'VIDEO' | 'FILE'
export type AutoResult = 'CORRECT' | 'INCORRECT' | 'PENDING_REVIEW' | 'UNANSWERED'
export type GapResult = 'CORRECT' | 'CASE_MISMATCH' | 'WRONG'

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
  documentId?: string | null
  documentRevision?: number | null
  blocks?: Block[] | null
  vocab?: DocumentVocabEntry[] | null
  materialId?: string | null
  material?: { id: string; name: string; type: string; contentType?: string | null; downloadUrl?: string | null } | null
}

export interface UnitAddress {
  assignmentItemId: string
  blockId?: string | null
  itemId?: string | null
}

export interface AnswerPayload {
  text?: string | null
  gaps?: string[] | null
  optionIds?: string[] | null
  isTrue?: boolean | null
  /** MATERIAL/TASK with an AUDIO/VIDEO/FILE response: this unit's uploads. */
  uploadIds?: string[] | null
}

export interface HomeworkUnit extends UnitAddress {
  blockType?: BlockType | null
  questionKind?: QuestionKind | null
  check?: 'AUTO' | 'REVIEW'
  answer?: AnswerPayload | null
  answeredAt?: string | null
  autoResult?: AutoResult | null
  autoScore?: number | null
  gapResults?: GapResult[] | null
  /** Teacher override of the auto result; `correct` is the effective verdict shown to the student. */
  teacherCorrect?: boolean | null
  correct?: boolean | null
  comment?: string | null
}

export interface HomeworkUpload {
  id: string
  assignmentItemId: string
  fileName: string
  contentType: string
  size: number
  downloadUrl: string
  createdAt: string
}

/** `GET /homework/{id}` — full homework: [HomeworkSummary] fields plus content and answers. */
export interface HomeworkDetail extends HomeworkSummary {
  instructions: string | null
  feedback: string | null
  items: AssignmentItem[]
  units: HomeworkUnit[]
  uploads: HomeworkUpload[]
}

export interface AnswersSavedResponse {
  updatedAt: string
  lastSavedAt: string | null
  answeredUnits: number
  totalUnits: number
}

/** `GET /homework/counts` — student's dashboard badges. */
export interface HomeworkCounts {
  open: number
  dueSoon: number
  returned: number
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
