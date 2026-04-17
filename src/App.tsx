import type { CSSProperties, FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react'
import { api, ApiError, type UserProfile } from './api'

type AuthState =
  | { kind: 'checking' }
  | { kind: 'needsLink' }
  | { kind: 'linking' }
  | { kind: 'signedIn'; user: UserProfile }
  | { kind: 'error'; message: string }

export function App() {
  const launchParams = useLaunchParams()
  const rawInitData = useRawInitData()

  const theme = launchParams.tgWebAppThemeParams ?? {}
  const cssVars: CSSProperties = {
    ['--tg-bg' as string]: theme.bg_color ?? '#ffffff',
    ['--tg-text' as string]: theme.text_color ?? '#000000',
    ['--tg-hint' as string]: theme.hint_color ?? '#999999',
    ['--tg-section-bg' as string]: theme.secondary_bg_color ?? '#f4f4f5',
    ['--tg-button' as string]: theme.button_color ?? '#3390ec',
    ['--tg-button-text' as string]: theme.button_text_color ?? '#ffffff',
  }

  return (
    <main className="app" style={cssVars}>
      <header>
        <h1>Mini App</h1>
        <p className="hint">
          {launchParams.tgWebAppPlatform} · v{launchParams.tgWebAppVersion}
        </p>
      </header>
      <AuthFlow rawInitData={rawInitData ?? ''} />
    </main>
  )
}

function AuthFlow({ rawInitData }: { rawInitData: string }) {
  const [state, setState] = useState<AuthState>({ kind: 'checking' })
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (!rawInitData) {
        setState({ kind: 'error', message: 'No initData — are we running inside Telegram?' })
        return
      }
      try {
        const auth = await api.signInWithMiniApp(rawInitData)
        if (cancelled) return
        setToken(auth.accessToken)
        const user = await api.me(auth.accessToken)
        if (cancelled) return
        setState({ kind: 'signedIn', user })
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setState({ kind: 'needsLink' })
          return
        }
        setState({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    check()
    return () => { cancelled = true }
  }, [rawInitData])

  switch (state.kind) {
    case 'checking':
      return <section><p>Signing you in…</p></section>
    case 'signedIn':
      return <SignedIn user={state.user} />
    case 'needsLink':
    case 'linking':
      return (
        <LinkForm
          rawInitData={rawInitData}
          isSubmitting={state.kind === 'linking'}
          onStart={() => setState({ kind: 'linking' })}
          onError={(message) => setState({ kind: 'error', message })}
          onSuccess={(nextToken, user) => {
            setToken(nextToken)
            setState({ kind: 'signedIn', user })
          }}
        />
      )
    case 'error':
      return (
        <section>
          <h2>Couldn't sign you in</h2>
          <p className="hint">{state.message}</p>
        </section>
      )
  }

  void token
}

function SignedIn({ user }: { user: UserProfile }) {
  return (
    <section>
      <h2>Signed in</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </section>
  )
}

function LinkForm({
  rawInitData,
  isSubmitting,
  onStart,
  onError,
  onSuccess,
}: {
  rawInitData: string
  isSubmitting: boolean
  onStart: () => void
  onError: (message: string) => void
  onSuccess: (token: string, user: UserProfile) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit(e: FormEvent) {
    e.preventDefault()
    onStart()
    try {
      const auth = await api.signInWithPassword(email, password)
      await api.linkTelegram(rawInitData, auth.accessToken)
      const user = await api.me(auth.accessToken)
      onSuccess(auth.accessToken, user)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Link failed')
    }
  }

  return (
    <section>
      <h2>Link your account</h2>
      <p className="hint">
        Sign in once with your email + password so we can link this Telegram
        account. Next time you'll be signed in automatically.
      </p>
      <form onSubmit={submit} className="form">
        <label>
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Linking…' : 'Sign in & link'}
        </button>
      </form>
    </section>
  )
}
