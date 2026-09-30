import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthedFile } from '../lib/authedFile'
import { isRichEmpty } from '../lib/richText'
import { splitGaps } from '../lib/blocks'
import type { Block, DocumentVocabEntry, ExamPartBlock, GrammarBoxBlock, MediaBlock, Question, WritingTaskBlock } from '@/api/types'
import { RichView } from './RichView'
import { VocabTableView } from './VocabTableView'
import { Instructions, Item, ItemList, OptionRow } from './parts'

export interface ViewOptions {
  vocab: Map<string, DocumentVocabEntry>
}

function AnswerLines({ count = 2 }: { count?: number }) {
  return (
    <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 16 }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ height: 1, background: 'var(--hair)' }} />
      ))}
    </div>
  )
}

function QuestionList({ questions }: { questions: Question[] }) {
  const { t } = useTranslation()
  if (!questions.length) return null
  return (
    <>
      <p className="eyebrow">{t('hw_questions')}</p>
      <ItemList>
        {questions.map((q, i) => (
          <Item key={q.id} n={i + 1}>
            <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink)', margin: 0 }} lang="de">
              {q.question}
            </p>
            {q.kind === 'CHOICE' && (
              <ul style={{ marginTop: 8, display: 'grid', gap: 6, padding: 0, listStyle: 'none' }}>
                {(q.options ?? []).map((o, oi) => (
                  <OptionRow key={o.id} option={o} index={oi} />
                ))}
              </ul>
            )}
            {q.kind === 'TRUE_FALSE' && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                {[true, false].map((v) => (
                  <span
                    key={String(v)}
                    style={{
                      borderRadius: 999,
                      padding: '4px 12px',
                      fontSize: 'var(--text-caption)',
                      fontWeight: 700,
                      background: 'var(--bg-2)',
                      color: 'var(--ink-2)',
                    }}
                  >
                    {v ? t('hw_true') : t('hw_false')}
                  </span>
                ))}
              </div>
            )}
            {q.kind === 'OPEN' && <AnswerLines count={1} />}
          </Item>
        ))}
      </ItemList>
    </>
  )
}

/** Read-only rendering of one block's content (context blocks, or after the unit list is exhausted). */
export function ReadOnlyBlock({ block, opts }: { block: Block; opts: ViewOptions }) {
  switch (block.type) {
    case 'heading':
      return (
        <h3 style={{ fontSize: block.level === 1 ? 'var(--text-section-title)' : 'var(--text-card-title)', color: 'var(--ink)', margin: 0 }} lang="de">
          {block.text}
        </h3>
      )
    case 'rich_text':
      return <RichView doc={block.content} />
    case 'vocab_table':
      return <VocabTableView block={block} vocab={opts.vocab} />
    case 'grammar_box':
      return <GrammarBoxView block={block} />
    case 'gap_fill':
      return (
        <div>
          <Instructions text={block.instructions} />
          <ItemList>
            {block.items.map((item, i) => {
              const parts = splitGaps(item.text)
              return (
                <Item key={item.id} n={i + 1}>
                  <p style={{ fontSize: 'var(--text-body)', lineHeight: 2, color: 'var(--ink)', margin: 0 }} lang="de">
                    {parts.map((part, pi) => (
                      <Fragment key={pi}>
                        {part}
                        {pi < parts.length - 1 && <span className="hw-gap" />}
                      </Fragment>
                    ))}
                    {item.hint && <span style={{ marginLeft: 6, fontSize: 'var(--text-small)', color: 'var(--ink-3)' }}>({item.hint})</span>}
                  </p>
                </Item>
              )
            })}
          </ItemList>
        </div>
      )
    case 'multiple_choice':
      return (
        <div>
          <Instructions text={block.instructions} />
          <ItemList>
            {block.items.map((item, i) => (
              <Item key={item.id} n={i + 1}>
                <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink)', margin: 0 }} lang="de">
                  {item.question}
                </p>
                <ul style={{ marginTop: 8, display: 'grid', gap: 6, padding: 0, listStyle: 'none' }}>
                  {item.options.map((o, oi) => (
                    <OptionRow key={o.id} option={o} index={oi} />
                  ))}
                </ul>
              </Item>
            ))}
          </ItemList>
        </div>
      )
    case 'error_correction':
      return (
        <div>
          <Instructions text={block.instructions} />
          <ItemList>
            {block.items.map((item, i) => (
              <Item key={item.id} n={i + 1}>
                <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink)', margin: 0 }} lang="de">
                  {item.sentence}
                </p>
                <AnswerLines count={1} />
              </Item>
            ))}
          </ItemList>
        </div>
      )
    case 'free_sentences':
    case 'free_form':
      return (
        <div>
          <Instructions text={block.instructions} />
          {block.type === 'free_form' && !isRichEmpty(block.content) && <RichView doc={block.content} />}
          {block.items.length > 0 && (
            <ItemList>
              {block.items.map((item, i) => (
                <Item key={item.id} n={i + 1}>
                  <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink)', margin: 0 }} lang="de">
                    {item.prompt}
                  </p>
                  {!(block.type === 'free_sentences' && block.purpose === 'SPEAKING') && <AnswerLines count={1} />}
                </Item>
              ))}
            </ItemList>
          )}
        </div>
      )
    case 'writing_task':
      return <WritingTaskView block={block} />
    case 'reading':
      return (
        <div>
          {block.title && (
            <h3 style={{ fontSize: 'var(--text-card-title)', color: 'var(--ink)', margin: '0 0 10px' }} lang="de">
              {block.title}
            </h3>
          )}
          <div className="glass-inner" style={{ borderRadius: 18, padding: 14 }}>
            <RichView doc={block.text} style={{ fontSize: 'var(--text-lead)', lineHeight: 1.6 }} />
          </div>
          <QuestionList questions={block.questions} />
        </div>
      )
    case 'media':
      return <MediaView block={block} />
    case 'exam_part':
      return <ExamPartView block={block} />
    default:
      return null
  }
}

