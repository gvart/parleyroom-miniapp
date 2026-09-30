import { useEffect } from 'react'
import {
  hideBackButton,
  isBackButtonMounted,
  isBackButtonSupported,
  mountBackButton,
  onBackButtonClick,
  showBackButton,
} from '@telegram-apps/sdk-react'

/**
 * Shows Telegram's native Back Button while the calling screen is mounted
 * and wires it to `onBack`. A no-op outside Telegram (e.g. browser dev) —
 * screens still render their own in-page back affordance for that case.
 */
export function useBackButton(onBack: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return
    try {
      if (!isBackButtonSupported()) return
      if (mountBackButton.isAvailable() && !isBackButtonMounted()) mountBackButton()
      if (showBackButton.isAvailable()) showBackButton()
    } catch {
      return
    }
    const off = onBackButtonClick.isAvailable() ? onBackButtonClick(onBack) : undefined
    return () => {
      off?.()
      try {
        if (hideBackButton.isAvailable()) hideBackButton()
      } catch {
        /* noop */
      }
    }
  }, [onBack, enabled])
}
