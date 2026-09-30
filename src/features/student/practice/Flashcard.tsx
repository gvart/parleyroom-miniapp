import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CardIntervals, PracticeRating, VocabularyWord } from '@/api/types'
import { vocabHeadword, vocabMeaning, wordTypeLabelKey } from '@/lib/vocab'
import { RatingBar } from './RatingBar'

/**
 * Front/back card that cross-fades on tap (no 3D rotate — avoids the WebKit
 * backface-visibility bug where both faces briefly show through on iOS).
 */
export function Flashcard({ word, direction, intervals, onRate }: {
  word: VocabularyWord
  direction: 'de-meaning' | 'meaning-de'
  intervals?: CardIntervals | null
  onRate: (rating: PracticeRating) => void
}) {
  const { t } = useTranslation()
  const [flipped, setFlipped] = useState(false)

  useEffect(() => setFlipped(false), [word.id])

  const german = (
    <>
      <span className="eyebrow">{t(wordTypeLabelKey(word.wordType))}</span>
      <div
        className="font-headline"
        style={{ fontSize: 'var(--text-page-title)', lineHeight: 1.1, fontWeight: 900, color: 'var(--ink)' }}
        lang="de"
      >
        {vocabHeadword(word)}
      </div>
    </>
  )
  const meaning = (
    <>
      <span className="eyebrow" style={{ color: 'var(--grape-ink)' }}>
        {t('meaning')}
      </span>
      <div className="font-headline" style={{ fontSize: 'var(--text-page-title)', lineHeight: 1.15, fontWeight: 900 }}>
        {vocabMeaning(word)}
      </div>
      {word.exampleSentence && (
        <div style={{ fontSize: 'var(--text-lead)', color: 'var(--ink-2)', fontStyle: 'italic', lineHeight: 1.45 }} lang="de">
          „{word.exampleSentence}“
        </div>
      )}
    </>
  )
  const front = direction === 'de-meaning' ? german : meaning
  const back = direction === 'de-meaning' ? meaning : german

  return (
    <>
      <div
        style={{ flex: 1, padding: '8px 16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFlipped((f) => !f)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setFlipped((f) => !f)
            }
          }}
          style={{ position: 'relative', width: '100%', maxWidth: 400, height: 'clamp(300px, 52vh, 440px)', cursor: 'pointer' }}
        >
          <div className="practice-face" style={{ opacity: flipped ? 0 : 1, pointerEvents: flipped ? 'none' : 'auto' }}>
            {front}
            <div className="practice-hint">
              <span className="ms" style={{ fontSize: 16 }} aria-hidden="true">
                touch_app
              </span>
              {t('tap_to_reveal')}
            </div>
          </div>
          <div
            className="practice-face practice-back"
            style={{ opacity: flipped ? 1 : 0, pointerEvents: flipped ? 'auto' : 'none' }}
          >
            {back}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px 20px' }}>
        <RatingBar intervals={intervals} disabled={!flipped} onRate={onRate} />
      </div>
    </>
  )
}
