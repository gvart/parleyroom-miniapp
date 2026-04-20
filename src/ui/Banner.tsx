import type { CSSProperties, ReactNode } from 'react'

export type BannerTone = 'info' | 'warn' | 'error' | 'success'

const tones: Record<BannerTone, { bg: string; fg: string; icon: string }> = {
  info: { bg: 'var(--accent-soft)', fg: 'var(--accent-deep)', icon: 'info' },
  warn: { bg: 'oklch(0.95 0.05 75)', fg: 'oklch(0.45 0.12 75)', icon: 'warning' },
  error: { bg: 'oklch(0.96 0.05 25)', fg: 'oklch(0.5 0.18 25)', icon: 'error' },
  success: { bg: 'oklch(0.95 0.07 145)', fg: 'oklch(0.38 0.12 145)', icon: 'check_circle' },
}

interface BannerProps {
  tone?: BannerTone
  icon?: string
  children: ReactNode
  style?: CSSProperties
}

export function Banner({ tone = 'info', icon, children, style }: BannerProps) {
  const t = tones[tone]
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 12,
        background: t.bg,
        color: t.fg,
        fontSize: 13,
        ...style,
      }}
    >
      <span className="ms fill" style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
        {icon ?? t.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}
