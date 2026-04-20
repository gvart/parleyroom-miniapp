# miniapp

The Telegram Mini App front-door for **Parleyroom**. Students get the full learning loop (book, reschedule, join shared lessons, live video, reflect, vocab SRS, homework, goals, materials with in-app JWT preview). Teachers get a working management surface (today timeline with start-lesson CTA, request acceptance, student profile with assign-homework / assign-goal / submission review, start & complete live lessons, material upload).

Production: Cloudflare Pages, project `parleyroom-miniapp`, served at `https://miniapp.rosehub.eu`. Backend at `https://api.rosehub.eu` (env var `VITE_API_BASE_URL`).

## Stack

- React 19 + Vite 6 + TypeScript (strict, `noUnusedLocals`, `noUnusedParameters`)
- `@telegram-apps/sdk-react` v3 — `useRawInitData`, `useLaunchParams`, `init()`
- `react-router-dom` v7 — `BrowserRouter` + `<Routes>` per role
- `@tanstack/react-query` v5 — server state, no manual caches
- `react-i18next` — `en` + `de` resources in `src/i18n.ts` (no async loading; keep small)
- No CSS framework. Design tokens live in `src/styles.css` as CSS custom properties; screens use inline styles + those tokens (intentional — see "Design system" below).

## Layout

```
src/
  api/
    client.ts       — apiFetch wrapper, ApiError, setApiToken singleton
    endpoints.ts    — typed endpoint methods (api.lessons(), api.me(), …)
    types.ts        — DTOs mirroring the backend's *Response shapes
  auth/
    AuthGate.tsx    — gate component: bootstraps via signInWithMiniApp, falls back to email/password link form, exposes useAuth()
  hooks/
    useLessons.ts   — TanStack Query wrappers, one per resource
    useVocab.ts
    useUpdateProfile.ts
  layout/
    AppShell.tsx    — viewport container + bottom TabBar, safe-area aware
    ErrorBoundary.tsx
    RoleRouter.tsx  — switches on user.role between student routes and TeacherStub
    ThemeProvider.tsx — toggles `:root.theme-dark` from prefers-color-scheme
    tabs.ts         — STUDENT_TABS / TEACHER_TABS definitions
  ui/               — design primitives ported from the design handoff
    Avatar.tsx, Banner.tsx, Button.tsx, Card.tsx, CategoryDot.tsx,
    Pill.tsx, Ring.tsx, Section.tsx, Sheet.tsx, StatChip.tsx,
    TabBar.tsx, TextField.tsx (+ TextArea, FieldLabel)
  features/
    student/        — Home, Lessons, LessonRow, LessonLive, LessonActionsSheet,
                      RescheduleSheet, LessonReflectSheet, BookLessonSheet,
                      Calendar, Vocab, VocabReview, Goals, Homework, Materials,
                      MaterialPreview, LessonAttachmentsList, VideoTile
    shared/         — Settings, ProfileEdit, ChangePassword, InterfaceLanguage,
                      Notifications
    teacher/        — TeacherHome, Students, StudentProfile, Materials,
                      UploadMaterialSheet, AssignHomeworkSheet,
                      AssignGoalSheet, LessonCompleteSheet
  lib/
    lesson.ts       — date helpers (todayISO, lessonTime, isClub, …)
  i18n.ts           — i18next bootstrap
  env.ts            — DEV-only mockTelegramEnv so the app runs in a normal browser
  main.tsx          — providers tree
  App.tsx           — ThemeProvider > AuthGate > RoleRouter

design-reference/   — the Claude Design handoff bundle (read-only spec)
```

## Auth flow (do not break)

1. `init()` from `@telegram-apps/sdk-react` runs once in `main.tsx`.
2. `<AuthGate>` calls `useRawInitData()` and posts it to `POST /api/v1/token/telegram-miniapp`.
3. **200** → store the access token via `setApiToken()` + `sessionStorage`, fetch `GET /api/v1/users/me`, hand off to children with `useAuth()`.
4. **404 telegram_not_linked** → render the email/password `LinkForm`. On submit: `POST /api/v1/token` (no auth), set token, `POST /api/v1/users/me/telegram/link` to persist the binding, then `GET /users/me`.
5. Subsequent opens skip the form because `signInWithMiniApp` now succeeds.
6. `signOut()` clears the token and resets state — does NOT call `DELETE /api/v1/users/me/telegram` (intentional; unlink is a future Settings action).

## Design system

The visual language is the design handoff's, **not Telegram's theme**:

