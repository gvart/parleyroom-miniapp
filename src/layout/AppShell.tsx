import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { TabBar, type TabDef } from '@/ui'
import { useKeyboardOpen } from '@/hooks/useKeyboardOpen'

interface AppShellProps {
  tabs: TabDef[]
  children: ReactNode
}

// Routes that take over the whole viewport and should hide the floating tab bar.
function isFullscreen(pathname: string): boolean {
  if (pathname.startsWith('/vocab/practice/session')) return true
  // /lessons/:id/live
  if (/^\/lessons\/[^/]+\/live$/.test(pathname)) return true
  // /homework/:id — a long document needs the vertical room, and its own
  // sticky Submit bar replaces the tab bar as the way back (ScreenHeader).
  if (/^\/homework\/[^/]+$/.test(pathname)) return true
  return false
}

// Telegram puts an overlay header (Close button + ⋯ pill) on top of our content
// in fullscreen mode. `--tg-viewport-content-safe-area-inset-top` is the height of
// that chrome; `--tg-viewport-safe-area-inset-top` is the system status bar.
// Stack both so our content starts below all of it. Falls back to env(safe-area-*)
// outside Telegram (PWA / browser).
const TOP_INSET =
  'calc(var(--tg-viewport-safe-area-inset-top, env(safe-area-inset-top)) + var(--tg-viewport-content-safe-area-inset-top, 0px))'

const BOTTOM_INSET =
  'calc(var(--tg-viewport-safe-area-inset-bottom, env(safe-area-inset-bottom)) + var(--tg-viewport-content-safe-area-inset-bottom, 0px))'

export function AppShell({ tabs, children }: AppShellProps) {
  const { pathname } = useLocation()
  const fullscreen = isFullscreen(pathname)
  // Any screen's floating tab bar would otherwise sit on top of the on-screen
  // keyboard (it doesn't resize the layout viewport — see useKeyboardAwareLayout)
  // and cover whatever the keyboard itself doesn't already cover.
  const keyboardOpen = useKeyboardOpen()
  return (
    <div
      style={{
        minHeight: '100vh',
        color: 'var(--ink)',
        paddingTop: fullscreen ? 0 : TOP_INSET,
      }}
    >
      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          paddingBottom: fullscreen ? 0 : `calc(104px + ${BOTTOM_INSET})`,
        }}
      >
        {children}
      </main>
      {!fullscreen && !keyboardOpen && <TabBar tabs={tabs} />}
    </div>
  )
}
