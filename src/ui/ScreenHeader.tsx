import { useCallback, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useBackButton } from '@/hooks/useBackButton'

interface ScreenHeaderProps {
  title: ReactNode
  /** Defaults to `navigate(-1)`. */
  onBack?: () => void
  action?: ReactNode
}

/**
 * Sub-screen header: arms Telegram's native Back Button while mounted, and
 * renders an in-page back button only as a fallback where the native one
 * isn't available (browser dev, platforms without BackButton support) —
 * never both, so real Telegram never shows two back arrows. Tab roots never
 * render this, so the native button stays hidden there.
 */
export function ScreenHeader({ title, onBack, action }: ScreenHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const back = useCallback(() => (onBack ? onBack() : navigate(-1)), [onBack, navigate])
  const nativeBackArmed = useBackButton(back)

  return (
    <div style={{ padding: '12px 16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      {!nativeBackArmed && (
        <button type="button" onClick={back} className="ico-btn" aria-label={t('back')}>
          <span className="ms" style={{ fontSize: 20 }} aria-hidden="true">
            arrow_back
          </span>
        </button>
      )}
      <div className="section-title" style={{ flex: 1, minWidth: 0 }}>
        {title}
      </div>
      {action}
    </div>
  )
}
