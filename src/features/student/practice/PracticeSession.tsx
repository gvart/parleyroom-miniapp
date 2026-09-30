import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, StatChip, SuccessState } from '@/ui'
import { useCheckArticle, useCreateSentence, usePracticeQueue, useReviewCard } from '@/hooks/usePractice'
import type { NounArticle, PracticeCard, PracticeRating } from '@/api/types'
import { isPracticeUIMode, queueModeFor, type PracticeUIMode } from './modes'
import { Flashcard } from './Flashcard'
import { ArticleDrill } from './ArticleDrill'
import { SentenceCard } from './SentenceCard'

const SESSION_SIZE = 20

/**
 * Fullscreen practice loop over a snapshot of the queue (a re-fetch behind an
 * in-progress session would reshuffle it). Ends in an inline summary.
 */
export function PracticeSession() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const modeParam = params.get('mode')
  const mode: PracticeUIMode = isPracticeUIMode(modeParam) ? modeParam : 'DE_TO_MEANING'

  const queue = usePracticeQueue({ mode: queueModeFor(mode), limit: SESSION_SIZE })
  const review = useReviewCard()
  const checkArticle = useCheckArticle()
  const createSentence = useCreateSentence()

  const [snapshot, setSnapshot] = useState<PracticeCard[] | null>(null)
  const [index, setIndex] = useState(0)
  const [reviewed, setReviewed] = useState(0)
  const [correct, setCorrect] = useState(0)
  const shownAt = useRef(performance.now())

  if (!snapshot && queue.data) setSnapshot(queue.data.cards)

  const list = snapshot ?? []
  const total = list.length
  const current = list[index]
  const done = total > 0 && index >= total
  const empty = !queue.isLoading && !!snapshot && total === 0

  useEffect(() => {
    shownAt.current = performance.now()
  }, [current])

  const exit = () => navigate('/vocab')
  const responseMs = () => Math.min(600_000, Math.round(performance.now() - shownAt.current))

  const record = (wasGood: boolean) => {
    setReviewed((n) => n + 1)
    if (wasGood) setCorrect((n) => n + 1)
  }

  const rate = (rating: PracticeRating) => {
    if (!current) return
    review.mutate({
      id: current.word.id,
      rating,
      mode: mode === 'MEANING_TO_DE' ? 'MEANING_TO_DE' : 'DE_TO_MEANING',
      responseMs: responseMs(),
    })
    record(rating === 'GOOD' || rating === 'EASY')
    window.setTimeout(() => setIndex((i) => i + 1), 180)
  }

  const checkArticleAnswer = async (article: NounArticle) => {
    if (!current) return null
    try {
      return await checkArticle.mutateAsync({ id: current.word.id, article, responseMs: responseMs() })
    } catch {
      return null
    }
  }
  const nextArticle = (wasCorrect: boolean) => {
    record(wasCorrect)
    setIndex((i) => i + 1)
  }

  const saveSentence = async (sentence: string) => {
    if (!current) return null
    try {
      return await createSentence.mutateAsync({ id: current.word.id, sentence })
    } catch {
      return null
    }
  }
  const nextSentence = () => {
    record(true)
    setIndex((i) => i + 1)
  }

  const progress = total > 0 ? (Math.min(index, total) / total) * 100 : 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        color: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        paddingTop:
          'calc(var(--tg-viewport-safe-area-inset-top, env(safe-area-inset-top)) + var(--tg-viewport-content-safe-area-inset-top, 0px))',
        paddingBottom:
          'calc(var(--tg-viewport-safe-area-inset-bottom, env(safe-area-inset-bottom)) + var(--tg-viewport-content-safe-area-inset-bottom, 0px))',
      }}
    >
      <div style={{ padding: '12px 16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
        <button type="button" onClick={exit} className="ico-btn" aria-label={t('back')}>
          <span className="ms" style={{ fontSize: 22 }} aria-hidden="true">
            close
          </span>
        </button>
        <div className="progress-track" style={{ flex: 1 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div
          className="font-headline"
          style={{
            fontSize: 'var(--text-small)',
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--ink-2)',
            minWidth: 38,
            textAlign: 'right',
          }}
        >
          {total > 0 ? `${Math.min(index + 1, total)}/${total}` : '0/0'}
        </div>
      </div>

      {empty ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <SuccessState icon="task_alt" title={t('practice_empty_title')} sub={t('practice_empty_sub')} />
          <div style={{ padding: '0 20px' }}>
            <Button block onClick={exit}>
              {t('back')}
            </Button>
          </div>
        </div>
      ) : done ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <SuccessState icon="celebration" title={t('review_done_title')} sub={t('review_done_sub')} />
          <div style={{ display: 'flex', gap: 10, padding: '0 20px 20px', justifyContent: 'center' }}>
            <StatChip icon="style" value={reviewed} label={t('summary_reviewed', { count: reviewed })} tone="grape" />
            <StatChip icon="check_circle" value={correct} label={t('summary_correct', { count: correct })} tone="leaf" />
          </div>
          <div style={{ padding: '0 20px' }}>
            <Button block onClick={exit}>
              {t('back')}
            </Button>
          </div>
        </div>
      ) : current ? (
        mode === 'ARTICLE' ? (
          <ArticleDrill word={current.word} onCheck={checkArticleAnswer} onNext={nextArticle} />
        ) : mode === 'SENTENCE' ? (
          <SentenceCard word={current.word} onSave={saveSentence} onNext={nextSentence} />
        ) : (
          <Flashcard
            word={current.word}
            direction={mode === 'MEANING_TO_DE' ? 'meaning-de' : 'de-meaning'}
            intervals={current.intervals}
            onRate={rate}
          />
        )
      ) : (
        <div style={{ flex: 1 }} />
      )}
    </div>
  )
}
