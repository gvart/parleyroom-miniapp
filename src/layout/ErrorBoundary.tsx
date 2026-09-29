import { Component, type ErrorInfo, type ReactNode } from 'react'
import i18n from '@/i18n'

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[miniapp] ErrorBoundary caught', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 30,
            textAlign: 'center',
            background: 'var(--bg)',
            color: 'var(--ink)',
          }}
        >
          <span
            className="icon-tile"
            style={{ width: 64, height: 64, borderRadius: 22, background: 'var(--coral-soft)', color: 'var(--coral-ink)' }}
          >
            <span className="ms fill" style={{ fontSize: 32 }} aria-hidden="true">
              error
            </span>
          </span>
          <div className="section-title">{i18n.t('something_went_wrong')}</div>
          <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', maxWidth: 280 }}>
            {this.state.error.message}
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.location.reload()}
            style={{ marginTop: 10 }}
          >
            {i18n.t('reload')}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
