import { splitGaps } from './blocks'

/** One gap of a gap-fill exercise, numbered across the whole exercise. */
export interface GapSlot {
  itemId: string
  /** Gap index inside its sentence. */
  gap: number
  /** Gaps in that sentence. */
  count: number
  /** 0-based sentence index. */
  item: number
}

export function gapSlots(items: { id: string; text: string }[]): GapSlot[] {
  return items.flatMap((it, item) => {
    const count = splitGaps(it.text).length - 1
    return Array.from({ length: count }, (_, gap) => ({ itemId: it.id, gap, count, item }))
  })
}

const filled = (v: string | undefined) => !!v?.trim()

/** First empty gap after `after` (wrapping round), or null when every gap is filled. */
export function nextEmpty(values: string[], after = -1): number | null {
  for (let step = 1; step <= values.length; step++) {
    const i = (after + step + values.length) % values.length
    if (!filled(values[i])) return i
  }
  return null
}

/** Per word-box chip: is it in a gap? Duplicate words are used up one chip at a time. */
export function usedChips(words: string[], values: string[]): boolean[] {
  const inGaps = new Map<string, number>()
  for (const v of values) if (filled(v)) inGaps.set(v.trim(), (inGaps.get(v.trim()) ?? 0) + 1)
  const seen = new Map<string, number>()
  return words.map((w) => {
    const k = seen.get(w) ?? 0
    seen.set(w, k + 1)
    return k < (inGaps.get(w) ?? 0)
  })
}

/**
 * Put `word` into gap `target`. A word whose chips are all in gaps moves: it leaves its
 * other gap. Returns the new values and the gap to make active next (null when all filled).
 */
export function placeWord(words: string[], values: string[], word: string, target: number) {
  const next = [...values]
  if (next[target]?.trim() !== word) {
    const inGaps = next.filter((v) => v.trim() === word).length
    if (inGaps >= words.filter((w) => w === word).length) {
      const from = next.findIndex((v, i) => i !== target && v.trim() === word)
      if (from >= 0) next[from] = ''
    }
    next[target] = word
  }
  return { values: next, active: nextEmpty(next, target) }
}
