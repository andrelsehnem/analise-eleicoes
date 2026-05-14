import { Analytics } from '@vercel/analytics/react'
import { useCookieConsent } from '../../hooks/useCookieConsent'

export function ConsentAwareAnalytics() {
  const { consentDecision } = useCookieConsent()

  if (consentDecision !== 'accepted') {
    return null
  }

  return <Analytics />
}
