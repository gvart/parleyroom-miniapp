import { useId } from 'react'
import { TONE_VARS, type Tone } from './tones'

interface RingProps {
  value?: number
  size?: number
  stroke?: number
  tone?: Tone
  label?: string | number
  sublabel?: string
}

/** Progress ring (portal `ProgressRing`, without the liquid fill). */
export function Ring({
  value = 60,
  size = 64,
  stroke = 6,
  tone = 'accent',
  label,
  sublabel,
}: RingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(100, value))
  const offset = c - (v / 100) * c
  const id = useId()
  const colors = TONE_VARS[tone]
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={colors.vivid} />
            <stop offset="100%" stopColor={colors.ink} />
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
          opacity={v === 0 ? 0 : 1}
          style={{ transition: 'stroke-dashoffset var(--spring-bouncy-ms) var(--spring-bouncy)' }}
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
          <div className="font-headline" style={{ fontSize: size * 0.26, fontWeight: 900, color: 'var(--ink)' }}>
            {label}
          </div>
          {sublabel && (
            <div style={{ fontSize: Math.max(10, size * 0.11), color: 'var(--ink-2)', marginTop: 3, fontWeight: 700 }}>
              {sublabel}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
