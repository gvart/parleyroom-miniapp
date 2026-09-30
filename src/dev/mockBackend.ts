// DEV-only network mock for the Parleyroom backend.
// Activated by adding `?mock=1` to the URL during `npm run dev`.
// Lets the miniapp render in a normal browser when the real backend
// is unavailable or when localhost isn't in the CORS allowlist.

interface MockUser {
  role: 'STUDENT' | 'TEACHER'
}

const SUPPORTED_LOCALES = ['ru', 'de', 'en']
const SUPPORTED_NATIVE_LANGUAGES = ['ru', 'uk', 'en']

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDaysISO(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// A lesson's `teacher` is a separate field from `students` on the real backend
// (LessonResponse.teacher / LessonResponse.students) — the teacher is never a
// member of `students`. Keep mocks matching that shape.
const TEACHER_MOCK = { id: 'u-mock', firstName: 'Helena', lastName: 'König' }
const TEACHER_REAL = { id: 't1', firstName: 'Helena', lastName: 'König' }

// Mutable so PUT /students/{id}/native-language can update it in place.
const sampleStudentsList = [
  { id: 's1', firstName: 'Lina', lastName: 'Weber', initials: 'LW', level: 'B1' },
  { id: 's2', firstName: 'Mateo', lastName: 'Alves', initials: 'MA', level: 'A2' },
  { id: 's3', firstName: 'Priya', lastName: 'Shah', initials: 'PS', level: 'B2' },
  { id: 's4', firstName: 'Yuki', lastName: 'Tanaka', initials: 'YT', level: 'A1' },
  { id: 's5', firstName: 'Noa', lastName: 'Ben-Ami', initials: 'NB', level: 'C1' },
  { id: 's6', firstName: 'Sören', lastName: 'Krüger', initials: 'SK', level: 'B1' },
].map((s) => ({
  ...s,
  email: `${s.firstName.toLowerCase()}@example.com`,
  role: 'STUDENT',
  status: 'ACTIVE',
  locale: 'ru',
  nativeLanguage: 'ru' as string,
  localeConfirmedAt: '2026-02-01T00:00:00Z' as string | null,
  createdAt: '2026-02-01T00:00:00Z',
}))

interface MockPendingReschedule {
  newScheduledAt: string
  note: string | null
  requestedBy: string
}

interface MockLesson {
  id: string
  title: string
  topic: string
  type: string
  scheduledAt: string
  durationMinutes: number
  teacherId: string
  teacher: { id: string; firstName: string; lastName: string }
  status: string
  level: string | null
  maxParticipants: number | null
  students: Array<{ id: string; firstName: string; lastName: string; status: string }>
  startedAt: string | null
  pendingReschedule: MockPendingReschedule | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

// Mutable (statuses/pendingReschedule change via cancel/reschedule mocks below) so
// the Calendar's reschedule/cancel flows are demoable against `?mock=1`.
const studentLessonsList: MockLesson[] = [
  {
    id: 'l1',
    title: 'Perfekt vs. Präteritum',
    topic: 'Perfekt vs. Präteritum',
    type: 'ONE_ON_ONE',
    scheduledAt: `${todayISO()}T09:30:00Z`,
    durationMinutes: 60,
    teacherId: 't1',
    teacher: TEACHER_REAL,
    status: 'CONFIRMED',
    level: 'B1',
    maxParticipants: null,
    students: [{ id: 'u-mock', firstName: 'Lina', lastName: 'Weber', status: 'CONFIRMED' }],
    startedAt: null,
    pendingReschedule: null,
    createdBy: 't1',
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'l2',
    title: 'Reisevokabular',
    topic: 'Reisevokabular',
    type: 'ONE_ON_ONE',
    scheduledAt: `${todayISO()}T11:00:00Z`,
    durationMinutes: 45,
    teacherId: 't1',
    teacher: TEACHER_REAL,
    status: 'CONFIRMED',
    level: 'A2',
    maxParticipants: null,
    students: [{ id: 'u-mock', firstName: 'Lina', lastName: 'Weber', status: 'CONFIRMED' }],
    startedAt: null,
    pendingReschedule: null,
    createdBy: 't1',
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'l3',
    title: 'Konversationsclub',
    topic: 'Konversationsclub',
    type: 'SPEAKING_CLUB',
    scheduledAt: `${addDaysISO(1)}T17:00:00Z`,
    durationMinutes: 60,
    teacherId: 't1',
    teacher: TEACHER_REAL,
    status: 'CONFIRMED',
    level: 'B1',
    maxParticipants: 6,
    students: [
      { id: 'u-mock', firstName: 'Lina', lastName: 'Weber', status: 'CONFIRMED' },
      { id: 's2', firstName: 'Mateo', lastName: 'Alves', status: 'CONFIRMED' },
    ],
    startedAt: null,
    pendingReschedule: null,
    createdBy: 't1',
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
  {
    id: 'l4',
    title: 'Konjunktiv II',
    topic: 'Konjunktiv II',
    type: 'ONE_ON_ONE',
    scheduledAt: `${addDaysISO(2)}T14:00:00Z`,
    durationMinutes: 60,
    teacherId: 't1',
    teacher: TEACHER_REAL,
    status: 'CONFIRMED',
    level: 'B1',
    maxParticipants: null,
    students: [{ id: 'u-mock', firstName: 'Lina', lastName: 'Weber', status: 'CONFIRMED' }],
    startedAt: null,
    pendingReschedule: { newScheduledAt: `${addDaysISO(3)}T16:00:00Z`, note: null, requestedBy: 't1' },
    createdBy: 't1',
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
  },
]

interface MockOpenClub {
  id: string
  title: string
  type: string
  scheduledAt: string
  durationMinutes: number
  topic: string
  level: string | null
  teacher: { id: string; firstName: string; lastName: string }
  maxParticipants: number | null
  takenSpots: number
  myStatus: string | null
  /** Mock-only: whether a fresh join resolves straight to CONFIRMED. */
  autoAccept: boolean
}

const openClubsList: MockOpenClub[] = [
  {
    id: 'oc1',
    title: 'Konversationsclub',
    type: 'SPEAKING_CLUB',
    scheduledAt: `${addDaysISO(2)}T17:00:00Z`,
    durationMinutes: 60,
    topic: 'Alltag & Reisen',
    level: 'B1',
    teacher: TEACHER_REAL,
    maxParticipants: 6,
    takenSpots: 2,
    myStatus: null,
    autoAccept: false,
  },
  {
    id: 'oc2',
    title: 'Lesezirkel',
    type: 'READING_CLUB',
    scheduledAt: `${addDaysISO(3)}T18:30:00Z`,
    durationMinutes: 45,
    topic: 'Der Prozess, Kapitel 2',
    level: 'B2',
    teacher: TEACHER_REAL,
    maxParticipants: 5,
    takenSpots: 3,
    myStatus: 'REQUESTED',
    autoAccept: false,
  },
  {
    id: 'oc3',
    title: 'Konversationsclub',
    type: 'SPEAKING_CLUB',
    scheduledAt: `${addDaysISO(1)}T17:00:00Z`,
    durationMinutes: 60,
    topic: 'Beruf & Karriere',
    level: 'B1',
    teacher: TEACHER_REAL,
    maxParticipants: 4,
    takenSpots: 4,
    myStatus: 'CONFIRMED',
    autoAccept: true,
  },
  {
    id: 'oc4',
    title: 'Lesezirkel',
    type: 'READING_CLUB',
    scheduledAt: `${addDaysISO(4)}T18:30:00Z`,
    durationMinutes: 45,
    topic: 'Kurzgeschichten',
    level: 'A2',
    teacher: TEACHER_REAL,
    maxParticipants: 6,
    takenSpots: 6,
    myStatus: null,
    autoAccept: false,
  },
  {
    id: 'oc5',
    title: 'Konversationsclub',
    type: 'SPEAKING_CLUB',
    scheduledAt: `${addDaysISO(5)}T17:00:00Z`,
    durationMinutes: 60,
    topic: 'Nachrichten diskutieren',
    level: null,
    teacher: TEACHER_REAL,
    maxParticipants: null,
    takenSpots: 3,
    myStatus: 'REJECTED',
    autoAccept: false,
  },
]

function lessonsBody(role: MockUser['role']) {
  const today = todayISO()
  if (role === 'TEACHER') {
    return {
      lessons: [
        {
          id: 'tl1',
          title: 'Perfekt vs. Präteritum',
          topic: 'Perfekt vs. Präteritum',
          type: 'ONE_ON_ONE',
          scheduledAt: `${today}T09:30:00Z`,
          durationMinutes: 60,
          teacherId: 'u-mock',
          teacher: TEACHER_MOCK,
          status: 'CONFIRMED',
          level: 'B1',
          maxParticipants: null,
          students: [
            { id: 's1', firstName: 'Lina', lastName: 'Weber', status: 'CONFIRMED' },
          ],
          startedAt: null,
          rawNotes: null,
          createdBy: 'u-mock',
          createdAt: '2026-03-10T00:00:00Z',
          updatedAt: '2026-03-10T00:00:00Z',
        },
        {
          id: 'tl2',
          title: 'Reisevokabular',
          topic: 'Reisevokabular',
          type: 'ONE_ON_ONE',
          scheduledAt: `${today}T11:00:00Z`,
          durationMinutes: 45,
          teacherId: 'u-mock',
          teacher: TEACHER_MOCK,
          status: 'CONFIRMED',
          level: 'A2',
          maxParticipants: null,
          students: [
            { id: 's2', firstName: 'Mateo', lastName: 'Alves', status: 'CONFIRMED' },
          ],
          startedAt: null,
          rawNotes: null,
          createdBy: 'u-mock',
          createdAt: '2026-03-10T00:00:00Z',
          updatedAt: '2026-03-10T00:00:00Z',
        },
        {
          id: 'tl3',
          title: 'Erste Gespräche',
          topic: 'Erste Gespräche',
          type: 'ONE_ON_ONE',
          scheduledAt: `${today}T16:30:00Z`,
          durationMinutes: 45,
          teacherId: 'u-mock',
          teacher: TEACHER_MOCK,
          status: 'REQUEST',
          level: 'A1',
          maxParticipants: null,
          students: [
            { id: 's4', firstName: 'Yuki', lastName: 'Tanaka', status: 'REQUESTED' },
          ],
          startedAt: null,
          rawNotes: null,
          createdBy: 's4',
          createdAt: '2026-03-10T00:00:00Z',
          updatedAt: '2026-03-10T00:00:00Z',
        },
      ],
      total: 3,
      page: 1,
      pageSize: 20,
    }
  }
  return {
    lessons: studentLessonsList,
    total: studentLessonsList.length,
    page: 1,
    pageSize: 100,
  }
}

interface MockNotification {
  id: string
  type: string
  defaultViewed: boolean
  actor: { id: string; firstName: string; lastName: string; role: string }
  referenceId: string | null
  ageMs: number
}

const NOTIFICATION_TEMPLATES: MockNotification[] = [
  {
    id: 'n1',
    type: 'RESCHEDULE_ACCEPTED',
    defaultViewed: false,
    actor: { id: 't1', firstName: 'Helena', lastName: 'König', role: 'TEACHER' },
    referenceId: 'l5',
    ageMs: 1000 * 60 * 12,
  },
  {
    id: 'n2',
    type: 'LESSON_COMPLETED',
    defaultViewed: false,
    actor: { id: 't1', firstName: 'Helena', lastName: 'König', role: 'TEACHER' },
    referenceId: 'l6',
    ageMs: 1000 * 60 * 60 * 3,
  },
  {
    id: 'n3',
    type: 'VOCAB_REVIEW_DUE',
    defaultViewed: true,
    actor: { id: 'u-mock', firstName: 'Lina', lastName: 'Weber', role: 'STUDENT' },
    referenceId: null,
    ageMs: 1000 * 60 * 60 * 24,
  },
]

// Tracks IDs that have been marked viewed during this session. Lives at module
// scope so a single in-app POST /viewed sticks until the page reloads.
const viewedNotificationIds = new Set<string>()

interface MockGoal {
  id: string
  studentId: string
  teacherId: string | null
  description: string
  progress: number
  setBy: string
  targetDate: string | null
  status: string
  createdAt: string
  updatedAt: string
}

let goalsList: MockGoal[] = [
  {
    id: 'g1',
    studentId: 'u-mock',
    teacherId: 't1',
    description: 'Speak 30 minutes a day',
    progress: 72,
    setBy: 'TEACHER',
    targetDate: '2026-04-30',
    status: 'ACTIVE',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'g2',
    studentId: 'u-mock',
    teacherId: null,
    description: 'Learn 10 new words this week',
    progress: 60,
    setBy: 'STUDENT',
    targetDate: '2026-04-22',
    status: 'ACTIVE',
    createdAt: '2026-03-14T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
  {
    id: 'g3',
    studentId: 'u-mock',
    teacherId: 't1',
    description: 'Finish 3 reading tasks',
    progress: 33,
    setBy: 'TEACHER',
    targetDate: '2026-04-30',
    status: 'ACTIVE',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
  },
]

function notificationsBody() {
  const now = Date.now()
  return {
    notifications: NOTIFICATION_TEMPLATES.map((t) => ({
      id: t.id,
      type: t.type,
      viewed: t.defaultViewed || viewedNotificationIds.has(t.id),
      actor: t.actor,
      referenceId: t.referenceId,
      createdAt: new Date(now - t.ageMs).toISOString(),
    })),
    total: NOTIFICATION_TEMPLATES.length,
    page: 1,
    pageSize: 20,
  }
}

const MOCK_STUDENT = { id: 'u-mock', firstName: 'Lina', lastName: 'Weber' }
const MOCK_TEACHER = { id: 't1', firstName: 'Helena', lastName: 'König' }

interface MockHomeworkSummary {
  id: string
  assignmentId: string
  title: string
  dueDate: string | null
  lessonId: string | null
  status: string
  lastOutcome: string | null
  attempt: number
  itemCount: number
  student: typeof MOCK_STUDENT
  teacher: typeof MOCK_TEACHER
  answeredUnits: number
  totalUnits: number
  lastSavedAt: string | null
  summary: unknown
  submittedAt: string | null
  reviewedAt: string | null
  returnedAt: string | null
  doneAt: string | null
  createdAt: string
  updatedAt: string
}

/** Mutates a fixture's status/outcome after a submit — kept outside the pure `homeworkSummary` fixtures. */
const MOCK_STATUS_OVERRIDES = new Map<string, Partial<MockHomeworkSummary>>()

function homeworkSummary(over: Partial<MockHomeworkSummary> & { id: string }): MockHomeworkSummary {
  return {
    assignmentId: `a-${over.id}`,
    title: 'Homework',
    dueDate: null,
    lessonId: null,
    status: 'OPEN',
    lastOutcome: null,
    attempt: 0,
    itemCount: 1,
    student: MOCK_STUDENT,
    teacher: MOCK_TEACHER,
    answeredUnits: 0,
    totalUnits: 1,
    lastSavedAt: null,
    summary: null,
    submittedAt: null,
    reviewedAt: null,
    returnedAt: null,
    doneAt: null,
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-10T00:00:00Z',
    ...over,
    ...MOCK_STATUS_OVERRIDES.get(over.id),
  }
}

function homeworkBody() {
  const today = todayISO()
  return {
    homework: [
      homeworkSummary({
        id: 'h1',
        title: 'Write: A day in Berlin',
        dueDate: today,
      }),
      homeworkSummary({
        id: 'h2',
        title: 'Grammar: Trennbare Verben',
        dueDate: '2026-04-25',
        updatedAt: '2026-03-12T00:00:00Z',
      }),
      homeworkSummary({
        id: 'h3',
        title: 'Reading: Der Prozess, Ch.1',
        dueDate: '2026-04-12',
        createdAt: '2026-03-05T00:00:00Z',
        updatedAt: '2026-03-05T00:00:00Z',
      }),
      homeworkSummary({
        id: 'h4',
        title: 'Vocab: Essen & Trinken',
        status: 'SUBMITTED',
        dueDate: '2026-04-18',
        answeredUnits: 1,
        attempt: 1,
        createdAt: '2026-03-09T00:00:00Z',
        updatedAt: '2026-03-15T00:00:00Z',
        submittedAt: '2026-03-15T00:00:00Z',
      }),
      homeworkSummary({
        id: 'h5',
        title: 'Listening: DW Tagesschau',
        status: 'DONE',
        dueDate: '2026-03-13',
        answeredUnits: 1,
        attempt: 1,
        lastOutcome: 'DONE',
        createdAt: '2026-03-04T00:00:00Z',
        updatedAt: '2026-03-13T00:00:00Z',
        submittedAt: '2026-03-12T00:00:00Z',
        reviewedAt: '2026-03-13T00:00:00Z',
        doneAt: '2026-03-13T00:00:00Z',
      }),
      homeworkSummary({
        id: 'h6',
        title: 'Wochenende in Berlin',
        dueDate: '2026-04-20',
        itemCount: 1,
        totalUnits: 8,
        createdAt: '2026-03-11T00:00:00Z',
        updatedAt: '2026-03-11T00:00:00Z',
      }),
      homeworkSummary({
        id: 'h7',
        title: 'Speaking: Introduce yourself',
        dueDate: '2026-04-15',
        createdAt: '2026-03-11T00:00:00Z',
        updatedAt: '2026-03-11T00:00:00Z',
      }),
      homeworkSummary({
        id: 'h8',
        title: 'Homework scan: workbook p.12',
        dueDate: '2026-04-15',
        createdAt: '2026-03-11T00:00:00Z',
        updatedAt: '2026-03-11T00:00:00Z',
      }),
      homeworkSummary({
        id: 'h9',
        title: 'Write: My favourite season',
        dueDate: '2026-04-10',
        lastOutcome: 'RETURNED',
        attempt: 1,
        answeredUnits: 1,
        createdAt: '2026-03-02T00:00:00Z',
        updatedAt: '2026-03-14T00:00:00Z',
        submittedAt: '2026-03-08T00:00:00Z',
        reviewedAt: '2026-03-14T00:00:00Z',
        returnedAt: '2026-03-14T00:00:00Z',
      }),
    ],
    total: 9,
    page: 1,
    pageSize: 20,
  }
}

/** Mock next-review timings for the four grades (DE_TO_MEANING / MEANING_TO_DE cards). */
function mockIntervals() {
  const now = Date.now()
  return {
    AGAIN: { dueAt: new Date(now + 10 * 60_000).toISOString(), seconds: 600 },
    HARD: { dueAt: new Date(now + 60 * 60_000).toISOString(), seconds: 3_600 },
    GOOD: { dueAt: new Date(now + 24 * 60 * 60_000).toISOString(), seconds: 86_400 },
    EASY: { dueAt: new Date(now + 3 * 24 * 60 * 60_000).toISOString(), seconds: 259_200 },
  }
}

function practiceQueueBody(mode: string) {
  const all = vocabBody().words
  // ARTICLE only makes sense for nouns.
  const words = mode === 'ARTICLE' ? all.filter((w) => w.article) : all
  const cards = words.map((w) => ({
    mode,
    isNew: w.status === 'NEW',
    word: w,
    intervals: mode === 'ARTICLE' ? null : mockIntervals(),
  }))
  return {
    mode,
    cards,
    dueCount: words.filter((w) => w.status === 'REVIEW').length,
    newCount: words.filter((w) => w.status === 'NEW').length,
    newLimit: 10,
    newIntroducedToday: 0,
  }
}

function practiceStatsBody() {
  const words = vocabBody().words
  const dueNow = words.filter((w) => w.status === 'REVIEW').length
  const newAvailable = words.filter((w) => w.status === 'NEW').length
  return {
    dueNow,
    dueToday: dueNow,
    newAvailable,
    newTotal: newAvailable,
    newLimit: 10,
    newIntroducedToday: 0,
    reviewedToday: 3,
    sentencesToday: 0,
    sentenceLimit: 5,
    aiAvailable: true,
  }
}

const mockSentences = new Map<string, unknown[]>()

/* --- Rich document fixture (h6): one of every exercise + context block type --- */

const RICH_TIP = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Use haben for most verbs, sein for movement/change of state.' }] }],
}
const READING_TEXT = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Anna wacht um sieben Uhr auf. Sie trinkt Kaffee und liest die Zeitung.' }] }],
}

const MOCK_VOCAB_ENTRIES = [
  {
    id: 'voc-1',
    lemma: 'Gemütlichkeit',
    article: 'DIE',
    plural: null,
    wordType: 'NOUN',
    forms: null,
    government: null,
    exampleSentence: 'In dieser Kneipe herrscht eine echte Gemütlichkeit.',
    level: 'B1',
    display: { fields: ['en'], allowTranslationToggle: false },
    translations: { en: 'coziness' },
    explanationDe: null,
    revealTranslations: null,
  },
  {
    id: 'voc-2',
    lemma: 'Augenblick',
    article: 'DER',
    plural: 'Augenblicke',
    wordType: 'NOUN',
    forms: null,
    government: null,
    exampleSentence: 'Einen Augenblick, bitte.',
    level: 'B1',
    display: { fields: ['en'], allowTranslationToggle: false },
    translations: { en: 'the moment' },
    explanationDe: null,
    revealTranslations: null,
  },
]

function richDocumentBlocks() {
  return [
    { id: 'b-heading', type: 'heading', interactive: false, text: 'Wochenende in Berlin', level: 1 },
    { id: 'b-rich', type: 'rich_text', interactive: false, content: RICH_TIP },
    { id: 'b-grammar', type: 'grammar_box', interactive: false, variant: 'TIP', title: 'Perfekt mit haben/sein', content: RICH_TIP, examples: ['Ich habe gegessen.', 'Ich bin gegangen.'] },
    { id: 'b-vocab', type: 'vocab_table', interactive: false, title: 'Neue Wörter', rows: [{ id: 'r1', vocabEntryId: 'voc-1' }, { id: 'r2', vocabEntryId: 'voc-2' }] },
    {
      id: 'b-gap',
      type: 'gap_fill',
      interactive: true,
      instructions: 'Fill in the gaps with haben or sein.',
      wordBox: ['bin', 'habe'],
      items: [{ id: 'g1', text: 'Ich ___ gestern ins Kino gegangen.', hint: null }],
    },
    {
      id: 'b-mc',
      type: 'multiple_choice',
      interactive: true,
      instructions: 'Choose the correct answer.',
      items: [{ id: 'm1', question: 'Welches Hilfsverb passt zu "gehen"?', multiple: false, options: [{ id: 'o1', text: 'haben' }, { id: 'o2', text: 'sein' }] }],
    },
    {
      id: 'b-ec',
      type: 'error_correction',
      interactive: true,
      instructions: 'Correct the sentence.',
      items: [{ id: 'e1', sentence: 'Er haben ein Buch gelesen.' }],
    },
    {
      id: 'b-fs',
      type: 'free_sentences',
      interactive: true,
      instructions: 'Write one sentence using each word.',
      purpose: 'USE_WORDS',
      items: [{ id: 'f1', prompt: 'Gemütlichkeit' }],
    },
    {
      id: 'b-wt',
      type: 'writing_task',
      interactive: true,
      instructions: 'Describe your weekend.',
      items: [{ id: 'w1', prompt: 'Was hast du am Wochenende gemacht?', register: 'INFORMAL', points: ['Wo warst du?', 'Was hast du gegessen?'], minWords: 40, maxWords: 100 }],
    },
    {
      id: 'b-reading',
      type: 'reading',
      interactive: true,
      title: 'Annas Tag',
      text: READING_TEXT,
      questions: [
        { id: 'q1', kind: 'TRUE_FALSE', question: 'Anna trinkt Tee.' },
        { id: 'q2', kind: 'OPEN', question: 'Was macht Anna um sieben Uhr?' },
      ],
    },
    {
      id: 'b-media',
      type: 'media',
      interactive: true,
      kind: 'AUDIO',
      url: null,
      task: RICH_TIP,
      questions: [{ id: 'q3', kind: 'CHOICE', question: 'Worum geht es in der Aufnahme?', options: [{ id: 'c1', text: 'Wetter' }, { id: 'c2', text: 'Reisen' }] }],
    },
  ]
}

/** Every answerable unit address for a homework id, in document order. */
function unitDefsFor(id: string): Array<{ assignmentItemId: string; blockId?: string; itemId?: string }> {
  if (id === 'h6') {
    return [
      { assignmentItemId: 'ai-h6', blockId: 'b-gap', itemId: 'g1' },
      { assignmentItemId: 'ai-h6', blockId: 'b-mc', itemId: 'm1' },
      { assignmentItemId: 'ai-h6', blockId: 'b-ec', itemId: 'e1' },
      { assignmentItemId: 'ai-h6', blockId: 'b-fs', itemId: 'f1' },
      { assignmentItemId: 'ai-h6', blockId: 'b-wt', itemId: 'w1' },
      { assignmentItemId: 'ai-h6', blockId: 'b-reading', itemId: 'q1' },
      { assignmentItemId: 'ai-h6', blockId: 'b-reading', itemId: 'q2' },
      { assignmentItemId: 'ai-h6', blockId: 'b-media', itemId: 'q3' },
    ]
  }
  return [{ assignmentItemId: `ai-${id}` }]
}

function ukey(u: { assignmentItemId: string; blockId?: string | null; itemId?: string | null }): string {
  return [u.assignmentItemId, u.blockId, u.itemId].filter(Boolean).join(':')
}

interface MockAnswer {
  text?: string | null
  gaps?: string[] | null
  optionIds?: string[] | null
  isTrue?: boolean | null
  uploadIds?: string[] | null
}

function isAnsweredMock(a: MockAnswer | null | undefined): boolean {
  if (!a) return false
  return !!(a.text?.trim() || a.gaps?.some((g) => g.trim()) || a.optionIds?.length || a.isTrue !== undefined || a.uploadIds?.length)
}

interface MockUpload {
  id: string
  assignmentItemId: string
  fileName: string
  contentType: string
  size: number
  downloadUrl: string
  createdAt: string
}

interface MockHomeworkState {
  answers: Map<string, MockAnswer>
  uploads: MockUpload[]
}

const MOCK_HOMEWORK_STATE = new Map<string, MockHomeworkState>()
const MOCK_UPLOAD_BLOBS = new Map<string, { dataUrl: string; contentType: string }>()

function homeworkState(id: string): MockHomeworkState {
  let state = MOCK_HOMEWORK_STATE.get(id)
  if (!state) {
    state = { answers: new Map(), uploads: [] }
    if (id === 'h4') state.answers.set('ai-h4', { text: 'Alle 10 Sätze im Anhang.' })
    if (id === 'h9') state.answers.set('ai-h9', { text: 'Der Sommer ist meine Lieblingsjahreszeit, weil...' })
    MOCK_HOMEWORK_STATE.set(id, state)
  }
  return state
}

function instructionsFor(id: string): string | null {
  if (id === 'h6') return 'Read the tip, then complete every exercise below.'
  if (id === 'h7') return 'Record yourself introducing your family and hobbies (30–60s).'
  if (id === 'h8') return 'Photograph or scan page 12 of your workbook and upload it here.'
  return 'Write 150–200 words using at least 4 Perfekt verbs.'
}

function feedbackFor(id: string): string | null {
  if (id === 'h5') return 'Very good! Small note on Umlaute.'
  if (id === 'h9') return 'Good structure, but check your Perfekt endings — see the comment below and try again.'
  return null
}

function commentsFor(id: string): Record<string, string> {
  if (id === 'h9') return { 'ai-h9': 'Careful with "ich bin gegessen" — it should be "ich habe gegessen".' }
  return {}
}

function homeworkDetail(id: string) {
  const summary = homeworkBody().homework.find((h) => h.id === id) ?? homeworkSummary({ id })
  const state = homeworkState(id)
  const comments = commentsFor(id)

  const items =
    id === 'h6'
      ? [{ id: 'ai-h6', kind: 'DOCUMENT', title: summary.title, task: null, responseType: null, documentId: 'doc-h6', blocks: richDocumentBlocks(), vocab: MOCK_VOCAB_ENTRIES }]
      : [
          {
            id: `ai-${id}`,
            kind: 'TASK',
            title: summary.title,
            task: instructionsFor(id),
            responseType: id === 'h7' ? 'AUDIO' : id === 'h8' ? 'FILE' : 'TEXT',
          },
        ]

  const units = unitDefsFor(id).map((u) => ({
    ...u,
    answer: state.answers.get(ukey(u)) ?? null,
    comment: comments[ukey(u)] ?? null,
  }))

  return {
    ...summary,
    instructions: instructionsFor(id),
    feedback: feedbackFor(id),
    items,
    units,
    uploads: state.uploads,
  }
}

interface MockVocabWord {
  id: string
  studentId: string
  entryId: string
  lemma: string
  article: string | null
  plural: string | null
  wordType: string
  forms: string | null
  government: string | null
  exampleSentence: string | null
  level: string | null
  topicIds: string[]
  synonyms: string[]
  lessonId: string | null
  status: string
  due: string | null
  reps: number
  lapses: number
  lastReview: string | null
  addedAt: string
  display: { fields: string[]; allowTranslationToggle: boolean }
  translations: Record<string, string>
  explanationDe: string | null
  revealTranslations: Record<string, string> | null
}

function vocabWord(over: Partial<MockVocabWord> & { id: string }): MockVocabWord {
  return {
    studentId: 'u-mock',
    entryId: `e-${over.id}`,
    lemma: 'Wort',
    article: null,
    plural: null,
    wordType: 'NOUN',
    forms: null,
    government: null,
    exampleSentence: null,
    level: 'B1',
    topicIds: [],
    synonyms: [],
    lessonId: null,
    status: 'NEW',
    due: null,
    reps: 0,
    lapses: 0,
    lastReview: null,
    addedAt: '2026-03-01T00:00:00Z',
    display: { fields: ['en'], allowTranslationToggle: false },
    translations: {},
    explanationDe: null,
    revealTranslations: null,
    ...over,
  }
}

function vocabBody() {
  return {
    words: [
      vocabWord({
        id: 'v1',
        lemma: 'Gemütlichkeit',
        article: 'DIE',
        exampleSentence: 'In dieser Kneipe herrscht eine echte Gemütlichkeit.',
        status: 'NEW',
        translations: { en: 'coziness' },
        addedAt: '2026-03-14T00:00:00Z',
      }),
      vocabWord({
        id: 'v2',
        lemma: 'beiläufig',
        wordType: 'ADJECTIVE',
        lessonId: 'l1',
        exampleSentence: 'Er erwähnte es beiläufig.',
        status: 'REVIEW',
        due: '2026-03-16T00:00:00Z',
        reps: 2,
        translations: { en: 'casual, in passing' },
        addedAt: '2026-03-11T00:00:00Z',
      }),
      vocabWord({
        id: 'v3',
        lemma: 'Augenblick',
        article: 'DER',
        lessonId: 'l1',
        exampleSentence: 'Einen Augenblick, bitte.',
        status: 'LEARNED',
        reps: 5,
        translations: { en: 'the moment' },
        addedAt: '2026-03-02T00:00:00Z',
      }),
    ],
    total: 3,
    page: 1,
    pageSize: 20,
  }
}

/**
 * True once `installMockBackend()` has patched `window.fetch` — client-side
 * navigation can drop the `?mock=1` query param, so callers that need to know
 * whether the mock is active (e.g. an XHR-based upload that bypasses `fetch`)
 * should check this instead of re-reading the URL.
 */
export let isMockBackendActive = false

export function installMockBackend(): void {
  isMockBackendActive = true
  const params = new URLSearchParams(window.location.search)
  const role: MockUser['role'] = params.get('role') === 'teacher' ? 'TEACHER' : 'STUDENT'

  const me = {
    id: 'u-mock',
    email: 'mock@example.com',
    firstName: role === 'TEACHER' ? 'Helena' : 'Lina',
    lastName: role === 'TEACHER' ? 'König' : 'Weber',
    initials: role === 'TEACHER' ? 'HK' : 'LW',
    role,
    status: 'ACTIVE',
    locale: 'ru',
    // Student mock starts unconfirmed so the first-run language picker can be
    // exercised on a fresh `?mock=1` load; the teacher mock is pre-confirmed
    // so teacher screens aren't blocked by it.
    nativeLanguage: role === 'STUDENT' ? 'ru' : null,
    localeConfirmedAt: role === 'STUDENT' ? null : '2026-01-01T00:00:00Z',
    level: role === 'TEACHER' ? null : 'B1',
    avatarUrl: null,
    telegramId: 42,
    telegramUsername: 'devuser',
    createdAt: '2026-03-01T00:00:00Z',
  }

  const original = window.fetch.bind(window)

  window.fetch = async (input, init) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url
    const method = (init?.method ?? 'GET').toUpperCase()

    const json = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      })

    if (url.endsWith('/api/v1/token/telegram-miniapp')) {
      return json({
        accessToken: 'mock-access',
        refreshToken: 'mock-refresh',
        accessTokenExpiresIn: 3600,
      })
    }
    if (url.endsWith('/api/v1/password-reset') && method === 'POST') {
      return json({ token: 'mock-reset-token' }, 201)
    }
    if (url.endsWith('/api/v1/password-reset/confirm') && method === 'POST') {
      return new Response(null, { status: 200 })
    }
    if (url.endsWith('/api/v1/users/me/avatar')) {
      if (method === 'POST') {
        const form = init?.body instanceof FormData ? init.body : null
        const file = form?.get('file')
        if (file instanceof Blob) {
          // Encode the uploaded blob as a data URL so the avatar renders without
          // a real backend. Async — wrap in a Promise that resolves to a Response.
          return new Promise<Response>((resolve) => {
            const reader = new FileReader()
            reader.onload = () => {
              ;(me as { avatarUrl?: string | null }).avatarUrl =
                typeof reader.result === 'string' ? reader.result : null
              resolve(json(me))
            }
            reader.onerror = () => resolve(json(me))
            reader.readAsDataURL(file)
          })
        }
        return json(me)
      }
      if (method === 'DELETE') {
        ;(me as { avatarUrl?: string | null }).avatarUrl = null
        return json(me)
      }
    }
    if (url.endsWith('/api/v1/users/me')) {
      if (method === 'PATCH') {
        const patch = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : {}
        const { confirmLocale, locale, nativeLanguage, ...rest } = patch
        if (locale !== undefined && !SUPPORTED_LOCALES.includes(locale as string)) {
          return json({ detail: 'UNSUPPORTED_LOCALE' }, 400)
        }
        if (nativeLanguage !== undefined) {
          if (me.role !== 'STUDENT') {
            return json({ detail: 'NATIVE_LANGUAGE_STUDENTS_ONLY' }, 400)
          }
          if (!SUPPORTED_NATIVE_LANGUAGES.includes(nativeLanguage as string)) {
            return json({ detail: 'UNSUPPORTED_NATIVE_LANGUAGE' }, 400)
          }
        }
        Object.assign(me, rest)
        if (locale !== undefined) (me as { locale: string }).locale = locale as string
        if (nativeLanguage !== undefined) {
          ;(me as { nativeLanguage?: string | null }).nativeLanguage = nativeLanguage as string
        }
        if (confirmLocale) {
          ;(me as { localeConfirmedAt?: string | null }).localeConfirmedAt = new Date().toISOString()
        }
      }
      return json(me)
    }
    const nativeLanguageMatch = url.match(/\/api\/v1\/students\/([^/]+)\/native-language$/)
    if (nativeLanguageMatch && method === 'PUT') {
      const body = init?.body
        ? (JSON.parse(init.body as string) as { nativeLanguage?: string })
        : {}
      if (!body.nativeLanguage || !SUPPORTED_NATIVE_LANGUAGES.includes(body.nativeLanguage)) {
        return json({ detail: 'UNSUPPORTED_NATIVE_LANGUAGE' }, 400)
      }
      const student = sampleStudentsList.find((s) => s.id === nativeLanguageMatch[1])
      if (student) student.nativeLanguage = body.nativeLanguage
      // Mirrors the real VocabSettingsResponse shape loosely — the miniapp
      // only reads `nativeLanguage` off it (via query invalidation, not the body).
      return json({
        fields: ['en'],
        allowTranslationToggle: false,
        nativeLanguage: body.nativeLanguage,
      })
    }
    const videoTokenMatch = url.match(/\/api\/v1\/lessons\/([^/]+)\/video-token$/)
    if (videoTokenMatch && method === 'POST') {
      return json({
        roomName: `mock-room-${videoTokenMatch[1]}`,
        accessToken: 'mock-access-token',
        url: 'mock://livekit',
      })
    }
    const lessonActionMatch = url.match(/\/api\/v1\/lessons\/([^/]+)\/(accept|cancel)$/)
    if (lessonActionMatch && method === 'POST') {
      const [, id, action] = lessonActionMatch
      const existing = studentLessonsList.find((l) => l.id === id)
      if (existing) {
        existing.status = action === 'accept' ? 'CONFIRMED' : 'CANCELLED'
        existing.updatedAt = new Date().toISOString()
        return json(existing)
      }
      return json({
        id,
        title: 'Updated',
        topic: 'Updated',
        type: 'ONE_ON_ONE',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 60,
        teacherId: 'u-mock',
        teacher: TEACHER_MOCK,
        status: action === 'accept' ? 'CONFIRMED' : 'CANCELLED',
        level: 'B1',
        maxParticipants: null,
        students: [],
        startedAt: null,
        createdBy: 'u-mock',
        createdAt: '2026-03-10T00:00:00Z',
        updatedAt: new Date().toISOString(),
      })
    }
    const completeMatch = url.match(/\/api\/v1\/lessons\/([^/]+)\/complete$/)
    if (completeMatch && method === 'POST') {
      return new Response(null, { status: 204 })
    }
    const rescheduleActionMatch = url.match(/\/api\/v1\/lessons\/([^/]+)\/reschedule\/(accept|reject|withdraw)$/)
    if (rescheduleActionMatch && method === 'POST') {
      const [, id, action] = rescheduleActionMatch
      const lesson = studentLessonsList.find((l) => l.id === id)
      if (lesson) {
        if (action === 'accept' && lesson.pendingReschedule) {
          lesson.scheduledAt = lesson.pendingReschedule.newScheduledAt
        }
        lesson.pendingReschedule = null
        lesson.updatedAt = new Date().toISOString()
      }
      if (action === 'reject') return new Response(null, { status: 200 })
      return json(lesson ?? {})
    }
    const rescheduleMatch = url.match(/\/api\/v1\/lessons\/([^/]+)\/reschedule$/)
    if (rescheduleMatch && method === 'POST') {
      const body = init?.body
        ? (JSON.parse(init.body as string) as { newScheduledAt: string; note?: string | null })
        : { newScheduledAt: new Date().toISOString() }
      const lesson = studentLessonsList.find((l) => l.id === rescheduleMatch[1])
      if (lesson) {
        lesson.pendingReschedule = {
          newScheduledAt: body.newScheduledAt,
          note: body.note ?? null,
          requestedBy: 'u-mock',
        }
      }
      return new Response(null, { status: 201 })
    }
    const joinMatch = url.match(/\/api\/v1\/lessons\/([^/]+)\/join$/)
    if (joinMatch && method === 'POST') {
      const club = openClubsList.find((c) => c.id === joinMatch[1])
      if (!club) return json({ detail: 'Lesson not found', code: 'NOT_FOUND' }, 404)
      if (club.myStatus === 'CONFIRMED' || club.myStatus === 'REQUESTED') {
        return json({ detail: 'Already pending or joined', code: 'ALREADY_PARTICIPANT' }, 409)
      }
      if (club.maxParticipants != null && club.takenSpots >= club.maxParticipants) {
        return json({ detail: 'Club is full', code: 'CLUB_FULL' }, 409)
      }
      club.myStatus = club.autoAccept ? 'CONFIRMED' : 'REQUESTED'
      club.takenSpots += 1
      return json({ status: club.myStatus }, 201)
    }
    if (joinMatch && method === 'DELETE') {
      const club = openClubsList.find((c) => c.id === joinMatch[1])
      if (!club || club.myStatus !== 'REQUESTED') {
        return json({ detail: 'Nothing pending', code: 'JOIN_REQUEST_NOT_FOUND' }, 404)
      }
      club.myStatus = null
      club.takenSpots = Math.max(0, club.takenSpots - 1)
      return new Response(null, { status: 204 })
    }
    if (url.endsWith('/api/v1/lessons/open-clubs') && method === 'GET') {
      return json(openClubsList.map(({ autoAccept: _autoAccept, ...club }) => club))
    }
    const slotsMatch = url.match(/\/api\/v1\/teachers\/([^/]+)\/available-slots/)
    if (slotsMatch && method === 'GET') {
      const sp = new URL(url, 'http://x').searchParams
      const date = (sp.get('from') ?? `${todayISO()}T00:00:00Z`).slice(0, 10)
      const durationMinutes = Number(sp.get('durationMinutes') ?? '60')
      const busyHours = new Set(
        studentLessonsList
          .filter((l) => l.scheduledAt.slice(0, 10) === date && l.status !== 'CANCELLED')
          .map((l) => Number(l.scheduledAt.slice(11, 13))),
      )
      const minHour = date === todayISO() ? new Date().getUTCHours() + 1 : 0
      const slots: Array<{ start: string; end: string }> = []
      for (let h = 9; h < 18; h++) {
        if (h < minHour || busyHours.has(h)) continue
        const start = new Date(`${date}T${String(h).padStart(2, '0')}:00:00Z`)
        const end = new Date(start.getTime() + durationMinutes * 60_000)
        slots.push({ start: start.toISOString(), end: end.toISOString() })
      }
      return json({ slots })
    }
    const contentMatch = url.match(/\/api\/v1\/lessons\/([^/]+)\/content$/)
    if (contentMatch && method === 'PATCH') {
      const body = init?.body
        ? (JSON.parse(init.body as string) as { rawNotes?: string | null })
        : {}
      return json({
        id: contentMatch[1],
        title: 'Lesson',
        topic: 'Lesson',
        type: 'ONE_ON_ONE',
        scheduledAt: new Date().toISOString(),
        durationMinutes: 60,
        teacherId: 'u-mock',
        teacher: TEACHER_MOCK,
        status: 'IN_PROGRESS',
        level: null,
        maxParticipants: null,
        students: [],
        startedAt: new Date().toISOString(),
        rawNotes: body.rawNotes ?? null,
        createdBy: 'u-mock',
        createdAt: '2026-03-10T00:00:00Z',
        updatedAt: new Date().toISOString(),
      })
    }
    if (url.endsWith('/api/v1/lessons') && method === 'POST') {
      const body = init?.body
        ? (JSON.parse(init.body as string) as {
            teacherId: string
            studentIds: string[]
            title: string
            topic: string
            type: string
            scheduledAt: string
            durationMinutes?: number
          })
        : null
      const created: MockLesson = {
        id: `l-${Date.now()}`,
        title: body?.title ?? 'New lesson',
        topic: body?.topic ?? 'New lesson',
        type: body?.type ?? 'ONE_ON_ONE',
        scheduledAt: body?.scheduledAt ?? new Date().toISOString(),
        durationMinutes: body?.durationMinutes ?? 60,
        teacherId: body?.teacherId ?? 't1',
        teacher: TEACHER_REAL,
        status: 'REQUEST',
        level: null,
        maxParticipants: null,
        students: [
          { id: 'u-mock', firstName: 'Lina', lastName: 'Weber', status: 'REQUESTED' },
        ],
        startedAt: null,
        pendingReschedule: null,
        createdBy: 'u-mock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      if (role === 'STUDENT') studentLessonsList.push(created)
      return json(created, 201)
    }
    if (url.includes('/api/v1/lessons')) {
      return json(lessonsBody(role))
    }
    if (url.endsWith('/api/v1/users') || url.includes('/api/v1/users?')) {
      const teacher = {
        id: 't1',
        email: 'helena@example.com',
        firstName: 'Helena',
        lastName: 'König',
        initials: 'HK',
        role: 'TEACHER',
        status: 'ACTIVE',
        locale: 'de',
        nativeLanguage: null,
        localeConfirmedAt: '2026-01-01T00:00:00Z',
        level: null,
        createdAt: '2026-01-01T00:00:00Z',
      }
      const sampleStudents = sampleStudentsList
      return json({
        users: [teacher, ...sampleStudents],
        total: 1 + sampleStudents.length,
        page: 1,
        pageSize: 100,
      })
    }
    const reviewMatch = url.match(/\/api\/v1\/vocabulary\/([^/]+)\/review$/)
    if (reviewMatch && method === 'POST') {
      const body = init?.body
        ? (JSON.parse(init.body as string) as { rating?: string })
        : {}
      const match = vocabBody().words.find((w) => w.id === reviewMatch[1])
      return json({
        ...vocabWord({ id: reviewMatch[1] }),
        ...match,
        status: body.rating === 'AGAIN' ? 'REVIEW' : 'LEARNED',
        reps: (match?.reps ?? 0) + 1,
      })
    }
    const articleMatch = url.match(/\/api\/v1\/vocabulary\/([^/]+)\/article$/)
    if (articleMatch && method === 'POST') {
      const body = init?.body ? (JSON.parse(init.body as string) as { article?: string }) : {}
      const word = vocabBody().words.find((w) => w.id === articleMatch[1]) ?? vocabWord({ id: articleMatch[1] })
      const correctArticle = word.article ?? 'DIE'
      const correct = body.article === correctArticle
      return json({ correct, correctArticle, rating: correct ? 'GOOD' : 'AGAIN', word })
    }
    const sentencesMatch = url.match(/\/api\/v1\/vocabulary\/([^/]+)\/sentences$/)
    if (sentencesMatch && method === 'POST') {
      const body = init?.body ? (JSON.parse(init.body as string) as { sentence?: string }) : {}
      const sentence = body.sentence ?? ''
      const created = {
        id: `sent-${Date.now()}`,
        studentVocabId: sentencesMatch[1],
        sentence,
        feedback: {
          isCorrect: true,
          corrected: sentence,
          explanation: 'Nice sentence!',
          usesWord: true,
        },
        createdAt: new Date().toISOString(),
      }
      const list = mockSentences.get(sentencesMatch[1]) ?? []
      mockSentences.set(sentencesMatch[1], [created, ...list])
      return json(created, 201)
    }
    if (sentencesMatch && method === 'GET') {
      return json(mockSentences.get(sentencesMatch[1]) ?? [])
    }
    if (url.includes('/api/v1/practice/queue')) {
      const sp = new URL(url, 'http://x').searchParams
      return json(practiceQueueBody(sp.get('mode') ?? 'DE_TO_MEANING'))
    }
    if (url.includes('/api/v1/practice/stats')) {
      return json(practiceStatsBody())
    }
    if (url.includes('/api/v1/vocabulary')) {
      const sp = new URL(url, 'http://x').searchParams
      const status = sp.get('status')
      const all = vocabBody().words
      const filtered = status ? all.filter((w) => w.status === status) : all
      return json({ words: filtered, total: filtered.length, page: 1, pageSize: 20 })
    }
    if (url.endsWith('/api/v1/assignments') && method === 'POST') {
      const body = init?.body
        ? (JSON.parse(init.body as string) as {
            title: string
            instructions?: string | null
            dueDate?: string | null
            lessonId?: string | null
            studentIds?: string[]
            groupIds?: string[]
            items: Array<{
              kind: string
              documentId?: string | null
              materialId?: string | null
              title?: string | null
              task?: string | null
              responseType?: string | null
            }>
          })
        : { title: 'Homework', items: [] }
      return json(
        {
          id: `a-${Date.now()}`,
          teacherId: 'u-mock',
          title: body.title,
          instructions: body.instructions ?? null,
          dueDate: body.dueDate ?? null,
          lessonId: body.lessonId ?? null,
          groupIds: body.groupIds ?? [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          items: body.items.map((it, i) => ({
            id: `ai-${i}`,
            position: i,
            kind: it.kind,
            title: it.title ?? '',
            task: it.task ?? null,
            responseType: it.responseType ?? null,
            documentId: it.documentId ?? null,
            documentRevision: null,
            blocks: null,
            vocab: null,
            materialId: it.materialId ?? null,
            material: null,
          })),
          homework: (body.studentIds ?? []).map((studentId, i) =>
            homeworkSummary({
              id: `h-${Date.now()}-${i}`,
              title: body.title,
              dueDate: body.dueDate ?? null,
              lessonId: body.lessonId ?? null,
              student: { id: studentId, firstName: 'Student', lastName: '' },
            }),
          ),
        },
        201,
      )
    }
    if (url.endsWith('/api/v1/homework/counts') && method === 'GET') {
      const all = homeworkBody().homework
      const today = todayISO()
      return json({
        open: all.filter((h) => h.status === 'OPEN').length,
        dueSoon: all.filter((h) => h.status === 'OPEN' && !!h.dueDate && h.dueDate <= today).length,
        returned: all.filter((h) => h.lastOutcome === 'RETURNED').length,
      })
    }
    const answersMatch = url.match(/\/api\/v1\/homework\/([^/]+)\/answers$/)
    if (answersMatch && method === 'PUT') {
      const id = answersMatch[1]
      const body = init?.body
        ? (JSON.parse(init.body as string) as {
            answers: Array<{ assignmentItemId: string; blockId?: string | null; itemId?: string | null; answer: MockAnswer | null }>
          })
        : { answers: [] }
      const state = homeworkState(id)
      for (const a of body.answers) {
        const k = ukey(a)
        if (a.answer === null || a.answer === undefined) state.answers.delete(k)
        else state.answers.set(k, a.answer)
      }
      const defs = unitDefsFor(id)
      const answeredUnits = defs.filter((u) => isAnsweredMock(state.answers.get(ukey(u)))).length
      return json({
        updatedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        answeredUnits,
        totalUnits: defs.length,
      })
    }
    const uploadFileMatch = url.match(/\/api\/v1\/homework\/([^/]+)\/uploads\/([^/]+)\/file$/)
    if (uploadFileMatch && method === 'GET') {
      const stored = MOCK_UPLOAD_BLOBS.get(uploadFileMatch[2])
      if (!stored) return new Response(null, { status: 404 })
      const decoded = await original(stored.dataUrl)
      const blob = await decoded.blob()
      return new Response(blob, { status: 200, headers: { 'content-type': stored.contentType } })
    }
    const uploadCreateMatch = url.match(/\/api\/v1\/homework\/([^/]+)\/items\/([^/]+)\/uploads$/)
    if (uploadCreateMatch && method === 'POST') {
      const [, id, itemId] = uploadCreateMatch
      const form = init?.body instanceof FormData ? init.body : null
      const file = form?.get('file')
      if (!(file instanceof Blob)) return json({ detail: 'no file' }, 400)
      return new Promise<Response>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = typeof reader.result === 'string' ? reader.result : ''
          const uploadId = `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          MOCK_UPLOAD_BLOBS.set(uploadId, { dataUrl, contentType: file.type || 'application/octet-stream' })
          const upload: MockUpload = {
            id: uploadId,
            assignmentItemId: itemId,
            fileName: file instanceof File ? file.name : 'upload',
            contentType: file.type || 'application/octet-stream',
            size: file.size,
            downloadUrl: `/api/v1/homework/${id}/uploads/${uploadId}/file`,
            createdAt: new Date().toISOString(),
          }
          homeworkState(id).uploads.push(upload)
          resolve(json(upload, 201))
        }
        reader.onerror = () => resolve(json({ detail: 'upload failed' }, 500))
        reader.readAsDataURL(file)
      })
    }
    const uploadDeleteMatch = url.match(/\/api\/v1\/homework\/([^/]+)\/items\/([^/]+)\/uploads\/([^/]+)$/)
    if (uploadDeleteMatch && method === 'DELETE') {
      const [, id, , uploadId] = uploadDeleteMatch
      const state = homeworkState(id)
      state.uploads = state.uploads.filter((u) => u.id !== uploadId)
      MOCK_UPLOAD_BLOBS.delete(uploadId)
      return new Response(null, { status: 204 })
    }
    const submitMatch = url.match(/\/api\/v1\/homework\/([^/]+)\/submit$/)
    if (submitMatch && method === 'POST') {
      const id = submitMatch[1]
      MOCK_STATUS_OVERRIDES.set(id, { status: 'SUBMITTED', lastOutcome: null, submittedAt: new Date().toISOString() })
      return json(homeworkDetail(id))
    }
    const homeworkDetailMatch = url.match(/\/api\/v1\/homework\/([^/]+)$/)
    if (homeworkDetailMatch && method === 'GET') {
      return json(homeworkDetail(homeworkDetailMatch[1]))
    }
    if (url.includes('/api/v1/homework')) {
      return json(homeworkBody())
    }
    if (url.endsWith('/api/v1/notifications/viewed') && method === 'POST') {
      const body = init?.body
        ? (JSON.parse(init.body as string) as { notificationIds?: string[] })
        : {}
      for (const id of body.notificationIds ?? []) viewedNotificationIds.add(id)
      return new Response(null, { status: 204 })
    }
    if (url.includes('/api/v1/notifications')) {
      return json(notificationsBody())
    }
    if (url.endsWith('/api/v1/materials') && method === 'POST') {
      return new Promise<Response>((resolve) => {
        const form = init?.body instanceof FormData ? init.body : null
        const meta = form?.get('metadata')
        const file = form?.get('file')
        const finalize = (m: Record<string, unknown>) => {
          resolve(
            json(
              {
                id: `mat-${Date.now()}`,
                teacherId: 'u-mock',
                studentId: m.studentId ?? null,
                lessonId: m.lessonId ?? null,
                name: m.name ?? 'New material',
                type: m.type ?? 'PDF',
                contentType: file instanceof Blob ? file.type : null,
                fileSize: file instanceof Blob ? file.size : null,
                downloadUrl: m.url ?? '#',
                createdAt: new Date().toISOString(),
              },
              201,
            ),
          )
        }
        if (meta instanceof Blob) {
          meta
            .text()
            .then((s) => finalize(JSON.parse(s) as Record<string, unknown>))
            .catch(() => finalize({}))
        } else {
          finalize({})
        }
      })
    }
    if (url.includes('/api/v1/materials')) {
      const sp = new URL(url, 'http://x').searchParams
      const type = sp.get('type')
      const all = [
        {
          id: 'm1',
          teacherId: 'u-mock',
          studentId: null,
          lessonId: null,
          name: 'A day in the Black Forest.pdf',
          type: 'PDF',
          contentType: 'application/pdf',
          fileSize: 540000,
          downloadUrl: '#',
          createdAt: '2026-03-01T00:00:00Z',
        },
        {
          id: 'm2',
          teacherId: 'u-mock',
          studentId: null,
          lessonId: null,
          name: 'German news: a gentle intro',
          type: 'AUDIO',
          contentType: 'audio/mpeg',
          fileSize: 3200000,
          downloadUrl: '#',
          createdAt: '2026-02-24T00:00:00Z',
        },
        {
          id: 'm3',
          teacherId: 'u-mock',
          studentId: 's1',
          lessonId: 'tl1',
          name: 'Perfekt vs. Präteritum (slides)',
          type: 'PDF',
          contentType: 'application/pdf',
          fileSize: 820000,
          downloadUrl: '#',
          createdAt: '2026-03-10T00:00:00Z',
        },
        {
          id: 'm4',
          teacherId: 'u-mock',
          studentId: null,
          lessonId: null,
          name: 'Kaffeehaus conversations',
          type: 'VIDEO',
          contentType: 'video/mp4',
          fileSize: 12400000,
          downloadUrl: '#',
          createdAt: '2026-02-20T00:00:00Z',
        },
        {
          id: 'm5',
          teacherId: 'u-mock',
          studentId: null,
          lessonId: null,
          name: 'Ordering at a restaurant',
          type: 'LINK',
          contentType: null,
          fileSize: null,
          downloadUrl: 'https://www.dw.com/en/learn-german/s-2469',
          createdAt: '2026-02-14T00:00:00Z',
        },
        {
          id: 'm6',
          teacherId: 'u-mock',
          studentId: 's1',
          lessonId: null,
          name: 'Letters between friends.pdf',
          type: 'PDF',
          contentType: 'application/pdf',
          fileSize: 410000,
          downloadUrl: '#',
          createdAt: '2026-03-07T00:00:00Z',
        },
      ]
      const filtered = type ? all.filter((m) => m.type === type) : all
      return json({ materials: filtered, total: filtered.length, page: 1, pageSize: 20 })
    }
    const goalActionMatch = url.match(/\/api\/v1\/goals\/([^/]+)\/(complete|abandon)$/)
    if (goalActionMatch && method === 'POST') {
      const [, id, action] = goalActionMatch
      goalsList = goalsList.map((g) =>
        g.id === id
          ? { ...g, status: action === 'complete' ? 'COMPLETED' : 'ABANDONED', progress: action === 'complete' ? 100 : g.progress }
          : g,
      )
      return json(goalsList.find((g) => g.id === id) ?? goalsList[0])
    }
    if (url.endsWith('/api/v1/goals') && method === 'POST') {
      const body = init?.body
        ? (JSON.parse(init.body as string) as {
            description: string
            targetDate?: string | null
          })
        : { description: 'New goal', targetDate: null }
      const created = {
        id: `g-${Date.now()}`,
        studentId: 'u-mock',
        teacherId: null,
        description: body.description,
        progress: 0,
        setBy: 'STUDENT',
        targetDate: body.targetDate ?? null,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      goalsList = [...goalsList, created]
      return json(created)
    }
    if (url.includes('/api/v1/goals')) {
      const sp = new URL(url, 'http://x').searchParams
      const status = sp.get('status')
      const filtered = status ? goalsList.filter((g) => g.status === status) : goalsList
      return json({ goals: filtered, total: filtered.length, page: 1, pageSize: 20 })
    }

    return original(input, init)
  }

  console.warn(`[miniapp] Mock backend active (role=${role}). Add ?role=teacher to switch.`)
}
