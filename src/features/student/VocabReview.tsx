import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useReviewVocab, useVocab } from '@/hooks/useVocab'

type Grade = 'AGAIN' | 'GOOD' | 'EASY'

interface GradeBtn {
  grade: Grade
  labelKey: string
  bg: string
}

const GRADES: GradeBtn[] = [
  { grade: 'AGAIN', labelKey: 'again', bg: 'oklch(0.55 0.18 25)' },
  { grade: 'GOOD', labelKey: 'good', bg: 'oklch(0.5 0.14 75)' },
  { grade: 'EASY', labelKey: 'easy', bg: 'oklch(0.5 0.12 172)' },
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

  const advance = (_grade: Grade) => {
    if (!currentWord) return
    setFlipped(false)
    review.mutate(currentWord.id)
    setTimeout(() => setIndex((i) => i + 1), 180)
  }

  const progress = total > 0 ? (index / total) * 100 : 0

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--bg)',
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
          padding: '8px 20px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/vocab')}
          className="tap"
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: 'var(--card)',
            border: '1px solid var(--hair)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink)',
            flexShrink: 0,
          }}
          aria-label={t('back')}
        >
          <span className="ms" style={{ fontSize: 20 }}>
            close
          </span>
        </button>
        <div
          style={{
            flex: 1,
            height: 4,
            background: 'var(--hair)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: 'var(--ink)',
              borderRadius: 999,
              transition: 'width .3s var(--ease)',
            }}
          />
        </div>
        <div
          className="mono"
          style={{
            fontSize: 12,
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
              padding: '20px',
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
                maxWidth: 360,
                height: 360,
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 24,
                  background: 'linear-gradient(160deg, var(--card) 0%, var(--accent-soft) 100%)',
                  border: '1px solid var(--hair)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 30,
                  textAlign: 'center',
                  boxShadow: '0 20px 60px rgba(15,15,14,0.08)',
                  opacity: flipped ? 0 : 1,
                  transition: 'opacity .25s var(--ease)',
                  pointerEvents: flipped ? 'none' : 'auto',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--ink-3)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  {currentWord.category.toLowerCase()}
                </div>
                <div
                  className="serif"
                  style={{
                    fontSize: 44,
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    color: 'var(--ink)',
                  }}
                >
                  {currentWord.german}
                </div>
                <div
                  style={{
                    marginTop: 'auto',
                    fontSize: 12,
                    color: 'var(--ink-3)',
                  }}
                >
                  {t('tap_to_reveal')}
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 24,
                  background: 'var(--ink)',
                  color: 'var(--bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 30,
                  textAlign: 'center',
                  opacity: flipped ? 1 : 0,
                  transition: 'opacity .25s var(--ease)',
                  pointerEvents: flipped ? 'auto' : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--accent)',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    marginBottom: 16,
                  }}
                >
                  {t('meaning')}
                </div>
                <div
                  className="serif"
                  style={{
                    fontSize: 32,
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {currentWord.english}
                </div>
                {currentWord.exampleSentence && (
                  <div
                    className="serif"
                    style={{
                      marginTop: 14,
                      fontSize: 14,
                      color: 'rgba(242,241,236,0.6)',
                      fontStyle: 'italic',
                      lineHeight: 1.4,
                    }}
                  >
                    „{currentWord.exampleSentence}“
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ padding: '0 20px 24px' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {GRADES.map((g) => (
                <button
                  type="button"
                  key={g.grade}
                  onClick={() => advance(g.grade)}
                  disabled={!flipped}
                  className="tap"
                  style={{
                    flex: 1,
                    border: 0,
                    background: g.bg,
                    color: '#fff',
                    padding: '14px',
                    borderRadius: 16,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: flipped ? 'pointer' : 'not-allowed',
                    opacity: flipped ? 1 : 0.4,
                    transition: 'opacity .2s var(--ease)',
                  }}
                >
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
          color: 'var(--accent-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'scale-in .5s var(--spring)',
        }}
      >
        <span className="ms fill" style={{ fontSize: 42 }}>
          check
        </span>
      </div>
      <div className="serif" style={{ fontSize: 30, letterSpacing: '-0.02em' }}>
        {title}
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 280 }}>{sub}</div>
      <button
        type="button"
        onClick={onBack}
        className="tap"
        style={{
          marginTop: 14,
          border: 0,
          background: 'var(--ink)',
          color: 'var(--bg)',
          padding: '12px 24px',
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {t('back')}
      </button>
    </div>
  )
}
