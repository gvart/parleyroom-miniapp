// DEV-only network mock for the Parleyroom backend.
// Activated by adding `?mock=1` to the URL during `npm run dev`.
// Lets the miniapp render in a normal browser when the real backend
// is unavailable or when localhost isn't in the CORS allowlist.

interface MockUser {
  role: 'STUDENT' | 'TEACHER'
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// A lesson's `teacher` is a separate field from `students` on the real backend
// (LessonResponse.teacher / LessonResponse.students) — the teacher is never a
// member of `students`. Keep mocks matching that shape.
const TEACHER_MOCK = { id: 'u-mock', firstName: 'Helena', lastName: 'König' }
const TEACHER_REAL = { id: 't1', firstName: 'Helena', lastName: 'König' }

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
    lessons: [
      {
        id: 'l1',
        title: 'Perfekt vs. Präteritum',
        topic: 'Perfekt vs. Präteritum',
        type: 'ONE_ON_ONE',
        scheduledAt: `${today}T09:30:00Z`,
        durationMinutes: 60,
        teacherId: 't1',
        teacher: TEACHER_REAL,
        status: 'CONFIRMED',
        level: 'B1',
        maxParticipants: null,
        students: [
          { id: 'u-mock', firstName: 'Lina', lastName: 'Weber', status: 'CONFIRMED' },
        ],
        startedAt: null,
        createdBy: 't1',
        createdAt: '2026-03-10T00:00:00Z',
        updatedAt: '2026-03-10T00:00:00Z',
      },
      {
        id: 'l2',
        title: 'Reisevokabular',
        topic: 'Reisevokabular',
        type: 'ONE_ON_ONE',
        scheduledAt: `${today}T11:00:00Z`,
        durationMinutes: 45,
        teacherId: 't1',
        teacher: TEACHER_REAL,
        status: 'CONFIRMED',
        level: 'A2',
        maxParticipants: null,
        students: [
          { id: 'u-mock', firstName: 'Lina', lastName: 'Weber', status: 'CONFIRMED' },
        ],
        startedAt: null,
        createdBy: 't1',
        createdAt: '2026-03-10T00:00:00Z',
        updatedAt: '2026-03-10T00:00:00Z',
      },
    ],
    total: 2,
    page: 1,
    pageSize: 20,
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
    ],
    total: 5,
    page: 1,
    pageSize: 20,
  }
}

const MOCK_HOMEWORK_ANSWERS = new Map<string, string>([['h4', 'Alle 10 Sätze im Anhang.']])

function homeworkDetail(id: string) {
  const summary = homeworkBody().homework.find((h) => h.id === id) ?? homeworkSummary({ id })
  const answer = MOCK_HOMEWORK_ANSWERS.get(id) ?? null
  return {
    ...summary,
    instructions: 'Write 150–200 words using at least 4 Perfekt verbs.',
    feedback: id === 'h5' ? 'Very good! Small note on Umlaute.' : null,
    items: [
      {
        id: `ai-${id}`,
        kind: 'TASK',
        title: summary.title,
        task: 'Write 150–200 words using at least 4 Perfekt verbs.',
        responseType: 'TEXT',
      },
    ],
    units: [
      {
        assignmentItemId: `ai-${id}`,
        blockId: null,
        itemId: null,
        answer: answer ? { text: answer } : null,
      },
    ],
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

export function installMockBackend(): void {
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
    locale: 'en',
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
        Object.assign(me, patch)
      }
      return json(me)
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
      const created = {
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
        createdBy: 'u-mock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
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
        level: null,
        createdAt: '2026-01-01T00:00:00Z',
      }
      const sampleStudents = [
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
        locale: 'en',
        createdAt: '2026-02-01T00:00:00Z',
      }))
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
    const answersMatch = url.match(/\/api\/v1\/homework\/([^/]+)\/answers$/)
    if (answersMatch && method === 'PUT') {
      const body = init?.body
        ? (JSON.parse(init.body as string) as {
            answers: Array<{ assignmentItemId: string; answer?: { text?: string | null } | null }>
          })
        : { answers: [] }
      const text = body.answers[0]?.answer?.text
      if (text !== undefined) {
        if (text) MOCK_HOMEWORK_ANSWERS.set(answersMatch[1], text)
        else MOCK_HOMEWORK_ANSWERS.delete(answersMatch[1])
      }
      return json({
        updatedAt: new Date().toISOString(),
        lastSavedAt: new Date().toISOString(),
        answeredUnits: MOCK_HOMEWORK_ANSWERS.has(answersMatch[1]) ? 1 : 0,
        totalUnits: 1,
      })
    }
    const submitMatch = url.match(/\/api\/v1\/homework\/([^/]+)\/submit$/)
    if (submitMatch && method === 'POST') {
      return json({ ...homeworkDetail(submitMatch[1]), status: 'SUBMITTED' })
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
