import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, EmptyState, PageHeader, Pill, type PillTone, Ring } from '@/ui'
import { useVocab } from '@/hooks/useVocab'
import { usePracticeStats } from '@/hooks/usePractice'
import { vocabDueLabel, vocabHeadword, vocabMeaning, wordTypeLabelKey } from '@/lib/vocab'
import type { VocabStatus } from '@/api/types'

type Filter = 'all' | VocabStatus

const FILTERS: Array<{ key: Filter; labelKey: string }> = [
  { key: 'all', labelKey: 'all' },
  { key: 'NEW', labelKey: 'new' },
  { key: 'LEARNING', labelKey: 'learning' },
  { key: 'REVIEW', labelKey: 'review' },
  { key: 'LEARNED', labelKey: 'learned' },
]

const STATUS_TONE: Record<VocabStatus, PillTone> = {
  NEW: 'accent',
  LEARNING: 'violet',
  REVIEW: 'warn',
  LEARNED: 'neutral',
}

const STATUS_LABEL_KEY: Record<VocabStatus, string> = {
  NEW: 'new',
  LEARNING: 'learning',
  REVIEW: 'review',
  LEARNED: 'learned',
}

export function Vocab() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const vocabQuery = useVocab(filter === 'all' ? {} : { status: filter })
  const statsQuery = usePracticeStats()

  const words = vocabQuery.data?.words ?? []
  const dueCount = statsQuery.data?.dueNow ?? 0
  const newCount = statsQuery.data?.newAvailable ?? 0
  const practiceCount = dueCount + newCount
  const reviewMinutes = Math.max(1, Math.round(practiceCount * 0.4))

  return (
    <div>
      <PageHeader eyebrow={t('vocab')} title={t('your_glossary')} />

      {practiceCount > 0 && (
        <div style={{ padding: '0 16px 16px' }}>
          <Card
            onClick={() => navigate('/vocab/practice')}
            className="tap"
            style={{
              cursor: 'pointer',
              background: 'linear-gradient(135deg, var(--grape-soft) 0%, var(--glass-bg) 70%)',
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <Ring value={100} size={56} tone="grape" label={practiceCount} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 800, marginBottom: 2 }}>
                  {practiceCount === 1
                    ? t('review_count_singular')
                    : t('review_count_plural', { count: practiceCount })}
                </div>
                <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>
                  {t('review_minutes_estimate', { minutes: reviewMinutes })}
                </div>
              </div>
              <span className="btn-primary" style={{ minHeight: 40, width: 40, padding: 0 }} aria-hidden="true">
                <span className="ms fill" style={{ fontSize: 22 }}>play_arrow</span>
              </span>
            </div>
          </Card>
        </div>
      )}

      <div style={{ padding: '0 16px 14px' }}>
        <div
          style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '2px 0' }}
          className="no-scrollbar"
        >
          {FILTERS.map((f) => (
            <button
              type="button"
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`chip${filter === f.key ? ' on' : ''}`}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {words.length > 0 ? (
        <div style={{ padding: '0 16px' }}>
          <Card padded={false} className="row-list">
            {words.map((w) => (
              <div
                key={w.id}
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="font-headline"
                    style={{
                      fontSize: 'var(--text-section-title)',
                      lineHeight: 1.2,
                      marginBottom: 2,
                    }}
                  >
                    {vocabHeadword(w)}
                  </div>
                  <div style={{ fontSize: 'var(--text-body)', color: 'var(--ink-2)' }}>{vocabMeaning(w)}</div>
                  {w.exampleSentence && (
                    <div
                      style={{
                        fontSize: 'var(--text-caption)',
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
                  <Pill tone={STATUS_TONE[w.status]}>{t(STATUS_LABEL_KEY[w.status])}</Pill>
                  <div style={{ fontSize: 'var(--text-label)', fontWeight: 700, color: 'var(--ink-3)' }}>
                    {t(wordTypeLabelKey(w.wordType))}
                    {vocabDueLabel(w.due, t) ? ` · ${vocabDueLabel(w.due, t)}` : ` · ${w.addedAt.slice(5, 10)}`}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      ) : (
        !vocabQuery.isLoading && (
          <EmptyState icon="menu_book" title={t('empty_vocab_title')} sub={t('empty_vocab_sub')} />
        )
      )}
    </div>
  )
}
