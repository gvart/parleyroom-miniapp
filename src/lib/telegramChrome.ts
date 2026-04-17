import {
  expandViewport,
  mountMiniApp,
  mountViewport,
  requestFullscreen,
  setMiniAppBackgroundColor,
  setMiniAppBottomBarColor,
  setMiniAppHeaderColor,
} from '@telegram-apps/sdk-react'

const LIGHT_BG = '#FBFAF6'
const DARK_BG = '#0D0D0C'

function currentBg(): `#${string}` {
  const isDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  return (isDark ? DARK_BG : LIGHT_BG) as `#${string}`
}

export async function setupTelegramChrome(): Promise<void> {
  if (mountViewport.isAvailable()) {
    try {
      await mountViewport()
      if (expandViewport.isAvailable()) expandViewport()
      if (requestFullscreen.isAvailable()) {
        try {
          await requestFullscreen()
        } catch (err) {
          console.warn('[miniapp] fullscreen rejected', err)
        }
      }
    } catch (err) {
      console.warn('[miniapp] viewport mount failed', err)
    }
  }

  if (mountMiniApp.isAvailable()) {
    try {
      await mountMiniApp()
      const bg = currentBg()
      if (setMiniAppBackgroundColor.isAvailable()) setMiniAppBackgroundColor(bg)
      if (setMiniAppHeaderColor.isAvailable()) setMiniAppHeaderColor(bg)
      if (setMiniAppBottomBarColor.isAvailable()) setMiniAppBottomBarColor(bg)
    } catch (err) {
      console.warn('[miniapp] mini app mount failed', err)
    }
  }

  if (typeof window !== 'undefined') {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', () => {
      const bg = currentBg()
      if (setMiniAppBackgroundColor.isAvailable()) setMiniAppBackgroundColor(bg)
      if (setMiniAppHeaderColor.isAvailable()) setMiniAppHeaderColor(bg)
      if (setMiniAppBottomBarColor.isAvailable()) setMiniAppBottomBarColor(bg)
    })
  }
}
