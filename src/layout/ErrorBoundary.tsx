import { Component, type ErrorInfo, type ReactNode } from 'react'

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
          <div style={{ fontSize: 40 }}>◌</div>
          <div className="serif" style={{ fontSize: 24, letterSpacing: '-0.02em' }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 280 }}>
            {this.state.error.message}
          </div>
          <button
            type="button"
            className="tap"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 14,
              border: 0,
              background: 'var(--ink)',
              color: 'var(--bg)',
              padding: '10px 18px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
