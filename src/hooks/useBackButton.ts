import { useEffect, useState } from 'react'
import {
  hideBackButton,
  isBackButtonMounted,
  isBackButtonSupported,
  mountBackButton,
  onBackButtonClick,
  showBackButton,
} from '@telegram-apps/sdk-react'

// `env.ts` always fakes the Telegram bridge in DEV (see its docstring), and
// the fake reports BackButton as supported for its mocked platform/version —
// there's just no real Telegram chrome around a plain browser tab to render
// it. So "supported" only means "will actually be visible" outside DEV.
const canUseNativeBackButton = !import.meta.env.DEV

function trySupported(enabled: boolean): boolean {
  if (!canUseNativeBackButton) return false
  try {
    return enabled && isBackButtonSupported()
  } catch {
    return false
  }
}

/**
 * Shows Telegram's native Back Button while the calling screen is mounted
 * and wires it to `onBack`. Returns whether the native button is actually
 * armed, so the caller can skip rendering its own in-page back affordance
 * on platforms where the native one is showing (avoids two back arrows) —
 * and still render one as a fallback in the browser / on platforms without
 * BackButton support.
 */
export function useBackButton(onBack: () => void, enabled = true): boolean {
  // Optimistic initial guess (support is stable for the session) avoids a
  // flash of the in-page fallback before the effect below confirms it.
  const [armed, setArmed] = useState(() => trySupported(enabled))

  useEffect(() => {
    if (!enabled || !canUseNativeBackButton || !isBackButtonSupported()) {
      setArmed(false)
      return
    }
    try {
      if (mountBackButton.isAvailable() && !isBackButtonMounted()) mountBackButton()
      if (showBackButton.isAvailable()) showBackButton()
    } catch {
      setArmed(false)
      return
    }
    setArmed(true)
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

  return armed
}
