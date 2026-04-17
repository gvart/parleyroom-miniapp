import { AuthGate } from '@/auth/AuthGate'
import { ThemeProvider } from '@/layout/ThemeProvider'
import { RoleRouter } from '@/layout/RoleRouter'

export function App() {
  return (
    <ThemeProvider>
      <AuthGate>
        <RoleRouter />
      </AuthGate>
    </ThemeProvider>
  )
}
