import { useEffect, type ReactNode } from 'react'
import { hapticSuccess } from '@/lib/haptics'

interface SuccessStateProps {
  icon: string
  title: ReactNode
  sub?: ReactNode
  /** Small note below `sub` (e.g. the LessonCompleteSheet portal hint). */
  extra?: ReactNode
}

/** Centered "done" state for a sheet's post-submit body (check circle + copy). */
export function SuccessState({ icon, title, sub, extra }: SuccessStateProps) {
  useEffect(() => {
    hapticSuccess()
  }, [])

  return (
    <div style={{ textAlign: 'center', padding: '28px 20px' }}>
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 999,
          background: 'var(--accent-soft)',
          color: 'var(--accent-ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
          boxShadow: 'var(--glass-highlight), 0 0 0 8px color-mix(in srgb, var(--accent) 10%, transparent)',
          animation: 'scale-in var(--spring-bouncy-ms) var(--spring-bouncy)',
        }}
      >
        <span className="ms fill" style={{ fontSize: 36 }} aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className="section-title" style={{ marginBottom: 4 }}>
        {title}
      </div>
      {sub && <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>{sub}</div>}
      {extra && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>{extra}</div>}
    </div>
  )
}
