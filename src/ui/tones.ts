/** Semantic hue families → CSS token triplets (mirrors the portal's lib/tones). */
export type Tone = 'accent' | 'leaf' | 'sky' | 'sunny' | 'grape' | 'coral'

export const TONE_VARS: Record<Tone, { vivid: string; ink: string; soft: string }> = {
  accent: { vivid: 'var(--accent)', ink: 'var(--accent-ink)', soft: 'var(--accent-soft)' },
  leaf: { vivid: 'var(--leaf-vivid)', ink: 'var(--leaf-ink)', soft: 'var(--leaf-soft)' },
  sky: { vivid: 'var(--sky-vivid)', ink: 'var(--sky-ink)', soft: 'var(--sky-soft)' },
  sunny: { vivid: 'var(--sunny-vivid)', ink: 'var(--sunny-ink)', soft: 'var(--sunny-soft)' },
  grape: { vivid: 'var(--grape-vivid)', ink: 'var(--grape-ink)', soft: 'var(--grape-soft)' },
  coral: { vivid: 'var(--coral-vivid)', ink: 'var(--coral-ink)', soft: 'var(--coral-soft)' },
}
