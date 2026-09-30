import { useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/ui'
import { exerciseNumbers } from './lib/blocks'
import { BlockEyebrow } from './answer/parts'
import { useAuthedFile } from './lib/authedFile'
import type { AssignmentItem, Block, HomeworkDetail, HomeworkUnit } from '@/api/types'
import { InteractiveBlock, TextAnswer, type AnswerContext } from './answer/InteractiveBlock'
import { MediaAnswer, type MediaAnswerProps } from './answer/MediaAnswer'
import { unitKey, type AnswerMap, type UnitAnswer } from './lib/answers'

/** Blocks that read as running text get no frame or label (like a document viewer). */
const PLAIN = new Set<Block['type']>(['heading', 'rich_text'])

export interface HomeworkItemsProps {
  hw: HomeworkDetail
  answers: AnswerMap
  onChange?: (key: string, value: UnitAnswer) => void
  showResults: boolean
  unitSlot?: (key: string) => ReactNode
  onUpload?: (itemId: string, file: Blob, name: string, onProgress: (pct: number) => void) => Promise<unknown>
  onDeleteUpload?: (uploadId: string) => Promise<unknown>
}

/** Every item of a homework, in order: documents with answerable blocks, materials, free tasks. */
export function HomeworkItems(props: HomeworkItemsProps) {
  const units = useMemo(() => new Map<string, HomeworkUnit>(props.hw.units.map((u) => [unitKey(u), u])), [props.hw.units])
  const many = props.hw.items.length > 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {props.hw.items.map((item, i) => (
        <HomeworkItemCard key={item.id} item={item} n={many ? i + 1 : null} units={units} {...props} />
      ))}
    </div>
  )
}

function HomeworkItemCard({
  item,
  n,
  units,
  hw,
  answers,
  onChange,
  showResults,
  unitSlot,
  onUpload,
  onDeleteUpload,
}: HomeworkItemsProps & { item: AssignmentItem; n: number | null; units: Map<string, HomeworkUnit> }) {
  const { t } = useTranslation()
  const ctx: AnswerContext = useMemo(
    () => ({ answers, onChange, showResults, unitSlot, itemId: item.id, units, vocab: new Map((item.vocab ?? []).map((v) => [v.id, v])) }),
    [answers, onChange, showResults, unitSlot, item.id, item.vocab, units],
  )
  const numbers = useMemo(() => exerciseNumbers(item.blocks ?? []), [item.blocks])
  const icon = item.kind === 'DOCUMENT' ? 'description' : item.kind === 'MATERIAL' ? 'folder_open' : 'assignment'
  const key = unitKey({ assignmentItemId: item.id })
  const hasUnit = units.has(key)
  const uploads = hw.uploads.filter((u) => u.assignmentItemId === item.id)
  const media: Pick<MediaAnswerProps, 'onUpload' | 'onDelete'> =
    onChange && onUpload ? { onUpload: (f, name, p) => onUpload(item.id, f, name, p), onDelete: onDeleteUpload } : {}

  return (
    <Card>
      <header style={{ marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span className="icon-tile" style={{ background: 'var(--accent-soft)', color: 'var(--accent-ink)' }}>
          <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
            {icon}
          </span>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="eyebrow">{n ? t('hw_item_numbered', { n, kind: t(`hw_item_kind_${item.kind}`) }) : t(`hw_item_kind_${item.kind}`)}</p>
          {(item.kind !== 'DOCUMENT' || item.title !== hw.title) && (
            <h2 style={{ fontSize: 'var(--text-section-title)', color: 'var(--ink)', margin: '2px 0 0' }} lang="de">
              {item.kind === 'MATERIAL' ? (item.material?.name ?? item.title) : item.title}
            </h2>
          )}
        </div>
      </header>

      {item.task && (
        <p style={{ marginBottom: 14, whiteSpace: 'pre-wrap', fontSize: 'var(--text-body)', color: 'var(--ink)' }} lang="de">
          {item.task}
        </p>
      )}

      {item.kind === 'DOCUMENT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(item.blocks ?? []).map((block) => {
            const plain = PLAIN.has(block.type)
            return (
              <section
                key={block.id}
                data-block-type={block.type}
                className={plain ? undefined : 'glass-inner'}
                style={plain ? undefined : { borderRadius: 18, padding: 14 }}
              >
                {!plain && <BlockEyebrow block={block} n={numbers.get(block.id)} />}
                <InteractiveBlock block={block} ctx={ctx} />
              </section>
            )
          })}
        </div>
      )}

      {item.kind === 'MATERIAL' && <MaterialInline item={item} />}

      {hasUnit && item.kind !== 'DOCUMENT' && (
        <div data-unit={key}>
          {item.responseType === 'TEXT' || !item.responseType ? (
            <TextAnswer k={key} ctx={ctx} rows={6} label={item.title} />
          ) : (
            <MediaAnswer kind={item.responseType} uploads={uploads} {...media} />
          )}
          {unitSlot?.(key)}
        </div>
      )}
    </Card>
  )
}

function MaterialInline({ item }: { item: AssignmentItem }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const material = item.material
  const { url, loading } = useAuthedFile(open ? material?.downloadUrl : null)
  if (!material) return <p style={{ marginBottom: 14, fontSize: 'var(--text-small)', color: 'var(--ink-3)' }}>{t('hw_material_gone')}</p>

  const isImage = material.contentType?.startsWith('image/')
  const isPdf = material.type === 'PDF'
  const isAudio = material.type === 'AUDIO'
  const isVideo = material.type === 'VIDEO'

  return (
    <div style={{ marginBottom: 14 }}>
      {!open ? (
        <button type="button" className="btn-ghost" onClick={() => setOpen(true)}>
          <span className="ms" style={{ fontSize: 18 }} aria-hidden="true">
            open_in_new
          </span>
          {t('hw_open_material')}
        </button>
      ) : loading ? (
        <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', padding: 12 }}>{t('preview_loading')}</div>
      ) : (
        url && (
          <>
            {isImage && <img src={url} alt={material.name} style={{ maxWidth: '100%', borderRadius: 14, border: '1px solid var(--hair)' }} />}
            {isPdf && <iframe src={url} title={material.name} style={{ width: '100%', height: '60vh', border: '1px solid var(--hair)', borderRadius: 14 }} />}
            {isAudio && <audio src={url} controls style={{ width: '100%' }} />}
            {isVideo && <video src={url} controls style={{ width: '100%', maxHeight: '60vh', borderRadius: 14 }} />}
          </>
        )
      )}
    </div>
  )
}
