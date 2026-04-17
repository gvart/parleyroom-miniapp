import type { ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  dark?: boolean
}

export function Sheet({ open, onClose, children, dark = false }: SheetProps) {
  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        animation: 'fade-in .2s var(--ease)',
      }}
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)' }}
      />
      <div
        style={{
          position: 'relative',
          background: dark ? '#1A1A18' : 'var(--bg)',
          color: dark ? '#F2F1EC' : 'var(--ink)',
          borderRadius: '24px 24px 0 0',
          padding: '10px 0 32px',
          paddingBottom: 'calc(32px + env(safe-area-inset-bottom))',
          animation: 'sheet-in .35s var(--ease)',
          boxShadow: '0 -24px 60px rgba(0,0,0,0.25)',
          maxHeight: '85%',
          overflow: 'auto',
        }}
      >
        <div
          style={{
            width: 38,
            height: 5,
            borderRadius: 999,
            background: dark ? 'rgba(255,255,255,0.2)' : 'rgba(15,15,14,0.15)',
            margin: '8px auto 14px',
          }}
        />
        {children}
      </div>
    </div>
  )
}
