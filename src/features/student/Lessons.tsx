import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Section } from '@/ui'
import { useLessons } from '@/hooks/useLessons'
import { lessonDate, lessonTime, todayISO, tomorrowISO } from '@/lib/lesson'
import type { Lesson } from '@/api/types'
import { LessonRow } from './LessonRow'
import { BookLessonSheet } from './BookLessonSheet'
import { LessonActionsSheet } from './LessonActionsSheet'

interface Buckets {
  today: Lesson[]
  tomorrow: Lesson[]
  upcoming: Lesson[]
}

export function Lessons() {
  const { t } = useTranslation()
  const lessonsQuery = useLessons()
  const [showBookSheet, setShowBookSheet] = useState(false)
  const [openedLesson, setOpenedLesson] = useState<Lesson | null>(null)

  const buckets = useMemo<Buckets>(() => {
    const out: Buckets = { today: [], tomorrow: [], upcoming: [] }
    const today = todayISO()
    const tomorrow = tomorrowISO()
    for (const l of lessonsQuery.data?.lessons ?? []) {
      const date = lessonDate(l.scheduledAt)
      if (date === today) out.today.push(l)
      else if (date === tomorrow) out.tomorrow.push(l)
      else if (date > today) out.upcoming.push(l)
    }
    const byTime = (a: Lesson, b: Lesson) =>
      lessonTime(a.scheduledAt).localeCompare(lessonTime(b.scheduledAt))
    out.today.sort(byTime)
    out.tomorrow.sort(byTime)
    out.upcoming.sort(byTime)
    return out
  }, [lessonsQuery.data])

  const isEmpty =
    !lessonsQuery.isLoading &&
    buckets.today.length === 0 &&
    buckets.tomorrow.length === 0 &&
    buckets.upcoming.length === 0

  const groups: Array<{ key: keyof Buckets; eyebrow: string }> = [
    { key: 'today', eyebrow: t('today') },
    { key: 'tomorrow', eyebrow: t('tomorrow') },
    { key: 'upcoming', eyebrow: t('next_up') },
  ]

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ padding: '8px 20px 18px' }}>
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
          {t('lessons')}
        </div>
        <div
          className="serif"
          style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          Your schedule
          <span style={{ color: 'var(--accent)' }}>.</span>
        </div>
      </div>

      {isEmpty ? (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✺</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
            {t('empty_lessons_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 16 }}>
            {t('empty_lessons_sub')}
          </div>
          <button
            type="button"
            onClick={() => setShowBookSheet(true)}
            className="tap"
            style={{
              border: 0,
              background: 'var(--ink)',
              color: 'var(--bg)',
              padding: '10px 18px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t('book')}
          </button>
        </div>
      ) : (
        <>
          {groups.map((g) =>
            buckets[g.key].length > 0 ? (
              <Section key={g.key} eyebrow={g.eyebrow}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {buckets[g.key].map((l) => (
                    <LessonRow key={l.id} lesson={l} onOpen={setOpenedLesson} />
                  ))}
                </div>
              </Section>
            ) : null,
          )}

          <div style={{ padding: '6px 20px 0' }}>
            <button
              onClick={() => setShowBookSheet(true)}
              type="button"
              className="tap"
              style={{
                width: '100%',
                border: '1px dashed var(--hair-strong)',
                background: 'transparent',
                borderRadius: 20,
                padding: '18px 16px',
                color: 'var(--ink-2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'left',
              }}
            >
              <span className="ms" style={{ fontSize: 22, color: 'var(--accent)' }}>
                add_circle
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                  {t('book')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                  {t('book_lesson_title')}
                </div>
              </div>
              <span className="ms" style={{ fontSize: 18, color: 'var(--ink-3)' }}>
                chevron_right
              </span>
            </button>
          </div>
        </>
      )}

      <BookLessonSheet open={showBookSheet} onClose={() => setShowBookSheet(false)} />
      <LessonActionsSheet
        open={Boolean(openedLesson)}
        lesson={openedLesson}
        onClose={() => setOpenedLesson(null)}
      />
    </div>
  )
}
