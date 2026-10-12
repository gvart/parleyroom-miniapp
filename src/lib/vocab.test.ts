import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '@/i18n'
import { vocabAddedLabel, vocabDueLabel } from './vocab'

const t = i18n.t.bind(i18n)

// vitest runs with TZ=Europe/Berlin (vite.config.ts).
describe('vocab dates in the device time zone', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-12T20:00:00Z')) // 22:00 on 12 Oct in Berlin
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reads a due instant after local midnight as tomorrow, not today', () => {
    // 23:30 UTC on 12 Oct is 01:30 on 13 Oct in Berlin; slicing the ISO string said "Today".
    expect(vocabDueLabel('2026-10-12T23:30:00Z', t)).toBe('Tomorrow')
    expect(vocabDueLabel('2026-10-12T21:00:00Z', t)).toBe('Today')
  })

  it('uses the given zone when one is passed', () => {
    expect(vocabDueLabel('2026-10-12T23:30:00Z', t, 'UTC')).toBe('Today')
  })

  it('reads a due instant before local midnight as overdue', () => {
    // 22:30 UTC on 10 Oct is 00:30 on 11 Oct in Berlin: still overdue, but on the 11th.
    expect(vocabDueLabel('2026-10-10T22:30:00Z', t)).toBe('Overdue')
  })

  it('returns null without a due date', () => {
    expect(vocabDueLabel(null, t)).toBeNull()
  })

  it('labels the added day in the device zone', () => {
    expect(vocabAddedLabel('2026-10-12T23:30:00Z')).toBe('Oct 13')
  })
})
