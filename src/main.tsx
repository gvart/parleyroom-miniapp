import './env'
import './i18n'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { init, mountViewport, expandViewport } from '@telegram-apps/sdk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'
import { ErrorBoundary } from './layout/ErrorBoundary'
import './styles.css'

init()

void (async () => {
  if (mountViewport.isAvailable()) {
    try {
      await mountViewport()
      if (expandViewport.isAvailable()) expandViewport()
    } catch (err) {
      console.warn('[miniapp] viewport mount failed', err)
    }
  }
})()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
