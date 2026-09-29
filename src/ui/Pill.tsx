import type { CSSProperties, ReactNode } from 'react'

export type PillTone = 'neutral' | 'accent' | 'warn' | 'violet' | 'live' | 'dark' | 'moss' | 'info'

const tones: Record<PillTone, { bg: string; fg: string }> = {
  neutral: { bg: 'var(--bg-3)', fg: 'var(--ink-2)' },
  accent: { bg: 'var(--accent-soft)', fg: 'var(--accent-ink)' },
  warn: { bg: 'var(--sunny-soft)', fg: 'var(--sunny-ink)' },
  violet: { bg: 'var(--grape-soft)', fg: 'var(--grape-ink)' },
  live: { bg: 'var(--coral-soft)', fg: 'var(--coral-ink)' },
  dark: { bg: 'var(--ink)', fg: 'var(--bg)' },
  moss: { bg: 'var(--leaf-soft)', fg: 'var(--leaf-ink)' },
  info: { bg: 'var(--sky-soft)', fg: 'var(--sky-ink)' },
}

interface PillProps {
  children: ReactNode
  tone?: PillTone
  style?: CSSProperties
}

/** Small rounded status label — the portal's Liquid Glass pill. */
export function Pill({ children, tone = 'neutral', style }: PillProps) {
  const t = tones[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: t.bg,
        color: t.fg,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 'var(--text-caption)',
        lineHeight: 1.5,
        fontWeight: 800,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
