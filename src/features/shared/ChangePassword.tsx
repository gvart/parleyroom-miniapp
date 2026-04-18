import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/ui'
import { useChangePassword } from '@/hooks/usePasswordChange'

function strengthOf(p: string): number {
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}

const STRENGTH_COLORS = [
  'oklch(0.6 0.18 25)',
  'oklch(0.6 0.18 25)',
  'oklch(0.7 0.14 75)',
  'oklch(0.55 0.14 172)',
]

export function ChangePassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const change = useChangePassword()
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')

  const st = strengthOf(pw1)
  const match = pw1.length > 0 && pw1 === pw2
  const canSubmit = match && st >= 3 && !change.isPending

  function strengthLabel(): string {
    if (st === 0) return ' '
    if (st < 2) return t('password_strength_too_weak')
    if (st < 3) return t('password_strength_okay')
    if (st < 4) return t('password_strength_strong')
    return t('password_strength_very_strong')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    try {
      await change.mutateAsync(pw1)
    } catch {
      /* error in change.error */
    }
  }

  if (change.isSuccess) {
    return (
      <div>
        <ScreenHeader title={t('change_password_title')} />
        <div style={{ padding: '0 20px' }}>
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 999,
                background: 'var(--accent-soft)',
                color: 'var(--accent-deep)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                animation: 'scale-in .5s var(--spring)',
              }}
            >
              <span className="ms fill" style={{ fontSize: 42 }}>
                lock_reset
              </span>
            </div>
            <div className="serif" style={{ fontSize: 30, letterSpacing: '-0.02em', marginBottom: 6 }}>
              {t('password_updated_title')}
            </div>
            <div
              style={{
                fontSize: 14,
                color: 'var(--ink-2)',
                marginBottom: 24,
                maxWidth: 280,
                margin: '0 auto 24px',
              }}
            >
              {t('password_updated_sub')}
            </div>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="tap"
              style={{
                border: 0,
                background: 'var(--ink)',
                color: 'var(--bg)',
                padding: '12px 24px',
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t('back_to_settings')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ScreenHeader title={t('change_password_title')} />

      <form onSubmit={submit} style={{ padding: '0 20px' }}>
        <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.02em', marginBottom: 6 }}>
          {t('new_password')}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 22 }}>
          {t('password_strength_hint')}
        </div>

        <Card>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            {t('new_password')}
          </div>
          <input
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '10px 0',
              background: 'transparent',
              color: 'var(--ink)',
              border: 0,
              fontSize: 16,
              fontFamily: 'inherit',
              outline: 'none',
              marginBottom: 10,
            }}
          />
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 999,
                  background: i < st ? STRENGTH_COLORS[st - 1] : 'var(--hair)',
                  transition: 'background .2s var(--ease)',
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{strengthLabel()}</div>

          <div style={{ height: 1, background: 'var(--hair)', margin: '14px 0' }} />

          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            {t('confirm_password')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'transparent',
                color: 'var(--ink)',
                border: 0,
                fontSize: 16,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            {pw2 && (
              <span
                className="ms fill"
                style={{
                  fontSize: 18,
                  color: match ? 'oklch(0.55 0.14 172)' : 'oklch(0.6 0.18 25)',
                }}
              >
                {match ? 'check_circle' : 'cancel'}
              </span>
            )}
          </div>
        </Card>

        {change.error && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'oklch(0.96 0.05 25)',
              color: 'oklch(0.5 0.18 25)',
              fontSize: 13,
            }}
          >
            {change.error instanceof Error ? change.error.message : 'Update failed'}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="tap"
          style={{
            width: '100%',
            marginTop: 16,
            border: 0,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            background: canSubmit ? 'var(--ink)' : 'var(--hair-strong)',
            color: canSubmit ? 'var(--bg)' : 'var(--ink-3)',
            padding: '14px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {change.isPending ? `${t('update_password')}…` : t('update_password')}
        </button>
      </form>
    </div>
  )
}

function ScreenHeader({ title }: { title: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div style={{ padding: '8px 20px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="tap"
        aria-label={t('back')}
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: 'var(--card)',
          border: '1px solid var(--hair)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--ink)',
        }}
      >
        <span className="ms" style={{ fontSize: 20 }}>
          arrow_back
        </span>
      </button>
      <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>
        {title}
      </div>
    </div>
  )
}
