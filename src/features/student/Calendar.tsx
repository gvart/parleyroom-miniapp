import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState, LessonCard, PageHeader } from '@/ui'
import { useLessons } from '@/hooks/useLessons'
import { lessonDate, lessonTime, todayISO } from '@/lib/lesson'
import { formatMonthYear, formatWeekdayShort } from '@/lib/intl'
import { BookLessonSheet } from './BookLessonSheet'
import { LessonActionsSheet } from './LessonActionsSheet'
import type { Lesson } from '@/api/types'

const HOURS = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20']

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

export function Calendar() {
  const { t, i18n } = useTranslation()
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
        label: formatWeekdayShort(d),
        dayNum: d.getDate(),
        isToday: iso === today,
        hasLessons: lessonsByDate,
      }
    })
  }, [lessonsQuery.data, today, i18n.resolvedLanguage])

  const dayLessons = useMemo<Lesson[]>(() => {
    return (lessonsQuery.data?.lessons ?? [])
      .filter((l) => lessonDate(l.scheduledAt) === selected)
      .sort((a, b) => lessonTime(a.scheduledAt).localeCompare(lessonTime(b.scheduledAt)))
  }, [lessonsQuery.data, selected])

  const monthLabel = useMemo(
    () => formatMonthYear(new Date(selected)),
    [selected, i18n.resolvedLanguage],
  )

  return (
    <div>
      <PageHeader
        eyebrow={t('calendar')}
        title={monthLabel}
        action={
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="btn-primary"
            aria-label={t('book_lesson_title')}
            style={{ width: 44, minHeight: 44, padding: 0 }}
          >
            <span className="ms" style={{ fontSize: 24 }} aria-hidden="true">
              add
            </span>
          </button>
        }
      />

      <div style={{ padding: '0 16px 16px' }}>
      <div className="card" style={{ padding: 6, display: 'flex', gap: 2, borderRadius: 24 }}>
        {week.map((d) => {
          const active = selected === d.iso
          return (
            <button
              type="button"
              key={d.iso}
              onClick={() => setSelected(d.iso)}
              className="tap"
              aria-pressed={active}
              style={{
                flex: 1,
                border: 0,
                cursor: 'pointer',
                padding: '8px 0',
                background: active ? 'var(--accent-face)' : 'transparent',
                color: active ? 'var(--on-accent)' : d.isToday ? 'var(--accent-ink)' : 'var(--ink)',
                boxShadow: active ? '0 3px 0 var(--accent-base)' : 'none',
                borderRadius: 18,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-label)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  opacity: 0.8,
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
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: d.hasLessons ? (active ? 'var(--on-accent)' : 'var(--accent)') : 'transparent',
                }}
              />
            </button>
          )
        })}
      </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {dayLessons.length === 0 ? (
          <EmptyState icon="event_busy" title={t('no_lessons_today')} />
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
                <div style={{ width: 40, fontSize: 'var(--text-caption)', fontWeight: 800, color: 'var(--ink-3)', paddingTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                  {h}:00
                </div>
                <div style={{ flex: 1 }}>
                  {inHour.map((l) => (
                    <LessonCard key={l.id} lesson={l} variant="compact" onOpen={setOpenedLesson} />
                  ))}
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
