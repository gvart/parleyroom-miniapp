import type { TFunction } from 'i18next'
import type { VocabularyWord, WordType } from '@/api/types'
import { computeDue, dueLabel } from './homework'

/** Article + lemma, e.g. "der Augenblick". */
export function vocabHeadword(word: VocabularyWord): string {
  return word.article ? `${word.article.toLowerCase()} ${word.lemma}` : word.lemma
}

/** Best available translation for the student's display setting, falling back to the German explanation. */
export function vocabMeaning(word: VocabularyWord): string {
  return (
    word.translations.en ??
    word.translations.ru ??
    Object.values(word.translations)[0] ??
    word.explanationDe ??
    ''
  )
}

const WORD_TYPE_LABEL_KEY: Record<WordType, string> = {
  NOUN: 'word_type_noun',
  VERB: 'word_type_verb',
  ADJECTIVE: 'word_type_adjective',
  ADVERB: 'word_type_adverb',
  PREPOSITION: 'word_type_preposition',
  CONJUNCTION: 'word_type_conjunction',
  PRONOUN: 'word_type_pronoun',
  PHRASE: 'word_type_phrase',
  OTHER: 'word_type_other',
}

export function wordTypeLabelKey(type: WordType): string {
  return WORD_TYPE_LABEL_KEY[type]
}

/** "Overdue" / "Today" / "Wed 8 Oct" for a word's next SRS due date, or null when not scheduled. */
export function vocabDueLabel(due: string | null, t: TFunction): string | null {
  if (!due) return null
  return dueLabel(computeDue(due.slice(0, 10)), t)
}
