import { useId, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

export interface TabDef {
  key: string
  path: string
  labelKey: string
  icon: string
}

interface TabBarProps {
  tabs: TabDef[]
}

/**
 * Floating Liquid Glass tab bar (portal `LiquidTabBar`). The active pill is
 * a goo indicator: a stiff head and a soft tail chase the tab under an SVG
 * blur/threshold filter, so they stretch like a droplet on the move. CSS
 * transitions only (no motion library); the only backdrop blur is the bar.
 */
export function TabBar({ tabs }: TabBarProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const filterId = `goo-${useId().replace(/:/g, '')}`
  const listRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const activeIndex = tabs.findIndex((tab) =>
    tab.path === '/' ? pathname === '/' : pathname === tab.path || pathname.startsWith(`${tab.path}/`),
  )
  const itemW = tabs.length ? width / tabs.length : 0
  const blobStyle = {
    width: itemW,
    transform: `translateX(${Math.max(activeIndex, 0) * itemW}px)`,
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom:
          'calc(12px + var(--tg-viewport-safe-area-inset-bottom, env(safe-area-inset-bottom)) + var(--tg-viewport-content-safe-area-inset-bottom, 0px))',
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 12px',
        pointerEvents: 'none',
      }}
    >
      <nav className="liquid-tabbar glass-chrome">
        <div ref={listRef} style={{ position: 'relative', display: 'flex' }}>
          <span
            aria-hidden="true"
            className="goo-layer"
            style={{
              filter: `url(#${filterId})`,
              opacity: activeIndex >= 0 && itemW > 0 ? 1 : 0,
            }}
          >
            <svg width="0" height="0" style={{ position: 'absolute' }}>
              <defs>
                <filter id={filterId}>
                  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                  <feColorMatrix
                    in="blur"
                    mode="matrix"
                    values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
                    result="goo"
                  />
                  <feComposite in="SourceGraphic" in2="goo" operator="atop" />
                </filter>
              </defs>
            </svg>
            <span className="goo-blob tail" style={blobStyle} />
            <span className="goo-blob head" style={blobStyle} />
          </span>
          {tabs.map((tab, i) => {
            const active = i === activeIndex
            return (
              <button
                type="button"
                key={tab.key}
                onClick={() => navigate(tab.path)}
                aria-current={active ? 'page' : undefined}
                className={`liquid-tab${active ? ' on' : ''}`}
              >
                <span className={`ms${active ? ' fill' : ''}`} aria-hidden="true">
                  {tab.icon}
                </span>
                <span className="tab-label">{t(tab.labelKey)}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
