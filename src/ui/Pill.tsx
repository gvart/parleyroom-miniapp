import type { CSSProperties, ReactNode } from 'react'

export type PillTone = 'neutral' | 'accent' | 'warn' | 'violet' | 'live' | 'dark'

const tones: Record<PillTone, { bg: string; fg: string }> = {
  neutral: { bg: 'var(--hair)', fg: 'var(--ink-2)' },
  accent: { bg: 'var(--accent-soft)', fg: 'var(--accent-deep)' },
  warn: { bg: 'oklch(0.95 0.05 75)', fg: 'oklch(0.45 0.12 75)' },
  violet: { bg: 'oklch(0.95 0.04 290)', fg: 'oklch(0.40 0.12 290)' },
  live: { bg: 'oklch(0.96 0.05 25)', fg: 'oklch(0.5 0.18 25)' },
  dark: { bg: 'var(--ink)', fg: 'var(--bg)' },
}

interface PillProps {
  children: ReactNode
  tone?: PillTone
  style?: CSSProperties
}

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
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.01em',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
