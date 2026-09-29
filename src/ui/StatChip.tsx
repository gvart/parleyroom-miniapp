import { TONE_VARS, type Tone } from './tones'

interface StatChipProps {
  icon: string
  value: string | number
  label: string
  tone?: Tone
}

/** Compact metric tile (portal `MetricCard`, phone-sized). */
export function StatChip({ icon, value, label, tone = 'accent' }: StatChipProps) {
  const v = TONE_VARS[tone]
  return (
    <div className="card" style={{ padding: '12px 12px 11px', borderRadius: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span
          className="icon-tile"
          style={{ width: 28, height: 28, borderRadius: 10, background: v.soft, color: v.ink }}
        >
          <span className="ms fill" style={{ fontSize: 16 }} aria-hidden="true">
            {icon}
          </span>
        </span>
        <div className="font-headline" style={{ fontSize: 22, lineHeight: 1, fontWeight: 900 }}>
          {value}
        </div>
      </div>
      <div
        style={{
          fontSize: 'var(--text-caption)',
          color: 'var(--ink-2)',
          fontWeight: 700,
          lineHeight: 1.25,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </div>
  )
}
