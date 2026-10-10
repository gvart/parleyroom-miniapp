/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Product name; one `|` splits the wordmark accent, e.g. `Parley|room`. */
  readonly VITE_BRAND_NAME?: string
  /** Optional logo image URL; replaces the letter tile and the favicon. */
  readonly VITE_BRAND_LOGO_URL?: string
}
