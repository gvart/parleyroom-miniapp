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
          status: 'CONFIRMED',
          level: 'B1',
          maxParticipants: null,
          students: [
            { id: 'u-mock', firstName: 'Helena', lastName: 'König', status: 'CONFIRMED' },
            { id: 's1', firstName: 'Lina', lastName: 'Weber', status: 'CONFIRMED' },
          ],
          startedAt: null,
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
          status: 'CONFIRMED',
          level: 'A2',
          maxParticipants: null,
          students: [
            { id: 'u-mock', firstName: 'Helena', lastName: 'König', status: 'CONFIRMED' },
            { id: 's2', firstName: 'Mateo', lastName: 'Alves', status: 'CONFIRMED' },
          ],
          startedAt: null,
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
          status: 'REQUEST',
          level: 'A1',
          maxParticipants: null,
          students: [
            { id: 'u-mock', firstName: 'Helena', lastName: 'König', status: 'CONFIRMED' },
            { id: 's4', firstName: 'Yuki', lastName: 'Tanaka', status: 'REQUESTED' },
          ],
          startedAt: null,
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
        status: 'REQUEST',
        level: null,
        maxParticipants: null,
        students: [
          { id: body?.teacherId ?? 't1', firstName: 'Helena', lastName: 'König', status: 'CONFIRMED' },
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
