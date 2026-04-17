import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, Pill, Ring } from '@/ui'
import { useVocab } from '@/hooks/useVocab'
import type { VocabStatus } from '@/api/types'

type Filter = 'all' | VocabStatus

const FILTERS: Array<{ key: Filter; labelKey: string }> = [
  { key: 'all', labelKey: 'all' },
  { key: 'NEW', labelKey: 'new' },
  { key: 'REVIEW', labelKey: 'review' },
  { key: 'LEARNED', labelKey: 'learned' },
]

export function Vocab() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const vocabQuery = useVocab(filter === 'all' ? {} : { status: filter })
  const reviewDueQuery = useVocab({ status: 'REVIEW' })

  const words = vocabQuery.data?.words ?? []
  const reviewDueCount = reviewDueQuery.data?.words.length ?? 0
  const reviewMinutes = Math.max(1, Math.round(reviewDueCount * 0.4))

  return (
    <div>
      <div style={{ padding: '8px 20px 18px' }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          {t('vocab')}
        </div>
        <div
          className="serif"
          style={{ fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em' }}
        >
          Your glossary
          <span style={{ color: 'var(--accent)' }}>.</span>
        </div>
      </div>

      {reviewDueCount > 0 && (
        <div style={{ padding: '0 20px 18px' }}>
          <Card
            onClick={() => navigate('/vocab/review')}
            style={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--accent-soft) 0%, var(--card) 65%)',
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Ring value={100} size={54} label={reviewDueCount} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-title)', fontWeight: 600, marginBottom: 2 }}>
                  {reviewDueCount === 1
                    ? t('review_count_singular')
                    : t('review_count_plural', { count: reviewDueCount })}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                  {t('review_minutes_estimate', { minutes: reviewMinutes })}
                </div>
              </div>
              <span className="ms" style={{ fontSize: 22, color: 'var(--ink-3)' }}>
                chevron_right
              </span>
            </div>
          </Card>
        </div>
      )}

      <div style={{ padding: '0 20px 14px' }}>
        <div
          style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}
          className="no-scrollbar"
        >
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="tap"
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: '1px solid var(--hair)',
                background: filter === f.key ? 'var(--ink)' : 'transparent',
                color: filter === f.key ? 'var(--bg)' : 'var(--ink-2)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {words.length > 0 ? (
        <div style={{ padding: '0 20px' }}>
          <Card padded={false}>
            {words.map((w, i) => (
              <div
                key={w.id}
                style={{
                  padding: '14px 18px',
                  borderBottom:
                    i < words.length - 1 ? '1px solid var(--hair)' : 0,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="serif"
                    style={{
                      fontSize: 22,
                      lineHeight: 1.1,
                      letterSpacing: '-0.01em',
                      marginBottom: 2,
                    }}
                  >
                    {w.german}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{w.english}</div>
                  {w.exampleSentence && (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--ink-3)',
                        fontStyle: 'italic',
                        marginTop: 4,
                        lineHeight: 1.4,
                      }}
                    >
                      “{w.exampleSentence}”
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <Pill
                    tone={w.status === 'NEW' ? 'accent' : w.status === 'REVIEW' ? 'warn' : 'neutral'}
                  >
                    {t(w.status === 'NEW' ? 'new' : w.status === 'REVIEW' ? 'review' : 'learned')}
                  </Pill>
                  <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>
                    {w.category.toLowerCase()} · {w.addedAt.slice(5, 10)}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      ) : (
        !vocabQuery.isLoading && (
          <div style={{ padding: '40px 30px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>◌</div>
            <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
              {t('empty_vocab_title')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('empty_vocab_sub')}</div>
          </div>
        )
      )}
    </div>
  )
}
