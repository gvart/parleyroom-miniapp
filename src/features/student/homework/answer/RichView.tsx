import type { ReactNode } from 'react'
import type { RichMark, RichNode, RichText } from '@/api/types'
import { SAFE_HREF } from '../lib/richText'

function applyMarks(text: ReactNode, marks: RichMark[] | undefined, key: number): ReactNode {
  let out = text
  for (const m of marks ?? []) {
    if (m.type === 'bold') out = <strong>{out}</strong>
    else if (m.type === 'italic') out = <em>{out}</em>
    else if (m.type === 'underline') out = <u>{out}</u>
    else if (m.type === 'strike') out = <s>{out}</s>
    else if (m.type === 'highlight') out = <mark>{out}</mark>
    else if (m.type === 'link' && SAFE_HREF.test(m.attrs.href)) {
      out = (
        <a href={m.attrs.href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ink)' }}>
          {out}
        </a>
      )
    }
  }
  return <span key={key}>{out}</span>
}

function renderNode(n: RichNode, key: number): ReactNode {
  const kids = () => n.content?.map(renderNode)
  switch (n.type) {
    case 'text':
      return applyMarks(n.text ?? '', n.marks, key)
    case 'hardBreak':
      return <br key={key} />
    case 'paragraph':
      return <p key={key}>{kids()}</p>
    case 'heading': {
      const level = n.attrs?.level ?? 2
      return level === 1 ? <h2 key={key}>{kids()}</h2> : <h3 key={key}>{kids()}</h3>
    }
    case 'bulletList':
      return <ul key={key}>{kids()}</ul>
    case 'orderedList':
      return <ol key={key}>{kids()}</ol>
    case 'listItem':
      return <li key={key}>{kids()}</li>
    case 'blockquote':
      return <blockquote key={key}>{kids()}</blockquote>
    default:
      return <span key={key}>{kids()}</span>
  }
}

/** Renders rich-text JSON (TipTap subset) as React elements; no HTML strings involved. */
export function RichView({ doc, style }: { doc: RichText | null | undefined; style?: React.CSSProperties }) {
  if (!doc?.content?.length) return null
  return (
    <div className="hw-rich" lang="de" style={style}>
      {doc.content.map(renderNode)}
    </div>
  )
}
