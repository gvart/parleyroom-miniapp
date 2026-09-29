import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: ReactNode
  title: ReactNode
  sub?: ReactNode
  /** Right-aligned slot (icon button, small CTA). */
  action?: ReactNode
}

/** Page opener — eyebrow + `.page-h1` + `.page-sub` (portal `PageHero`). */
export function PageHeader({ eyebrow, title, sub, action }: PageHeaderProps) {
  return (
    <div
      className="animate-in"
      style={{
        padding: '12px 16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</div>}
        <h1 className="page-h1">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {action}
    </div>
  )
}
