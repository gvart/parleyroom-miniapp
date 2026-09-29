import { useEffect } from 'react'

/**
 * L0 background mesh (ported from the portal): three radial-gradient blobs
 * drifting via a transform-only CSS animation. Paused while the app is
 * hidden; static under reduced motion (CSS).
 */
export function BlobBackground() {
  useEffect(() => {
    const root = document.documentElement
    const sync = () => root.classList.toggle('bg-paused', document.hidden)
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      root.classList.remove('bg-paused')
    }
  }, [])

  return (
    <div className="blob-field" aria-hidden="true">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  )
}
