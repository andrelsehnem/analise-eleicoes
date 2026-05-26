import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CookieConsentProvider } from './hooks/CookieConsentProvider'
import { ConsentAwareAnalytics } from './components/common/ConsentAwareAnalytics'
import { AuthProvider } from './hooks/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CookieConsentProvider>
      <AuthProvider>
        <BrowserRouter>
          <App />
          <ConsentAwareAnalytics />
        </BrowserRouter>
      </AuthProvider>
    </CookieConsentProvider>
  </StrictMode>,
)