function GrammarBoxView({ block }: { block: GrammarBoxBlock }) {
  const tip = block.variant === 'TIP'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {block.title && (
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-card-title)', color: 'var(--ink)', margin: 0 }} lang="de">
          <span className="ms fill" style={{ fontSize: 20, color: tip ? 'var(--sunny-ink)' : 'var(--sky-ink)' }} aria-hidden="true">
            {tip ? 'lightbulb' : 'table_chart'}
          </span>
          {block.title}
        </h3>
      )}
      {block.content && !isRichEmpty(block.content) && <RichView doc={block.content} />}
      {block.table && block.table.headers.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-body)' }} lang="de">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--hair-strong)', textAlign: 'left' }}>
                {block.table.headers.map((h, i) => (
                  <th key={i} style={{ padding: '6px 10px 6px 0', fontWeight: 800, color: 'var(--ink)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.table.rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid var(--hair)' }}>
                  {row.map((c, ci) => (
                    <td key={ci} style={{ padding: '6px 10px 6px 0', color: 'var(--ink)' }}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!!block.examples?.length && (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: 0, margin: 0, listStyle: 'none' }} lang="de">
          {block.examples.filter(Boolean).map((ex, i) => (
            <li key={i} style={{ display: 'flex', gap: 6, fontSize: 'var(--text-body)', fontStyle: 'italic', color: 'var(--ink-2)' }}>
              <span className="ms" style={{ fontSize: 16, color: 'var(--ink-3)', fontStyle: 'normal' }} aria-hidden="true">
                arrow_right
              </span>
              {ex}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function WritingTaskView({ block }: { block: WritingTaskBlock }) {
  const { t } = useTranslation()
  const tr = block.instructionsTranslation
  return (
    <div>
      <Instructions text={block.instructions} />
      {tr?.ru && (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }} lang="ru">
          {tr.ru}
        </p>
      )}
      {tr?.uk && (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }} lang="uk">
          {tr.uk}
        </p>
      )}
      {tr?.en && (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }} lang="en">
          {tr.en}
        </p>
      )}
      <ItemList>
        {block.items.map((item, i) => (
          <Item key={item.id} n={i + 1}>
            <p style={{ fontSize: 'var(--text-body)', fontWeight: 700, color: 'var(--ink)', margin: 0 }} lang="de">
              {item.prompt}
            </p>
            {item.points.filter(Boolean).length > 0 && (
              <ul style={{ marginTop: 6, paddingLeft: 20 }} lang="de">
                {item.points.filter(Boolean).map((p, pi) => (
                  <li key={pi} style={{ fontSize: 'var(--text-body)', color: 'var(--ink)' }}>
                    {p}
                  </li>
                ))}
              </ul>
            )}
            {(item.minWords || item.maxWords) && (
              <p style={{ marginTop: 4, fontSize: 'var(--text-caption)', color: 'var(--ink-3)' }}>
                {item.minWords && item.maxWords
                  ? t('hw_word_range', { min: item.minWords, max: item.maxWords })
                  : item.minWords
                    ? t('hw_word_min', { count: item.minWords })
                    : t('hw_word_max', { count: item.maxWords ?? 0 })}
              </p>
            )}
            <AnswerLines count={4} />
          </Item>
        ))}
      </ItemList>
    </div>
  )
}

function MediaView({ block }: { block: MediaBlock }) {
  const { t } = useTranslation()
  const source = block.materialId ? `/api/v1/materials/${block.materialId}/file` : null
  const { url } = useAuthedFile(source)
  const youtube = block.url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/)?.[1]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {youtube ? (
        <div style={{ aspectRatio: '16/9', borderRadius: 18, overflow: 'hidden', background: 'var(--bg-3)' }}>
          <iframe
            style={{ width: '100%', height: '100%', border: 0 }}
            src={`https://www.youtube-nocookie.com/embed/${youtube}`}
            title={t('hw_block_media')}
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : block.url && !block.materialId ? (
        block.kind === 'VIDEO' ? (
          <video src={block.url} controls style={{ width: '100%', borderRadius: 18, background: 'var(--bg-3)' }} />
        ) : (
          <audio src={block.url} controls style={{ width: '100%' }} />
        )
      ) : url ? (
        block.kind === 'VIDEO' ? (
          <video src={url} controls style={{ width: '100%', borderRadius: 18, background: 'var(--bg-3)' }} />
        ) : (
          <audio src={url} controls style={{ width: '100%' }} />
        )
      ) : (
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--ink-3)' }}>{t('hw_no_media')}</p>
      )}
      {block.task && !isRichEmpty(block.task) && <RichView doc={block.task} />}
      <QuestionList questions={block.questions} />
    </div>
  )
}

function ExamPartView({ block }: { block: ExamPartBlock }) {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        {block.exam && <span className="chip">{block.exam}</span>}
        {block.part && (
          <span style={{ fontSize: 'var(--text-card-title)', color: 'var(--ink)' }} lang="de">
            {block.part}
          </span>
        )}
        {block.timeMinutes ? <span className="chip">{t('hw_minutes', { count: block.timeMinutes })}</span> : null}
      </div>
      <Instructions text={block.instructions} />
      {block.content && !isRichEmpty(block.content) && (
        <div className="glass-inner" style={{ borderRadius: 18, padding: 14 }}>
          <RichView doc={block.content} />
        </div>
      )}
      <QuestionList questions={block.questions} />
    </div>
  )
}
