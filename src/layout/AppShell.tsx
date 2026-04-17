import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { TabBar, type TabDef } from '@/ui'

interface AppShellProps {
  tabs: TabDef[]
  children: ReactNode
}

// Routes that take over the whole viewport and should hide the floating tab bar.
const FULLSCREEN_PREFIXES = ['/vocab/review', '/lesson/']

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
  const fullscreen = FULLSCREEN_PREFIXES.some((p) => pathname.startsWith(p))
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
        paddingTop: fullscreen ? 0 : TOP_INSET,
      }}
    >
      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          paddingBottom: fullscreen ? 0 : `calc(110px + ${BOTTOM_INSET})`,
        }}
      >
        {children}
      </main>
      {!fullscreen && <TabBar tabs={tabs} />}
    </div>
  )
}
