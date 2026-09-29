import type { ReactNode } from 'react'

interface SegmentedProps<K extends string> {
  options: Array<{ key: K; label: ReactNode; count?: number }>
  value: K
  onChange: (key: K) => void
  ariaLabel?: string
}

/** Pill segmented control (portal `.seg`). */
export function Segmented<K extends string>({ options, value, onChange, ariaLabel }: SegmentedProps<K>) {
  return (
    <div className="seg" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          type="button"
          role="tab"
          key={o.key}
          aria-selected={o.key === value}
          className={o.key === value ? 'on' : undefined}
          onClick={() => onChange(o.key)}
        >
          {o.label}
          {o.count !== undefined && <span className="count">{o.count}</span>}
        </button>
      ))}
    </div>
  )
}
