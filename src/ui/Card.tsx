import type { CSSProperties, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  padded?: boolean
  style?: CSSProperties
  onClick?: () => void
  className?: string
}

/** L1 glass content surface (portal `GlassCard` / `.card`) — no backdrop blur. */
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
        padding: padded ? 20 : 0,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
