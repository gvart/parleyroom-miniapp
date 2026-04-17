import { useId } from 'react'

interface RingProps {
  value?: number
  size?: number
  stroke?: number
  hue?: number | string
  label?: string | number
  sublabel?: string
}

export function Ring({
  value = 60,
  size = 64,
  stroke = 6,
  hue = 172,
  label,
  sublabel,
}: RingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  const id = useId()
  const startStop = `oklch(0.72 0.14 ${hue})`
  const endStop = `oklch(0.50 0.12 ${hue})`
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={startStop} />
            <stop offset="100%" stopColor={endStop} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--hair)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .6s var(--ease)' }}
        />
      </svg>
      {label !== undefined && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            lineHeight: 1,
          }}
        >
          <div style={{ fontSize: size * 0.28, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {label}
          </div>
          {sublabel && (
            <div style={{ fontSize: size * 0.13, color: 'var(--ink-3)', marginTop: 2 }}>
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
