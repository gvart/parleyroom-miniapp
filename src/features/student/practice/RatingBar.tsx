import { useTranslation } from 'react-i18next'
import { TONE_VARS, type Tone } from '@/ui'
import type { CardIntervals, PracticeRating } from '@/api/types'
import { formatDurationShort } from '@/lib/intl'

interface RatingDef {
  rating: PracticeRating
  labelKey: string
  icon: string
  tone: Tone
}

const RATINGS: RatingDef[] = [
  { rating: 'AGAIN', labelKey: 'again', icon: 'replay', tone: 'coral' },
  { rating: 'HARD', labelKey: 'hard', icon: 'trending_flat', tone: 'sunny' },
  { rating: 'GOOD', labelKey: 'good', icon: 'thumb_up', tone: 'leaf' },
  { rating: 'EASY', labelKey: 'easy', icon: 'bolt', tone: 'sky' },
]

/** "10 мин", "1 Std.", "3 days" — localized, until-next-review shorthand. */
function intervalHint(intervals: CardIntervals | null | undefined, rating: PracticeRating): string | null {
  const iv = intervals?.[rating]
  return iv ? formatDurationShort(iv.seconds) : null
}

/** The four FSRS grades as thumb-zone buttons, with the next-interval hint per grade when known. */
export function RatingBar({ intervals, disabled, onRate }: {
  intervals?: CardIntervals | null
  disabled?: boolean
  onRate: (rating: PracticeRating) => void
}) {
  const { t } = useTranslation()
  return (
    <div style={{ display: 'flex', gap: 8 }} role="group" aria-label={t('rate_word')}>
      {RATINGS.map((r) => {
        const hint = intervalHint(intervals, r.rating)
        return (
          <button
            type="button"
            key={r.rating}
            onClick={() => onRate(r.rating)}
            disabled={disabled}
            className="rate-btn"
            style={{ background: TONE_VARS[r.tone].soft, color: TONE_VARS[r.tone].ink }}
          >
            <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
              {r.icon}
            </span>
            {t(r.labelKey)}
            {hint && (
              <span style={{ fontSize: 10, fontWeight: 700, opacity: 0.75 }} aria-hidden="true">
                {hint}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
