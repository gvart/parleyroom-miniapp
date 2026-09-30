import { AuthGate } from '@/auth/AuthGate'
import { BlobBackground } from '@/layout/BlobBackground'
import { ThemeProvider } from '@/layout/ThemeProvider'
import { RoleRouter } from '@/layout/RoleRouter'
import { useKeyboardAwareLayout } from '@/hooks/useKeyboardAwareLayout'

export function App() {
  useKeyboardAwareLayout()
  return (
    <ThemeProvider>
      <BlobBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <AuthGate>
          <RoleRouter />
        </AuthGate>
      </div>
    </ThemeProvider>
  )
}
