import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useLaunchParams, useRawInitData } from '@telegram-apps/sdk-react'
import { useTranslation } from 'react-i18next'
import { ApiError, setApiToken } from '@/api/client'
import { api } from '@/api/endpoints'
import type { UserProfile } from '@/api/types'
import i18n, { DEFAULT_LOCALE, normalizeLocale } from '@/i18n'
import { FirstRunLocalePicker } from '@/features/shared/FirstRunLocalePicker'
import { Button } from '@/ui'

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
  const { t } = useTranslation()
  const rawInitData = useRawInitData() ?? ''
  const launchParams = useLaunchParams()
  const [status, setStatus] = useState<Status>({ kind: 'checking' })

  // Pre-login default: Telegram's `language_code` if it's ru/de/en, else 'ru'.
  // Only applies on a genuinely first run — a previously cached/chosen
  // language (localStorage, or `user.locale` synced below) always wins.
  useEffect(() => {
    if (localStorage.getItem('i18nextLng')) return
    const code = launchParams?.tgWebAppData?.user?.language_code
    void i18n.changeLanguage(normalizeLocale(code) ?? DEFAULT_LOCALE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Once logged in, the interface language always follows `user.locale`.
  useEffect(() => {
    if (status.kind !== 'ready') return
    const locale = normalizeLocale(status.user.locale) ?? DEFAULT_LOCALE
    if (i18n.resolvedLanguage !== locale) void i18n.changeLanguage(locale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.kind === 'ready' ? status.user.locale : null])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!rawInitData) {
        setStatus({ kind: 'error', message: t('no_init_data') })
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
          message: err instanceof Error ? err.message : t('unknown_error'),
        })
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
    // `t` intentionally excluded — it changes identity on every language switch,
    // and re-running the auth bootstrap on a language change would be wrong.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (!status.user.localeConfirmedAt) {
    return (
      <FirstRunLocalePicker
        user={status.user}
        onConfirmed={(user) => setStatus({ kind: 'ready', user, accessToken: status.accessToken })}
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

function BrandLockup() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span className="brand-mark font-headline" aria-hidden="true">
        P
      </span>
      <span className="font-headline" style={{ fontSize: 24 }}>
        Parley<span style={{ color: 'var(--accent-ink)' }}>room</span>
      </span>
    </div>
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
        color: 'var(--ink)',
      }}
    >
      <BrandLockup />
      <div style={{ fontSize: 'var(--text-small)', fontWeight: 700, color: 'var(--ink-2)' }}>
        {t('signing_in')}
      </div>
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
        color: 'var(--ink)',
      }}
    >
      <span
        className="icon-tile"
        style={{ width: 64, height: 64, borderRadius: 22, background: 'var(--coral-soft)', color: 'var(--coral-ink)' }}
      >
        <span className="ms fill" style={{ fontSize: 32 }} aria-hidden="true">
          error
        </span>
      </span>
      <h1 className="section-title" style={{ margin: 0 }}>
        {t('something_went_wrong')}
      </h1>
      <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', maxWidth: 280 }}>{message}</div>
      <Button leadingIcon="refresh" onClick={() => window.location.reload()} style={{ marginTop: 10 }}>
        {t('try_again')}
      </Button>
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
      onError(err instanceof Error ? err.message : t('link_failed'))
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 24,
        padding: '40px 16px',
        color: 'var(--ink)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <BrandLockup />
      </div>
      <div className="card animate-in" style={{ padding: 24 }}>
        <h1 className="page-h1">{t('link_account_title')}</h1>
        <p className="page-sub">{t('link_account_sub')}</p>

        <form
          onSubmit={submit}
          style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 22 }}
        >
          <div>
            <label htmlFor="email" className="eyebrow field-label">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-field"
            />
          </div>
          <div>
            <label htmlFor="password" className="eyebrow field-label">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-field"
            />
          </div>
          <Button type="submit" block disabled={isSubmitting} style={{ marginTop: 6 }}>
            {isSubmitting ? t('linking') : t('sign_in_link')}
          </Button>
        </form>
      </div>
    </div>
  )
}
