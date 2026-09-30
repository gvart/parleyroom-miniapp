import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Block, Option } from '@/api/types'
import { BLOCK_META, blockLabel } from '../lib/blocks'

/** Icon, "Exercise N" for exercises, and the block's label: the eyebrow over a block. */
export function BlockEyebrow({ block, n }: { block: Block; n?: number }) {
  const { t } = useTranslation()
  return (
    <span className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
      <span className="ms" style={{ fontSize: 15 }} aria-hidden="true">
        {BLOCK_META[block.type].icon}
      </span>
      {n !== undefined && (
        <>
          <span style={{ color: 'var(--ink-2)' }}>{t('hw_exercise_number', { n })}</span>
          <span aria-hidden="true">·</span>
        </>
      )}
      <span>{blockLabel(block, t)}</span>
    </span>
  )
}

/** Answer key line, shown only after review (students never get a raw `solution` otherwise). */
export function Solution({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <p
      style={{
        marginTop: 6,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 6,
        fontSize: 'var(--text-small)',
        color: 'var(--leaf-ink)',
      }}
      data-testid="solution"
    >
      <span className="ms fill" style={{ fontSize: 16, flexShrink: 0 }} aria-hidden="true">
        check_circle
      </span>
      <span>
        <span className="sr-only">{t('hw_solution_label')}: </span>
        <span lang="de">{children}</span>
      </span>
    </p>
  )
}

export function Instructions({ text }: { text?: string | null }) {
  if (!text?.trim()) return null
  return (
    <p style={{ fontSize: 'var(--text-body)', fontWeight: 700, color: 'var(--ink)', margin: 0 }} lang="de">
      {text}
    </p>
  )
}

/** Numbered list of exercise items. */
export function ItemList({ children }: { children: ReactNode }) {
  return <ol style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: '10px 0 0', padding: 0, listStyle: 'none' }}>{children}</ol>
}

export function Item({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li style={{ display: 'flex', gap: 10 }}>
      <span
        style={{
          marginTop: 1,
          flexShrink: 0,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: 'var(--bg-2)',
          color: 'var(--ink-2)',
          fontSize: 'var(--text-caption)',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden="true"
      >
        {n}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </li>
  )
}

/** A lettered option (a, b, c...); marked green when it's in the answer key. */
export function OptionRow({ option, index, correct }: { option: Option; index: number; correct?: boolean }) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        borderRadius: 12,
        padding: '6px 10px',
        fontSize: 'var(--text-body)',
        background: correct ? 'var(--leaf-soft)' : 'var(--bg-2)',
        color: 'var(--ink)',
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: correct ? 'none' : '1px solid var(--hair-strong)',
          background: correct ? 'var(--leaf-vivid)' : 'transparent',
          color: correct ? 'var(--on-accent)' : 'var(--ink-3)',
          fontSize: 12,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden="true"
      >
        {correct ? (
          <span className="ms" style={{ fontSize: 13 }}>
            check
          </span>
        ) : (
          String.fromCharCode(97 + index)
        )}
      </span>
      <span lang="de">{option.text}</span>
    </li>
  )
}
