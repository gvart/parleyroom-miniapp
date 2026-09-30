import { Fragment, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TextArea } from '@/ui'
import type { Block, ChoiceItem, DocumentVocabEntry, GapFillBlock, GapResult, HomeworkUnit, Option, Question, WritingItem } from '@/api/types'
import { ReadOnlyBlock } from './ReadOnlyBlock'
import { Instructions, Item, ItemList, Solution } from './parts'
import { isRichEmpty } from '../lib/richText'
import { splitGaps } from '../lib/blocks'
import { countWords, unitKey, type AnswerMap, type UnitAnswer } from '../lib/answers'
import { RichView } from './RichView'

export interface AnswerContext {
  answers: AnswerMap
  /** Absent -> read-only. */
  onChange?: (key: string, value: UnitAnswer) => void
  /** After review: show the per-unit result (correct/wrong) inline. */
  showResults: boolean
  /** Extra content under a unit (e.g. teacher comment). */
  unitSlot?: (key: string) => ReactNode
  vocab: Map<string, DocumentVocabEntry>
  /** The assignment item this document belongs to. */
  itemId: string
  /** Every answerable unit (from the API), by key; carries results after review. */
  units: Map<string, HomeworkUnit>
}

/** One document block as a student answers it. */
export function InteractiveBlock({ block, ctx }: { block: Block; ctx: AnswerContext }) {
  const prefix = `${ctx.itemId}:${block.id}:`
  // The server lists every answerable unit; a block without any is context only.
  if (![...ctx.units.keys()].some((k) => k.startsWith(prefix))) {
    return <ReadOnlyBlock block={block} opts={{ vocab: ctx.vocab }} />
  }
  const key = (itemId: string) => unitKey({ assignmentItemId: ctx.itemId, blockId: block.id, itemId })
  const unit = (itemId: string, node: ReactNode) => {
    const u = ctx.units.get(key(itemId))
    return (
      <div data-unit={key(itemId)} data-result={u?.correct ?? undefined}>
        {node}
        {ctx.showResults && u?.correct !== undefined && u?.correct !== null && <ResultBadge correct={u.correct} />}
        {ctx.unitSlot?.(key(itemId))}
      </div>
    )
  }
  switch (block.type) {
    case 'gap_fill':
      return <GapFill block={block} ctx={ctx} unit={unit} />
    case 'multiple_choice':
      return (
        <div>
          <Instructions text={block.instructions} />
          <ItemList>
            {block.items.map((item, i) => (
              <Item key={item.id} n={i + 1}>
                {unit(item.id, <ChoiceAnswer blockId={block.id} item={item} ctx={ctx} />)}
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
            {block.items.map((item, i) => {
              const k = key(item.id)
              const u = ctx.units.get(k)
              return (
                <Item key={item.id} n={i + 1}>
                  {unit(
                    item.id,
                    <>
                      <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink)', margin: 0 }} lang="de">
                        {item.sentence}
                      </p>
                      <TextAnswer k={k} ctx={ctx} rows={1} label={item.sentence} />
                      {ctx.showResults && u?.correct === false && item.solution?.corrected && (
                        <>
                          <Solution>{item.solution.corrected}</Solution>
                          {item.solution.explanation && (
                            <p style={{ marginLeft: 22, fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>{item.solution.explanation}</p>
                          )}
                        </>
                      )}
                    </>,
                  )}
                </Item>
              )
            })}
          </ItemList>
        </div>
      )
    case 'free_sentences':
    case 'free_form':
      return (
        <div>
          <Instructions text={block.instructions} />
          {block.type === 'free_form' && !isRichEmpty(block.content) && <RichView doc={block.content} />}
          <ItemList>
            {block.items.map((item, i) => {
              const k = key(item.id)
              return (
                <Item key={item.id} n={i + 1}>
                  {unit(
                    item.id,
                    <>
                      <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink)', margin: 0 }} lang="de">
                        {item.prompt}
                      </p>
                      {ctx.units.has(k) && <TextAnswer k={k} ctx={ctx} rows={2} label={item.prompt} />}
                    </>,
                  )}
                </Item>
              )
            })}
          </ItemList>
        </div>
      )
    case 'writing_task':
      return (
        <div>
          <Instructions text={block.instructions} />
          {block.instructionsTranslation?.ru && (
            <p style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }} lang="ru">
              {block.instructionsTranslation.ru}
            </p>
          )}
          {block.instructionsTranslation?.uk && (
            <p style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }} lang="uk">
              {block.instructionsTranslation.uk}
            </p>
          )}
          {block.instructionsTranslation?.en && (
            <p style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }} lang="en">
              {block.instructionsTranslation.en}
            </p>
          )}
          <ItemList>
            {block.items.map((item, i) => (
              <Item key={item.id} n={i + 1}>
                {unit(item.id, <WritingAnswer blockId={block.id} item={item} ctx={ctx} />)}
              </Item>
            ))}
          </ItemList>
        </div>
      )
    case 'reading':
      return (
        <div>
          {block.title && (
            <h3 style={{ fontSize: 'var(--text-card-title)', color: 'var(--ink)', margin: '0 0 10px' }} lang="de">
              {block.title}
            </h3>
          )}
          <div className="glass-inner" style={{ borderRadius: 18, padding: 14, marginBottom: 14 }}>
            <RichView doc={block.text} style={{ fontSize: 'var(--text-lead)', lineHeight: 1.6 }} />
          </div>
          <Questions blockId={block.id} questions={block.questions} ctx={ctx} unit={unit} />
        </div>
      )
    case 'media':
    case 'exam_part':
      return (
        <div>
          <ReadOnlyBlock block={{ ...block, questions: [] } as Block} opts={{ vocab: ctx.vocab }} />
          <Questions blockId={block.id} questions={block.questions} ctx={ctx} unit={unit} />
        </div>
      )
    default:
      return <ReadOnlyBlock block={block} opts={{ vocab: ctx.vocab }} />
  }
}

