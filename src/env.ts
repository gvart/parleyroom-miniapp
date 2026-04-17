import { mockTelegramEnv, emitEvent } from '@telegram-apps/bridge'

// In dev, fake the Telegram environment so the app renders in a normal browser.
// Production builds never run this block, so real Telegram data is untouched.
if (import.meta.env.DEV) {
  const themeParams = {
    bg_color: '#ffffff',
    text_color: '#000000',
    hint_color: '#999999',
    link_color: '#3390ec',
    button_color: '#3390ec',
    button_text_color: '#ffffff',
    secondary_bg_color: '#f4f4f5',
  } as const

  const noInsets = { top: 0, right: 0, bottom: 0, left: 0 } as const

  mockTelegramEnv({
    launchParams: {
      tgWebAppThemeParams: themeParams,
      tgWebAppData: new URLSearchParams([
        [
          'user',
          JSON.stringify({
            id: 42,
            first_name: 'Dev',
            last_name: 'Mode',
            username: 'devuser',
            language_code: 'en',
          }),
        ],
        ['hash', 'dev-mode-no-hash'],
        ['signature', ''],
        ['auth_date', Math.floor(Date.now() / 1000).toString()],
      ]),
      tgWebAppStartParam: '',
      tgWebAppVersion: '8',
      tgWebAppPlatform: 'tdesktop',
    },
    onEvent([name]) {
      if (name === 'web_app_request_theme') {
        emitEvent('theme_changed', { theme_params: themeParams })
        return
      }
      if (name === 'web_app_request_viewport') {
        emitEvent('viewport_changed', {
          height: window.innerHeight,
          width: window.innerWidth,
          is_expanded: true,
          is_state_stable: true,
        })
        return
      }
      if (name === 'web_app_request_safe_area') {
        emitEvent('safe_area_changed', noInsets)
        return
      }
      if (name === 'web_app_request_content_safe_area') {
        emitEvent('content_safe_area_changed', noInsets)
      }
    },
  })

  console.warn('[miniapp] Running in mocked Telegram environment (dev only)')
}
