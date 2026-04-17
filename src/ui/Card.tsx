import type { CSSProperties, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  padded?: boolean
  style?: CSSProperties
  onClick?: () => void
  className?: string
}

export function Card({
  children,
  padded = true,
  style,
  onClick,
  className = '',
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`card ${className}`}
      style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius-card)',
        padding: padded ? 'var(--pad)' : 0,
        boxShadow:
          '0 1px 0 rgba(255,255,255,0.5) inset, 0 1px 2px rgba(15,15,14,0.03), 0 8px 24px rgba(15,15,14,0.04)',
        border: '1px solid var(--hair)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
