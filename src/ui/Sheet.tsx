import { useEffect, type ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Force dark tokens (video-context sheets). */
  dark?: boolean
}

/**
 * L2 floating glass bottom sheet (portal `GlassSheet`). The scrim is a plain
 * tint — no second backdrop-filter — so the blur budget stays at 2 layers.
 */
export function Sheet({ open, onClose, children, dark = false }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className={dark ? 'dark' : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div className="sheet-backdrop" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="sheet-popup glass-chrome">
        <div className="sheet-grabber" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