type UnitFn = (itemId: string, node: ReactNode) => ReactNode

function ResultBadge({ correct }: { correct: boolean }) {
  const { t } = useTranslation()
  return (
    <span
      style={{
        marginTop: 6,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 'var(--text-caption)',
        fontWeight: 800,
        color: correct ? 'var(--leaf-ink)' : 'var(--coral-ink)',
      }}
    >
      <span className="ms fill" style={{ fontSize: 15 }} aria-hidden="true">
        {correct ? 'check_circle' : 'cancel'}
      </span>
      {correct ? t('hw_correct') : t('hw_incorrect')}
    </span>
  )
}

/* --- Gap fill: inputs inline in the sentence; word-box chips fill the focused gap --- */

function GapFill({ block, ctx, unit }: { block: GapFillBlock; ctx: AnswerContext; unit: UnitFn }) {
  const { t } = useTranslation()
  const words = (block.wordBox ?? []).filter(Boolean)
  const focused = useRef<{ itemId: string; gap: number } | null>(null)
  const refs = useRef(new Map<string, HTMLInputElement>())
  const [, bump] = useState(0)
  const editable = !!ctx.onChange

  const gapsOf = (itemId: string, n: number) => {
    const g = ctx.answers[unitKey({ assignmentItemId: ctx.itemId, blockId: block.id, itemId })]?.gaps ?? []
    return Array.from({ length: n }, (_, i) => g[i] ?? '')
  }
  const setGap = (itemId: string, n: number, gap: number, value: string) => {
    const next = gapsOf(itemId, n)
    next[gap] = value
    ctx.onChange?.(unitKey({ assignmentItemId: ctx.itemId, blockId: block.id, itemId }), { gaps: next })
  }
  const used = new Set(
    block.items.flatMap((it) => ctx.answers[unitKey({ assignmentItemId: ctx.itemId, blockId: block.id, itemId: it.id })]?.gaps ?? []).map((w) => w.trim()),
  )

  /** Tap a chip: fill the focused gap, else the first empty one. */
  const pick = (word: string) => {
    let target = focused.current
    if (!target) {
      for (const it of block.items) {
        const n = splitGaps(it.text).length - 1
        const idx = gapsOf(it.id, n).findIndex((g) => !g.trim())
        if (idx >= 0) {
          target = { itemId: it.id, gap: idx }
          break
        }
      }
    }
    if (!target) return
    const it = block.items.find((x) => x.id === target.itemId)
    if (!it) return
    setGap(it.id, splitGaps(it.text).length - 1, target.gap, word)
    refs.current.get(`${target.itemId}:${target.gap}`)?.focus()
    bump((x) => x + 1)
  }

  return (
    <div>
      <Instructions text={block.instructions} />
      {words.length > 0 && (
        <div
          style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, borderRadius: 14, border: '1px dashed var(--hair-strong)', padding: 10 }}
          role="group"
          aria-label={t('hw_word_box')}
          lang="de"
        >
          {words.map((w, i) =>
            editable ? (
              <button
                key={i}
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => pick(w)}
                className="chip"
                style={used.has(w) ? { textDecoration: 'line-through', color: 'var(--ink-3)' } : undefined}
                data-testid="word-chip"
              >
                {w}
              </button>
            ) : (
              <span key={i} className="chip">
                {w}
              </span>
            ),
          )}
        </div>
      )}
      <ItemList>
        {block.items.map((item, i) => {
          const parts = splitGaps(item.text)
          const n = parts.length - 1
          const values = gapsOf(item.id, n)
          const k = unitKey({ assignmentItemId: ctx.itemId, blockId: block.id, itemId: item.id })
          return (
            <Item key={item.id} n={i + 1}>
              {unit(
                item.id,
                <>
                  <p style={{ fontSize: 'var(--text-body)', lineHeight: 2.2, color: 'var(--ink)', margin: 0 }} lang="de">
                    {parts.map((part, pi) => (
                      <Fragment key={pi}>
                        {part}
                        {pi < n &&
                          (editable ? (
                            <input
                              ref={(el) => {
                                if (el) refs.current.set(`${item.id}:${pi}`, el)
                                else refs.current.delete(`${item.id}:${pi}`)
                              }}
                              value={values[pi]}
                              onChange={(e) => setGap(item.id, n, pi, e.target.value)}
                              onFocus={() => {
                                focused.current = { itemId: item.id, gap: pi }
                              }}
                              aria-label={t('hw_gap_label', { n: pi + 1, item: i + 1 })}
                              autoCapitalize="off"
                              autoCorrect="off"
                              spellCheck={false}
                              size={Math.max(6, values[pi].length + 1)}
                              className="hw-gap"
                              data-testid="gap-input"
                            />
                          ) : (
                            <GapRead value={values[pi]} result={ctx.units.get(k)?.gapResults?.[pi]} />
                          ))}
                      </Fragment>
                    ))}
                    {item.hint && <span style={{ marginLeft: 6, fontSize: 'var(--text-small)', color: 'var(--ink-3)' }}>({item.hint})</span>}
                  </p>
                </>,
              )}
            </Item>
          )
        })}
      </ItemList>
    </div>
  )
}

