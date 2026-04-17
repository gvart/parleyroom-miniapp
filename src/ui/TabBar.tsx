import { useLocation, useNavigate } from 'react-router-dom'

export interface TabDef {
  key: string
  path: string
  label: string
  icon: string
}

interface TabBarProps {
  tabs: TabDef[]
}

export function TabBar({ tabs }: TabBarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const activeKey = tabs.find((t) => pathname === t.path || pathname.startsWith(`${t.path}/`))?.key

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(16px + env(safe-area-inset-bottom))',
        left: 16,
        right: 16,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 6,
        background: 'color-mix(in oklab, var(--card) 78%, transparent)',
        border: '1px solid var(--hair)',
        borderRadius: 999,
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        maxWidth: 640,
        margin: '0 auto',
      }}
    >
      {tabs.map((t) => {
        const active = t.key === activeKey
        return (
          <button
            type="button"
            key={t.key}
            onClick={() => navigate(t.path)}
            className="tap"
            style={{
              flex: 1,
              border: 0,
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--bg)' : 'var(--ink-2)',
              padding: '11px 6px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 600,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition: 'all .2s var(--ease)',
            }}
          >
            <span className={`ms ${active ? 'fill' : ''}`} style={{ fontSize: 22 }}>
              {t.icon}
            </span>
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
