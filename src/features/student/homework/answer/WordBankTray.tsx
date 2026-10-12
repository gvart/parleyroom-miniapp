import { useEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

/**
 * Should the word box dock to the bottom of the screen? Yes while the exercise is on screen
 * (above the band the tray covers) but its own word box has scrolled away.
 */
export function useWordBankDock(exercise: RefObject<HTMLElement | null>, bank: RefObject<HTMLElement | null>, enabled: boolean) {
  const [exerciseOn, setExerciseOn] = useState(false)
  const [bankOn, setBankOn] = useState(true)
  useEffect(() => {
    if (!enabled || !exercise.current || !bank.current || typeof IntersectionObserver === 'undefined') return
    const ex = new IntersectionObserver(([e]) => setExerciseOn(e.isIntersecting), { rootMargin: '0px 0px -25% 0px' })
    const bk = new IntersectionObserver(([e]) => setBankOn(e.isIntersecting && e.intersectionRatio >= 0.6), { threshold: [0, 0.6, 1] })
    ex.observe(exercise.current)
    bk.observe(bank.current)
    return () => {
      ex.disconnect()
      bk.disconnect()
    }
  }, [enabled, exercise, bank])
  return enabled && exerciseOn && !bankOn
}

export function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduce, setReduce] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches)
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia(query)
    const on = () => setReduce(mq.matches)
    mq.addEventListener?.('change', on)
    return () => mq.removeEventListener?.('change', on)
  }, [])
  return reduce
}

/**
 * The word box docked to the bottom of the screen as a glass tray. While open it publishes its
 * height as `--wordbank-space` (and `html[data-wordbank]`) so the screen can pad its scroll
 * area and hide its own bottom bar.
 */
export function WordBankTray({
  open,
  words,
  used,
  done,
  total,
  onPick,
}: {
  open: boolean
  words: string[]
  used: boolean[]
  done: number
  total: number
  /** `keyboard`: chosen with Enter/Space, not a tap. */
  onPick: (index: number, keyboard: boolean) => void
}) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!open || !el) return
    const root = document.documentElement
    const publish = () => root.style.setProperty('--wordbank-space', `${Math.ceil(el.getBoundingClientRect().height) + 16}px`)
    publish()
    root.dataset.wordbank = 'docked'
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(publish) : null
    ro?.observe(el)
    return () => {
      ro?.disconnect()
      delete root.dataset.wordbank
      root.style.removeProperty('--wordbank-space')
    }
  }, [open])

  // Up to three rows, in reading order; more words scroll sideways.
  const perRow = Math.ceil(words.length / Math.min(3, Math.ceil(words.length / 4)))
  const rows = Array.from({ length: Math.ceil(words.length / perRow) }, (_, r) => words.slice(r * perRow, (r + 1) * perRow).map((w, j) => [w, r * perRow + j] as const))

  return createPortal(
    <div
      ref={ref}
      role="region"
      aria-label={t('hw_word_box')}
      aria-hidden={!open}
      inert={!open}
      className="wb-tray glass-chrome"
      data-open={open || undefined}
      data-reduced={reduce || undefined}
      data-testid="word-bank-tray"
      lang="de"
    >
      <div className="wb-tray-head">
        <span className="eyebrow">{t('hw_word_box')}</span>
        <span className="wb-tray-count">{t('hw_word_box_progress', { done, total })}</span>
      </div>
      <div className="wb-tray-words">
        {rows.map((row, r) => (
          <div key={r} className="wb-tray-row">
            {row.map(([w, i]) => (
              <button
                key={i}
                type="button"
                className="wb-word"
                data-used={used[i] || undefined}
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => onPick(i, e.detail === 0)}
                data-testid="tray-word"
              >
                {w}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>,
    document.body,
  )
}
