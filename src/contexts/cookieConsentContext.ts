import { createContext } from 'react'
import type { CookieConsentDecision } from '../utils/cookieConsent'

export type CookieConsentContextValue = {
  consentDecision: CookieConsentDecision | null
  isBannerVisible: boolean
  acceptCookies: () => void
  rejectCookies: () => void
  dismissBanner: () => void
}

export const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)
