/**
 * White-label branding, fixed per build via env (see .env.production.example).
 * `VITE_BRAND_NAME` may contain one `|` marking where the accent-colored half
 * of the wordmark starts, e.g. `Parley|room`. Keep the parsing in sync with
 * `brandHtml` in vite.config.ts.
 */
const raw = import.meta.env.VITE_BRAND_NAME || 'Parley|room'
const [head, accent = ''] = raw.split('|')

export const brand = {
  /** Plain product name, exposed to i18n strings as `{{brand}}`. */
  name: head + accent,
  wordmark: { head, accent },
  /** Letter shown in the brand tile when no logo image is configured. */
  mark: head.charAt(0).toUpperCase(),
  logoUrl: import.meta.env.VITE_BRAND_LOGO_URL || undefined,
}
