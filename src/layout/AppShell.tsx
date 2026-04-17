import type { ReactNode } from 'react'
import { TabBar, type TabDef } from '@/ui'

interface AppShellProps {
  tabs: TabDef[]
  children: ReactNode
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
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
        paddingTop: TOP_INSET,
      }}
    >
      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          paddingBottom: `calc(110px + ${BOTTOM_INSET})`,
        }}
      >
        {children}
      </main>
      <TabBar tabs={tabs} />
    </div>
  )
}
