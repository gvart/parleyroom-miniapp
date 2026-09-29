interface AvatarProps {
  hue?: number
  initials?: string
  size?: number
  live?: boolean
  src?: string | null
}

/** Glossy glass orb with initials, or the photo (portal `UserAvatar`). */
export function Avatar({
  hue = 140,
  initials = '??',
  size = 44,
  live = false,
  src,
}: AvatarProps) {
  return (
    <div
      className="font-headline"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: src
          ? 'var(--bg-2)'
          : `radial-gradient(circle at 32% 22%, oklch(0.86 0.12 ${hue}) 0%, oklch(0.56 0.16 ${hue}) 45%, oklch(0.44 0.15 ${hue}) 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textShadow: '0 1px 1px rgba(0,0,0,0.25)',
        fontWeight: 800,
        fontSize: size * 0.36,
        boxShadow: src
          ? '0 0 0 2px var(--glass-border), var(--shadow-1)'
          : `inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -2px 4px oklch(0.3 0.12 ${hue} / 0.35), 0 0 0 2px var(--glass-border), 0 4px 12px -2px oklch(0.5 0.16 ${hue} / 0.35)`,
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={initials}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 999 }}
        />
      ) : (
        initials
      )}
      {live && (
        <span
          className="live-dot"
          style={{
            position: 'absolute',
            top: -1,
            right: -1,
            width: 12,
            height: 12,
            border: '2px solid var(--glass-fallback)',
          }}
        />
      )}
    </div>
  )
}
