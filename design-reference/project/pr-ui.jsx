// Shared UI primitives for Parleyroom

function useT(lang) {
  return React.useCallback((k) => (window.I18N[lang] && window.I18N[lang][k]) || window.I18N.en[k] || k, [lang]);
}

// Accent chromatic avatar — gradient orb with initials
function Avatar({ hue = 172, initials = '??', size = 44, live = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 999,
      background: `radial-gradient(circle at 30% 25%, oklch(0.88 0.10 ${hue}) 0%, oklch(0.55 0.14 ${hue}) 70%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 600, fontSize: size * 0.36, letterSpacing: '-0.02em',
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 8px oklch(0.55 0.14 ${hue} / 0.25)`,
      position: 'relative', flexShrink: 0,
    }}>
      {initials}
      {live && <span style={{
        position: 'absolute', top: -2, right: -2, width: 12, height: 12, borderRadius: 999,
        background: 'oklch(0.7 0.2 25)', border: '2px solid var(--bg)',
        animation: 'pulse-dot 1.6s infinite',
      }} />}
    </div>
  );
}

// Progress ring (SVG, with gradient stroke)
function Ring({ value = 60, size = 64, stroke = 6, hue = 172, label, sublabel }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const id = React.useId ? React.useId() : `r${Math.random().toString(36).slice(2)}`;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={`oklch(0.72 0.14 ${hue})`} />
            <stop offset="100%" stopColor={`oklch(0.50 0.12 ${hue})`} />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--hair)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset .6s var(--ease)' }} />
      </svg>
      {(label !== undefined) && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', lineHeight: 1 }}>
          <div style={{ fontSize: size * 0.28, fontWeight: 600, letterSpacing: '-0.02em' }}>{label}</div>
          {sublabel && <div style={{ fontSize: size * 0.13, color: 'var(--ink-3)', marginTop: 2 }}>{sublabel}</div>}
        </div>
      )}
    </div>
  );
}

// A "Pill" inline tag
function Pill({ children, tone = 'neutral', style = {} }) {
  const tones = {
    neutral: { bg: 'var(--hair)', fg: 'var(--ink-2)' },
    accent:  { bg: 'var(--accent-soft)', fg: 'var(--accent-deep)' },
    warn:    { bg: 'oklch(0.95 0.05 75)', fg: 'oklch(0.45 0.12 75)' },
    violet:  { bg: 'oklch(0.95 0.04 290)', fg: 'oklch(0.40 0.12 290)' },
    live:    { bg: 'oklch(0.96 0.05 25)', fg: 'oklch(0.5 0.18 25)' },
    dark:    { bg: 'var(--ink)', fg: 'var(--bg)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: t.bg, color: t.fg,
      padding: '4px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
      ...style,
    }}>{children}</span>
  );
}

// Soft card
function Card({ children, padded = true, style = {}, onClick, className = '' }) {
  return (
    <div onClick={onClick} className={`card ${className}`} style={{
      background: 'var(--card)', borderRadius: 'var(--radius-card)',
      padding: padded ? 'var(--pad)' : 0,
      boxShadow: '0 1px 0 rgba(255,255,255,0.5) inset, 0 1px 2px rgba(15,15,14,0.03), 0 8px 24px rgba(15,15,14,0.04)',
      border: '1px solid var(--hair)',
      ...style,
    }}>{children}</div>
  );
}

// Section header: eyebrow + optional link
function Section({ eyebrow, title, action, children }) {
  return (
    <section style={{ marginBottom: 22 }}>
      {(eyebrow || title || action) && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 10, padding: '0 20px' }}>
          <div>
            {eyebrow && <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 2 }}>{eyebrow}</div>}
            {title && <div className="serif" style={{ fontSize: 24, color: 'var(--ink)' }}>{title}</div>}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: '0 20px' }}>{children}</div>
    </section>
  );
}