- Fonts: **Instrument Serif** (display, `.serif`), **Geist** (body), **JetBrains Mono** (`.mono`), **Material Symbols Rounded** (`.ms` / `.ms.fill`). Loaded from Google Fonts in `index.html`.
- Palette tokens: `--bg`, `--card`, `--ink/ink-2/ink-3`, `--hair/hair-strong`, `--accent` (oklch via `--accent-h/c/l`). Dark mode = `:root.theme-dark`. Density compact = `:root.density-compact`.
- Components are **inline-styled** intentionally — keep that pattern when porting more screens. The design uses inline styles + tokens; converting to a CSS-in-JS or utility-class layer would lose 1:1 fidelity. Do not refactor `ui/` into Tailwind / CSS modules.
- Telegram theme vars are not used for body styling; only safe-area insets matter (`env(safe-area-inset-*)`).

## Design reference

`design-reference/` is the verbatim Claude Design handoff (HTML/JSX prototypes). When adding any new screen, port the corresponding `pr-screens-*.jsx` 1:1 — read it top to bottom before writing TSX. The data model in `pr-data.jsx` mirrors the real backend types but uses lowercase enums (e.g. `'one-on-one'`); the real API is uppercase (`'ONE_ON_ONE'`). Translate at the edges.

## Backend contract

OpenAPI at `http://rose.local/swagger/documentation.yaml` (LAN only). Critical things to remember:
- `UserResponse.role` is uppercase `ADMIN | STUDENT | TEACHER`.
- `GET /api/v1/lessons` returns `LessonPageResponse { lessons, total, page, pageSize }`, not a raw array. `lesson.scheduledAt` is one ISO datetime; split with `lessonDate()` / `lessonTime()` from `lib/lesson.ts`.
- `GET /api/v1/vocabulary` returns `VocabularyPageResponse { words, ... }`. Status enum is `NEW | REVIEW | LEARNED`.
- `PATCH /api/v1/users/me` accepts `{ firstName?, lastName?, locale?, level? }`. Send only changed fields.

## Dev

```
npm run dev       # http://localhost:5174 — mocked Telegram env, talks to localhost:8080
npm run build     # tsc -b && vite build → dist/
npm run preview
```

`src/env.ts` mocks the Telegram environment in DEV so the app renders in a normal browser. Edit the mock user there to test different ids / roles.

## UI primitives — use them, don't duplicate

When building a new screen or sheet, compose from `src/ui/`:

- **Button** — variants `primary` | `secondary` | `danger` | `ghost`, sizes `md` | `sm`, `block`, `leadingIcon`, `loading`, `disabled`. Don't hand-roll pill buttons.
- **TextField / TextArea** — already include the uppercase label + error/hint slot. Don't redeclare the input styles.
- **Banner** — tones `info` | `warn` | `error` | `success`. Don't paste `oklch(0.96 0.05 25)` banners inline.
- **Sheet** — every modal is a bottom sheet. Use `dark` prop only for video-context sheets.

The inline-styles-with-tokens pattern still applies **inside** these primitives; don't refactor them to Tailwind or CSS modules (intentional per the Claude Design handoff).

## Backend contract (selected)

Full list in `src/api/endpoints.ts`. Lesson lifecycle beyond the obvious:

- `POST /lessons/{id}/reschedule` (body `{ newScheduledAt, note? }`) → request. Counterparty confirms via `POST /lessons/{id}/reschedule/accept` or `.../reject`. `Lesson.pendingReschedule` surfaces the in-flight proposal.
- `POST /lessons/{id}/join` — student requests to join a group lesson. Teacher confirms per-student via `POST /lessons/{id}/participants/{studentId}/accept`.
- `POST /lessons/{id}/start` — teacher-only. Returns `{ document, videoRoom }`. Sets IN_PROGRESS so students can join the room.
- `POST /lessons/{id}/complete` — teacher-only. Body accepts `teacherNotes`, `teacherWentWell`, `teacherWorkingOn` (all optional).
- `POST /lessons/{id}/reflect` — student-only. Body accepts `studentReflection`, `studentHardToday` (at least one required).
- `POST /homework` — teacher assigns. Body: `{ studentId, title, category, description?, lessonId?, dueDate? }`. Enum values in `types.ts`.
- `PUT /goals/{id}/progress` body `{ progress }` (0-100). Separate from `/complete` and `/abandon`.

## Out of scope (follow-ups)

In-app theme/density panel, teacher-side homework grading (status review beyond read), shared lesson document sync, vocab manual status override, lesson reschedule counter-proposals, push notifications, offline cache.
