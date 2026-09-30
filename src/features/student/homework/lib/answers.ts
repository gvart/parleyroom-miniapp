import type { AnswerPayload, HomeworkUnit, UnitAddress } from '@/api/types'

export type UnitAnswer = AnswerPayload
export type AnswerMap = Record<string, UnitAnswer>

/** Stable key of one answerable unit: assignment item [+ block + block item/question]. */
export const unitKey = (u: UnitAddress) => [u.assignmentItemId, u.blockId, u.itemId].filter(Boolean).join(':')

export function addressOf(key: string): UnitAddress {
  const [assignmentItemId, blockId, itemId] = key.split(':')
  return { assignmentItemId, ...(blockId ? { blockId, itemId } : {}) }
}

export const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length

export function isAnswered(a: UnitAnswer | null | undefined): boolean {
  if (!a) return false
  return !!(a.text?.trim() || a.gaps?.some((g) => g.trim()) || a.optionIds?.length || a.isTrue !== undefined || a.uploadIds?.length)
}

export function answersFromUnits(units: HomeworkUnit[]): AnswerMap {
  const map: AnswerMap = {}
  for (const u of units) if (u.answer) map[unitKey(u)] = u.answer
  return map
}
