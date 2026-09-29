import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState, PageHeader, Section } from '@/ui'
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
      <PageHeader eyebrow={t('lessons')} title={t('your_schedule')} />

      {isEmpty ? (
        <EmptyState
          icon="event_available"
          title={t('empty_lessons_title')}
          sub={t('empty_lessons_sub')}
          action={
            <Button leadingIcon="add" onClick={() => setShowBookSheet(true)}>
              {t('book')}
            </Button>
          }
        />
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

          <div style={{ padding: '4px 16px 0' }}>
            <button
              onClick={() => setShowBookSheet(true)}
              type="button"
              className="row-btn tap"
              style={{
                border: '1.5px dashed var(--hair-strong)',
                borderRadius: 22,
                padding: '14px 16px',
              }}
            >
              <span className="icon-tile">
                <span className="ms" style={{ fontSize: 22 }} aria-hidden="true">
                  add
                </span>
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 800 }}>{t('book')}</div>
                <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-2)', marginTop: 2 }}>
                  {t('book_lesson_title')}
                </div>
              </div>
              <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }} aria-hidden="true">
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