function GapRead({ value, result }: { value: string; result?: GapResult | null }) {
  const { t } = useTranslation()
  const color = result === 'CORRECT' ? 'var(--leaf-ink)' : result === 'CASE_MISMATCH' ? 'var(--sunny-ink)' : result === 'WRONG' ? 'var(--coral-ink)' : 'var(--ink)'
  return (
    <span
      className="hw-gap hw-gap-read"
      style={{
        color: value ? color : 'var(--ink-3)',
        textDecoration: result === 'WRONG' ? 'line-through' : undefined,
      }}
      data-testid="gap-answer"
      data-result={result ?? undefined}
    >
      {value || '—'}
      {result && <span className="sr-only"> ({t(`hw_gap_result_${result}`)})</span>}
    </span>
  )
}

/* --- Choice: tap options (single or multiple) --- */

function ChoiceAnswer({ blockId, item, ctx }: { blockId: string; item: ChoiceItem; ctx: AnswerContext }) {
  const key = unitKey({ assignmentItemId: ctx.itemId, blockId, itemId: item.id })
  const multiple = !!item.multiple
  return (
    <>
      <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink)', margin: 0 }} lang="de" id={`q-${key}`}>
        {item.question}
      </p>
      <OptionGrid k={key} options={item.options} multiple={multiple} ctx={ctx} />
    </>
  )
}

