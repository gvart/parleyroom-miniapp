import { TONE_VARS, type Tone } from './tones'

interface CategoryDotProps {
  cat: string
}

const map: Record<string, { tone: Tone; icon: string }> = {
  writing: { tone: 'grape', icon: 'edit' },
  reading: { tone: 'sunny', icon: 'menu_book' },
  grammar: { tone: 'leaf', icon: 'school' },
  vocabulary: { tone: 'sky', icon: 'dictionary' },
  listening: { tone: 'coral', icon: 'headphones' },
}

export function CategoryDot({ cat }: CategoryDotProps) {
  const c = map[cat] ?? map.writing
  const v = TONE_VARS[c.tone]
  return (
    <div
      className="icon-tile"
      style={{ width: 36, height: 36, borderRadius: 12, background: v.soft, color: v.ink }}
    >
      <span className="ms fill" style={{ fontSize: 18 }} aria-hidden="true">
        {c.icon}
      </span>
    </div>
  )
}
