import {
  hapticFeedbackImpactOccurred,
  hapticFeedbackNotificationOccurred,
  isHapticFeedbackSupported,
} from '@telegram-apps/sdk-react'

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'

/** Impact haptic for a primary/danger action tap. No-op outside Telegram. */
export function haptic(style: ImpactStyle = 'light'): void {
  try {
    if (isHapticFeedbackSupported()) hapticFeedbackImpactOccurred(style)
  } catch {
    /* not available in this environment (e.g. browser dev) */
  }
}

/** Notification haptic for a completed action (a sheet's success state). */
export function hapticSuccess(): void {
  try {
    if (isHapticFeedbackSupported()) hapticFeedbackNotificationOccurred('success')
  } catch {
    /* not available in this environment (e.g. browser dev) */
  }
}
