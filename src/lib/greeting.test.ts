import { describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { greetingKey } from './greeting'

// Local times: getHours() reads the device's time zone.
const at = (hour: number, minute = 0) => new Date(2026, 9, 12, hour, minute)

describe('greetingKey', () => {
  it('follows the time of day', () => {
    expect(greetingKey(at(5))).toBe('good_morning')
    expect(greetingKey(at(11, 59))).toBe('good_morning')
    expect(greetingKey(at(12))).toBe('good_afternoon')
    expect(greetingKey(at(17, 59))).toBe('good_afternoon')
    expect(greetingKey(at(18))).toBe('good_evening')
    expect(greetingKey(at(23, 30))).toBe('good_evening')
  })

  it('has a translation for every greeting', () => {
    for (const hour of [8, 14, 20]) expect(i18n.t(greetingKey(at(hour)))).not.toBe(greetingKey(at(hour)))
  })
})
