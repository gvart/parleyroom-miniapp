import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, TONE_VARS, type Tone } from '@/ui'
import { haptic, hapticSuccess } from '@/lib/haptics'
import type { ArticleCheckResult, NounArticle, VocabularyWord } from '@/api/types'
import { vocabMeaning } from '@/lib/vocab'

const ARTICLES: NounArticle[] = ['DER', 'DIE', 'DAS']

/** The classic classroom colours: der blue, die red, das green. */
const ARTICLE_TONE: Record<NounArticle, Tone> = { DER: 'sky', DIE: 'coral', DAS: 'leaf' }

/**
 * Article trainer: the noun without its article, three big buttons. The
 * server checks the answer. A right pick moves on by itself after a short
 * pause; a wrong one waits so the student can read the correction.
 */
export function ArticleDrill({ word, onCheck, onNext }: {
  word: VocabularyWord
  /** Resolves with the verdict, or null when the answer couldn't be saved (pick again). */
  onCheck: (article: NounArticle) => Promise<ArticleCheckResult | null>
  onNext: (correct: boolean) => void
}) {
  const { t } = useTranslation()
  const [chosen, setChosen] = useState<NounArticle | null>(null)
  const [result, setResult] = useState<ArticleCheckResult | null>(null)
  const correct = !!result?.correct
  const meaning = vocabMeaning(word)

  useEffect(() => {
    setChosen(null)
    setResult(null)
  }, [word.id])

  const pick = async (a: NounArticle) => {
    if (chosen) return
    setChosen(a)
    const r = await onCheck(a)
    if (!r) {
      setChosen(null)
      return
    }
    setResult(r)
    if (r.correct) {
      hapticSuccess()
      window.setTimeout(() => onNext(true), 900)
    } else {
      haptic('medium')
    }
  }

  return (
    <>
      <div
        style={{ flex: 1, padding: '8px 16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}
      >
        <div className="practice-face" style={{ position: 'relative', width: '100%', maxWidth: 400, height: 'clamp(300px, 52vh, 440px)' }}>
          <span className="eyebrow">{t('article_prompt')}</span>
          <div
            className="font-headline"
            style={{ fontSize: 'var(--text-page-title)', lineHeight: 1.1, fontWeight: 900, color: 'var(--ink)' }}
            lang="de"
          >
            {result ? `${result.correctArticle.toLowerCase()} ${word.lemma}` : word.lemma}
          </div>
          {meaning && <div style={{ fontSize: 'var(--text-body)', color: 'var(--ink-2)' }}>{meaning}</div>}
          <span aria-live="polite" style={{ minHeight: 24 }}>
            {result && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontWeight: 800,
                  color: correct ? 'var(--leaf-ink)' : 'var(--coral-ink)',
                }}
              >
                <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
                  {correct ? 'check_circle' : 'cancel'}
                </span>
                {correct ? t('article_correct') : t('article_incorrect')}
              </span>
            )}
          </span>
        </div>
      </div>

      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', gap: 8 }} role="group" aria-label={t('article_prompt')}>
          {ARTICLES.map((a) => {
            const isAnswer = !!result && a === result.correctArticle
            const isWrongPick = !!result && chosen === a && !correct
            const muted = !!result && !isAnswer && !isWrongPick
            // Before answering: gender colours (der/die/das). After: unambiguous
            // solid success/danger — a gender tone (e.g. die's own coral) must
            // never double as the "correct" or "wrong" signal.
            const style = isAnswer
              ? { background: 'var(--leaf-vivid)', color: 'var(--on-accent)' }
              : isWrongPick
                ? { background: 'var(--coral-vivid)', color: 'var(--on-coral-ink)' }
                : { background: TONE_VARS[ARTICLE_TONE[a]].soft, color: TONE_VARS[ARTICLE_TONE[a]].ink }
            return (
              <button
                type="button"
                key={a}
                disabled={!!chosen}
                onClick={() => pick(a)}
                className="rate-btn"
                style={{ ...style, opacity: muted ? 0.4 : 1 }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  {isAnswer && (
                    <span className="ms fill" style={{ fontSize: 16 }} aria-hidden="true">
                      check
                    </span>
                  )}
                  {isWrongPick && (
                    <span className="ms fill" style={{ fontSize: 16 }} aria-hidden="true">
                      close
                    </span>
                  )}
                  <span style={{ fontSize: 'var(--text-lead)' }} lang="de">
                    {a.toLowerCase()}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        {result && !correct && (
          <Button block style={{ marginTop: 10 }} onClick={() => onNext(false)}>
            {t('practice_next')}
          </Button>
        )}
      </div>
    </>
  )
}
