import type { ReactNode } from 'react'

interface SectionProps {
  eyebrow?: ReactNode
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
}

export function Section({ eyebrow, title, action, children }: SectionProps) {
  return (
    <section style={{ marginBottom: 22 }}>
      {(eyebrow || title || action) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 10,
            padding: '0 20px',
          }}
        >
          <div>
            {eyebrow && (
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-3)',
                  fontWeight: 600,
                  marginBottom: 2,
                }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <div className="serif" style={{ fontSize: 24, color: 'var(--ink)' }}>
                {title}
              </div>
            )}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: '0 20px' }}>{children}</div>
    </section>
  )
}
