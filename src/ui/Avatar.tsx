interface AvatarProps {
  hue?: number
  initials?: string
  size?: number
  live?: boolean
  src?: string | null
}

export function Avatar({
  hue = 172,
  initials = '??',
  size = 44,
  live = false,
  src,
}: AvatarProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: src
          ? 'var(--bg-2)'
          : `radial-gradient(circle at 30% 25%, oklch(0.88 0.10 ${hue}) 0%, oklch(0.55 0.14 ${hue}) 70%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 600,
        fontSize: size * 0.36,
        letterSpacing: '-0.02em',
        boxShadow: src
          ? '0 2px 8px rgba(15, 15, 14, 0.18)'
          : `inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 8px oklch(0.55 0.14 ${hue} / 0.25)`,
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={initials}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        initials
      )}
      {live && (
        <span
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: 'oklch(0.7 0.2 25)',
            border: '2px solid var(--bg)',
            animation: 'pulse-dot 1.6s infinite',
          }}
        />
      )}
    </div>
  )
}
