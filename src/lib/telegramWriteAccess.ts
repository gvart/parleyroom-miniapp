import { requestWriteAccess } from '@telegram-apps/sdk-react'
import { api } from '@/api/endpoints'
import type { UserProfile } from '@/api/types'

const AUTO_ASKED_KEY = 'parleyroom.writeAccessAsked'

export type WriteAccessResult = 'granted' | 'denied' | 'unsupported'

/**
 * Asks Telegram to let the bot message this user. When granted, sends the
 * backend test message, which is what flips `telegramReachable` to true —
 * callers should refresh the user afterwards. Errors from the test call
 * propagate.
 */
export async function requestBotWriteAccess(): Promise<WriteAccessResult> {
  if (!requestWriteAccess.isAvailable()) return 'unsupported'
  const status = await requestWriteAccess()
  if (status !== 'allowed') return 'denied'
  await api.sendTelegramTest()
  return 'granted'
}

/**
 * The one automatic ask per session: only for a linked user the bot can't
 * reach yet. Settings offers a manual retry after that.
 */
export function shouldAutoRequestWriteAccess(user: UserProfile): boolean {
  if (user.role === 'ADMIN' || !user.telegramId || user.telegramReachable !== false) return false
  if (sessionStorage.getItem(AUTO_ASKED_KEY)) return false
  sessionStorage.setItem(AUTO_ASKED_KEY, '1')
  return true
}
