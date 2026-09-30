import { useTranslation } from 'react-i18next'
import type { DocumentVocabEntry, VocabTableBlock } from '@/api/types'

const headword = (e: DocumentVocabEntry) => (e.article ? `${e.article.toLowerCase()} ${e.lemma}` : e.lemma)

function meaning(entry: DocumentVocabEntry): string[] {
  const fields = entry.display?.fields ?? ['ru', 'en', 'de_explanation']
  return fields
    .map((f) => (f === 'de_explanation' ? entry.explanationDe : entry.translations[f]))
    .filter((v): v is string => !!v)
}

/** The words of a vocab_table, shown read-only in the viewer's display setting. */
export function VocabTableView({ block, vocab }: { block: VocabTableBlock; vocab: Map<string, DocumentVocabEntry> }) {
  const { t } = useTranslation()
  const entries = block.rows.map((r) => vocab.get(r.vocabEntryId)).filter((e): e is DocumentVocabEntry => !!e)

  return (
    <div>
      {block.title && (
        <h3 style={{ fontSize: 'var(--text-card-title)', fontWeight: 800, color: 'var(--ink)', margin: '0 0 8px' }} lang="de">
          {block.title}
        </h3>
      )}
      {entries.length === 0 ? (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--ink-3)' }}>{t('hw_no_words')}</p>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 0, margin: 0, listStyle: 'none' }} data-testid="vocab-table">
          {entries.map((e) => (
            <li key={e.id} style={{ paddingBottom: 8, borderBottom: '1px solid var(--hair)' }}>
              <div style={{ fontWeight: 800, color: 'var(--ink)' }} lang="de">
                {headword(e)}
              </div>
              <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>{meaning(e).join(' · ')}</div>
              {e.exampleSentence && (
                <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-3)' }} lang="de">
                  {e.exampleSentence}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
