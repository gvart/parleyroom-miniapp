import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  isThemeParamsDark,
  isThemeParamsMounted,
  isThemeParamsMounting,
  mountThemeParams,
  useSignal,
} from '@telegram-apps/sdk-react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type AccentKey = 'leaf' | 'sky' | 'sunny' | 'grape' | 'coral'

export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']
export const ACCENT_KEYS: AccentKey[] = ['leaf', 'sky', 'sunny', 'grape', 'coral']

const THEME_KEY = 'parleyroom.theme'
const ACCENT_KEY = 'parleyroom.accent'

function readStored<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value && (allowed as readonly string[]).includes(value) ? (value as T) : fallback
  } catch {
    return fallback
  }
}

function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private mode / blocked storage — theme just won't persist */
  }
}

interface ThemeValue {
  mode: ThemeMode
  accent: AccentKey
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: AccentKey) => void
}

const ThemeContext = createContext<ThemeValue | null>(null)

export function useTheme(): ThemeValue {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>')
  return value
}

/**
 * Appearance (theme + accent), local to this device — never synced to the
 * backend. `system` follows Telegram's own colour scheme (`themeParams`),
 * not the OS media query, so it matches the surrounding chrome.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStored(THEME_KEY, THEME_MODES, 'system'))
  const [accent, setAccentState] = useState<AccentKey>(() => readStored(ACCENT_KEY, ACCENT_KEYS, 'leaf'))

  useEffect(() => {
    try {
      // Guard against React StrictMode's double-invoked effects (dev only) —
      // mounting twice while the first mount is still in flight throws.
      if (mountThemeParams.isAvailable() && !isThemeParamsMounted() && !isThemeParamsMounting()) {
        mountThemeParams()
      }
    } catch {
      /* not available in this environment (e.g. browser dev without a bridge) */
    }
  }, [])

  const telegramDark = useSignal(isThemeParamsDark)
  const dark = mode === 'dark' ? true : mode === 'light' ? false : telegramDark

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', dark ? '#06120D' : '#EEF7EC')
  }, [dark])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
  }, [accent])

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next)
    writeStored(THEME_KEY, next)
  }, [])
  const setAccent = useCallback((next: AccentKey) => {
    setAccentState(next)
    writeStored(ACCENT_KEY, next)
  }, [])

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent }}>{children}</ThemeContext.Provider>
  )
}
