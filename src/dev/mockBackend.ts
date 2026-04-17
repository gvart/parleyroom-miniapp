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

function lessonsBody(role: MockUser['role']) {
  if (role === 'TEACHER') return { lessons: [], total: 0, page: 1, pageSize: 20 }
  const today = todayISO()
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
        status: 'CONFIRMED',
        level: 'B1',
        maxParticipants: null,
        students: [
          { id: 't1', firstName: 'Helena', lastName: 'König', status: 'CONFIRMED' },
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
        status: 'CONFIRMED',
        level: 'A2',
        maxParticipants: null,
        students: [
          { id: 't1', firstName: 'Helena', lastName: 'König', status: 'CONFIRMED' },
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

function homeworkBody() {
  const today = todayISO()
  return {
    homework: [
      {
        id: 'h1',
        studentId: 'u-mock',
        teacherId: 't1',
        lessonId: 'l1',
        title: 'Write: A day in Berlin',
        description: 'Write 150–200 words using at least 4 Perfekt verbs.',
        category: 'WRITING',
        status: 'OPEN',
        dueDate: today,
        submissionText: null,
        submissionUrl: null,
        teacherFeedback: null,
        attachmentType: null,
        attachmentUrl: null,
        attachmentName: null,
        createdAt: '2026-03-10T00:00:00Z',
        updatedAt: '2026-03-10T00:00:00Z',
      },
      {
        id: 'h2',
        studentId: 'u-mock',
        teacherId: 't1',
        lessonId: 'l1',
        title: 'Grammar: Trennbare Verben',
        description: 'Complete exercises 1–12 in the workbook.',
        category: 'GRAMMAR',
        status: 'OPEN',
        dueDate: '2026-04-25',
        submissionText: null,
        submissionUrl: null,
        teacherFeedback: null,
        attachmentType: null,
        attachmentUrl: null,
        attachmentName: null,
        createdAt: '2026-03-10T00:00:00Z',
        updatedAt: '2026-03-12T00:00:00Z',
      },
      {
        id: 'h3',
        studentId: 'u-mock',
        teacherId: 't1',
        lessonId: null,
        title: 'Reading: Der Prozess, Ch.1',
        description: 'Read chapter 1 and note 5 new words.',
        category: 'READING',
        status: 'OPEN',
        dueDate: '2026-04-12',
        submissionText: null,
        submissionUrl: null,
        teacherFeedback: null,
        attachmentType: null,
        attachmentUrl: null,
        attachmentName: null,
        createdAt: '2026-03-05T00:00:00Z',
        updatedAt: '2026-03-05T00:00:00Z',
      },
      {
        id: 'h4',
        studentId: 'u-mock',
        teacherId: 't1',
        lessonId: 'l2',
        title: 'Vocab: Essen & Trinken',
        description: 'Create 10 example sentences.',
        category: 'VOCABULARY',
        status: 'IN_REVIEW',
        dueDate: '2026-04-18',
        submissionText: 'Alle 10 Sätze im Anhang.',
        submissionUrl: null,
        teacherFeedback: null,
        attachmentType: null,
        attachmentUrl: null,
        attachmentName: null,
        createdAt: '2026-03-09T00:00:00Z',
        updatedAt: '2026-03-15T00:00:00Z',
      },
      {
        id: 'h5',
        studentId: 'u-mock',
        teacherId: 't1',
        lessonId: 'l2',
        title: 'Listening: DW Tagesschau',
        description: 'Listen and transcribe the first 2 minutes.',
        category: 'LISTENING',
        status: 'DONE',
        dueDate: '2026-03-13',
        submissionText: 'Eingereicht.',
        submissionUrl: null,
        teacherFeedback: 'Very good! Small note on Umlaute.',
        attachmentType: null,
        attachmentUrl: null,
        attachmentName: null,
        createdAt: '2026-03-04T00:00:00Z',
        updatedAt: '2026-03-13T00:00:00Z',
      },
    ],
    total: 5,
    page: 1,
    pageSize: 20,
  }
}

function vocabBody() {
  return {
    words: [
      {
        id: 'v1',
        studentId: 'u-mock',
        lessonId: null,
        german: 'die Gemütlichkeit',
        english: 'coziness',
        exampleSentence: 'In dieser Kneipe herrscht eine echte Gemütlichkeit.',
        exampleTranslation: 'This pub has real coziness.',
        category: 'NOUN',
        status: 'NEW',
        nextReviewAt: null,
        reviewCount: 0,
        addedAt: '2026-03-14T00:00:00Z',
      },
      {
        id: 'v2',
        studentId: 'u-mock',
        lessonId: 'l1',
        german: 'beiläufig',
        english: 'casual, in passing',
        exampleSentence: 'Er erwähnte es beiläufig.',
        exampleTranslation: 'He mentioned it in passing.',
        category: 'ADJECTIVE',
        status: 'REVIEW',
        nextReviewAt: '2026-03-16T00:00:00Z',
        reviewCount: 2,
        addedAt: '2026-03-11T00:00:00Z',
      },
      {
        id: 'v3',
        studentId: 'u-mock',
        lessonId: 'l1',
        german: 'der Augenblick',
        english: 'the moment',
        exampleSentence: 'Einen Augenblick, bitte.',
        exampleTranslation: 'One moment, please.',
        category: 'NOUN',
        status: 'LEARNED',
        nextReviewAt: null,
        reviewCount: 5,
        addedAt: '2026-03-02T00:00:00Z',
      },
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
    if (url.endsWith('/api/v1/users/me')) {
      if (method === 'PATCH') {
        const patch = init?.body ? (JSON.parse(init.body as string) as Record<string, unknown>) : {}
        Object.assign(me, patch)
      }
      return json(me)
    }
    if (url.includes('/api/v1/lessons')) {
      return json(lessonsBody(role))
    }
    const reviewMatch = url.match(/\/api\/v1\/vocabulary\/([^/]+)\/review$/)
    if (reviewMatch && method === 'POST') {
      return json({
        id: reviewMatch[1],
        studentId: 'u-mock',
        lessonId: null,
        german: '—',
        english: '—',
        exampleSentence: null,
        exampleTranslation: null,
        category: 'NOUN',
        status: 'LEARNED',
        nextReviewAt: null,
        reviewCount: 1,
        addedAt: '2026-01-01T00:00:00Z',
      })
    }
    if (url.includes('/api/v1/vocabulary')) {
      const sp = new URL(url, 'http://x').searchParams
      const status = sp.get('status')
      const all = vocabBody().words
      const filtered = status ? all.filter((w) => w.status === status) : all
      return json({ words: filtered, total: filtered.length, page: 1, pageSize: 20 })
    }
    const submitMatch = url.match(/\/api\/v1\/homework\/([^/]+)\/submit$/)
    if (submitMatch && method === 'POST') {
      const body = init?.body
        ? (JSON.parse(init.body as string) as { submissionText?: string })
        : {}
      return json({
        id: submitMatch[1],
        studentId: 'u-mock',
        teacherId: 't1',
        lessonId: null,
        title: 'Submitted',
        description: null,
        category: 'WRITING',
        status: 'SUBMITTED',
        dueDate: null,
        submissionText: body.submissionText ?? '',
        submissionUrl: null,
        teacherFeedback: null,
        attachmentType: null,
        attachmentUrl: null,
        attachmentName: null,
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: new Date().toISOString(),
      })
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

    return original(input, init)
  }

  console.warn(`[miniapp] Mock backend active (role=${role}). Add ?role=teacher to switch.`)
}
