import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useAvailableSlots } from '@/hooks/useAvailableSlots'
import { lessonTime, todayISO } from '@/lib/lesson'
import { formatShortDate, formatWeekdayShort } from '@/lib/intl'
import type { AvailableSlot } from '@/api/types'

// Same solid-accent "selected" look as the calendar's day strip, in place of
// `.chip.on`'s default soft tint.
const CHIP_ON_STYLE: CSSProperties = {
  background: 'var(--accent-face)',
  borderColor: 'var(--accent-face)',
  color: 'var(--on-accent)',
}

interface SlotPickerProps {
  teacherId: string | undefined
  date: string
  onDateChange: (date: string) => void
  durationMinutes: number
  selectedStart: string | null
  onSelect: (slot: AvailableSlot) => void
}

function addDays(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00`)
  d.setDate(d.getDate() + delta)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Day nav + duration-scoped slot pills, fed by `GET /available-slots`. Shared
 * by BookLessonSheet and RescheduleSheet so both pick a real bookable time
 * instead of free-typing a date/time that might clash.
 */
export function SlotPicker({
  teacherId,
  date,
  onDateChange,
  durationMinutes,
  selectedStart,
  onSelect,
}: SlotPickerProps) {
  const { t } = useTranslation()
  const slotsQuery = useAvailableSlots({ teacherId, date, durationMinutes })
  const canGoBack = date > todayISO()

  // RescheduleSheet's `date` starts as `''` for one render before its effect
  // populates it from the lesson — skip rendering rather than crash on `new Date('')`.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          className="ico-btn"
          disabled={!canGoBack}
          onClick={() => onDateChange(addDays(date, -1))}
          aria-label={t('previous_day')}
          style={{ opacity: canGoBack ? 1 : 0.35 }}
        >
          <span className="ms" style={{ fontSize: 20 }} aria-hidden="true">
            chevron_left
          </span>
        </button>
        <div style={{ fontWeight: 800, fontSize: 'var(--text-small)' }}>
          {formatWeekdayShort(new Date(`${date}T00:00:00`))} · {formatShortDate(date)}
        </div>
        <button
          type="button"
          className="ico-btn"
          onClick={() => onDateChange(addDays(date, 1))}
          aria-label={t('next_day')}
        >
          <span className="ms" style={{ fontSize: 20 }} aria-hidden="true">
            chevron_right
          </span>
        </button>
      </div>

      {!teacherId ? null : slotsQuery.isLoading ? (
        <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', padding: '6px 0' }}>
          {t('loading')}
        </div>
      ) : !slotsQuery.data || slotsQuery.data.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', fontStyle: 'italic' }}>
            {t('no_slots_this_day')}
          </span>
          <button type="button" className="chip" onClick={() => onDateChange(addDays(date, 1))}>
            {t('try_next_day')}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {slotsQuery.data.map((slot) => {
            const active = selectedStart === slot.start
            return (
              <button
                type="button"
                key={slot.start}
                onClick={() => onSelect(slot)}
                aria-pressed={active}
                className={`chip${active ? ' on' : ''}`}
                style={active ? CHIP_ON_STYLE : undefined}
              >
                {lessonTime(slot.start)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
