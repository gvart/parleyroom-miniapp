import type { TFunction } from 'i18next'
import { ApiError } from '@/api/client'
import i18n from '@/i18n'

/** For responses without a code (proxy errors, old backends). */
const STATUS_FALLBACK: Record<number, string> = {
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  413: 'FILE_TOO_LARGE',
}

function errorCode(err: unknown): string | null {
  if (err instanceof ApiError) return err.code ?? STATUS_FALLBACK[err.status] ?? null
  // fetch rejects with a TypeError when the request never got a response: offline, DNS, CORS
  if (err instanceof TypeError) return 'NETWORK_ERROR'
  return null
}

/** True when `err` is an `ApiError` carrying one of these backend codes. */
export function hasErrorCode(err: unknown, ...codes: string[]): boolean {
  return err instanceof ApiError && err.code !== null && codes.includes(err.code)
}

/**
 * User-facing, translated message for any thrown error. Backend errors are
 * translated by their stable `code` via `error_code_<CODE>`; the English
 * `detail` is never shown. Codes without an entry fall back to `fallbackKey`,
 * a context-specific "couldn't do X".
 */
export function errorMessage(err: unknown, t: TFunction, fallbackKey = 'error_generic'): string {
  const code = errorCode(err)
  if (code && i18n.exists(`error_code_${code}`)) return t(`error_code_${code}`)
  return t(fallbackKey)
}
