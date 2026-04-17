import type { ReactNode } from 'react'
import { TabBar, type TabDef } from '@/ui'

interface AppShellProps {
  tabs: TabDef[]
  children: ReactNode
}

export function AppShell({ tabs, children }: AppShellProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          paddingBottom: 'calc(110px + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </main>
      <TabBar tabs={tabs} />
    </div>
  )
}
