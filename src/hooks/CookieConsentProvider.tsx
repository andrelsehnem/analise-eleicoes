import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  dismissCookieBannerForThirtyDays,
  getCookieConsentDecision,
  saveAcceptedCookieConsent,
  saveRejectedCookieConsent,
  shouldShowCookieBanner,
  type CookieConsentDecision,
} from '../utils/cookieConsent'
import { enableTrackingByConsent } from '../utils/trackingConsent'
import {
  CookieConsentContext,
  type CookieConsentContextValue,
} from '../contexts/cookieConsentContext'

type CookieConsentProviderProps = {
  children: ReactNode
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const [consentDecision, setConsentDecision] = useState<CookieConsentDecision | null>(() =>
    getCookieConsentDecision(),
  )
  const [isBannerVisible, setIsBannerVisible] = useState<boolean>(() => shouldShowCookieBanner())

  useEffect(() => {
    if (consentDecision === 'accepted') {
      enableTrackingByConsent()
    }
  }, [consentDecision])

  const acceptCookies = useCallback(() => {
    saveAcceptedCookieConsent()
    setConsentDecision('accepted')
    setIsBannerVisible(false)
  }, [])

  const rejectCookies = useCallback(() => {
    saveRejectedCookieConsent()
    setConsentDecision('rejected')
    setIsBannerVisible(false)
  }, [])

  const dismissBanner = useCallback(() => {
    dismissCookieBannerForThirtyDays()
    setIsBannerVisible(false)
  }, [])

  const contextValue = useMemo<CookieConsentContextValue>(
    () => ({
      consentDecision,
      isBannerVisible,
      acceptCookies,
      rejectCookies,
      dismissBanner,
    }),
    [acceptCookies, consentDecision, dismissBanner, isBannerVisible, rejectCookies],
  )

  return <CookieConsentContext.Provider value={contextValue}>{children}</CookieConsentContext.Provider>
}