// Bottom tab bar
function TabBar({ tabs, active, onChange, dark }) {
  return (
    <div style={{
      position: 'absolute', bottom: 24, left: 16, right: 16, zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 4, padding: 6,
      background: dark ? 'rgba(28,28,26,0.78)' : 'rgba(255,255,255,0.78)',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(15,15,14,0.06)'}`,
      borderRadius: 999,
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className="tap"
          style={{
            flex: 1, border: 0, background: active === t.key ? (dark ? '#F2F1EC' : '#0F0F0E') : 'transparent',
            color: active === t.key ? (dark ? '#0D0D0C' : '#FBFAF6') : (dark ? '#A7A69C' : '#5B5A54'),
            padding: '11px 6px', borderRadius: 999, fontSize: 10, fontWeight: 600,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'all .2s var(--ease)',
          }}>
          <span className={`ms ${active === t.key ? 'fill' : ''}`} style={{ fontSize: 22 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Status bar wrapper, with dynamic island overlay-safe padding
function StatusStrip({ dark }) {
  const c = dark ? '#F2F1EC' : '#0F0F0E';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 32px 0', fontSize: 15, fontWeight: 600, color: c, position: 'relative', zIndex: 5 }}>
      <span style={{ letterSpacing: '-0.01em' }}>9:41</span>
      <span style={{ display: 'inline-block', width: 100 }} />
      <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="6" width="3" height="4" rx="0.5" fill={c}/><rect x="5" y="4" width="3" height="6" rx="0.5" fill={c}/><rect x="10" y="2" width="3" height="8" rx="0.5" fill={c}/><rect x="15" y="0" width="2" height="10" rx="0.5" fill={c} opacity=".3"/></svg>
        <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.5a7 7 0 0 1 5 2l1-1a8.5 8.5 0 0 0-12 0l1 1a7 7 0 0 1 5-2zm0 3a4 4 0 0 1 2.8 1.2l1-1a5.5 5.5 0 0 0-7.6 0l1 1a4 4 0 0 1 2.8-1.2zm0 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" fill={c}/></svg>
        <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" fill="none" stroke={c} strokeOpacity=".4"/><rect x="2" y="2" width="17" height="7" rx="1.5" fill={c}/><path d="M22 3.5v4c.6-.3 1-.9 1-2s-.4-1.7-1-2z" fill={c} fillOpacity=".5"/></svg>
      </span>
    </div>
  );
}

// Home indicator
function HomeIndicator({ dark }) {
  return (
    <div style={{ position:'absolute', bottom: 6, left: 0, right: 0, display:'flex', justifyContent:'center', pointerEvents:'none', zIndex: 100 }}>
      <div style={{ width: 134, height: 5, borderRadius: 999, background: dark ? 'rgba(242,241,236,0.55)' : 'rgba(15,15,14,0.3)' }} />
    </div>
  );
}

// Dynamic Island Live pill — used on home + live banner
function DynamicIslandLive({ text = 'Lesson live' }) {
  return (
    <div style={{
      position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
      width: 'auto', height: 37, padding: '0 16px 0 12px',
      borderRadius: 24, background: '#000', zIndex: 80,
      display: 'flex', alignItems: 'center', gap: 10,
      color: '#fff', fontSize: 12, fontWeight: 600,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'oklch(0.7 0.2 145)', animation: 'pulse-dot 1.4s infinite' }} />
      </div>
      <span style={{ letterSpacing: '-0.01em' }}>{text}</span>
      <span style={{ fontSize: 11, color: 'oklch(0.75 0.14 145)', fontVariantNumeric: 'tabular-nums' }}>00:12</span>
    </div>
  );
}

// Sheet/modal overlay
function Sheet({ open, onClose, children, dark }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      animation: 'fade-in .2s var(--ease)',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)' }} />
      <div style={{
        position: 'relative', background: dark ? '#1A1A18' : '#FBFAF6', color: dark ? '#F2F1EC' : '#0F0F0E',
        borderRadius: '24px 24px 0 0', padding: '10px 0 32px',
        animation: 'sheet-in .35s var(--ease)',
        boxShadow: '0 -24px 60px rgba(0,0,0,0.25)',
        maxHeight: '85%', overflow: 'auto',
      }}>
        <div style={{ width: 38, height: 5, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.2)' : 'rgba(15,15,14,0.15)', margin: '8px auto 14px' }} />
        {children}
      </div>
    </div>
  );
}

Object.assign(window, { useT, Avatar, Ring, Pill, Card, Section, TabBar, StatusStrip, HomeIndicator, DynamicIslandLive, Sheet });
