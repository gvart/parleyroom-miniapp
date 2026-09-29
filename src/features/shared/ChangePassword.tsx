import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Banner, Button, Card } from '@/ui'
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
  'var(--coral-vivid)',
  'var(--coral-vivid)',
  'var(--sunny-vivid)',
  'var(--leaf-vivid)',
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
        <div style={{ padding: '0 16px' }}>
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 999,
                background: 'var(--accent-soft)',
                color: 'var(--accent-ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: 'var(--glass-highlight), 0 0 0 10px color-mix(in srgb, var(--accent) 10%, transparent)',
                animation: 'scale-in var(--spring-bouncy-ms) var(--spring-bouncy)',
              }}
            >
              <span className="ms fill" style={{ fontSize: 42 }}>
                lock_reset
              </span>
            </div>
            <h1 className="page-h1" style={{ marginBottom: 6 }}>
              {t('password_updated_title')}
            </h1>
            <div
              style={{
                fontSize: 'var(--text-lead)',
                color: 'var(--ink-2)',
                maxWidth: 280,
                margin: '0 auto 24px',
              }}
            >
              {t('password_updated_sub')}
            </div>
            <Button leadingIcon="arrow_back" onClick={() => navigate('/settings')}>
              {t('back_to_settings')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ScreenHeader title={t('change_password_title')} />

      <form onSubmit={submit} style={{ padding: '0 16px' }}>
        <div className="section-title" style={{ marginBottom: 6 }}>
          {t('new_password')}
        </div>
        <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', marginBottom: 22 }}>
          {t('password_strength_hint')}
        </div>

        <Card>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {t('new_password')}
          </div>
          <input
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            className="glass-field"
            style={{ marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: i < st ? STRENGTH_COLORS[st - 1] : 'var(--bg-3)',
                  transition: 'background .2s var(--ease)',
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--ink-2)' }}>{strengthLabel()}</div>

          <div style={{ height: 1, background: 'var(--hair)', margin: '14px 0' }} />

          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {t('confirm_password')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="glass-field"
              style={{ flex: 1 }}
            />
            {pw2 && (
              <span
                className="ms fill"
                style={{
                  fontSize: 22,
                  color: match ? 'var(--leaf-ink)' : 'var(--coral-ink)',
                }}
              >
                {match ? 'check_circle' : 'cancel'}
              </span>
            )}
          </div>
        </Card>

        {change.error && (
          <Banner tone="error" style={{ marginTop: 12 }}>
            {change.error instanceof Error ? change.error.message : t('update_failed')}
          </Banner>
        )}

        <Button type="submit" block disabled={!canSubmit} loading={change.isPending} style={{ marginTop: 16 }}>
          {t('update_password')}
        </Button>
      </form>
    </div>
  )
}

function ScreenHeader({ title }: { title: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <div style={{ padding: '12px 16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="ico-btn"
        aria-label={t('back')}
      >
        <span className="ms" style={{ fontSize: 20 }}>
          arrow_back
        </span>
      </button>
      <div className="section-title">
        {title}
      </div>
    </div>
  )
}
