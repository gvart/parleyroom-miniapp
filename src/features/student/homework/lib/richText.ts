import type { RichNode, RichText } from '@/api/types'

export const SAFE_HREF = /^(https?:|mailto:)/i

/** Plain text, one line per paragraph / list item — used only to test emptiness. */
export function richToText(doc: RichText | null | undefined): string {
  const lines: string[] = []
  const inline = (n: RichNode): string =>
    n.type === 'text' ? (n.text ?? '') : n.type === 'hardBreak' ? '\n' : (n.content ?? []).map(inline).join('')
  const walk = (n: RichNode, prefix = '') => {
    switch (n.type) {
      case 'paragraph':
      case 'heading':
        lines.push(prefix + inline(n))
        break
      case 'bulletList':
        n.content?.forEach((li) => walk(li, '• '))
        break
      case 'orderedList':
        n.content?.forEach((li, i) => walk(li, `${i + 1}. `))
        break
      case 'listItem':
        n.content?.forEach((c, i) => walk(c, i === 0 ? prefix : '   '))
        break
      default:
        n.content?.forEach((c) => walk(c, prefix))
    }
  }
  doc?.content?.forEach((n) => walk(n))
  return lines.join('\n')
}

export function isRichEmpty(doc: RichText | null | undefined): boolean {
  return !richToText(doc).trim()
}
