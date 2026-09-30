import { useTranslation } from 'react-i18next'
import { ScreenHeader, Section, TONE_VARS } from '@/ui'
import { ACCENT_KEYS, THEME_MODES, useTheme, type AccentKey, type ThemeMode } from '@/layout/ThemeProvider'

const MODE_ICON: Record<ThemeMode, string> = { light: 'light_mode', dark: 'dark_mode', system: 'smartphone' }
const MODE_LABEL_KEY: Record<ThemeMode, string> = {
  light: 'theme_light',
  dark: 'theme_dark',
  system: 'theme_system',
}
const ACCENT_LABEL_KEY: Record<AccentKey, string> = {
  leaf: 'accent_leaf',
  sky: 'accent_sky',
  sunny: 'accent_sunny',
  grape: 'accent_grape',
  coral: 'accent_coral',
}

export function Appearance() {
  const { t } = useTranslation()
  const { mode, accent, setMode, setAccent } = useTheme()

  return (
    <div>
      <ScreenHeader title={t('appearance_title')} />

      <div style={{ padding: '0 16px 18px' }}>
        <div style={{ fontSize: 'var(--text-lead)', color: 'var(--ink-2)' }}>{t('appearance_sub')}</div>
      </div>

      <Section eyebrow={t('theme_label')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {THEME_MODES.map((m) => {
            const selected = mode === m
            return (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                aria-pressed={selected}
                className={`mode-chip${selected ? ' on' : ''}`}
              >
                <span className="ms fill" style={{ fontSize: 22 }} aria-hidden="true">
                  {MODE_ICON[m]}
                </span>
                <div style={{ flex: 1 }}>{t(MODE_LABEL_KEY[m])}</div>
                {selected && (
                  <span className="ms fill" style={{ fontSize: 22, color: 'var(--accent-ink)' }} aria-hidden="true">
                    check_circle
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </Section>

      <Section eyebrow={t('accent_label')}>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '4px 2px' }}>
          {ACCENT_KEYS.map((key) => {
            const selected = accent === key
            const vivid = TONE_VARS[key].vivid
            return (
              <button
                type="button"
                key={key}
                onClick={() => setAccent(key)}
                aria-pressed={selected}
                aria-label={t(ACCENT_LABEL_KEY[key])}
                className="tap"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 999,
                  border: selected ? `3px solid ${vivid}` : '1px solid var(--hair-strong)',
                  padding: selected ? 4 : 6,
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 999,
                    background: vivid,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)',
                  }}
                >
                  {selected && (
                    <span className="ms fill" style={{ fontSize: 20, color: '#fff' }} aria-hidden="true">
                      check
                    </span>
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
