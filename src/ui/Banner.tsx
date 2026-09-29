import type { CSSProperties, ReactNode } from 'react'

export type BannerTone = 'info' | 'warn' | 'error' | 'success'

const tones: Record<BannerTone, { bg: string; fg: string; icon: string }> = {
  info: { bg: 'var(--sky-soft)', fg: 'var(--sky-ink)', icon: 'info' },
  warn: { bg: 'var(--sunny-soft)', fg: 'var(--sunny-ink)', icon: 'warning' },
  error: { bg: 'var(--coral-soft)', fg: 'var(--coral-ink)', icon: 'error' },
  success: { bg: 'var(--leaf-soft)', fg: 'var(--leaf-ink)', icon: 'check_circle' },
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
      role={tone === 'error' ? 'alert' : undefined}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 18,
        background: t.bg,
        color: t.fg,
        fontSize: 'var(--text-small)',
        fontWeight: 700,
        boxShadow: 'var(--glass-highlight)',
        ...style,
      }}
    >
      <span className="ms fill" style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }} aria-hidden="true">
        {icon ?? t.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  )
}
