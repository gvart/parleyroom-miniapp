interface CategoryDotProps {
  cat: string
}

const map: Record<string, { bg: string; fg: string; icon: string }> = {
  writing: { bg: 'oklch(0.94 0.05 290)', fg: 'oklch(0.5 0.13 290)', icon: 'edit' },
  reading: { bg: 'oklch(0.94 0.05 75)', fg: 'oklch(0.48 0.13 75)', icon: 'menu_book' },
  grammar: { bg: 'oklch(0.94 0.04 172)', fg: 'oklch(0.45 0.11 172)', icon: 'school' },
  vocabulary: { bg: 'oklch(0.94 0.05 210)', fg: 'oklch(0.5 0.13 210)', icon: 'dictionary' },
  listening: { bg: 'oklch(0.94 0.05 25)', fg: 'oklch(0.55 0.15 25)', icon: 'headphones' },
}

export function CategoryDot({ cat }: CategoryDotProps) {
  const c = map[cat] ?? map.writing
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        background: c.bg,
        color: c.fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span className="ms" style={{ fontSize: 18 }}>
        {c.icon}
      </span>
    </div>
  )
}
