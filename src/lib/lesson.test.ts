import { afterEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { lessonDate, lessonDateLabel, lessonTime } from './lesson'

const t = i18n.t.bind(i18n)

describe('lesson date and time', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a UTC instant in the given time zone', () => {
    expect(lessonTime('2026-10-12T08:00:00Z', 'Europe/Berlin')).toBe('10:00')
    expect(lessonTime('2026-10-12T08:00:00Z', 'America/New_York')).toBe('04:00')
    expect(lessonTime('2026-10-12T08:00:00Z', 'UTC')).toBe('08:00')
  })

  it('reads instants with any offset, not just Z', () => {
    expect(lessonTime('2026-10-12T10:00:00+02:00', 'Europe/Berlin')).toBe('10:00')
    expect(lessonTime('2026-10-12T10:00:00+02:00', 'Asia/Tokyo')).toBe('17:00')
  })

  it('moves the calendar day when the zone crosses midnight', () => {
    expect(lessonDate('2026-10-12T22:30:00Z', 'Europe/Berlin')).toBe('2026-10-13')
    expect(lessonDate('2026-10-12T02:00:00Z', 'America/Los_Angeles')).toBe('2026-10-11')
  })

  it("defaults to the device's zone, including daylight saving", () => {
    // vitest runs with TZ=Europe/Berlin: CET in January, CEST in July.
    expect(lessonTime('2026-01-15T08:00:00Z')).toBe('09:00')
    expect(lessonTime('2026-07-15T08:00:00Z')).toBe('10:00')
  })

  it('labels a lesson after local midnight as tomorrow', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-12T20:00:00Z')) // 22:00 on 12 Oct in Berlin
    expect(lessonDateLabel('2026-10-12T22:30:00Z', t)).toBe('Tomorrow') // 00:30 on 13 Oct
    expect(lessonDateLabel('2026-10-12T21:00:00Z', t)).toBe('Today')
  })
})
