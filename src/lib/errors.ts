import { ApiError } from '@/api/client'

/** True when `err` is an `ApiError` carrying one of these backend codes. */
export function hasErrorCode(err: unknown, ...codes: string[]): boolean {
  return err instanceof ApiError && err.code !== null && codes.includes(err.code)
}
