import { useMemo, useRef, useState, type TouchEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState, LessonCard, PageHeader, Segmented } from '@/ui'
import { useLessons } from '@/hooks/useLessons'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { useUsers } from '@/hooks/useCreateLesson'
import { DEFAULT_LESSON_DURATION, lessonDate, lessonTime, todayISO } from '@/lib/lesson'
import { formatMonthYear, formatWeekdayShort } from '@/lib/intl'
import { BookLessonSheet } from './BookLessonSheet'
import { LessonActionsSheet } from './LessonActionsSheet'
import { ClubsList } from './ClubsList'
import type { AvailableSlot, Lesson } from '@/api/types'

// Fallback hour range when the day has neither a lesson nor a free slot to
// anchor on — a plausible working day rather than an empty grid.
const FALLBACK_HOURS_START = 8
const FALLBACK_HOURS_END = 20
const SWIPE_THRESHOLD_PX = 40

type Segment = 'schedule' | 'clubs'

interface DayCell {
  iso: string
  label: string
  dayNum: number
  isToday: boolean
  hasLessons: boolean
}

function mondayOfThisWeek(): Date {
  const d = new Date()
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

function hourOf(iso: string): number {
  return Number(lessonTime(iso).slice(0, 2))
}

/** Union of lesson/slot hours, padded by one hour each side; falls back to a plausible working day. */
function hourRange(lessons: Lesson[], slots: AvailableSlot[]): number[] {
  const hours = new Set<number>()
  for (const l of lessons) hours.add(hourOf(l.scheduledAt))
  for (const s of slots) hours.add(hourOf(s.start))
  if (hours.size === 0) {
    return Array.from({ length: FALLBACK_HOURS_END - FALLBACK_HOURS_START + 1 }, (_, i) => i + FALLBACK_HOURS_START)
  }
  const min = Math.max(0, Math.min(...hours) - 1)
  const max = Math.min(23, Math.max(...hours) + 1)
  return Array.from({ length: max - min + 1 }, (_, i) => i + min)
}

export function Calendar() {
  const { t, i18n } = useTranslation()
  const lessonsQuery = useLessons()
  const usersQuery = useUsers()
  const today = todayISO()

  const [segment, setSegment] = useState<Segment>('schedule')
  const [weekOffset, setWeekOffset] = useState(0)
  // Index (Mon=0..Sun=6) kept stable across week paging so "Wed" stays "Wed".
  const [dayIndex, setDayIndex] = useState(() => (new Date().getDay() + 6) % 7)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [initialSlot, setInitialSlot] = useState<AvailableSlot | null>(null)
  const [openedLesson, setOpenedLesson] = useState<Lesson | null>(null)
  const touchStartX = useRef<number | null>(null)

  const teacherId = lessonsQuery.data?.lessons[0]?.teacherId ?? usersQuery.data?.users.find((u) => u.role === 'TEACHER')?.id

  const week = useMemo<DayCell[]>(() => {
    const start = mondayOfThisWeek()
    start.setDate(start.getDate() + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const iso = isoFromDate(d)
      const hasLessons = (lessonsQuery.data?.lessons ?? []).some((l) => lessonDate(l.scheduledAt) === iso)
      return {
        iso,
        label: formatWeekdayShort(d),
        dayNum: d.getDate(),
        isToday: iso === today,
        hasLessons,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonsQuery.data, today, weekOffset, i18n.resolvedLanguage])

  const selected = week[dayIndex]?.iso ?? today

  function changeWeek(delta: number) {
    setWeekOffset((w) => w + delta)
  }

  function onTouchStart(e: TouchEvent<HTMLDivElement>) {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  function onTouchEnd(e: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current == null) return
    const dx = (e.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) changeWeek(dx < 0 ? 1 : -1)
  }

  const dayLessons = useMemo<Lesson[]>(() => {
    return (lessonsQuery.data?.lessons ?? [])
      .filter((l) => lessonDate(l.scheduledAt) === selected)
      .sort((a, b) => lessonTime(a.scheduledAt).localeCompare(lessonTime(b.scheduledAt)))
  }, [lessonsQuery.data, selected])

  const slotsQuery = useAvailableSlots({ teacherId, date: selected, durationMinutes: DEFAULT_LESSON_DURATION })
  const daySlots = slotsQuery.data ?? []

  const monthLabel = useMemo(() => formatMonthYear(new Date(`${selected}T00:00:00`)), [selected, i18n.resolvedLanguage])

  const hours = useMemo(() => hourRange(dayLessons, daySlots), [dayLessons, daySlots])
  const isEmpty = dayLessons.length === 0 && daySlots.length === 0

  function openBooking(slot: AvailableSlot | null = null) {
    setInitialSlot(slot)
    setSheetOpen(true)
  }

  return (
    <div>
      <PageHeader
        eyebrow={t('calendar')}
        title={monthLabel}
        action={
          <button
            type="button"
            onClick={() => openBooking()}
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

      <div style={{ padding: '0 16px 12px' }}>
        <Segmented
          ariaLabel={t('calendar')}
          value={segment}
          onChange={setSegment}
          options={[
            { key: 'schedule', label: t('segment_schedule') },
            { key: 'clubs', label: t('segment_clubs') },
          ]}
        />
      </div>

      {segment === 'clubs' ? (
        <ClubsList />
      ) : (
        <>
          <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              type="button"
              className="ico-btn"
              onClick={() => changeWeek(-1)}
              aria-label={t('previous_week')}
            >
              <span className="ms" style={{ fontSize: 20 }} aria-hidden="true">
                chevron_left
              </span>
            </button>
            <div
              className="card"
              style={{ flex: 1, padding: 6, display: 'flex', gap: 2, borderRadius: 24 }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {week.map((d, i) => {
                const active = dayIndex === i
                return (
                  <button
                    type="button"
                    key={d.iso}
                    onClick={() => setDayIndex(i)}
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
                    <div style={{ fontSize: 18, fontWeight: d.isToday ? 700 : 600, letterSpacing: '-0.02em' }}>
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
            <button
              type="button"
              className="ico-btn"
              onClick={() => changeWeek(1)}
              aria-label={t('next_week')}
            >
              <span className="ms" style={{ fontSize: 20 }} aria-hidden="true">
                chevron_right
              </span>
            </button>
          </div>

          <div style={{ padding: '0 16px' }}>
            {isEmpty ? (
              <EmptyState icon="event_busy" title={t('no_lessons_today')} />
            ) : (
              hours.map((h, i) => {
                const inHour = dayLessons.filter((l) => hourOf(l.scheduledAt) === h)
                const freeSlots = daySlots.filter((s) => hourOf(s.start) === h)
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
                    <div
                      style={{
                        width: 40,
                        fontSize: 'var(--text-caption)',
                        fontWeight: 800,
                        color: 'var(--ink-3)',
                        paddingTop: 4,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {String(h).padStart(2, '0')}:00
                    </div>
                    <div style={{ flex: 1 }}>
                      {inHour.map((l) => (
                        <LessonCard key={l.id} lesson={l} variant="compact" onOpen={setOpenedLesson} />
                      ))}
                      {freeSlots.map((slot) => (
                        <button
                          key={slot.start}
                          type="button"
                          onClick={() => openBooking(slot)}
                          className="tap"
                          aria-label={t('book_slot_at', { time: lessonTime(slot.start) })}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            width: '100%',
                            textAlign: 'left',
                            cursor: 'pointer',
                            background: 'transparent',
                            color: 'var(--accent-ink)',
                            padding: '8px 14px',
                            borderRadius: 18,
                            border: '1.5px dashed var(--hair-strong)',
                            marginBottom: 4,
                            fontFamily: 'inherit',
                            fontSize: 'var(--text-caption)',
                            fontWeight: 800,
                          }}
                        >
                          <span className="ms" style={{ fontSize: 16 }} aria-hidden="true">
                            add
                          </span>
                          {lessonTime(slot.start)}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}

      <BookLessonSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        defaultDate={selected}
        initialSlot={initialSlot}
      />
      <LessonActionsSheet
        open={Boolean(openedLesson)}
        lesson={openedLesson}
        onClose={() => setOpenedLesson(null)}
      />
    </div>
  )
}
