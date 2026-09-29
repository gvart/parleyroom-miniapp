import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useReviewVocab, useVocab } from '@/hooks/useVocab'
import { vocabHeadword, vocabMeaning, wordTypeLabelKey } from '@/lib/vocab'
import { Button, TONE_VARS, type Tone } from '@/ui'

type Grade = 'AGAIN' | 'GOOD' | 'EASY'

interface GradeBtn {
  grade: Grade
  labelKey: string
  icon: string
  tone: Tone
}

const GRADES: GradeBtn[] = [
  { grade: 'AGAIN', labelKey: 'again', icon: 'replay', tone: 'coral' },
  { grade: 'GOOD', labelKey: 'good', icon: 'thumb_up', tone: 'sunny' },
  { grade: 'EASY', labelKey: 'easy', icon: 'bolt', tone: 'leaf' },
]

export function VocabReview() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const vocabQuery = useVocab({ status: 'REVIEW' })
  const review = useReviewVocab()

  const allDue = useMemo(() => vocabQuery.data?.words ?? [], [vocabQuery.data])
  const [queue, setQueue] = useState<string[] | null>(null)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const list = queue ?? allDue.map((w) => w.id)
  const total = list.length
  const currentId = list[index]
  const currentWord = allDue.find((w) => w.id === currentId)
  const done = total > 0 && index >= total
  const noneDue = !vocabQuery.isLoading && total === 0

  // Capture the queue once on first render so re-fetches mid-session don't reorder.
  if (!queue && allDue.length > 0) {
    setQueue(allDue.map((w) => w.id))
  }

  const advance = (grade: Grade) => {
    if (!currentWord) return
    setFlipped(false)
    review.mutate({ id: currentWord.id, rating: grade })
    setTimeout(() => setIndex((i) => i + 1), 180)
  }

  const progress = total > 0 ? (index / total) * 100 : 0

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
      <div
        style={{
          padding: '12px 16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/vocab')}
          className="ico-btn"
          aria-label={t('back')}
        >
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

      {noneDue ? (
        <DoneScreen
          title={t('empty_vocab_title')}
          sub={t('empty_vocab_sub')}
          onBack={() => navigate('/vocab')}
        />
      ) : done ? (
        <DoneScreen
          title={t('review_done_title')}
          sub={t('review_done_sub')}
          onBack={() => navigate('/vocab')}
        />
      ) : currentWord ? (
        <>
          <div
            style={{
              flex: 1,
              padding: '8px 16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 0,
            }}
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
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 400,
                height: 'clamp(300px, 52vh, 440px)',
                cursor: 'pointer',
              }}
            >
              <div
                className="practice-face"
                style={{ opacity: flipped ? 0 : 1, pointerEvents: flipped ? 'none' : 'auto' }}
              >
                <span className="eyebrow">{t(wordTypeLabelKey(currentWord.wordType))}</span>
                <div
                  className="font-headline"
                  style={{ fontSize: 'var(--text-page-title)', lineHeight: 1.1, fontWeight: 900, color: 'var(--ink)' }}
                >
                  {vocabHeadword(currentWord)}
                </div>
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
                <span className="eyebrow" style={{ color: 'var(--grape-ink)' }}>
                  {t('meaning')}
                </span>
                <div className="font-headline" style={{ fontSize: 'var(--text-page-title)', lineHeight: 1.15, fontWeight: 900 }}>
                  {vocabMeaning(currentWord)}
                </div>
                {currentWord.exampleSentence && (
                  <div
                    style={{
                      fontSize: 'var(--text-lead)',
                      color: 'var(--ink-2)',
                      fontStyle: 'italic',
                      lineHeight: 1.45,
                    }}
                  >
                    „{currentWord.exampleSentence}“
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ padding: '0 16px 20px' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {GRADES.map((g) => (
                <button
                  type="button"
                  key={g.grade}
                  onClick={() => advance(g.grade)}
                  disabled={!flipped}
                  className="rate-btn"
                  style={{ background: TONE_VARS[g.tone].soft, color: TONE_VARS[g.tone].ink }}
                >
                  <span className="ms fill" style={{ fontSize: 22 }} aria-hidden="true">
                    {g.icon}
                  </span>
                  {t(g.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ flex: 1 }} />
      )}
    </div>
  )
}

function DoneScreen({ title, sub, onBack }: { title: string; sub: string; onBack: () => void }) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 30,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 999,
          background: 'var(--accent-soft)',
          color: 'var(--accent-ink)',
          boxShadow: 'var(--glass-highlight), 0 0 0 10px color-mix(in srgb, var(--accent) 10%, transparent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scale-in var(--spring-bouncy-ms) var(--spring-bouncy)',
        }}
      >
        <span className="ms fill" style={{ fontSize: 42 }}>
          check
        </span>
      </div>
      <h2 className="page-h1">{title}</h2>
      <div style={{ fontSize: 'var(--text-lead)', color: 'var(--ink-2)', maxWidth: 280 }}>{sub}</div>
      <Button onClick={onBack} style={{ marginTop: 10 }}>
        {t('back')}
      </Button>
    </div>
  )
}
