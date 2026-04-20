import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pill } from '@/ui'
import { useLessons } from '@/hooks/useLessons'
import { isClub, lessonDate, lessonTime, todayISO } from '@/lib/lesson'
import { BookLessonSheet } from './BookLessonSheet'
import { LessonActionsSheet } from './LessonActionsSheet'
import type { Lesson } from '@/api/types'

const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface DayCell {
  iso: string
  label: string
  dayNum: number
  isToday: boolean
  hasLessons: boolean
}

function startOfWeek(today: Date): Date {
  const d = new Date(today)
  const dow = d.getDay() // 0 = Sun
  const diff = (dow + 6) % 7 // days since Monday
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function isoFromDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function Calendar() {
  const { t } = useTranslation()
  const lessonsQuery = useLessons()
  const today = todayISO()
  const [selected, setSelected] = useState(today)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [openedLesson, setOpenedLesson] = useState<Lesson | null>(null)

  const week = useMemo<DayCell[]>(() => {
    const start = startOfWeek(new Date())
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const iso = isoFromDate(d)
      const lessonsByDate = (lessonsQuery.data?.lessons ?? []).some(
        (l) => lessonDate(l.scheduledAt) === iso,
      )
      return {
        iso,
        label: DAY_LABELS[i],
        dayNum: d.getDate(),
        isToday: iso === today,
        hasLessons: lessonsByDate,
      }
    })
  }, [lessonsQuery.data, today])

  const dayLessons = useMemo<Lesson[]>(() => {
    return (lessonsQuery.data?.lessons ?? [])
      .filter((l) => lessonDate(l.scheduledAt) === selected)
      .sort((a, b) => lessonTime(a.scheduledAt).localeCompare(lessonTime(b.scheduledAt)))
  }, [lessonsQuery.data, selected])

  const monthLabel = useMemo(() => {
    const d = new Date(selected)
    return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
  }, [selected])

  return (
    <div>
      <div
        style={{
          padding: '8px 20px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-3)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            {t('calendar')}
          </div>
          <div
            className="serif"
            style={{ fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            {monthLabel}
            <span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="tap"
          aria-label={t('book_lesson_title')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: 'var(--ink)',
            color: 'var(--bg)',
            border: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span className="ms" style={{ fontSize: 20 }}>
            add
          </span>
        </button>
      </div>

      <div style={{ padding: '0 12px 16px', display: 'flex', gap: 4 }}>
        {week.map((d) => {
          const active = selected === d.iso
          return (
            <button
              type="button"
              key={d.iso}
              onClick={() => setSelected(d.iso)}
              className="tap"
              style={{
                flex: 1,
                border: 0,
                cursor: 'pointer',
                padding: '10px 0',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? 'var(--bg)' : 'var(--ink)',
                borderRadius: 14,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  opacity: 0.7,
                }}
              >
                {d.label}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: d.isToday ? 700 : 600,
                  letterSpacing: '-0.02em',
                }}
              >
                {d.dayNum}
              </div>
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  background: d.hasLessons ? 'var(--accent)' : 'transparent',
                }}
              />
            </button>
          )
        })}
      </div>

      <div style={{ padding: '0 20px' }}>
        {dayLessons.length === 0 ? (
          <div style={{ padding: '40px 30px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>·</div>
            <div className="serif" style={{ fontSize: 20, color: 'var(--ink-2)' }}>
              {t('no_lessons_today')}
            </div>
          </div>
        ) : (
          HOURS.map((h, i) => {
            const inHour = dayLessons.filter(
              (l) => parseInt(lessonTime(l.scheduledAt).split(':')[0], 10) === parseInt(h, 10),
            )
            return (
              <div
                key={h}
                style={{
                  display: 'flex',
                  gap: 14,
                  minHeight: 50,
                  borderTop: i === 0 ? 0 : '1px dashed var(--hair)',
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              >
                <div className="mono" style={{ width: 32, fontSize: 11, color: 'var(--ink-3)', paddingTop: 2 }}>
                  {h}:00
                </div>
                <div style={{ flex: 1 }}>
                  {inHour.map((l) => {
                    const live = l.status === 'IN_PROGRESS'
                    const club = isClub(l)
                    const teacherName =
                      l.students.find((s) => s.id === l.teacherId)?.firstName ?? ''
                    return (
                      <button
                        type="button"
                        key={l.id}
                        onClick={() => setOpenedLesson(l)}
                        className="tap"
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          background: live
                            ? 'linear-gradient(135deg, oklch(0.38 0.12 145), oklch(0.28 0.1 200))'
                            : club
                              ? 'oklch(0.94 0.04 290)'
                              : 'var(--card)',
                          color: live
                            ? '#F2F1EC'
                            : club
                              ? 'oklch(0.35 0.12 290)'
                              : 'var(--ink)',
                          padding: '10px 12px',
                          borderRadius: 14,
                          border: live ? 0 : '1px solid var(--hair)',
                          marginBottom: 4,
                          boxShadow: live
                            ? '0 8px 20px oklch(0.28 0.1 200 / 0.3)'
                            : 'none',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 2,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {l.topic}
                          </div>
                          {live && (
                            <Pill tone="live" style={{ fontSize: 9, padding: '2px 6px' }}>
                              <span className="live-dot" />
                              LIVE
                            </Pill>
                          )}
                        </div>
                        <div style={{ fontSize: 11, opacity: 0.7 }}>
                          {lessonTime(l.scheduledAt)} · {l.durationMinutes}m ·{' '}
                          {club
                            ? `${l.students.length}${l.maxParticipants ? `/${l.maxParticipants}` : ''}`
                            : teacherName}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      <BookLessonSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        defaultDate={selected}
      />
      <LessonActionsSheet
        open={Boolean(openedLesson)}
        lesson={openedLesson}
        onClose={() => setOpenedLesson(null)}
      />
    </div>
  )
}
