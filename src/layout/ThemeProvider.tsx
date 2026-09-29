import { useEffect, type ReactNode } from 'react'

// Same approach as the portal: `.dark` on <html> follows the system scheme.
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle('dark', dark)
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', dark ? '#06120D' : '#EEF7EC')
    }
    apply(media.matches)
    const onChange = (e: MediaQueryListEvent) => apply(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
  return <>{children}</>
}
