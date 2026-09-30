import { useEffect } from 'react'

/**
 * Keyboard-safe layout for iOS/Telegram webviews, where the on-screen
 * keyboard shrinks `visualViewport` without resizing the layout viewport —
 * the classic "keyboard covers the input" bug. Mount once at the app root.
 *
 * - Exposes `--keyboard-inset` (px) on <html>, updated on every
 *   visualViewport resize/scroll. `Sheet` and scrollable screens pad by it
 *   so content and primary actions never sit under the keyboard.
 * - Globally scrolls the focused input into view once the keyboard has
 *   finished animating in, within whichever ancestor actually scrolls
 *   (`#root`, or an open sheet's `.sheet-popup`).
 */
export function useKeyboardAwareLayout(): void {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const root = document.documentElement
    let raf = 0

    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
        root.style.setProperty('--keyboard-inset', `${inset}px`)
        root.classList.toggle('keyboard-open', inset > 60)
      })
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      cancelAnimationFrame(raf)
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      root.style.removeProperty('--keyboard-inset')
      root.classList.remove('keyboard-open')
    }
  }, [])

  useEffect(() => {
    function onFocusIn(e: FocusEvent) {
      const el = e.target
      if (!(el instanceof HTMLElement)) return
      if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return
      // Give the keyboard time to finish animating in before measuring/scrolling.
      window.setTimeout(() => {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }, 300)
    }
    document.addEventListener('focusin', onFocusIn)
    return () => document.removeEventListener('focusin', onFocusIn)
  }, [])
}
