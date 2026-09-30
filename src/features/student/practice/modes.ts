import type { PracticeMode } from '@/api/types'

/** Client-side mode list: adds "write a sentence", which has no queue mode of its own. */
export type PracticeUIMode = PracticeMode | 'SENTENCE'

export const PRACTICE_UI_MODES: PracticeUIMode[] = ['DE_TO_MEANING', 'MEANING_TO_DE', 'ARTICLE', 'SENTENCE']

export const MODE_ICON: Record<PracticeUIMode, string> = {
  DE_TO_MEANING: 'translate',
  MEANING_TO_DE: 'swap_horiz',
  ARTICLE: 'join_inner',
  SENTENCE: 'edit_note',
}

export const MODE_LABEL_KEY: Record<PracticeUIMode, string> = {
  DE_TO_MEANING: 'mode_de_to_meaning',
  MEANING_TO_DE: 'mode_meaning_to_de',
  ARTICLE: 'mode_article',
  SENTENCE: 'mode_sentence',
}

/** `/practice/queue` has no SENTENCE mode; source that session's words from DE_TO_MEANING. */
export function queueModeFor(mode: PracticeUIMode): PracticeMode {
  return mode === 'SENTENCE' ? 'DE_TO_MEANING' : mode
}

export function isPracticeUIMode(value: string | null): value is PracticeUIMode {
  return !!value && (PRACTICE_UI_MODES as string[]).includes(value)
}
