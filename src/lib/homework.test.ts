import { describe, expect, it } from 'vitest'
import type { HomeworkOutcome, HomeworkStatus } from '@/api/types'
import { needsStudent } from './homework'

const hw = (status: HomeworkStatus, lastOutcome: HomeworkOutcome | null = null) => ({ status, lastOutcome })

describe('needsStudent', () => {
  it('counts open and returned homework only', () => {
    const list = [
      hw('OPEN'),
      hw('OPEN', 'RETURNED'),
      hw('SUBMITTED'),
      hw('REVIEWED', 'REVIEWED'),
      hw('DONE', 'DONE'),
    ]
    expect(list.filter(needsStudent)).toEqual([hw('OPEN'), hw('OPEN', 'RETURNED')])
  })

  it('does not count homework waiting for the teacher', () => {
    expect(needsStudent(hw('SUBMITTED'))).toBe(false)
    expect(needsStudent(hw('REVIEWED'))).toBe(false)
  })
})
