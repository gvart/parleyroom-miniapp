import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useRawInitData } from '@telegram-apps/sdk-react'
import { useTranslation } from 'react-i18next'
import { ApiError, setApiToken } from '@/api/client'
import { api } from '@/api/endpoints'
import type { UserProfile } from '@/api/types'

const TOKEN_KEY = 'parleyroom.access'

interface AuthValue {
  user: UserProfile
  accessToken: string
  signOut: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthValue | null>(null)

export function useAuth(): AuthValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthGate>')
  return value
}

type Status =
  | { kind: 'checking' }
  | { kind: 'needsLink' }
  | { kind: 'linking' }
  | { kind: 'ready'; user: UserProfile; accessToken: string }
  | { kind: 'error'; message: string }

export function AuthGate({ children }: { children: ReactNode }) {
  const rawInitData = useRawInitData() ?? ''
  const [status, setStatus] = useState<Status>({ kind: 'checking' })

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!rawInitData) {
        setStatus({ kind: 'error', message: 'No initData — open this page from Telegram.' })
        return
      }
      try {
        const auth = await api.signInWithMiniApp(rawInitData)
        if (cancelled) return
        setApiToken(auth.accessToken)
        sessionStorage.setItem(TOKEN_KEY, auth.accessToken)
        const user = await api.me()
        if (cancelled) return
        setStatus({ kind: 'ready', user, accessToken: auth.accessToken })
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 404) {
          setStatus({ kind: 'needsLink' })
          return
        }
        setStatus({
          kind: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [rawInitData])

  const signOut = useCallback(() => {
    setApiToken(null)
    sessionStorage.removeItem(TOKEN_KEY)
    setStatus({ kind: 'checking' })
  }, [])

  const refreshUser = useCallback(async () => {
    const user = await api.me()
    setStatus((prev) =>
      prev.kind === 'ready' ? { ...prev, user } : prev,
    )
  }, [])

  if (status.kind === 'checking') return <SplashScreen />
  if (status.kind === 'error') return <ErrorScreen message={status.message} />
  if (status.kind === 'needsLink' || status.kind === 'linking') {
    return (
      <LinkForm
        rawInitData={rawInitData}
        isSubmitting={status.kind === 'linking'}
        onStart={() => setStatus({ kind: 'linking' })}
        onError={(message) => setStatus({ kind: 'error', message })}
        onSuccess={(accessToken, user) => {
          setApiToken(accessToken)
          sessionStorage.setItem(TOKEN_KEY, accessToken)
          setStatus({ kind: 'ready', user, accessToken })
        }}
      />
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user: status.user,
        accessToken: status.accessToken,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function SplashScreen() {
  const { t } = useTranslation()
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        padding: 24,
        background: 'var(--bg)',
        color: 'var(--ink)',
      }}
    >
      <div
        className="serif"
        style={{ fontSize: 38, letterSpacing: '-0.02em', lineHeight: 1 }}
      >
        Parleyroom<span style={{ color: 'var(--accent)' }}>.</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t('signing_in')}</div>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  const { t } = useTranslation()
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 30,
        textAlign: 'center',
        background: 'var(--bg)',
        color: 'var(--ink)',
      }}
    >
      <div style={{ fontSize: 40 }}>◌</div>
      <div className="serif" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>
        {t('something_went_wrong')}
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 280 }}>{message}</div>
      <button
        type="button"
        className="tap"
        onClick={() => window.location.reload()}
        style={{
          marginTop: 14,
          border: 0,
          background: 'var(--ink)',
          color: 'var(--bg)',
          padding: '10px 18px',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {t('try_again')}
      </button>
    </div>
  )
}

interface LinkFormProps {
  rawInitData: string
  isSubmitting: boolean
  onStart: () => void
  onError: (message: string) => void
  onSuccess: (accessToken: string, user: UserProfile) => void
}

function LinkForm({ rawInitData, isSubmitting, onStart, onError, onSuccess }: LinkFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onStart()
    try {
      const auth = await api.signInWithPassword(email, password)
      setApiToken(auth.accessToken)
      await api.linkTelegram(rawInitData)
      const user = await api.me()
      onSuccess(auth.accessToken, user)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Link failed')
    }
  }

  const labelStyle = {
    fontSize: 11,
    color: 'var(--ink-3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontWeight: 600,
    marginBottom: 6,
    display: 'block',
  }
  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--card)',
    color: 'var(--ink)',
    border: '1px solid var(--hair)',
    borderRadius: 14,
    fontSize: 15,
    outline: 'none',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        padding: '40px 20px',
        background: 'var(--bg)',
        color: 'var(--ink)',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--ink-3)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          Parleyroom
        </div>
        <div
          className="serif"
          style={{ fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          {t('link_account_title')}
          <span style={{ color: 'var(--accent)' }}>.</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 8 }}>
          {t('link_account_sub')}
        </div>
      </div>

      <form
        onSubmit={submit}
        style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 6 }}
      >
        <div>
          <label htmlFor="email" style={labelStyle}>
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div>
          <label htmlFor="password" style={labelStyle}>
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="tap"
          style={{
            width: '100%',
            marginTop: 6,
            border: 0,
            cursor: isSubmitting ? 'progress' : 'pointer',
            background: 'var(--ink)',
            color: 'var(--bg)',
            padding: '14px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? t('linking') : t('sign_in_link')}
        </button>
      </form>
    </div>
  )
}
