import { Card } from './Card'

interface StatChipProps {
  icon: string
  value: string | number
  label: string
  hue?: number
}

export function StatChip({ icon, value, label, hue = 172 }: StatChipProps) {
  return (
    <Card padded={false} style={{ padding: '12px 12px 11px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span
          className="ms fill"
          style={{ fontSize: 14, color: `oklch(0.55 0.14 ${hue})` }}
        >
          {icon}
        </span>
        <div
          className="mono"
          style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}
        >
          {value}
        </div>
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--ink-3)',
          letterSpacing: '0.03em',
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
    </Card>
  )
}
