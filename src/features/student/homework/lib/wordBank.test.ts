import { describe, expect, it } from 'vitest'
import { gapSlots, nextEmpty, placeWord, usedChips } from './wordBank'

describe('word bank logic', () => {
  it('numbers gaps across the sentences', () => {
    const slots = gapSlots([
      { id: 'a', text: 'Ich ___ müde.' },
      { id: 'b', text: 'Sie ___ gut, er ___ viel.' },
    ])
    expect(slots.map((s) => [s.itemId, s.gap, s.count, s.item])).toEqual([
      ['a', 0, 1, 0],
      ['b', 0, 2, 1],
      ['b', 1, 2, 1],
    ])
  })

  it('finds the next empty gap after the given one, wrapping round', () => {
    expect(nextEmpty(['', 'x', ''], 0)).toBe(2)
    expect(nextEmpty(['', 'x', 'y'], 1)).toBe(0)
    expect(nextEmpty(['x', 'y'])).toBeNull()
    expect(nextEmpty([' ', 'y'])).toBe(0)
  })

  it('marks chips used one at a time for duplicate words', () => {
    expect(usedChips(['die', 'der', 'die'], ['die', '', ''])).toEqual([true, false, false])
    expect(usedChips(['die', 'der', 'die'], ['die', 'die', 'der'])).toEqual([true, true, true])
  })

  it('fills the target and advances to the next empty gap', () => {
    expect(placeWord(['geht', 'kann'], ['', '', ''], 'kann', 1)).toEqual({ values: ['', 'kann', ''], active: 2 })
    expect(placeWord(['geht', 'kann', 'hat'], ['', 'kann', 'hat'], 'geht', 0).active).toBeNull()
  })

  it('moves a used word out of its old gap', () => {
    expect(placeWord(['geht', 'kann'], ['geht', ''], 'geht', 1)).toEqual({ values: ['', 'geht'], active: 0 })
  })

  it('keeps a duplicate word in both gaps while chips remain', () => {
    expect(placeWord(['die', 'die'], ['die', ''], 'die', 1).values).toEqual(['die', 'die'])
  })
})
