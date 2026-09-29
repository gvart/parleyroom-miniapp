import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: string
  title: ReactNode
  sub?: ReactNode
  action?: ReactNode
}

/** Centered empty state: accent icon tile + section title + support copy. */
export function EmptyState({ icon, title, sub, action }: EmptyStateProps) {
  return (
    <div className="animate-in" style={{ padding: '36px 28px', textAlign: 'center' }}>
      <span className="icon-tile" style={{ width: 64, height: 64, borderRadius: 22, marginBottom: 14 }}>
        <span className="ms fill" style={{ fontSize: 32 }} aria-hidden="true">
          {icon}
        </span>
      </span>
      <div className="section-title" style={{ marginBottom: 4 }}>
        {title}
      </div>
      {sub && <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>{sub}</div>}
      {action && <div style={{ marginTop: 18 }}>{action}</div>}
    </div>
  )
}
