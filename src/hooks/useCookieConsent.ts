import { useContext } from 'react'
import { CookieConsentContext, type CookieConsentContextValue } from '../contexts/cookieConsentContext'

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext)

  if (!context) {
    throw new Error('useCookieConsent deve ser usado dentro de CookieConsentProvider')
  }

  return context
}
