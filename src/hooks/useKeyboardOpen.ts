import { useEffect, useState } from 'react'

/**
 * Mirrors the `keyboard-open` class `useKeyboardAwareLayout` toggles on
 * `<html>` (mounted once in App.tsx) as reactive state, so components can
 * hide chrome — a floating tab bar, a sticky action bar — that would
 * otherwise sit on top of the keyboard.
 */
export function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(() => document.documentElement.classList.contains('keyboard-open'))

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => setOpen(root.classList.contains('keyboard-open')))
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return open
}
