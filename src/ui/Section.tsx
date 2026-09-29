import type { ReactNode } from 'react'

interface SectionProps {
  eyebrow?: ReactNode
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
}

export function Section({ eyebrow, title, action, children }: SectionProps) {
  return (
    <section style={{ marginBottom: 24 }}>
      {(eyebrow || title || action) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 12,
            marginBottom: 12,
            padding: '0 16px',
          }}
        >
          <div style={{ minWidth: 0 }}>
            {eyebrow && <div className="eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>}
            {title && <h2 className="section-title" style={{ margin: 0 }}>{title}</h2>}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: '0 16px' }}>{children}</div>
    </section>
  )
}
