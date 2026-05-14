export type CookieConsentDecision = 'accepted' | 'rejected'

type CookieConsentStorageStatus = CookieConsentDecision | 'dismissed'

type CookieConsentStorage = {
  cookieConsent: CookieConsentStorageStatus
  date?: string
  dismissUntil?: string
}

export const COOKIE_CONSENT_STORAGE_KEY = 'cookieConsent'
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000

function hasBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function parseStoredValue(rawValue: string): CookieConsentStorage | null {
  try {
    const parsed = JSON.parse(rawValue) as unknown

    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    const candidate = parsed as Partial<CookieConsentStorage>

    if (
      candidate.cookieConsent !== 'accepted'
      && candidate.cookieConsent !== 'rejected'
      && candidate.cookieConsent !== 'dismissed'
    ) {
      return null
    }

    return {
      cookieConsent: candidate.cookieConsent,
      date: typeof candidate.date === 'string' ? candidate.date : undefined,
      dismissUntil: typeof candidate.dismissUntil === 'string' ? candidate.dismissUntil : undefined,
    }
  } catch {
    if (rawValue === 'accepted' || rawValue === 'rejected') {
      return { cookieConsent: rawValue }
    }

    return null
  }
}

export function readCookieConsentStorage(): CookieConsentStorage | null {
  if (!hasBrowserStorage()) {
    return null
  }

  const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  return parseStoredValue(rawValue)
}

function writeCookieConsentStorage(value: CookieConsentStorage): void {
  if (!hasBrowserStorage()) {
    return
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(value))
}

export function saveAcceptedCookieConsent(date = new Date()): void {
  writeCookieConsentStorage({
    cookieConsent: 'accepted',
    date: date.toISOString(),
  })
}

export function saveRejectedCookieConsent(): void {
  writeCookieConsentStorage({
    cookieConsent: 'rejected',
  })
}

export function dismissCookieBannerForThirtyDays(date = new Date()): void {
  writeCookieConsentStorage({
    cookieConsent: 'dismissed',
    dismissUntil: new Date(date.getTime() + THIRTY_DAYS_IN_MS).toISOString(),
  })
}

export function getCookieConsentDecision(): CookieConsentDecision | null {
  const stored = readCookieConsentStorage()

  if (!stored) {
    return null
  }

  if (stored.cookieConsent === 'accepted' || stored.cookieConsent === 'rejected') {
    return stored.cookieConsent
  }

  return null
}

export function shouldShowCookieBanner(now = new Date()): boolean {
  const stored = readCookieConsentStorage()

  if (!stored) {
    return true
  }

  if (stored.cookieConsent === 'accepted' || stored.cookieConsent === 'rejected') {
    return false
  }

  if (!stored.dismissUntil) {
    return true
  }

  const dismissUntilTimestamp = Date.parse(stored.dismissUntil)

  if (Number.isNaN(dismissUntilTimestamp)) {
    return true
  }

  return dismissUntilTimestamp <= now.getTime()
}
