import type { CSSProperties } from 'react'
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react'

export function App() {
  const launchParams = useLaunchParams()
  const rawInitData = useRawInitData()

  const user = launchParams.tgWebAppData?.user
  const theme = launchParams.tgWebAppThemeParams ?? {}
  const platform = launchParams.tgWebAppPlatform
  const version = launchParams.tgWebAppVersion
  const startParam = launchParams.tgWebAppStartParam

  const cssVars: CSSProperties = {
    ['--tg-bg' as string]: theme.bg_color ?? '#ffffff',
    ['--tg-text' as string]: theme.text_color ?? '#000000',
    ['--tg-hint' as string]: theme.hint_color ?? '#999999',
    ['--tg-section-bg' as string]: theme.secondary_bg_color ?? '#f4f4f5',
  }

  return (
    <main className="app" style={cssVars}>
      <header>
        <h1>Mini App shell</h1>
        <p className="hint">
          {platform} · Telegram WebApp v{version}
          {startParam ? ` · start: ${startParam}` : ''}
        </p>
      </header>

      <Section title="User (from initData)">
        {user ? (
          <pre>{JSON.stringify(user, null, 2)}</pre>
        ) : (
          <p className="hint">No user — are we running outside Telegram?</p>
        )}
      </Section>

      <Section title="Raw initData (what the backend will verify)">
        <pre className="wrap">{rawInitData || '(none)'}</pre>
      </Section>

      <Section title="Theme params">
        <pre>{JSON.stringify(theme, null, 2)}</pre>
      </Section>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}