function OptionGrid({ k, options, multiple, ctx }: { k: string; options: Option[]; multiple: boolean; ctx: AnswerContext }) {
  const chosen = ctx.answers[k]?.optionIds ?? []
  const toggle = (id: string) => {
    if (!ctx.onChange) return
    const next = multiple ? (chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id]) : [id]
    ctx.onChange(k, { optionIds: next })
  }
  return (
    <div role={multiple ? 'group' : 'radiogroup'} aria-labelledby={`q-${k}`} style={{ marginTop: 8, display: 'grid', gap: 8 }}>
      {options.map((o, oi) => {
        const on = chosen.includes(o.id)
        return (
          <button
            key={o.id}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={on}
            disabled={!ctx.onChange}
            onClick={() => toggle(o.id)}
            className="hw-option"
            data-on={on || undefined}
            data-testid="option"
          >
            <span className="hw-option-mark" data-shape={multiple ? 'square' : 'round'}>
              {on ? (
                <span className="ms" style={{ fontSize: 15 }}>
                  check
                </span>
              ) : (
                String.fromCharCode(97 + oi)
              )}
            </span>
            <span lang="de" style={{ flex: 1 }}>
              {o.text}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function TrueFalse({ k, ctx }: { k: string; ctx: AnswerContext }) {
  const { t } = useTranslation()
  const value = ctx.answers[k]?.isTrue
  return (
    <div role="radiogroup" aria-labelledby={`q-${k}`} style={{ marginTop: 8, display: 'flex', gap: 8 }}>
      {[true, false].map((v) => {
        const on = value === v
        return (
          <button
            key={String(v)}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={!ctx.onChange}
            onClick={() => ctx.onChange?.(k, { isTrue: v })}
            className="hw-tf"
            data-on={on || undefined}
            data-testid="tf-option"
          >
            {v ? t('hw_true') : t('hw_false')}
          </button>
        )
      })}
    </div>
  )
}

function Questions({ blockId, questions, ctx, unit }: { blockId: string; questions: Question[]; ctx: AnswerContext; unit: UnitFn }) {
  const { t } = useTranslation()
  if (!questions.length) return null
  return (
    <>
      <p className="eyebrow" style={{ marginTop: 14 }}>
        {t('hw_questions')}
      </p>
      <ItemList>
        {questions.map((q, i) => {
          const key = unitKey({ assignmentItemId: ctx.itemId, blockId, itemId: q.id })
          return (
            <Item key={q.id} n={i + 1}>
              {unit(
                q.id,
                <>
                  <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink)', margin: 0 }} lang="de" id={`q-${key}`}>
                    {q.question}
                  </p>
                  {q.kind === 'CHOICE' && <OptionGrid k={key} options={q.options ?? []} multiple={(q.solution?.correctOptionIds?.length ?? 0) > 1} ctx={ctx} />}
                  {q.kind === 'TRUE_FALSE' && <TrueFalse k={key} ctx={ctx} />}
                  {q.kind === 'OPEN' && <TextAnswer k={key} ctx={ctx} rows={2} label={q.question} />}
                </>,
              )}
            </Item>
          )
        })}
      </ItemList>
    </>
  )
}

/* --- Text --- */

export function TextAnswer({ k, ctx, rows, label, initial }: { k: string; ctx: AnswerContext; rows: number; label: string; initial?: string }) {
  const { t } = useTranslation()
  const value = ctx.answers[k]?.text
  if (!ctx.onChange) {
    return (
      <p style={{ marginTop: 8, whiteSpace: 'pre-wrap', borderRadius: 14, background: 'var(--bg-2)', padding: '10px 12px', fontSize: 'var(--text-body)', color: value ? 'var(--ink)' : 'var(--ink-3)' }} lang="de" data-testid="text-answer">
        {value || t('hw_no_answer')}
      </p>
    )
  }
  return (
    <TextArea
      value={value ?? initial ?? ''}
      onChange={(e) => ctx.onChange?.(k, { text: e.target.value })}
      rows={rows}
      lang="de"
      aria-label={label}
      placeholder={t('hw_answer_placeholder')}
      style={{ marginTop: 8 }}
      data-testid="text-input"
    />
  )
}

function WritingAnswer({ blockId, item, ctx }: { blockId: string; item: WritingItem; ctx: AnswerContext }) {
  const { t } = useTranslation()
  const key = unitKey({ assignmentItemId: ctx.itemId, blockId, itemId: item.id })
  const text = ctx.answers[key]?.text ?? ''
  const words = countWords(text)
  const min = item.minWords ?? 0
  const max = item.maxWords ?? 0
  const outOfRange = !!((min && words < min) || (max && words > max))
  return (
    <>
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
      {ctx.onChange ? (
        <TextArea
          value={text}
          onChange={(e) => ctx.onChange?.(key, { text: e.target.value })}
          rows={8}
          lang="de"
          aria-label={item.prompt}
          placeholder={t('hw_writing_placeholder')}
          style={{ marginTop: 10 }}
          data-testid="writing-input"
        />
      ) : (
        <p
          style={{ marginTop: 10, whiteSpace: 'pre-wrap', borderRadius: 14, background: 'var(--bg-2)', padding: '10px 12px', fontSize: 'var(--text-body)', color: text ? 'var(--ink)' : 'var(--ink-3)' }}
          lang="de"
          data-testid="text-answer"
        >
          {text || t('hw_no_answer')}
        </p>
      )}
      <p
        style={{ marginTop: 4, fontSize: 'var(--text-caption)', color: outOfRange && text ? 'var(--sunny-ink)' : 'var(--ink-3)' }}
        aria-live="polite"
      >
        {min && max
          ? t('hw_word_count_range', { count: words, min, max })
          : min
            ? t('hw_word_count_min', { count: words, min })
            : max
              ? t('hw_word_count_max', { count: words, max })
              : t('hw_word_count', { count: words })}
      </p>
    </>
  )
}
